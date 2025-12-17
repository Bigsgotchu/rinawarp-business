// RinaWarp Terminal Pro - Project Health Commands
// Commands that integrate the cleanup knowledge into the terminal

import { ProjectHealthAssistant } from '../ai/project-health-assistant.js';

export const projectHealthCommands = {
  // Main project health check command
  'project-health': {
    description: 'Run comprehensive project health analysis',
    usage: 'project-health [path]',
    execute: async (args, terminal) => {
      const path = args[0] || '.';
      const assistant = new ProjectHealthAssistant();
      const result = await assistant.analyzeAndAdvise('health check', path);

      terminal.write(`\n${result.message}\n`);
      terminal.write(`Health Score: ${result.healthScore}/100\n\n`);

      if (result.issues.length > 0) {
        terminal.write('🚨 Issues Found:\n');
        result.issues.forEach((issue) => terminal.write(`  • ${issue}\n`));
        terminal.write('\n');
      }

      if (result.recommendations.length > 0) {
        terminal.write('💡 Recommendations:\n');
        result.recommendations.forEach((rec) => terminal.write(`  • ${rec}\n`));
        terminal.write('\n');
      }

      terminal.write('🔧 Suggested Commands:\n');
      result.commands.forEach((cmd) => terminal.write(`  ${cmd}\n`));
    },
  },

  // Cleanup suggestion command
  'cleanup-suggest': {
    description: 'Suggest cleanup commands for current project',
    usage: 'cleanup-suggest [path]',
    execute: async (args, terminal) => {
      const path = args[0] || '.';
      const assistant = new ProjectHealthAssistant();
      const result = await assistant.analyzeAndAdvise('cleanup', path);

      terminal.write(`\n${result.message}\n\n`);

      if (result.issues.length > 0) {
        terminal.write('🚨 Issues Found:\n');
        result.issues.forEach((issue) => terminal.write(`  • ${issue}\n`));
        terminal.write('\n');
      }

      terminal.write('🧹 Cleanup Commands:\n');
      result.commands.forEach((cmd) => terminal.write(`  ${cmd}\n`));

      terminal.write('\n📚 Knowledge Base Lessons:\n');
      result.knowledge.forEach((lesson) => {
        terminal.write(`  Problem: ${lesson.problem}\n`);
        terminal.write(`  Solution: ${lesson.solution}\n\n`);
      });
    },
  },

  // Deployment setup command
  'deploy-setup': {
    description: 'Set up production deployment configuration',
    usage: 'deploy-setup [path]',
    execute: async (args, terminal) => {
      const path = args[0] || '.';
      const assistant = new ProjectHealthAssistant();
      const result = await assistant.analyzeAndAdvise('deployment', path);

      terminal.write(`\n${result.message}\n\n`);

      terminal.write('📋 Deployment Checklist:\n');
      result.checklist.forEach((item) => terminal.write(`  ${item}\n`));

      terminal.write('\n🔧 Setup Commands:\n');
      result.commands.forEach((cmd) => terminal.write(`  ${cmd}\n`));
    },
  },

  // Dependency audit command
  'dependency-audit': {
    description: 'Audit and clean up dependencies',
    usage: 'dependency-audit [path]',
    execute: async (args, terminal) => {
      const path = args[0] || '.';
      const assistant = new ProjectHealthAssistant();
      const result = await assistant.analyzeAndAdvise('dependencies', path);

      terminal.write(`\n${result.message}\n\n`);

      terminal.write('📋 Dependency Checklist:\n');
      result.checklist.forEach((item) => terminal.write(`  ${item}\n`));

      terminal.write('\n🔧 Audit Commands:\n');
      result.commands.forEach((cmd) => terminal.write(`  ${cmd}\n`));
    },
  },

  // Configuration fix command
  'config-fix': {
    description: 'Fix configuration issues',
    usage: 'config-fix [path]',
    execute: async (args, terminal) => {
      const path = args[0] || '.';
      const assistant = new ProjectHealthAssistant();
      const result = await assistant.analyzeAndAdvise('configuration', path);

      terminal.write(`\n${result.message}\n\n`);

      terminal.write('📋 Configuration Checklist:\n');
      result.checklist.forEach((item) => terminal.write(`  ${item}\n`));

      terminal.write('\n🔧 Fix Commands:\n');
      result.commands.forEach((cmd) => terminal.write(`  ${cmd}\n`));
    },
  },

  // Business setup command
  'business-setup': {
    description: 'Set up business configuration',
    usage: 'business-setup [path]',
    execute: async (args, terminal) => {
      const path = args[0] || '.';
      const assistant = new ProjectHealthAssistant();
      const result = await assistant.analyzeAndAdvise('business', path);

      terminal.write(`\n${result.message}\n\n`);

      terminal.write('📋 Business Setup Checklist:\n');
      result.checklist.forEach((item) => terminal.write(`  ${item}\n`));

      terminal.write('\n🔧 Setup Commands:\n');
      result.commands.forEach((cmd) => terminal.write(`  ${cmd}\n`));
    },
  },

  // Learn command - shows knowledge base
  'learn-cleanup': {
    description: 'Learn about project cleanup and organization',
    usage: 'learn-cleanup [topic]',
    execute: async (args, terminal) => {
      const topic = args[0] || 'all';
      const assistant = new ProjectHealthAssistant();

      terminal.write('\n📚 RinaWarp Cleanup Knowledge Base\n');
      terminal.write('=====================================\n\n');

      if (topic === 'all' || topic === 'organization') {
        terminal.write('🏗️ Project Organization:\n');
        assistant.knowledgeBase.projectOrganization.lessons.forEach(
          (lesson) => {
            terminal.write(`  Problem: ${lesson.problem}\n`);
            terminal.write(`  Solution: ${lesson.solution}\n`);
            terminal.write(`  Prevention: ${lesson.prevention}\n\n`);
          }
        );
      }

      if (topic === 'all' || topic === 'dependencies') {
        terminal.write('📦 Dependency Management:\n');
        assistant.knowledgeBase.dependencyManagement.lessons.forEach(
          (lesson) => {
            terminal.write(`  Problem: ${lesson.problem}\n`);
            terminal.write(`  Solution: ${lesson.solution}\n`);
            terminal.write(`  Prevention: ${lesson.prevention}\n\n`);
          }
        );
      }

      if (topic === 'all' || topic === 'configuration') {
        terminal.write('⚙️ Configuration Management:\n');
        assistant.knowledgeBase.configurationManagement.lessons.forEach(
          (lesson) => {
            terminal.write(`  Problem: ${lesson.problem}\n`);
            terminal.write(`  Solution: ${lesson.solution}\n`);
            terminal.write(`  Prevention: ${lesson.prevention}\n\n`);
          }
        );
      }
    },
  },
};

// Export for terminal integration
export default projectHealthCommands;
