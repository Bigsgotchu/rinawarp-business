// Advanced AI Command Predictor
// Provides intelligent command suggestions and explanations

class CommandPredictor {
  constructor() {
    this.commandHistory = [];
    this.userPreferences = {};
    this.context = {
      currentDirectory: '',
      recentCommands: [],
      systemInfo: {},
      projectType: null,
    };
  }

  // Analyze user input and predict commands
  async predictCommand(input, context = {}) {
    try {
      const predictions = await this.generatePredictions(input, context);
      return {
        suggestions: predictions.suggestions,
        explanation: predictions.explanation,
        confidence: predictions.confidence,
        alternatives: predictions.alternatives,
      };
    } catch (error) {
      console.error('Command prediction error:', error);
      return this.getFallbackSuggestions(input);
    }
  }

  // Generate AI-powered predictions
  async generatePredictions(input, context) {
    const prompt = this.buildPredictionPrompt(input, context);

    try {
      const response = await fetch('https://api.rinawarptech.com/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt,
          provider: 'groq', // Use faster Groq for predictions
          enableVoice: false,
        }),
      });

      const data = await response.json();
      return this.parseAIResponse(data.response);
    } catch (error) {
      return this.getLocalPredictions(input);
    }
  }

  // Build intelligent prompt for command prediction
  buildPredictionPrompt(input, context) {
    return `
You are an expert terminal command predictor. Analyze this user input and provide intelligent suggestions.

User Input: "${input}"
Context: ${JSON.stringify(context, null, 2)}

Provide:
1. 3-5 specific command suggestions with explanations
2. What each command does in simple terms
3. Alternative approaches
4. Potential risks or warnings
5. Confidence level (1-10)

Format as JSON:
{
  "suggestions": [
    {
      "command": "git status",
      "explanation": "Shows current git repository status",
      "confidence": 9,
      "category": "git"
    }
  ],
  "explanation": "Overall explanation of what the user is trying to do",
  "confidence": 8,
  "alternatives": ["alternative approaches"],
  "warnings": ["potential risks"]
}
`;
  }

  // Parse AI response into structured data
  parseAIResponse(response) {
    try {
      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('Failed to parse AI response:', error);
    }

    return this.getFallbackSuggestions(input);
  }

  // Local fallback predictions when AI is unavailable
  getLocalPredictions(input) {
    const lowerInput = input.toLowerCase();

    // Git commands
    if (
      lowerInput.includes('git') ||
      lowerInput.includes('commit') ||
      lowerInput.includes('push')
    ) {
      return {
        suggestions: [
          {
            command: 'git status',
            explanation: 'Check current repository status',
            confidence: 9,
            category: 'git',
          },
          {
            command: 'git add .',
            explanation: 'Stage all changes for commit',
            confidence: 8,
            category: 'git',
          },
          {
            command: 'git commit -m "message"',
            explanation: 'Commit staged changes with message',
            confidence: 8,
            category: 'git',
          },
        ],
        explanation: 'Git version control commands',
        confidence: 7,
        alternatives: ['GitHub CLI', 'VS Code Git integration'],
        warnings: ['Make sure you are in a git repository'],
      };
    }

    // File operations
    if (
      lowerInput.includes('file') ||
      lowerInput.includes('list') ||
      lowerInput.includes('directory')
    ) {
      return {
        suggestions: [
          {
            command: 'ls -la',
            explanation: 'List all files with detailed information',
            confidence: 9,
            category: 'filesystem',
          },
          {
            command: 'find . -name "*.js"',
            explanation: 'Find all JavaScript files',
            confidence: 8,
            category: 'filesystem',
          },
          {
            command: 'du -sh *',
            explanation: 'Show directory sizes',
            confidence: 7,
            category: 'filesystem',
          },
        ],
        explanation: 'File and directory operations',
        confidence: 8,
        alternatives: ['File manager', 'VS Code explorer'],
        warnings: [],
      };
    }

    // System monitoring
    if (
      lowerInput.includes('cpu') ||
      lowerInput.includes('memory') ||
      lowerInput.includes('system')
    ) {
      return {
        suggestions: [
          {
            command: 'top',
            explanation: 'Show running processes and system stats',
            confidence: 9,
            category: 'system',
          },
          {
            command: 'htop',
            explanation: 'Interactive process viewer (if installed)',
            confidence: 8,
            category: 'system',
          },
          {
            command: 'df -h',
            explanation: 'Show disk usage by filesystem',
            confidence: 8,
            category: 'system',
          },
        ],
        explanation: 'System monitoring and process management',
        confidence: 8,
        alternatives: ['Activity Monitor (macOS)', 'Task Manager (Windows)'],
        warnings: ['Some commands may require sudo privileges'],
      };
    }

    // Default suggestions
    return {
      suggestions: [
        {
          command: 'help',
          explanation: 'Show available commands',
          confidence: 6,
          category: 'general',
        },
        {
          command: 'man [command]',
          explanation: 'Show manual page for a command',
          confidence: 7,
          category: 'general',
        },
      ],
      explanation: 'General help and documentation',
      confidence: 5,
      alternatives: ['Ask Rina for help', 'Check documentation'],
      warnings: [],
    };
  }

  // Get fallback suggestions when all else fails
  getFallbackSuggestions(input) {
    return {
      suggestions: [
        {
          command: 'help',
          explanation: 'Show available commands',
          confidence: 5,
          category: 'general',
        },
      ],
      explanation: 'Basic help command',
      confidence: 3,
      alternatives: [],
      warnings: ['AI prediction unavailable'],
    };
  }

  // Learn from user behavior
  learnFromCommand(command, success, context) {
    this.commandHistory.push({
      command,
      success,
      context,
      timestamp: new Date(),
    });

    // Update user preferences based on patterns
    this.updateUserPreferences();
  }

  // Update user preferences based on command history
  updateUserPreferences() {
    const recentCommands = this.commandHistory.slice(-20);
    const categories = {};

    recentCommands.forEach((entry) => {
      if (entry.success) {
        categories[entry.context.category] =
          (categories[entry.context.category] || 0) + 1;
      }
    });

    this.userPreferences = {
      favoriteCategories: Object.keys(categories).sort(
        (a, b) => categories[b] - categories[a]
      ),
      lastUpdated: new Date(),
    };
  }

  // Get contextual suggestions based on current state
  getContextualSuggestions() {
    const suggestions = [];

    // Add suggestions based on current directory
    if (this.context.currentDirectory.includes('node_modules')) {
      suggestions.push({
        command: 'cd ..',
        explanation: 'Go back to project root',
        confidence: 8,
        category: 'navigation',
      });
    }

    // Add suggestions based on recent commands
    if (this.context.recentCommands.includes('git add')) {
      suggestions.push({
        command: 'git commit -m "feat: add new feature"',
        explanation: 'Commit staged changes',
        confidence: 9,
        category: 'git',
      });
    }

    return suggestions;
  }
}

export default CommandPredictor;
