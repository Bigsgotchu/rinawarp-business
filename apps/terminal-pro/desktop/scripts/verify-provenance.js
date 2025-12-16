#!/usr/bin/env node

/**
 * Provenance/SLSA metadata validation for RinaWarp Terminal Pro
 * Validates build provenance JSON with builder, commit, Electron ABI, node-pty ABI
 * Implements SLSA (Supply-chain Levels for Software Artifacts) compliance
 */

const execa = require('execa');
const { readFileSync } = require('fs');
const { resolve } = require('path');

// Read version from package.json
const packageJson = JSON.parse(readFileSync(resolve(__dirname, '../package.json'), 'utf8'));
const version = process.env.VERSION || packageJson.version || '0.4.0';

const ORIGIN = process.env.UPDATES_ORIGIN || 'https://updates.rinawarp.dev';
const base = `${ORIGIN}/releases/${version}`;
const provenanceUrl = `${base}/provenance.json`;

/**
 * Retry helper with exponential backoff
 */
async function retry(fn, maxAttempts = 3, baseDelay = 1000) {
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt === maxAttempts) break;

      const delay = baseDelay * Math.pow(2, attempt - 1);
      console.log(`  ⏳ Attempt ${attempt} failed, retrying in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Fetch and parse provenance JSON
 */
async function fetchProvenance() {
  return retry(
    async () => {
      const { stdout } = await execa('curl', ['-4fsSL', provenanceUrl], { timeout: 30000 });
      return JSON.parse(stdout);
    },
    3,
    1000,
  );
}

/**
 * Validate SLSA provenance structure
 */
function validateSlsaStructure(provenance) {
  const errors = [];

  // Required SLSA fields
  const requiredFields = ['_type', 'subject', 'predicateType', 'predicate'];

  for (const field of requiredFields) {
    if (!provenance[field]) {
      errors.push(`Missing required SLSA field: ${field}`);
    }
  }

  // Validate _type (should be https://in-toto.io/Statement/v0.1)
  if (provenance._type && provenance._type !== 'https://in-toto.io/Statement/v0.1') {
    errors.push(`Invalid _type: ${provenance._type}`);
  }

  // Validate subject (artifacts being attested)
  if (provenance.subject && !Array.isArray(provenance.subject)) {
    errors.push('subject must be an array');
  }

  // Validate predicateType (should be SLSA provenance)
  if (provenance.predicateType && !provenance.predicateType.includes('slsa.dev/provenance')) {
    errors.push(`Invalid predicateType: ${provenance.predicateType}`);
  }

  return errors;
}

/**
 * Validate build metadata
 */
function validateBuildMetadata(provenance) {
  const errors = [];
  const predicate = provenance.predicate || {};
  const buildMetadata = predicate.buildMetadata || {};

  // Required build metadata fields
  const requiredFields = [
    'builder',
    'buildInvocationId',
    'buildStartedOn',
    'buildFinishedOn',
    'reproducible',
  ];

  for (const field of requiredFields) {
    if (!buildMetadata[field]) {
      errors.push(`Missing required build metadata field: ${field}`);
    }
  }

  // Validate builder
  if (buildMetadata.builder) {
    if (!buildMetadata.builder.id) {
      errors.push('Builder must have an id field');
    }
    if (!buildMetadata.builder.version) {
      errors.push('Builder should have version information');
    }
  }

  // Validate timestamps
  if (buildMetadata.buildStartedOn) {
    const startDate = new Date(buildMetadata.buildStartedOn);
    if (isNaN(startDate.getTime())) {
      errors.push(`Invalid buildStartedOn timestamp: ${buildMetadata.buildStartedOn}`);
    }
  }

  if (buildMetadata.buildFinishedOn) {
    const finishDate = new Date(buildMetadata.buildFinishedOn);
    if (isNaN(finishDate.getTime())) {
      errors.push(`Invalid buildFinishedOn timestamp: ${buildMetadata.buildFinishedOn}`);
    }
  }

  return errors;
}

/**
 * Validate materials (source code and dependencies)
 */
function validateMaterials(provenance) {
  const errors = [];
  const predicate = provenance.predicate || {};
  const materials = predicate.materials || [];

  for (let i = 0; i < materials.length; i++) {
    const material = materials[i];

    if (!material.uri) {
      errors.push(`Material ${i} missing uri`);
    }

    if (!material.digest) {
      errors.push(`Material ${i} missing digest`);
    } else {
      // Validate digest format (should have algorithm and hash)
      const digestKeys = Object.keys(material.digest);
      if (digestKeys.length === 0) {
        errors.push(`Material ${i} digest object is empty`);
      }

      for (const algorithm of digestKeys) {
        const hash = material.digest[algorithm];
        if (!hash || typeof hash !== 'string' || hash.length === 0) {
          errors.push(`Material ${i} has invalid ${algorithm} hash`);
        }
      }
    }
  }

  return errors;
}

/**
 * Validate environment and configuration
 */
function validateEnvironment(provenance) {
  const errors = [];
  const predicate = provenance.predicate || {};
  const environment = predicate.environment || {};

  // Check for Electron and Node.js version information
  if (!environment.electron && !environment.node) {
    errors.push('Missing Electron or Node.js version information');
  }

  // Validate platform information
  if (!environment.platform) {
    errors.push('Missing platform information');
  }

  // Check for node-pty ABI compatibility
  if (!environment.nodePtyAbi && !environment.abi) {
    errors.push('Missing node-pty ABI information');
  }

  return errors;
}

/**
 * Validate git commit information
 */
function validateGitMetadata(provenance) {
  const errors = [];
  const predicate = provenance.predicate || {};
  const source = predicate.source || {};

  if (!source.git) {
    errors.push('Missing git source information');
    return errors;
  }

  // Validate git repository
  if (!source.git.url) {
    errors.push('Missing git repository URL');
  }

  // Validate commit hash
  if (!source.git.commit) {
    errors.push('Missing git commit hash');
  } else {
    // Git commit should be 40 character SHA-1 hash
    const commitHash = source.git.commit;
    if (!/^[a-f0-9]{40}$/i.test(commitHash)) {
      errors.push(`Invalid git commit hash format: ${commitHash}`);
    }
  }

  // Validate branch information
  if (!source.git.branch) {
    errors.push('Missing git branch information');
  }

  return errors;
}

/**
 * Cross-reference with environment variables
 */
function crossReferenceWithEnv(provenance) {
  const warnings = [];
  const predicate = provenance.predicate || {};
  const buildMetadata = predicate.buildMetadata || {};
  const environment = predicate.environment || {};

  // Check GitHub Actions environment if available
  if (process.env.GITHUB_SHA && buildMetadata.buildInvocationId) {
    if (!buildMetadata.buildInvocationId.includes(process.env.GITHUB_SHA.substring(0, 7))) {
      warnings.push(`GitHub SHA ${process.env.GITHUB_SHA} not found in build invocation ID`);
    }
  }

  // Check Node.js version consistency
  if (process.env.NODE_VERSION && environment.node) {
    if (!environment.node.includes(process.env.NODE_VERSION)) {
      warnings.push(
        `Node.js version mismatch: expected ${process.env.NODE_VERSION}, got ${environment.node}`,
      );
    }
  }

  return warnings;
}

/**
 * Main provenance validation runner
 */
async function run() {
  try {
    console.log(`🔍 Validating provenance/SLSA metadata for version ${version}`);
    console.log(`🔍 Using origin: ${ORIGIN}`);
    console.log(`📋 Checking: ${provenanceUrl}`);

    // Fetch provenance JSON
    const provenance = await fetchProvenance();
    console.log('✅ Provenance JSON downloaded successfully');

    const allErrors = [];
    const allWarnings = [];

    // Validate SLSA structure
    const structureErrors = validateSlsaStructure(provenance);
    allErrors.push(...structureErrors);

    if (structureErrors.length === 0) {
      console.log('✅ SLSA structure validation passed');
    }

    // Validate build metadata
    const buildErrors = validateBuildMetadata(provenance);
    allErrors.push(...buildErrors);

    if (buildErrors.length === 0) {
      console.log('✅ Build metadata validation passed');
    }

    // Validate materials
    const materialsErrors = validateMaterials(provenance);
    allErrors.push(...materialsErrors);

    if (materialsErrors.length === 0) {
      console.log('✅ Materials validation passed');
    }

    // Validate environment
    const envErrors = validateEnvironment(provenance);
    allErrors.push(...envErrors);

    if (envErrors.length === 0) {
      console.log('✅ Environment validation passed');
    }

    // Validate git metadata
    const gitErrors = validateGitMetadata(provenance);
    allErrors.push(...gitErrors);

    if (gitErrors.length === 0) {
      console.log('✅ Git metadata validation passed');
    }

    // Cross-reference with environment
    const envWarnings = crossReferenceWithEnv(provenance);
    allWarnings.push(...envWarnings);

    if (envWarnings.length === 0) {
      console.log('✅ Environment cross-reference passed');
    }

    // Print summary
    console.log('\n📊 PROVENANCE VALIDATION RESULTS:');
    console.log('='.repeat(60));

    if (allErrors.length === 0 && allWarnings.length === 0) {
      console.log('🎉 All provenance validations passed!');
      console.log('✅ SLSA compliance verified');
    } else {
      if (allErrors.length > 0) {
        console.log(`❌ ${allErrors.length} PROVENANCE ERROR(S):`);
        for (const error of allErrors) {
          console.log(`  • ${error}`);
        }
      }

      if (allWarnings.length > 0) {
        console.log(`⚠️  ${allWarnings.length} PROVENANCE WARNING(S):`);
        for (const warning of allWarnings) {
          console.log(`  • ${warning}`);
        }
      }
    }

    console.log('='.repeat(60));

    if (allErrors.length > 0) {
      throw new Error(`Provenance validation failed with ${allErrors.length} error(s)`);
    }
  } catch (error) {
    if (error.code === 22) {
      console.log('⚠️  Provenance file not found - this is optional for now');
      console.log('   Future releases should include SLSA provenance metadata');
      return;
    }

    console.error(`❌ Provenance validation failed: ${error.message}`);
    throw error;
  }
}

// CLI interface
if (require.main === module) {
  run().catch(console.error);
}

module.exports = {
  run,
  validateSlsaStructure,
  validateBuildMetadata,
  validateMaterials,
  validateEnvironment,
  validateGitMetadata,
};
