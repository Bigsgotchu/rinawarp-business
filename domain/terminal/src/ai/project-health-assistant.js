// RinaWarp Terminal Pro - Project Health Assistant
// AI assistant that helps prevent and fix common project issues

import {
  cleanupKnowledgeBase,
  aiAssistantFunctions,
} from './cleanup-knowledge-base.js';

export class ProjectHealthAssistant {
  constructor() {
    this.knowledgeBase = cleanupKnowledgeBase;
    this.assistantFunctions = aiAssistantFunctions;
  }

  // Main AI assistant function
  async analyzeAndAdvise(userQuery, projectPath = '.') {
    const query = userQuery.toLowerCase();

    // Detect what the user is asking about
    if (
      query.includes('clean') ||
      query.includes('organize') ||
      query.includes('mess')
    ) {
      return this.handleCleanupRequest(projectPath);
    }

    if (
      query.includes('deploy') ||
      query.includes('production') ||
      query.includes('host')
    ) {
      return this.handleDeploymentRequest(projectPath);
    }

    if (
      query.includes('dependencies') ||
      query.includes('npm') ||
      query.includes('install')
    ) {
      return this.handleDependencyRequest(projectPath);
    }

    if (
      query.includes('config') ||
      query.includes('setup') ||
      query.includes('configure')
    ) {
      return this.handleConfigurationRequest(projectPath);
    }

    if (
      query.includes('business') ||
      query.includes('stripe') ||
      query.includes('payment')
    ) {
      return this.handleBusinessRequest(projectPath);
    }

    // General project health check
    return this.handleGeneralHealthCheck(projectPath);
  }

  // Handle cleanup requests
  handleCleanupRequest(projectPath) {
    const analysis = this.assistantFunctions.analyzeProject(projectPath);

    return {
      type: 'cleanup',
      message: `🧹 Project Cleanup Analysis for ${projectPath}`,
      issues: analysis.issues,
      recommendations: analysis.recommendations,
      commands: this.assistantFunctions.suggestCleanup(projectPath),
      knowledge: this.knowledgeBase.projectOrganization.lessons,
      nextSteps: [
        'Run the suggested cleanup commands',
        'Review the knowledge base lessons',
        'Implement best practices to prevent future issues',
      ],
    };
  }

  // Handle deployment requests
  handleDeploymentRequest(projectPath) {
    return {
      type: 'deployment',
      message: `🚀 Deployment Setup for ${projectPath}`,
      checklist: [
        '✅ Consolidate deployment scripts (max 3 essential scripts)',
        '✅ Configure production URLs (not localhost)',
        '✅ Set up environment variables',
        '✅ Configure PM2 for process management',
        '✅ Set up AWS S3 and CloudFront',
        '✅ Configure domain and SSL',
      ],
      commands: [
        '# Check current deployment scripts',
        "find . -name '*deploy*.sh' | wc -l",
        '',
        '# Consolidate to essential scripts only',
        'mv *deploy*.sh backup/',
        'mv *setup*.sh backup/',
        '',
        '# Create essential scripts',
        'touch dev-start.sh prod-deploy.sh setup-environment.sh',
      ],
      knowledge: this.knowledgeBase.automation.lessons,
    };
  }

  // Handle dependency requests
  handleDependencyRequest(projectPath) {
    return {
      type: 'dependencies',
      message: `📦 Dependency Management for ${projectPath}`,
      checklist: [
        '✅ Check for node_modules in wrong locations',
        '✅ Audit dependencies for size and duplicates',
        '✅ Move build tools to devDependencies',
        '✅ Remove unused dependencies',
        '✅ Use consistent versions across projects',
      ],
      commands: [
        '# Find all node_modules directories',
        'find . -name node_modules -type d',
        '',
        '# Check dependency sizes',
        'du -sh node_modules',
        '',
        '# Audit dependencies',
        'npm audit',
        'npm ls --depth=0',
        '',
        '# Remove unused dependencies',
        'npx depcheck',
      ],
      knowledge: this.knowledgeBase.dependencyManagement.lessons,
    };
  }

  // Handle configuration requests
  handleConfigurationRequest(projectPath) {
    return {
      type: 'configuration',
      message: `⚙️ Configuration Management for ${projectPath}`,
      checklist: [
        '✅ Replace hardcoded localhost URLs',
        '✅ Use environment variables',
        '✅ Separate dev/prod configurations',
        '✅ Update deprecated meta tags',
        '✅ Configure proper CORS settings',
      ],
      commands: [
        '# Find hardcoded localhost URLs',
        "grep -r 'localhost' . --include='*.js' --include='*.html'",
        '',
        '# Replace with environment variables',
        "sed -i 's/rinawarptech.com/${API_URL}/g' *.js",
        '',
        '# Check for deprecated meta tags',
        "grep -r 'apple-mobile-web-app-capable' .",
        '',
        '# Update meta tags',
        "sed -i 's/apple-mobile-web-app-capable/mobile-web-app-capable/g' *.html",
      ],
      knowledge: this.knowledgeBase.configurationManagement.lessons,
    };
  }

  // Handle business requests
  handleBusinessRequest(projectPath) {
    return {
      type: 'business',
      message: `🏢 Business Configuration for ${projectPath}`,
      checklist: [
        '✅ Set up Stripe with live keys',
        '✅ Configure production domain',
        '✅ Set up payment processing',
        '✅ Configure download delivery',
        '✅ Set up business monitoring',
      ],
      commands: [
        '# Check Stripe configuration',
        'echo $STRIPE_PUBLISHABLE_KEY',
        '',
        '# Update production URLs',
        "sed -i 's/rinawarptech.com/rinawarptech.com/g' *.js",
        '',
        '# Set up environment variables',
        'export NODE_ENV=production',
        'export DOMAIN=rinawarptech.com',
      ],
      knowledge: this.knowledgeBase.businessConfiguration.lessons,
    };
  }

  // General health check
  handleGeneralHealthCheck(projectPath) {
    const healthReport =
      this.assistantFunctions.generateHealthReport(projectPath);

    return {
      type: 'health-check',
      message: `🏥 Project Health Check for ${projectPath}`,
      healthScore: healthReport.healthScore,
      issues: healthReport.issues,
      recommendations: healthReport.recommendations,
      commands: [
        '# Run comprehensive health check',
        'find . -type f | wc -l',
        'find . -name node_modules -type d | wc -l',
        "find . -name '*deploy*.sh' | wc -l",
        "find . -name '*.bak' -o -name '*.tmp' | wc -l",
        '',
        '# Check for common issues',
        "grep -r 'localhost' . --include='*.js' | wc -l",
        'npm audit --audit-level moderate',
      ],
      nextSteps: healthReport.nextSteps,
    };
  }

  // Generate AI training prompt
  generateTrainingPrompt() {
    return `
# RinaWarp Terminal Pro AI Training

You are an AI assistant that helps developers maintain clean, organized, and production-ready projects. 

## Key Principles:
1. **Prevention over Fixing**: Help users avoid issues before they become problems
2. **Consolidation**: Always suggest consolidating similar tools/scripts
3. **Organization**: Keep projects clean and organized
4. **Production Ready**: Always consider production deployment needs

## Common Issues to Watch For:
- Too many deployment scripts (consolidate to 3 essential ones)
- node_modules in wrong directories (only in project roots)
- Hardcoded localhost URLs (use environment variables)
- Deprecated meta tags (update to current standards)
- Mixed dev/prod configurations (separate with NODE_ENV)
- Oversized dependencies (regular audits and cleanup)

## When Users Ask About:
- **Cleanup**: Suggest consolidation and organization
- **Deployment**: Focus on production-ready configuration
- **Dependencies**: Emphasize proper organization and auditing
- **Configuration**: Stress environment-based configuration
- **Business**: Ensure production business setup

## Always Provide:
1. Specific commands to run
2. Checklists for verification
3. Prevention strategies
4. Best practices from knowledge base

Remember: Help users build maintainable, scalable, and production-ready projects from the start.
    `;
  }

  // Export knowledge base for terminal integration
  exportKnowledgeForTerminal() {
    return {
      commands: {
        'project-health': 'Run comprehensive project health check',
        'cleanup-suggest': 'Suggest cleanup commands for current project',
        'deploy-setup': 'Set up production deployment configuration',
        'dependency-audit': 'Audit and clean up dependencies',
        'config-fix': 'Fix configuration issues',
      },
      knowledge: this.knowledgeBase,
      functions: this.assistantFunctions,
    };
  }
}

export default ProjectHealthAssistant;
