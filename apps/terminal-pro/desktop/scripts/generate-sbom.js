#!/usr/bin/env node

/**
 * Generate SBOM (Software Bill of Materials) for RinaWarp Terminal Pro
 * Outputs SPDX format JSON file
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class SBOMGenerator {
  constructor() {
    this.version = require('../package.json').version;
    this.name = 'RinaWarp Terminal Pro';
    this.namespace = 'com.rinawarp.terminalpro';
  }

  async generate() {
    console.log('📦 Generating SBOM...');

    const sbom = {
      spdxVersion: 'SPDX-2.3',
      dataLicense: 'CC0-1.0',
      SPDXID: 'SPDXRef-DOCUMENT',
      documentName: `${this.name}-${this.version}`,
      documentNamespace: `https://rinawarp.com/spdx/${this.name}-${this.version}`,
      creationInfo: {
        created: new Date().toISOString(),
        creators: ['Tool: rinawarp-sbom-generator-1.0.0'],
        comment: 'Generated SBOM for RinaWarp Terminal Pro release',
      },
      packages: await this.collectPackages(),
      relationships: this.generateRelationships(),
    };

    const distDir = path.join(__dirname, '..', 'dist');
    if (!fs.existsSync(distDir)) {
      fs.mkdirSync(distDir, { recursive: true });
    }

    const outputPath = path.join(distDir, `sbom-${this.version}.spdx.json`);
    fs.writeFileSync(outputPath, JSON.stringify(sbom, null, 2));

    console.log(`✅ SBOM generated: ${outputPath}`);
    return outputPath;
  }

  async collectPackages() {
    const packages = [];

    // Main application package
    packages.push({
      SPDXID: `SPDXRef-Package-${this.namespace}`,
      name: this.name,
      versionInfo: this.version,
      downloadLocation: 'NOASSERTION',
      filesAnalyzed: false,
      copyrightText: 'NOASSERTION',
      licenseConcluded: 'MIT',
      licenseDeclared: 'MIT',
      supplier: 'Organization: RinaWarp Technologies',
      description: 'Local-first intent-to-execution desktop terminal application',
    });

    // Collect dependencies from package.json
    const pkg = require('../package.json');
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };

    for (const [name, version] of Object.entries(deps)) {
      packages.push({
        SPDXID: `SPDXRef-Package-${name.replace(/[^a-zA-Z0-9]/g, '-')}`,
        name,
        versionInfo: version.replace(/[\^~]/g, ''),
        downloadLocation: `https://registry.npmjs.org/${name}/-/${name}-${version.replace(/[\^~]/g, '')}.tgz`,
        filesAnalyzed: false,
        copyrightText: 'NOASSERTION',
        licenseConcluded: 'NOASSERTION',
        licenseDeclared: 'NOASSERTION',
        supplier: 'NOASSERTION',
      });
    }

    // Electron and Node.js
    packages.push({
      SPDXID: 'SPDXRef-Package-Electron',
      name: 'Electron',
      versionInfo: pkg.devDependencies.electron.replace(/[\^~]/g, ''),
      downloadLocation: 'https://github.com/electron/electron/releases',
      filesAnalyzed: false,
      copyrightText: 'NOASSERTION',
      licenseConcluded: 'MIT',
      licenseDeclared: 'MIT',
      supplier: 'Organization: GitHub',
    });

    // Node-pty
    packages.push({
      SPDXID: 'SPDXRef-Package-node-pty',
      name: 'node-pty',
      versionInfo: pkg.dependencies['node-pty'].replace(/[\^~]/g, ''),
      downloadLocation: 'https://github.com/microsoft/node-pty',
      filesAnalyzed: false,
      copyrightText: 'NOASSERTION',
      licenseConcluded: 'MIT',
      licenseDeclared: 'MIT',
      supplier: 'Organization: Microsoft',
    });

    return packages;
  }

  generateRelationships() {
    const relationships = [];

    // Main package contains dependencies
    const pkg = require('../package.json');
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };

    for (const name of Object.keys(deps)) {
      relationships.push({
        spdxElementId: `SPDXRef-Package-${this.namespace}`,
        relationshipType: 'DEPENDS_ON',
        relatedSpdxElement: `SPDXRef-Package-${name.replace(/[^a-zA-Z0-9]/g, '-')}`,
      });
    }

    // Main package contains Electron
    relationships.push({
      spdxElementId: `SPDXRef-Package-${this.namespace}`,
      relationshipType: 'DEPENDS_ON',
      relatedSpdxElement: 'SPDXRef-Package-Electron',
    });

    return relationships;
  }
}

// CLI interface
if (require.main === module) {
  const generator = new SBOMGenerator();
  generator.generate().catch(console.error);
}

module.exports = SBOMGenerator;
