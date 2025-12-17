// RinaWarp Terminal Pro - Cleanup & Configuration Knowledge Base
// This knowledge base teaches the AI terminal how to prevent and fix common project issues

export const cleanupKnowledgeBase = {
  // Project Organization Lessons
  projectOrganization: {
    title: 'Project Organization Best Practices',
    lessons: [
      {
        problem: 'Multiple deployment scripts causing confusion',
        solution:
          'Consolidate into 3 essential scripts: dev-start.sh, prod-deploy.sh, setup-environment.sh',
        prevention:
          'Always check for existing scripts before creating new ones',
        commands: [
          'find . -name \'*deploy*.sh\' | wc -l  # Count deployment scripts',
          'ls -la | grep -E \'(setup|configure|deploy)\'  # List config scripts',
        ],
      },
      {
        problem: 'node_modules installed in wrong directories',
        solution:
          'Only install in project root directories, not subdirectories',
        prevention:
          'Always run \'npm install\' from the correct package.json location',
        commands: [
          'find . -name node_modules -type d  # Find all node_modules',
          'du -sh node_modules  # Check size before installing',
        ],
      },
      {
        problem: 'Duplicate dependencies across projects',
        solution: 'Use workspace/monorepo approach or shared dependencies',
        prevention:
          'Audit dependencies regularly with \'npm audit\' and \'npm ls\'',
        commands: [
          'npm ls --depth=0  # List direct dependencies',
          'npm audit  # Check for vulnerabilities',
        ],
      },
    ],
  },

  // Configuration Management
  configurationManagement: {
    title: 'Configuration Management',
    lessons: [
      {
        problem: 'Hardcoded localhost URLs in production',
        solution: 'Use environment variables and configuration files',
        prevention: 'Never hardcode URLs, always use config variables',
        examples: {
          bad: 'fetch(\'https://rinawarptech.com/api\')',
          good: 'fetch(`${process.env.API_URL}/api`)',
        },
      },
      {
        problem: 'Mixed development and production configurations',
        solution: 'Separate configs with NODE_ENV environment variable',
        prevention: 'Always check NODE_ENV before applying configs',
        commands: [
          'echo $NODE_ENV  # Check current environment',
          'export NODE_ENV=production  # Set production mode',
        ],
      },
      {
        problem: 'Deprecated meta tags causing warnings',
        solution:
          'Update to current standards (apple-mobile-web-app-capable → mobile-web-app-capable)',
        prevention: 'Regularly audit HTML for deprecated tags',
        commands: [
          'grep -r \'apple-mobile-web-app-capable\' .  # Find deprecated tags',
          'sed -i \'s/apple-mobile-web-app-capable/mobile-web-app-capable/g\' *.html  # Fix tags',
        ],
      },
    ],
  },

  // Dependency Management
  dependencyManagement: {
    title: 'Dependency Management',
    lessons: [
      {
        problem: 'Dependencies in wrong package.json section',
        solution:
          'Move build tools to devDependencies, runtime deps to dependencies',
        prevention: 'Always categorize dependencies correctly',
        commands: [
          'npm install --save-dev package-name  # Dev dependency',
          'npm install --save package-name     # Runtime dependency',
        ],
      },
      {
        problem: 'Oversized node_modules directories',
        solution: 'Remove unnecessary dependencies and use .gitignore',
        prevention: 'Regular dependency audits and cleanup',
        commands: [
          'du -sh node_modules  # Check size',
          'npm prune  # Remove unused packages',
          'npx depcheck  # Find unused dependencies',
        ],
      },
      {
        problem: 'Version conflicts between projects',
        solution: 'Use consistent versions across all projects',
        prevention: 'Use package-lock.json and version ranges',
        commands: [
          'npm ls  # Check installed versions',
          'npm outdated  # Check for outdated packages',
        ],
      },
    ],
  },

  // File Structure Management
  fileStructureManagement: {
    title: 'File Structure Management',
    lessons: [
      {
        problem: 'Too many files causing confusion (42,744 files)',
        solution:
          'Organize into clear project structure with essential files only',
        prevention: 'Regular cleanup and organization',
        commands: [
          'find . -type f | wc -l  # Count total files',
          'find . -name \'*.bak\' -o -name \'*.tmp\' -o -name \'*~\'  # Find temp files',
          'find . -type d -empty  # Find empty directories',
        ],
      },
      {
        problem: 'Backup files cluttering project',
        solution: 'Use .gitignore and automated cleanup scripts',
        prevention: 'Never commit backup files to version control',
        commands: [
          'echo \'*.bak\n*.tmp\n*~\n*.backup\' >> .gitignore',
          'find . -name \'*.bak\' -delete  # Remove backup files',
        ],
      },
      {
        problem: 'Empty directories and unused files',
        solution: 'Regular cleanup and organization',
        prevention: 'Use linting and cleanup tools',
        commands: [
          'find . -type d -empty -delete  # Remove empty dirs',
          'find . -name \'*.log\' -mtime +7 -delete  # Remove old logs',
        ],
      },
    ],
  },

  // Business Configuration
  businessConfiguration: {
    title: 'Business Configuration',
    lessons: [
      {
        problem: 'Development URLs in production',
        solution: 'Configure all URLs to use production domain',
        prevention: 'Always use environment-based configuration',
        examples: {
          development: 'https://rinawarptech.com',
          production: 'https://rinawarptech.com',
        },
      },
      {
        problem: 'Test payment keys in production',
        solution:
          'Use live Stripe keys for production, test keys for development',
        prevention: 'Environment-based API key management',
        commands: [
          'echo $STRIPE_PUBLISHABLE_KEY  # Check current key',
          'export STRIPE_PUBLISHABLE_KEY=pk_live_...  # Set live key',
        ],
      },
      {
        problem: 'Missing business infrastructure',
        solution: 'Set up proper business tools (Stripe, AWS, domain)',
        prevention: 'Plan business infrastructure from the start',
        checklist: [
          'Stripe account with live keys',
          'AWS S3 buckets for hosting',
          'Domain configuration',
          'SSL certificates',
          'Payment processing',
          'Download delivery system',
        ],
      },
    ],
  },

  // Automation and Scripts
  automation: {
    title: 'Automation and Scripts',
    lessons: [
      {
        problem: 'Manual repetitive tasks',
        solution: 'Create automated scripts for common tasks',
        prevention: 'Always automate repetitive processes',
        examples: [
          'dev-start.sh - Start all development servers',
          'prod-deploy.sh - Deploy to production',
          'cleanup-scripts.sh - Clean up old files',
        ],
      },
      {
        problem: 'No process management',
        solution: 'Use PM2 for persistent server management',
        prevention: 'Always use process managers in production',
        commands: [
          'pm2 start ecosystem.config.cjs',
          'pm2 status',
          'pm2 restart all',
        ],
      },
      {
        problem: 'No backup strategy',
        solution: 'Always backup before making changes',
        prevention: 'Create backups before any major changes',
        commands: [
          'cp -r project project.backup.$(date +%Y%m%d)',
          'tar -czf backup.tar.gz project/',
        ],
      },
    ],
  },
};

// AI Assistant Functions
export const aiAssistantFunctions = {
  // Analyze project structure
  analyzeProject: (projectPath) => {
    const issues = [];
    const recommendations = [];

    // Check for too many files
    const fileCount = `find ${projectPath} -type f | wc -l`;
    if (parseInt(fileCount) > 10000) {
      issues.push('Too many files - consider cleanup');
      recommendations.push('Run cleanup script to remove unnecessary files');
    }

    // Check for duplicate deployment scripts
    const deployScripts = `find ${projectPath} -name "*deploy*.sh" | wc -l`;
    if (parseInt(deployScripts) > 5) {
      issues.push('Too many deployment scripts');
      recommendations.push('Consolidate deployment scripts');
    }

    // Check for node_modules in wrong places
    const nodeModulesCount = `find ${projectPath} -name node_modules -type d | wc -l`;
    if (parseInt(nodeModulesCount) > 6) {
      issues.push('node_modules in multiple locations');
      recommendations.push('Consolidate node_modules to project roots only');
    }

    return { issues, recommendations };
  },

  // Suggest cleanup commands
  suggestCleanup: (projectPath) => {
    return [
      '# Analyze project structure',
      `find ${projectPath} -type f | wc -l`,
      `find ${projectPath} -name node_modules -type d`,
      `find ${projectPath} -name "*deploy*.sh" | wc -l`,
      '',
      '# Clean up temporary files',
      `find ${projectPath} -name "*.bak" -o -name "*.tmp" -o -name "*~" -delete`,
      `find ${projectPath} -type d -empty -delete`,
      '',
      '# Check for hardcoded localhost URLs',
      `grep -r "localhost" ${projectPath} --include="*.js" --include="*.html"`,
      '',
      '# Audit dependencies',
      `cd ${projectPath} && npm audit`,
      `cd ${projectPath} && npm ls --depth=0`,
    ];
  },

  // Generate project health report
  generateHealthReport: (projectPath) => {
    const analysis = aiAssistantFunctions.analyzeProject(projectPath);

    return {
      projectPath,
      timestamp: new Date().toISOString(),
      healthScore: Math.max(0, 100 - analysis.issues.length * 10),
      issues: analysis.issues,
      recommendations: analysis.recommendations,
      nextSteps: [
        'Review and fix identified issues',
        'Run suggested cleanup commands',
        'Implement recommended best practices',
        'Set up automated monitoring',
      ],
    };
  },
};

export default cleanupKnowledgeBase;
