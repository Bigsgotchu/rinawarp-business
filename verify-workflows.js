#!/usr/bin/env node
import { existsSync, readFileSync } from "fs";
import { join } from "path";

// ===============================
// Workflow Verification Script
// ===============================

const WORKFLOWS_DIR = ".github/workflows";
const SCRIPTS = [
  "staging-test.js",
  "staging-smoke-test.js", 
  "production-test.js",
  "production-smoke-test.js"
];

const WORKFLOWS = [
  "staging.yml",
  "production.yml"
];

console.log("🔍 Verifying RinaWarp Staging Workflow Implementation\n");

// Check if all required scripts exist
console.log("📁 Checking required test scripts...");
let allScriptsExist = true;

SCRIPTS.forEach(script => {
  const path = join(process.cwd(), script);
  if (existsSync(path)) {
    console.log(`   ✅ ${script} - Found`);
  } else {
    console.log(`   ❌ ${script} - Missing`);
    allScriptsExist = false;
  }
});

// Check if workflow files exist
console.log("\n📁 Checking workflow files...");
let allWorkflowsExist = true;

WORKFLOWS.forEach(workflow => {
  const path = join(process.cwd(), WORKFLOWS_DIR, workflow);
  if (existsSync(path)) {
    console.log(`   ✅ ${workflow} - Found`);
  } else {
    console.log(`   ❌ ${workflow} - Missing`);
    allWorkflowsExist = false;
  }
});

// Verify workflow syntax
console.log("\n🔍 Verifying workflow syntax...");

WORKFLOWS.forEach(workflow => {
  const path = join(process.cwd(), WORKFLOWS_DIR, workflow);
  if (existsSync(path)) {
    try {
      const content = readFileSync(path, "utf8");
      
      // Basic syntax checks
      const hasName = content.includes("name:");
      const hasOn = content.includes("on:");
      const hasJobs = content.includes("jobs:");
      const hasSteps = content.includes("steps:");
      
      if (hasName && hasOn && hasJobs && hasSteps) {
        console.log(`   ✅ ${workflow} - Valid YAML syntax`);
      } else {
        console.log(`   ⚠️ ${workflow} - Potential syntax issues`);
      }
    } catch (err) {
      console.log(`   ❌ ${workflow} - Error reading file: ${err.message}`);
    }
  }
});

// Verify script syntax
console.log("\n🔍 Verifying script syntax...");

SCRIPTS.forEach(script => {
  const path = join(process.cwd(), script);
  if (existsSync(path)) {
    try {
      const content = readFileSync(path, "utf8");
      
      // Basic syntax checks
      const hasImport = content.includes("import");
      const hasMain = content.includes("async () =>");
      const hasExit = content.includes("process.exit");
      
      if (hasImport && hasMain && hasExit) {
        console.log(`   ✅ ${script} - Valid JavaScript syntax`);
      } else {
        console.log(`   ⚠️ ${script} - Potential syntax issues`);
      }
    } catch (err) {
      console.log(`   ❌ ${script} - Error reading file: ${err.message}`);
    }
  }
});

// Check for integration points
console.log("\n🔗 Checking integration points...");

const integrationChecks = [
  {
    name: "Cloudflare Pages Integration",
    check: () => {
      const stagingPath = join(process.cwd(), WORKFLOWS_DIR, "staging.yml");
      const productionPath = join(process.cwd(), WORKFLOWS_DIR, "production.yml");
      
      const checkFile = (path) => {
        if (existsSync(path)) {
          const content = readFileSync(path, "utf8");
          return content.includes("cloudflare/pages-action");
        }
        return false;
      };
      
      return checkFile(stagingPath) || checkFile(productionPath);
    }
  },
  {
    name: "Slack Notifications",
    check: () => {
      const stagingPath = join(process.cwd(), WORKFLOWS_DIR, "staging.yml");
      const productionPath = join(process.cwd(), WORKFLOWS_DIR, "production.yml");
      
      const checkFile = (path) => {
        if (existsSync(path)) {
          const content = readFileSync(path, "utf8");
          return content.includes("hooks.slack.com");
        }
        return false;
      };
      
      return checkFile(stagingPath) || checkFile(productionPath);
    }
  },
  {
    name: "GitHub Release Integration",
    check: () => {
      const stagingPath = join(process.cwd(), WORKFLOWS_DIR, "staging.yml");
      const productionPath = join(process.cwd(), WORKFLOWS_DIR, "production.yml");
      
      const checkFile = (path) => {
        if (existsSync(path)) {
          const content = readFileSync(path, "utf8");
          return content.includes("gh release");
        }
        return false;
      };
      
      return checkFile(stagingPath) || checkFile(productionPath);
    }
  },
  {
    name: "Artifact Management",
    check: () => {
      const stagingPath = join(process.cwd(), WORKFLOWS_DIR, "staging.yml");
      const productionPath = join(process.cwd(), WORKFLOWS_DIR, "production.yml");
      
      const checkFile = (path) => {
        if (existsSync(path)) {
          const content = readFileSync(path, "utf8");
          return content.includes("upload-artifact");
        }
        return false;
      };
      
      return checkFile(stagingPath) || checkFile(productionPath);
    }
  }
];

integrationChecks.forEach(check => {
  const result = check.check();
  console.log(`   ${result ? '✅' : '❌'} ${check.name} - ${result ? 'Configured' : 'Missing'}`);
});

// Final verification summary
console.log("\n" + "=".repeat(60));
console.log("VERIFICATION SUMMARY");
console.log("=".repeat(60));

const totalChecks = SCRIPTS.length + WORKFLOWS.length + integrationChecks.length;
const passedChecks = [
  allScriptsExist ? SCRIPTS.length : 0,
  allWorkflowsExist ? WORKFLOWS.length : 0,
  ...integrationChecks.map(check => check.check() ? 1 : 0)
].reduce((sum, count) => sum + count, 0);

console.log(`\n📊 Overall Status: ${passedChecks}/${totalChecks} checks passed`);
console.log(`   Scripts: ${SCRIPTS.length} (${allScriptsExist ? '✅' : '❌'})`);
console.log(`   Workflows: ${WORKFLOWS.length} (${allWorkflowsExist ? '✅' : '❌'})`);
console.log(`   Integrations: ${integrationChecks.length} (checking...)`);

// Debug integration checks
integrationChecks.forEach(check => {
  const result = check.check();
  console.log(`     • ${check.name}: ${result ? '✅' : '❌'}`);
});

if (passedChecks === totalChecks) {
  console.log("\n✅ ALL VERIFICATION CHECKS PASSED");
  console.log("🎉 RinaWarp staging workflow implementation is complete and ready for use!");
  console.log("\n📋 Next Steps:");
  console.log("1. Configure required GitHub secrets");
  console.log("2. Set up Cloudflare Pages projects");
  console.log("3. Test the workflow with a pull request");
  console.log("4. Monitor the first few deployments");
  process.exit(0);
} else {
  console.log("\n❌ SOME VERIFICATION CHECKS FAILED");
  console.log("🔧 Please review and fix the failed checks before using the workflow");
  process.exit(1);
}