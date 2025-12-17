// Plugin Manager System
// Manages and loads plugins for extensible functionality

export class PluginManager {
  constructor() {
    this.plugins = new Map();
    this.loadedPlugins = new Set();
    this.pluginHooks = {
      beforeCommand: [],
      afterCommand: [],
      onTerminalReady: [],
      onThemeChange: [],
      onUserAction: [],
    };

    this.initializePluginSystem();
  }

  initializePluginSystem() {
    // Load built-in plugins
    this.loadBuiltInPlugins();

    // Set up plugin discovery
    this.setupPluginDiscovery();

    // Set up plugin lifecycle
    this.setupPluginLifecycle();
  }

  loadBuiltInPlugins() {
    // Load Git Enhanced plugin
    this.loadPlugin('git-enhanced', {
      name: 'Git Enhanced',
      version: '1.0.0',
      description: 'Enhanced Git functionality with AI suggestions',
      author: 'RinaWarp Team',
      hooks: ['beforeCommand', 'afterCommand'],
      commands: ['git-status', 'git-branch', 'git-commit'],
      dependencies: [],
    });

    // Load Docker Tools plugin
    this.loadPlugin('docker-tools', {
      name: 'Docker Tools',
      version: '1.0.0',
      description: 'Docker container and image management tools',
      author: 'RinaWarp Team',
      hooks: ['beforeCommand', 'afterCommand'],
      commands: ['docker-ps', 'docker-build', 'docker-run'],
      dependencies: [],
    });

    // Load VS Code Integration plugin
    this.loadPlugin('vscode-integration', {
      name: 'VS Code Integration',
      version: '1.0.0',
      description: 'Integrate with VS Code for seamless development',
      author: 'RinaWarp Team',
      hooks: ['onTerminalReady', 'onUserAction'],
      commands: ['vscode-open', 'vscode-command'],
      dependencies: [],
    });
  }

  setupPluginDiscovery() {
    // Discover plugins from plugins directory
    this.discoverPlugins();

    // Set up hot reloading for development
    if (process.env.NODE_ENV === 'development') {
      this.setupHotReloading();
    }
  }

  discoverPlugins() {
    // In a real implementation, this would scan the plugins directory
    // For now, we'll use the built-in plugins
    console.log('🔌 Plugin system initialized with built-in plugins');
  }

  setupHotReloading() {
    // Set up file watching for plugin changes
    console.log('🔄 Hot reloading enabled for plugins');
  }

  setupPluginLifecycle() {
    // Set up plugin lifecycle management
    this.pluginLifecycle = {
      loading: new Set(),
      loaded: new Set(),
      error: new Set(),
    };
  }

  loadPlugin(pluginId, pluginConfig) {
    try {
      // Check if plugin is already loaded
      if (this.loadedPlugins.has(pluginId)) {
        console.warn(`Plugin ${pluginId} is already loaded`);
        return false;
      }

      // Validate plugin configuration
      if (!this.validatePluginConfig(pluginConfig)) {
        throw new Error('Invalid plugin configuration');
      }

      // Load plugin
      this.plugins.set(pluginId, {
        ...pluginConfig,
        id: pluginId,
        loaded: false,
        error: null,
      });

      // Initialize plugin
      this.initializePlugin(pluginId);

      console.log(`✅ Plugin ${pluginId} loaded successfully`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to load plugin ${pluginId}:`, error);
      this.pluginLifecycle.error.add(pluginId);
      return false;
    }
  }

  validatePluginConfig(config) {
    const required = ['name', 'version', 'description', 'author'];
    return required.every((field) => config.hasOwnProperty(field));
  }

  initializePlugin(pluginId) {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) return false;

    try {
      // Set up plugin hooks
      this.setupPluginHooks(pluginId, plugin);

      // Mark as loaded
      plugin.loaded = true;
      this.loadedPlugins.add(pluginId);
      this.pluginLifecycle.loaded.add(pluginId);

      return true;
    } catch (error) {
      plugin.error = error.message;
      this.pluginLifecycle.error.add(pluginId);
      return false;
    }
  }

  setupPluginHooks(pluginId, plugin) {
    if (plugin.hooks) {
      plugin.hooks.forEach((hook) => {
        if (this.pluginHooks[hook]) {
          this.pluginHooks[hook].push({
            pluginId,
            handler: this.getPluginHandler(pluginId, hook),
          });
        }
      });
    }
  }

  getPluginHandler(pluginId, hook) {
    // Return a handler function for the plugin hook
    return (data) => {
      try {
        return this.executePluginHook(pluginId, hook, data);
      } catch (error) {
        console.error(`Plugin ${pluginId} hook ${hook} error:`, error);
        return null;
      }
    };
  }

  executePluginHook(pluginId, hook, data) {
    const plugin = this.plugins.get(pluginId);
    if (!plugin || !plugin.loaded) return null;

    // Execute plugin-specific hook logic
    switch (pluginId) {
    case 'git-enhanced':
      return this.executeGitEnhancedHook(hook, data);
    case 'docker-tools':
      return this.executeDockerToolsHook(hook, data);
    case 'vscode-integration':
      return this.executeVSCodeIntegrationHook(hook, data);
    default:
      return null;
    }
  }

  executeGitEnhancedHook(hook, data) {
    switch (hook) {
    case 'beforeCommand':
      if (data.command.startsWith('git ')) {
        return this.enhanceGitCommand(data.command);
      }
      break;
    case 'afterCommand':
      if (data.command.startsWith('git ')) {
        return this.postProcessGitCommand(data);
      }
      break;
    }
    return null;
  }

  executeDockerToolsHook(hook, data) {
    switch (hook) {
    case 'beforeCommand':
      if (data.command.startsWith('docker ')) {
        return this.enhanceDockerCommand(data.command);
      }
      break;
    case 'afterCommand':
      if (data.command.startsWith('docker ')) {
        return this.postProcessDockerCommand(data);
      }
      break;
    }
    return null;
  }

  executeVSCodeIntegrationHook(hook, data) {
    switch (hook) {
    case 'onTerminalReady':
      return this.setupVSCodeIntegration();
    case 'onUserAction':
      return this.handleVSCodeUserAction(data);
    }
    return null;
  }

  // Plugin-specific implementations
  enhanceGitCommand(command) {
    // Add AI suggestions for Git commands
    const suggestions = this.getGitSuggestions(command);
    return {
      enhanced: true,
      suggestions: suggestions,
      originalCommand: command,
    };
  }

  postProcessGitCommand(data) {
    // Post-process Git command output
    return {
      processed: true,
      summary: this.generateGitSummary(data.output),
      nextSteps: this.suggestNextGitSteps(data.command),
    };
  }

  enhanceDockerCommand(command) {
    // Add Docker command enhancements
    const enhancements = this.getDockerEnhancements(command);
    return {
      enhanced: true,
      enhancements: enhancements,
      originalCommand: command,
    };
  }

  postProcessDockerCommand(data) {
    // Post-process Docker command output
    return {
      processed: true,
      summary: this.generateDockerSummary(data.output),
      recommendations: this.getDockerRecommendations(data.command),
    };
  }

  setupVSCodeIntegration() {
    // Set up VS Code integration
    return {
      integrated: true,
      features: ['file-opening', 'command-palette', 'debugging'],
    };
  }

  handleVSCodeUserAction(data) {
    // Handle VS Code user actions
    return {
      handled: true,
      action: data.action,
      result: 'success',
    };
  }

  // Helper methods
  getGitSuggestions(command) {
    const suggestions = [];

    if (command.includes('git status')) {
      suggestions.push('git add .', 'git commit -m "message"', 'git push');
    } else if (command.includes('git branch')) {
      suggestions.push('git checkout -b new-branch', 'git merge branch-name');
    } else if (command.includes('git commit')) {
      suggestions.push('git push', 'git tag v1.0.0');
    }

    return suggestions;
  }

  generateGitSummary(output) {
    // Generate a summary of Git command output
    return {
      filesChanged: this.extractFilesChanged(output),
      branches: this.extractBranches(output),
      commits: this.extractCommits(output),
    };
  }

  suggestNextGitSteps(command) {
    const steps = [];

    if (command.includes('git add')) {
      steps.push('git commit -m "Add changes"');
    } else if (command.includes('git commit')) {
      steps.push('git push origin main');
    }

    return steps;
  }

  getDockerEnhancements(command) {
    const enhancements = [];

    if (command.includes('docker run')) {
      enhancements.push('Add --rm flag for auto-cleanup');
      enhancements.push('Add -p flag for port mapping');
    } else if (command.includes('docker build')) {
      enhancements.push('Use .dockerignore for better performance');
      enhancements.push('Add --no-cache for fresh build');
    }

    return enhancements;
  }

  generateDockerSummary(output) {
    return {
      containers: this.extractContainers(output),
      images: this.extractImages(output),
      networks: this.extractNetworks(output),
    };
  }

  getDockerRecommendations(command) {
    const recommendations = [];

    if (command.includes('docker run')) {
      recommendations.push('Consider using docker-compose for complex setups');
    } else if (command.includes('docker build')) {
      recommendations.push('Use multi-stage builds for smaller images');
    }

    return recommendations;
  }

  // Utility methods
  extractFilesChanged(output) {
    // Extract file changes from Git output
    return output.match(/modified:\s+(.+)/g) || [];
  }

  extractBranches(output) {
    // Extract branch information from Git output
    return output.match(/\*\s+(.+)/g) || [];
  }

  extractCommits(output) {
    // Extract commit information from Git output
    return output.match(/commit\s+([a-f0-9]+)/g) || [];
  }

  extractContainers(output) {
    // Extract container information from Docker output
    return output.match(/[a-f0-9]+\s+.+/g) || [];
  }

  extractImages(output) {
    // Extract image information from Docker output
    return output.match(/[a-f0-9]+\s+.+/g) || [];
  }

  extractNetworks(output) {
    // Extract network information from Docker output
    return output.match(/[a-f0-9]+\s+.+/g) || [];
  }

  // Hook execution
  executeHooks(hookName, data) {
    const hooks = this.pluginHooks[hookName] || [];
    const results = [];

    hooks.forEach((hook) => {
      try {
        const result = hook.handler(data);
        if (result) {
          results.push({
            pluginId: hook.pluginId,
            result: result,
          });
        }
      } catch (error) {
        console.error(
          `Hook ${hookName} execution error for plugin ${hook.pluginId}:`,
          error
        );
      }
    });

    return results;
  }

  // Public API
  getLoadedPlugins() {
    return Array.from(this.loadedPlugins);
  }

  getPlugin(pluginId) {
    return this.plugins.get(pluginId);
  }

  getAllPlugins() {
    return Array.from(this.plugins.values());
  }

  unloadPlugin(pluginId) {
    if (this.loadedPlugins.has(pluginId)) {
      this.loadedPlugins.delete(pluginId);
      this.pluginLifecycle.loaded.delete(pluginId);

      // Remove hooks
      Object.keys(this.pluginHooks).forEach((hookName) => {
        this.pluginHooks[hookName] = this.pluginHooks[hookName].filter(
          (hook) => hook.pluginId !== pluginId
        );
      });

      console.log(`✅ Plugin ${pluginId} unloaded`);
      return true;
    }
    return false;
  }

  getPluginStatus() {
    return {
      total: this.plugins.size,
      loaded: this.loadedPlugins.size,
      errors: this.pluginLifecycle.error.size,
      hooks: Object.keys(this.pluginHooks).reduce((acc, hook) => {
        acc[hook] = this.pluginHooks[hook].length;
        return acc;
      }, {}),
    };
  }
}

// Global instance
window.pluginManager = new PluginManager();
