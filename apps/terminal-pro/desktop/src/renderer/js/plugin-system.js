const plugins = new Map();

export function registerPlugin(id, pluginDef) {
  if (!id || plugins.has(id)) return;
  plugins.set(id, pluginDef);

  // Register plugin commands into command palette
  if (pluginDef.commands && Array.isArray(pluginDef.commands)) {
    window.RinaCommandPalette?.registerPluginCommands(id, pluginDef.commands);
  }
}

export function getPlugins() {
  return Array.from(plugins.entries()).map(([id, def]) => ({ id, ...def }));
}

// Example plugin loader (later: load from disk/remote)
export function loadBuiltInPlugins() {
  // Placeholder for built-in plugins
  registerPlugin('sample.rina.docs', {
    name: 'Rina Docs Helper',
    version: '1.0.0',
    commands: [
      {
        id: 'rina:open-docs',
        label: 'Open RinaWarp Documentation',
        run: () => {
          window.open('https://rinawarptech.com/docs', '_blank');
        },
      },
    ],
  });
}
