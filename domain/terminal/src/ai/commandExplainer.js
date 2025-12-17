// Advanced Command Explanation System
// Provides detailed explanations and examples for terminal commands

class CommandExplainer {
  constructor() {
    this.explanations = new Map();
    this.examples = new Map();
    this.initializeCommandDatabase();
  }

  // Initialize database of common commands with explanations
  initializeCommandDatabase() {
    const commands = {
      // Git commands
      'git status': {
        explanation:
          'Shows the current state of your Git repository, including staged, unstaged, and untracked files.',
        examples: [
          'git status',
          'git status --short',
          'git status --porcelain',
        ],
        category: 'git',
        difficulty: 'beginner',
        related: ['git add', 'git commit', 'git diff'],
      },
      'git add': {
        explanation:
          'Stages changes for the next commit. You can add specific files or all changes.',
        examples: [
          'git add filename.txt',
          'git add .',
          'git add --all',
          'git add -p',
        ],
        category: 'git',
        difficulty: 'beginner',
        related: ['git status', 'git commit', 'git reset'],
      },
      'git commit': {
        explanation:
          'Creates a snapshot of your staged changes with a descriptive message.',
        examples: [
          'git commit -m "Add new feature"',
          'git commit -am "Quick commit"',
          'git commit --amend',
        ],
        category: 'git',
        difficulty: 'beginner',
        related: ['git add', 'git push', 'git log'],
      },
      'git push': {
        explanation: 'Uploads your local commits to the remote repository.',
        examples: [
          'git push',
          'git push origin main',
          'git push -u origin feature-branch',
        ],
        category: 'git',
        difficulty: 'beginner',
        related: ['git commit', 'git pull', 'git fetch'],
      },

      // File system commands
      ls: {
        explanation: 'Lists files and directories in the current location.',
        examples: ['ls', 'ls -la', 'ls -lh', 'ls -t'],
        category: 'filesystem',
        difficulty: 'beginner',
        related: ['dir', 'find', 'tree'],
      },
      cd: {
        explanation: 'Changes the current directory to the specified path.',
        examples: ['cd /path/to/directory', 'cd ..', 'cd ~', 'cd -'],
        category: 'filesystem',
        difficulty: 'beginner',
        related: ['pwd', 'ls', 'pushd', 'popd'],
      },
      mkdir: {
        explanation: 'Creates a new directory with the specified name.',
        examples: [
          'mkdir newfolder',
          'mkdir -p path/to/nested/folder',
          'mkdir folder1 folder2 folder3',
        ],
        category: 'filesystem',
        difficulty: 'beginner',
        related: ['rmdir', 'rm', 'ls'],
      },
      rm: {
        explanation: 'Removes files or directories. Use with caution!',
        examples: [
          'rm filename.txt',
          'rm -r directory',
          'rm -rf directory',
          'rm -i filename.txt',
        ],
        category: 'filesystem',
        difficulty: 'intermediate',
        related: ['rmdir', 'mv', 'cp'],
        warning: 'This command permanently deletes files!',
      },

      // System monitoring
      top: {
        explanation:
          'Shows real-time information about running processes and system resource usage.',
        examples: ['top', 'top -u username', 'top -p 1234'],
        category: 'system',
        difficulty: 'intermediate',
        related: ['htop', 'ps', 'kill'],
      },
      ps: {
        explanation: 'Shows information about running processes.',
        examples: ['ps aux', 'ps -ef', 'ps -u username'],
        category: 'system',
        difficulty: 'intermediate',
        related: ['top', 'htop', 'kill'],
      },
      kill: {
        explanation: 'Terminates processes by process ID (PID).',
        examples: ['kill 1234', 'kill -9 1234', 'killall processname'],
        category: 'system',
        difficulty: 'intermediate',
        related: ['ps', 'top', 'pkill'],
        warning: 'Use with caution - can terminate important processes!',
      },

      // Network commands
      ping: {
        explanation:
          'Tests network connectivity to a host by sending ICMP packets.',
        examples: [
          'ping google.com',
          'ping -c 4 8.8.8.8',
          'ping -i 2 example.com',
        ],
        category: 'network',
        difficulty: 'beginner',
        related: ['traceroute', 'nslookup', 'curl'],
      },
      curl: {
        explanation:
          'Transfers data to or from a server using various protocols (HTTP, FTP, etc.).',
        examples: [
          'curl https://api.example.com',
          'curl -O https://example.com/file.zip',
          'curl -X POST -d "data" https://api.example.com',
        ],
        category: 'network',
        difficulty: 'intermediate',
        related: ['wget', 'ping', 'telnet'],
      },

      // Text processing
      grep: {
        explanation: 'Searches for patterns in text files or input streams.',
        examples: [
          'grep "pattern" file.txt',
          'grep -r "pattern" directory/',
          'grep -i "pattern" file.txt',
          'grep -n "pattern" file.txt',
        ],
        category: 'text',
        difficulty: 'intermediate',
        related: ['awk', 'sed', 'find'],
      },
      awk: {
        explanation:
          'Powerful text processing tool for pattern scanning and data extraction.',
        examples: [
          'awk \'{print $1}\' file.txt',
          'awk -F: \'{print $1}\' /etc/passwd',
          'awk \'NR>1 {print $2}\' data.csv',
        ],
        category: 'text',
        difficulty: 'advanced',
        related: ['grep', 'sed', 'cut'],
      },
      sed: {
        explanation: 'Stream editor for filtering and transforming text.',
        examples: [
          'sed \'s/old/new/g\' file.txt',
          'sed -n \'1,10p\' file.txt',
          'sed -i \'s/old/new/g\' file.txt',
        ],
        category: 'text',
        difficulty: 'advanced',
        related: ['awk', 'grep', 'tr'],
      },
    };

    // Store commands in maps
    Object.entries(commands).forEach(([command, data]) => {
      this.explanations.set(command, data);
    });
  }

  // Get detailed explanation for a command
  async explainCommand(command, context = {}) {
    const cleanCommand = this.cleanCommand(command);

    // Check if we have a cached explanation
    if (this.explanations.has(cleanCommand)) {
      return this.formatExplanation(
        this.explanations.get(cleanCommand),
        context
      );
    }

    // Try to get AI explanation
    try {
      return await this.getAIExplanation(command, context);
    } catch (error) {
      console.error('AI explanation failed:', error);
      return this.getGenericExplanation(command);
    }
  }

  // Clean command for lookup
  cleanCommand(command) {
    return command.trim().toLowerCase().replace(/\s+/g, ' ');
  }

  // Get AI-powered explanation
  async getAIExplanation(command, context) {
    const prompt = `
Explain this terminal command in detail: "${command}"

Provide:
1. What the command does
2. Common usage examples
3. Important flags/options
4. Potential risks or warnings
5. Related commands
6. Difficulty level (beginner/intermediate/advanced)

Format as JSON:
{
  "explanation": "Detailed explanation",
  "examples": ["example1", "example2"],
  "flags": ["-flag: description"],
  "warnings": ["potential risks"],
  "related": ["related commands"],
  "difficulty": "beginner|intermediate|advanced",
  "category": "command category"
}
`;

    try {
      const response = await fetch('https://api.rinawarptech.com/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt,
          provider: 'groq',
          enableVoice: false,
        }),
      });

      const data = await response.json();
      return this.parseAIExplanation(data.response);
    } catch (error) {
      throw new Error('AI explanation unavailable');
    }
  }

  // Parse AI explanation response
  parseAIExplanation(response) {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return this.formatExplanation(parsed);
      }
    } catch (error) {
      console.error('Failed to parse AI explanation:', error);
    }

    return this.getGenericExplanation(command);
  }

  // Format explanation for display
  formatExplanation(data, context = {}) {
    return {
      command: data.command || 'Unknown command',
      explanation: data.explanation || 'No explanation available',
      examples: data.examples || [],
      flags: data.flags || [],
      warnings: data.warnings || [],
      related: data.related || [],
      difficulty: data.difficulty || 'unknown',
      category: data.category || 'general',
      confidence: data.confidence || 5,
      timestamp: new Date().toISOString(),
    };
  }

  // Get generic explanation when AI is unavailable
  getGenericExplanation(command) {
    const parts = command.trim().split(' ');
    const baseCommand = parts[0];

    return {
      command: command,
      explanation: `This appears to be a ${baseCommand} command. For detailed help, try: ${baseCommand} --help or man ${baseCommand}`,
      examples: [`${baseCommand} --help`, `man ${baseCommand}`],
      flags: [],
      warnings: ['Command explanation not available - use built-in help'],
      related: ['help', 'man'],
      difficulty: 'unknown',
      category: 'general',
      confidence: 2,
      timestamp: new Date().toISOString(),
    };
  }

  // Get command suggestions based on current context
  getContextualSuggestions(context) {
    const suggestions = [];

    // Git context
    if (context.currentDirectory && context.currentDirectory.includes('.git')) {
      suggestions.push(
        'git status',
        'git log --oneline',
        'git branch',
        'git remote -v'
      );
    }

    // Node.js context
    if (
      context.currentDirectory &&
      (context.currentDirectory.includes('node_modules') ||
        context.currentDirectory.includes('package.json'))
    ) {
      suggestions.push(
        'npm install',
        'npm run dev',
        'npm test',
        'npm run build'
      );
    }

    // System monitoring context
    if (context.systemLoad && context.systemLoad > 0.8) {
      suggestions.push('top', 'htop', 'ps aux', 'df -h');
    }

    return suggestions;
  }

  // Search commands by category or keyword
  searchCommands(query) {
    const results = [];
    const lowerQuery = query.toLowerCase();

    for (const [command, data] of this.explanations) {
      if (
        command.includes(lowerQuery) ||
        data.explanation.toLowerCase().includes(lowerQuery) ||
        data.category.toLowerCase().includes(lowerQuery)
      ) {
        results.push({
          command,
          ...data,
        });
      }
    }

    return results.sort((a, b) => a.command.localeCompare(b.command));
  }

  // Get commands by difficulty level
  getCommandsByDifficulty(level) {
    const results = [];

    for (const [command, data] of this.explanations) {
      if (data.difficulty === level) {
        results.push({
          command,
          ...data,
        });
      }
    }

    return results;
  }

  // Get commands by category
  getCommandsByCategory(category) {
    const results = [];

    for (const [command, data] of this.explanations) {
      if (data.category === category) {
        results.push({
          command,
          ...data,
        });
      }
    }

    return results;
  }
}

export default CommandExplainer;
