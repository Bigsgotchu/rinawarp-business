// Advanced Search & History - Safe to implement
class AdvancedSearch {
  constructor() {
    this.commandHistory = [];
    this.searchIndex = new Map();
    this.maxHistory = 1000;
  }

  // Add command to history
  addCommand(command, result, timestamp = Date.now()) {
    const entry = {
      command,
      result,
      timestamp,
      id: Date.now() + Math.random(),
    };

    this.commandHistory.unshift(entry);

    // Keep only last 1000 commands
    if (this.commandHistory.length > this.maxHistory) {
      this.commandHistory = this.commandHistory.slice(0, this.maxHistory);
    }

    // Update search index
    this.updateSearchIndex(entry);
  }

  // Update search index for fuzzy search
  updateSearchIndex(entry) {
    const words = entry.command.toLowerCase().split(/\s+/);
    words.forEach((word) => {
      if (!this.searchIndex.has(word)) {
        this.searchIndex.set(word, []);
      }
      this.searchIndex.get(word).push(entry.id);
    });
  }

  // Fuzzy search through command history
  search(query, limit = 10) {
    const results = [];
    const queryLower = query.toLowerCase();

    // Exact matches first
    for (const entry of this.commandHistory) {
      if (entry.command.toLowerCase().includes(queryLower)) {
        results.push({
          ...entry,
          score: entry.command.toLowerCase() === queryLower ? 100 : 80,
        });
      }
    }

    // Sort by score and timestamp
    return results
      .sort((a, b) => b.score - a.score || b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  // Get command suggestions based on current input
  getSuggestions(partialCommand, limit = 5) {
    const suggestions = new Set();

    for (const entry of this.commandHistory) {
      if (
        entry.command.toLowerCase().startsWith(partialCommand.toLowerCase())
      ) {
        suggestions.add(entry.command);
      }
    }

    return Array.from(suggestions).slice(0, limit);
  }

  // Get most used commands
  getMostUsed(limit = 10) {
    const commandCount = new Map();

    this.commandHistory.forEach((entry) => {
      const count = commandCount.get(entry.command) || 0;
      commandCount.set(entry.command, count + 1);
    });

    return Array.from(commandCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([command, count]) => ({ command, count }));
  }

  // Export history for backup
  exportHistory() {
    return {
      commands: this.commandHistory,
      exportedAt: new Date().toISOString(),
      totalCommands: this.commandHistory.length,
    };
  }

  // Import history from backup
  importHistory(data) {
    if (data.commands && Array.isArray(data.commands)) {
      this.commandHistory = data.commands;
      this.updateSearchIndex();
    }
  }
}

export default AdvancedSearch;
