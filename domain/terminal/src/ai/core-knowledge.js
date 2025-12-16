// RinaWarp Terminal Pro - Core Technical Knowledge Base
// Essential technical lessons only - no small talk

export const CORE_TECHNICAL_KNOWLEDGE = {
  // Project Organization - Critical Issues
  projectOrganization: {
    criticalIssues: [
      {
        problem: 'Multiple deployment scripts (62+ scripts found)',
        solution:
          'Consolidate to 3 essential scripts: dev-start.sh, prod-deploy.sh, setup-environment.sh',
        autoFix: "find . -name '*deploy*.sh' -exec mv {} backup/ \\;",
        prevention: 'Always check existing scripts before creating new ones',
      },
      {
        problem:
          'node_modules in wrong directories (server/, src/, deployment/)',
        solution: 'Only install in project root directories',
        autoFix:
          "find . -name node_modules -not -path './node_modules' -exec rm -rf {} \\;",
        prevention: 'Always run npm install from correct package.json location',
      },
      {
        problem: 'Too many files (42,744 files causing confusion)',
        solution: 'Organize into clear structure with essential files only',
        autoFix: "find . -name '*.bak' -o -name '*.tmp' -o -name '*~' -delete",
        prevention: 'Use .gitignore and regular cleanup',
      },
    ],
  },

  // Configuration Management - Critical Issues
  configurationManagement: {
    criticalIssues: [
      {
        problem: 'Hardcoded localhost URLs in production code',
        solution: 'Use environment variables and configuration files',
        autoFix: "sed -i 's/rinawarptech.com/${API_URL}/g' *.js",
        prevention: 'Never hardcode URLs, always use config variables',
      },
      {
        problem: 'Deprecated meta tags causing browser warnings',
        solution: 'Update to current standards',
        autoFix:
          "sed -i 's/apple-mobile-web-app-capable/mobile-web-app-capable/g' *.html",
        prevention: 'Regularly audit HTML for deprecated tags',
      },
      {
        problem: 'Mixed development and production configurations',
        solution: 'Separate with NODE_ENV environment variable',
        autoFix: 'export NODE_ENV=production',
        prevention: 'Always check NODE_ENV before applying configs',
      },
    ],
  },

  // Dependency Management - Critical Issues
  dependencyManagement: {
    criticalIssues: [
      {
        problem: 'Dependencies in wrong package.json section',
        solution:
          'Move build tools to devDependencies, runtime deps to dependencies',
        autoFix: 'npm install --save-dev package-name',
        prevention: 'Always categorize dependencies correctly',
      },
      {
        problem: 'Oversized node_modules (1.7GB total)',
        solution: 'Remove unnecessary dependencies and use .gitignore',
        autoFix: 'npm prune && npx depcheck',
        prevention: 'Regular dependency audits and cleanup',
      },
      {
        problem: 'Version conflicts between projects',
        solution: 'Use consistent versions across all projects',
        autoFix: 'npm ls && npm outdated',
        prevention: 'Use package-lock.json and version ranges',
      },
    ],
  },

  // Business Configuration - Critical Issues
  businessConfiguration: {
    criticalIssues: [
      {
        problem: 'Development URLs in production (rinawarptech.com)',
        solution: 'Configure all URLs to use production domain',
        autoFix: "sed -i 's/rinawarptech.com/rinawarptech.com/g' *.js",
        prevention: 'Always use environment-based configuration',
      },
      {
        problem: 'Test payment keys in production',
        solution:
          'Use live Stripe keys for production, test keys for development',
        autoFix: 'export STRIPE_PUBLISHABLE_KEY=pk_live_...',
        prevention: 'Environment-based API key management',
      },
      {
        problem: 'Missing business infrastructure',
        solution: 'Set up proper business tools (Stripe, AWS, domain)',
        autoFix: 'Configure AWS S3, CloudFront, domain, SSL certificates',
        prevention: 'Plan business infrastructure from the start',
      },
    ],
  },

  // Process Management - Critical Issues
  processManagement: {
    criticalIssues: [
      {
        problem: 'No process management for servers',
        solution: 'Use PM2 for persistent server management',
        autoFix: 'pm2 start ecosystem.config.cjs',
        prevention: 'Always use process managers in production',
      },
      {
        problem: 'No backup strategy',
        solution: 'Always backup before making changes',
        autoFix: 'cp -r project project.backup.$(date +%Y%m%d)',
        prevention: 'Create backups before any major changes',
      },
      {
        problem: 'Manual repetitive tasks',
        solution: 'Create automated scripts for common tasks',
        autoFix: 'Create dev-start.sh, prod-deploy.sh, cleanup.sh',
        prevention: 'Always automate repetitive processes',
      },
    ],
  },
};

// Auto-Detection Rules
export const AUTO_DETECTION_RULES = {
  // File count thresholds
  fileCount: {
    warning: 5000,
    critical: 10000,
    action: 'Run cleanup script',
  },

  // Deployment script thresholds
  deployScripts: {
    warning: 3,
    critical: 5,
    action: 'Consolidate to 3 essential scripts',
  },

  // Node modules thresholds
  nodeModules: {
    warning: 4,
    critical: 6,
    action: 'Move to project roots only',
  },

  // Localhost references
  localhostRefs: {
    warning: 5,
    critical: 10,
    action: 'Replace with environment variables',
  },

  // Dependency size thresholds
  dependencySize: {
    warning: 500000000, // 500MB
    critical: 1000000000, // 1GB
    action: 'Audit and clean dependencies',
  },
};

// Auto-Fix Commands
export const AUTO_FIX_COMMANDS = {
  cleanup: [
    "find . -name '*.bak' -o -name '*.tmp' -o -name '*~' -delete",
    'find . -type d -empty -delete',
    "find . -name '*.log' -mtime +7 -delete",
  ],

  consolidate: [
    "find . -name '*deploy*.sh' -exec mv {} backup/ \\;",
    "find . -name '*setup*.sh' -exec mv {} backup/ \\;",
    'touch dev-start.sh prod-deploy.sh setup-environment.sh',
  ],

  dependencies: [
    'npm prune',
    'npx depcheck',
    'npm audit --audit-level moderate',
  ],

  configuration: [
    "sed -i 's/rinawarptech.com/${API_URL}/g' *.js",
    "sed -i 's/apple-mobile-web-app-capable/mobile-web-app-capable/g' *.html",
    'export NODE_ENV=production',
  ],

  business: [
    'export STRIPE_PUBLISHABLE_KEY=pk_live_...',
    "sed -i 's/rinawarptech.com/rinawarptech.com/g' *.js",
    'pm2 start ecosystem.config.cjs',
  ],
};

// Knowledge Integration Functions
export const KNOWLEDGE_INTEGRATION = {
  // Analyze project state
  analyzeProject: (projectPath = '.') => {
    const analysis = {
      fileCount: 0,
      deployScripts: 0,
      nodeModules: 0,
      localhostRefs: 0,
      dependencySize: 0,
      issues: [],
      suggestions: [],
      autoFixes: [],
    };

    // This would be implemented with actual file system analysis
    // For now, returning structure
    return analysis;
  },

  // Generate suggestions based on analysis
  generateSuggestions: (analysis) => {
    const suggestions = [];

    if (analysis.fileCount > AUTO_DETECTION_RULES.fileCount.critical) {
      suggestions.push('Run cleanup script to remove unnecessary files');
    }

    if (analysis.deployScripts > AUTO_DETECTION_RULES.deployScripts.critical) {
      suggestions.push('Consolidate deployment scripts to 3 essential ones');
    }

    if (analysis.nodeModules > AUTO_DETECTION_RULES.nodeModules.critical) {
      suggestions.push('Move node_modules to project roots only');
    }

    if (analysis.localhostRefs > AUTO_DETECTION_RULES.localhostRefs.critical) {
      suggestions.push('Replace localhost URLs with environment variables');
    }

    return suggestions;
  },

  // Generate auto-fix commands
  generateAutoFixes: (analysis) => {
    const fixes = [];

    if (analysis.fileCount > AUTO_DETECTION_RULES.fileCount.critical) {
      fixes.push(...AUTO_FIX_COMMANDS.cleanup);
    }

    if (analysis.deployScripts > AUTO_DETECTION_RULES.deployScripts.critical) {
      fixes.push(...AUTO_FIX_COMMANDS.consolidate);
    }

    if (analysis.localhostRefs > AUTO_DETECTION_RULES.localhostRefs.critical) {
      fixes.push(...AUTO_FIX_COMMANDS.configuration);
    }

    return fixes;
  },
};

export default CORE_TECHNICAL_KNOWLEDGE;
