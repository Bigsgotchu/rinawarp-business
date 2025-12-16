/**
 * RinaWarp Terminal Pro - Plugin System
 * Extensible plugin architecture for custom functionality
 */

import { EventEmitter } from 'events';
import fs from 'fs';
import path from 'path';

class PluginManager extends EventEmitter {
  constructor(options = {}) {
    super();
    this.options = {
      pluginsDir: path.join(process.cwd(), 'plugins'),
      autoLoad: true,
      ...options,
    };

    this.plugins = new Map();
    this.hooks = new Map();
    this.commands = new Map();
    this.themes = new Map();
    this.workflows = new Map();

    this.init();
  }

  init() {
    // Create plugins directory
    if (!fs.existsSync(this.options.pluginsDir)) {
      fs.mkdirSync(this.options.pluginsDir, { recursive: true });
    }

    // Create plugins subdirectories
    const subdirs = ['commands', 'themes', 'workflows', 'hooks'];
    subdirs.forEach((subdir) => {
      const dir = path.join(this.options.pluginsDir, subdir);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });

    if (this.options.autoLoad) {
      this.loadAllPlugins();
    }
  }

  loadAllPlugins() {
    try {
      const files = fs.readdirSync(this.options.pluginsDir);
      const pluginFiles = files.filter((file) => file.endsWith('.js'));

      for (const file of pluginFiles) {
        this.loadPlugin(path.join(this.options.pluginsDir, file));
      }

      this.emit('pluginsLoaded', Array.from(this.plugins.values()));
    } catch (error) {
      console.error('Error loading plugins:', error);
    }
  }

  loadPlugin(pluginPath) {
    try {
      // Clear require cache for hot reloading
      delete require.cache[require.resolve(pluginPath)];

      const plugin = require(pluginPath);
      const pluginInfo = this.validatePlugin(plugin);

      if (pluginInfo) {
        this.plugins.set(pluginInfo.id, pluginInfo);
        this.registerPlugin(pluginInfo);
        this.emit('pluginLoaded', pluginInfo);
      }
    } catch (error) {
      console.error(`Error loading plugin ${pluginPath}:`, error);
    }
  }

  validatePlugin(plugin) {
    if (!plugin.id || !plugin.name || !plugin.version) {
      throw new Error('Plugin must have id, name, and version');
    }

    if (!plugin.init || typeof plugin.init !== 'function') {
      throw new Error('Plugin must have an init function');
    }

    return {
      id: plugin.id,
      name: plugin.name,
      version: plugin.version,
      description: plugin.description || '',
      author: plugin.author || 'Unknown',
      dependencies: plugin.dependencies || [],
      ...plugin,
    };
  }

  registerPlugin(plugin) {
    // Register commands
    if (plugin.commands) {
      plugin.commands.forEach((command) => {
        this.commands.set(command.name, {
          ...command,
          pluginId: plugin.id,
        });
      });
    }

    // Register themes
    if (plugin.themes) {
      plugin.themes.forEach((theme) => {
        this.themes.set(theme.name, {
          ...theme,
          pluginId: plugin.id,
        });
      });
    }

    // Register workflows
    if (plugin.workflows) {
      plugin.workflows.forEach((workflow) => {
        this.workflows.set(workflow.id, {
          ...workflow,
          pluginId: plugin.id,
        });
      });
    }

    // Register hooks
    if (plugin.hooks) {
      Object.entries(plugin.hooks).forEach(([hookName, handler]) => {
        if (!this.hooks.has(hookName)) {
          this.hooks.set(hookName, []);
        }
        this.hooks.get(hookName).push({
          handler,
          pluginId: plugin.id,
        });
      });
    }
  }

  unloadPlugin(pluginId) {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    // Remove commands
    for (const [name, command] of this.commands.entries()) {
      if (command.pluginId === pluginId) {
        this.commands.delete(name);
      }
    }

    // Remove themes
    for (const [name, theme] of this.themes.entries()) {
      if (theme.pluginId === pluginId) {
        this.themes.delete(name);
      }
    }

    // Remove workflows
    for (const [id, workflow] of this.workflows.entries()) {
      if (workflow.pluginId === pluginId) {
        this.workflows.delete(id);
      }
    }

    // Remove hooks
    for (const [hookName, handlers] of this.hooks.entries()) {
      const filteredHandlers = handlers.filter((h) => h.pluginId !== pluginId);
      if (filteredHandlers.length === 0) {
        this.hooks.delete(hookName);
      } else {
        this.hooks.set(hookName, filteredHandlers);
      }
    }

    // Call plugin cleanup
    if (plugin.cleanup) {
      plugin.cleanup();
    }

    this.plugins.delete(pluginId);
    this.emit('pluginUnloaded', plugin);
  }

  reloadPlugin(pluginId) {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    this.unloadPlugin(pluginId);
    this.loadPlugin(plugin.path);
  }

  executeHook(hookName, ...args) {
    const handlers = this.hooks.get(hookName) || [];
    const results = [];

    for (const { handler, pluginId } of handlers) {
      try {
        const result = handler(...args);
        results.push({ pluginId, result });
      } catch (error) {
        console.error(
          `Error in hook ${hookName} from plugin ${pluginId}:`,
          error
        );
        results.push({ pluginId, error });
      }
    }

    return results;
  }

  getCommand(name) {
    return this.commands.get(name);
  }

  getAllCommands() {
    return Array.from(this.commands.values());
  }

  getTheme(name) {
    return this.themes.get(name);
  }

  getAllThemes() {
    return Array.from(this.themes.values());
  }

  getWorkflow(id) {
    return this.workflows.get(id);
  }

  getAllWorkflows() {
    return Array.from(this.workflows.values());
  }

  getPlugin(pluginId) {
    return this.plugins.get(pluginId);
  }

  getAllPlugins() {
    return Array.from(this.plugins.values());
  }

  // Plugin development helpers
  createPluginTemplate(name, type = 'basic') {
    const pluginId = name.toLowerCase().replace(/\s+/g, '-');
    const pluginPath = path.join(this.options.pluginsDir, `${pluginId}.js`);

    let template = '';

    switch (type) {
      case 'command':
        template = this.getCommandPluginTemplate(pluginId, name);
        break;
      case 'theme':
        template = this.getThemePluginTemplate(pluginId, name);
        break;
      case 'workflow':
        template = this.getWorkflowPluginTemplate(pluginId, name);
        break;
      default:
        template = this.getBasicPluginTemplate(pluginId, name);
    }

    fs.writeFileSync(pluginPath, template);
    return pluginPath;
  }

  getBasicPluginTemplate(pluginId, name) {
    return `/**
 * ${name} Plugin
 * Generated by RinaWarp Terminal Pro Plugin Manager
 */

module.exports = {
    id: '${pluginId}',
    name: '${name}',
    version: '1.0.0',
    description: 'A custom plugin for RinaWarp Terminal Pro',
    author: 'Your Name',
    
    init(terminal, pluginManager) {
        // Plugin initialization
        console.log('${name} plugin loaded');
        
        // Add your plugin logic here
    },
    
    cleanup() {
        // Plugin cleanup
        console.log('${name} plugin unloaded');
    }
};`;
  }

  getCommandPluginTemplate(pluginId, name) {
    return `/**
 * ${name} Command Plugin
 * Generated by RinaWarp Terminal Pro Plugin Manager
 */

module.exports = {
    id: '${pluginId}',
    name: '${name}',
    version: '1.0.0',
    description: 'A command plugin for RinaWarp Terminal Pro',
    author: 'Your Name',
    
    commands: [
        {
            name: '${pluginId}',
            description: 'Execute ${name} command',
            usage: '${pluginId} [options]',
            handler: (args, terminal) => {
                terminal.write('\\r\\n${name} command executed\\r\\n');
                // Add your command logic here
            }
        }
    ],
    
    init(terminal, pluginManager) {
        console.log('${name} command plugin loaded');
    },
    
    cleanup() {
        console.log('${name} command plugin unloaded');
    }
};`;
  }

  getThemePluginTemplate(pluginId, name) {
    return `/**
 * ${name} Theme Plugin
 * Generated by RinaWarp Terminal Pro Plugin Manager
 */

module.exports = {
    id: '${pluginId}',
    name: '${name}',
    version: '1.0.0',
    description: 'A theme plugin for RinaWarp Terminal Pro',
    author: 'Your Name',
    
    themes: [
        {
            name: '${pluginId}',
            displayName: '${name}',
            colors: {
                background: '#1a1a1a',
                foreground: '#ffffff',
                cursor: '#ffffff',
                selection: '#ffffff40',
                black: '#000000',
                red: '#ff5555',
                green: '#50fa7b',
                yellow: '#f1fa8c',
                blue: '#bd93f9',
                magenta: '#ff79c6',
                cyan: '#8be9fd',
                white: '#f8f8f2'
            }
        }
    ],
    
    init(terminal, pluginManager) {
        console.log('${name} theme plugin loaded');
    },
    
    cleanup() {
        console.log('${name} theme plugin unloaded');
    }
};`;
  }

  getWorkflowPluginTemplate(pluginId, name) {
    return `/**
 * ${name} Workflow Plugin
 * Generated by RinaWarp Terminal Pro Plugin Manager
 */

module.exports = {
    id: '${pluginId}',
    name: '${name}',
    version: '1.0.0',
    description: 'A workflow plugin for RinaWarp Terminal Pro',
    author: 'Your Name',
    
    workflows: [
        {
            id: '${pluginId}',
            name: '${name}',
            description: 'Execute ${name} workflow',
            commands: [
                'echo "Starting ${name} workflow"',
                'echo "Workflow completed"'
            ]
        }
    ],
    
    init(terminal, pluginManager) {
        console.log('${name} workflow plugin loaded');
    },
    
    cleanup() {
        console.log('${name} workflow plugin unloaded');
    }
};`;
  }

  // Plugin marketplace integration
  async searchMarketplace(query) {
    // This would integrate with a plugin marketplace
    // For now, return mock data
    return [
      {
        id: 'git-enhanced',
        name: 'Git Enhanced',
        description: 'Enhanced git commands and workflows',
        version: '1.2.0',
        downloads: 1500,
        rating: 4.8,
      },
      {
        id: 'docker-tools',
        name: 'Docker Tools',
        description: 'Docker management and automation',
        version: '2.1.0',
        downloads: 2300,
        rating: 4.9,
      },
    ];
  }

  async installFromMarketplace(pluginId) {
    // This would download and install from marketplace
    // For now, create a placeholder
    console.log(`Installing plugin ${pluginId} from marketplace...`);
  }

  destroy() {
    // Unload all plugins
    for (const pluginId of this.plugins.keys()) {
      this.unloadPlugin(pluginId);
    }

    this.removeAllListeners();
  }
}

export default PluginManager;
