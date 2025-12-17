// Command Macros - Safe to implement
class CommandMacros {
  constructor() {
    this.macros = new Map();
    this.recording = false;
    this.recordedCommands = [];
  }

  // Start recording a macro
  startRecording(name) {
    this.recording = true;
    this.recordedCommands = [];
    this.currentMacroName = name;
    return `🎬 Started recording macro: ${name}`;
  }

  // Stop recording and save macro
  stopRecording() {
    if (!this.recording) {
      return '❌ No macro is currently being recorded';
    }

    if (this.recordedCommands.length === 0) {
      this.recording = false;
      return '❌ No commands recorded. Macro not saved.';
    }

    this.macros.set(this.currentMacroName, {
      commands: [...this.recordedCommands],
      createdAt: new Date().toISOString(),
      usageCount: 0,
    });

    this.recording = false;
    const macroName = this.currentMacroName;
    this.currentMacroName = null;

    return `✅ Macro '${macroName}' saved with ${this.recordedCommands.length} commands`;
  }

  // Add command to current recording
  addCommandToRecording(command, result) {
    if (!this.recording) return;

    this.recordedCommands.push({
      command,
      result,
      timestamp: Date.now(),
    });
  }

  // Execute a macro
  executeMacro(name, context = {}) {
    const macro = this.macros.get(name);
    if (!macro) {
      return {
        success: false,
        message: `❌ Macro '${name}' not found`,
        commands: [],
      };
    }

    // Increment usage count
    macro.usageCount++;

    // Execute each command in the macro
    const results = [];
    for (const cmd of macro.commands) {
      // Replace variables in command if context provided
      let processedCommand = cmd.command;
      if (context) {
        Object.keys(context).forEach((key) => {
          processedCommand = processedCommand.replace(
            new RegExp(`\\{${key}\\}`, 'g'),
            context[key]
          );
        });
      }

      results.push({
        originalCommand: cmd.command,
        processedCommand,
        result: cmd.result,
        timestamp: Date.now(),
      });
    }

    return {
      success: true,
      message: `✅ Executed macro '${name}' (${macro.commands.length} commands)`,
      commands: results,
      usageCount: macro.usageCount,
    };
  }

  // List all macros
  listMacros() {
    if (this.macros.size === 0) {
      return '📝 No macros saved yet';
    }

    const macroList = Array.from(this.macros.entries()).map(
      ([name, macro]) => ({
        name,
        commandCount: macro.commands.length,
        usageCount: macro.usageCount,
        createdAt: macro.createdAt,
      })
    );

    return {
      macros: macroList,
      total: this.macros.size,
    };
  }

  // Delete a macro
  deleteMacro(name) {
    if (!this.macros.has(name)) {
      return `❌ Macro '${name}' not found`;
    }

    this.macros.delete(name);
    return `✅ Macro '${name}' deleted`;
  }

  // Get macro details
  getMacroDetails(name) {
    const macro = this.macros.get(name);
    if (!macro) {
      return `❌ Macro '${name}' not found`;
    }

    return {
      name,
      commands: macro.commands,
      usageCount: macro.usageCount,
      createdAt: macro.createdAt,
    };
  }

  // Export macros for backup
  exportMacros() {
    const exportData = {};
    this.macros.forEach((macro, name) => {
      exportData[name] = macro;
    });

    return {
      macros: exportData,
      exportedAt: new Date().toISOString(),
      totalMacros: this.macros.size,
    };
  }

  // Import macros from backup
  importMacros(data) {
    if (data.macros && typeof data.macros === 'object') {
      Object.keys(data.macros).forEach((name) => {
        this.macros.set(name, data.macros[name]);
      });
      return `✅ Imported ${Object.keys(data.macros).length} macros`;
    }
    return '❌ Invalid macro data format';
  }

  // Get recording status
  getRecordingStatus() {
    return {
      recording: this.recording,
      currentMacro: this.currentMacroName,
      recordedCommands: this.recordedCommands.length,
    };
  }
}

export default CommandMacros;
