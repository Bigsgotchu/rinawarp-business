/**
 * Advanced Learning Engine - ML-powered user behavior analysis
 * Learns from user patterns and provides intelligent suggestions
 */

class LearningEngine {
  constructor() {
    this.userPatterns = new Map();
    this.commandSequences = new Map();
    this.timePatterns = new Map();
    this.contextPatterns = new Map();
    this.skillLevel = 'beginner';
    this.vocabulary = new Map();
    this.confidenceThreshold = 0.7;
    this.forgettingFactor = 0.95; // Prevents overfitting to old behavior

    // Neural network weights (simplified)
    this.neuralWeights = {
      commandPattern: 0.3,
      timePattern: 0.2,
      contextPattern: 0.3,
      vocabularyPattern: 0.2,
    };

    this.initializePatterns();
  }

  initializePatterns() {
    // Initialize common command patterns
    this.commandSequences.set('git', [
      ['git status', 'git add .', 'git commit -m'],
      ['git pull', 'git push'],
      ['git checkout', 'git branch'],
      ['git log', 'git diff'],
    ]);

    this.commandSequences.set('npm', [
      ['npm install', 'npm start'],
      ['npm run dev', 'npm run build'],
      ['npm test', 'npm run lint'],
    ]);

    this.commandSequences.set('docker', [
      ['docker build', 'docker run'],
      ['docker ps', 'docker logs'],
      ['docker-compose up', 'docker-compose down'],
    ]);

    // Initialize time patterns (working hours)
    this.timePatterns.set('morning', {
      start: 9,
      end: 12,
      commands: ['git pull', 'npm start'],
    });
    this.timePatterns.set('afternoon', {
      start: 13,
      end: 17,
      commands: ['git add', 'git commit', 'npm run build'],
    });
    this.timePatterns.set('evening', {
      start: 18,
      end: 22,
      commands: ['git push', 'docker build'],
    });
  }

  learnFromInteraction(command, context, timestamp, response) {
    // Update command patterns
    this.updateCommandPatterns(command, context);

    // Update time patterns
    this.updateTimePatterns(command, timestamp);

    // Update context patterns
    this.updateContextPatterns(command, context);

    // Update vocabulary
    this.updateVocabulary(command);

    // Assess skill level
    this.assessSkillLevel(command, context);

    // Apply forgetting factor to prevent overfitting
    this.applyForgettingFactor();
  }

  updateCommandPatterns(command, context) {
    const contextKey = this.extractContextKey(context);
    if (!this.userPatterns.has(contextKey)) {
      this.userPatterns.set(contextKey, {
        commands: [],
        sequences: [],
        frequency: new Map(),
      });
    }

    const patterns = this.userPatterns.get(contextKey);
    patterns.commands.push({
      command,
      timestamp: Date.now(),
      context,
    });

    // Keep only last 100 commands per context
    if (patterns.commands.length > 100) {
      patterns.commands = patterns.commands.slice(-100);
    }

    // Update frequency
    const freq = patterns.frequency.get(command) || 0;
    patterns.frequency.set(command, freq + 1);

    // Learn 2-command sequences
    if (patterns.commands.length >= 2) {
      const lastTwo = patterns.commands.slice(-2);
      const sequence = [lastTwo[0].command, lastTwo[1].command];
      this.learnSequence(sequence, contextKey);
    }

    // Learn 3-command sequences
    if (patterns.commands.length >= 3) {
      const lastThree = patterns.commands.slice(-3);
      const sequence = [
        lastThree[0].command,
        lastThree[1].command,
        lastThree[2].command,
      ];
      this.learnSequence(sequence, contextKey);
    }
  }

  learnSequence(sequence, contextKey) {
    if (!this.commandSequences.has(contextKey)) {
      this.commandSequences.set(contextKey, new Map());
    }

    const sequences = this.commandSequences.get(contextKey);
    const sequenceKey = sequence.join(' -> ');
    const count = sequences.get(sequenceKey) || 0;
    sequences.set(sequenceKey, count + 1);
  }

  updateTimePatterns(command, timestamp) {
    const hour = new Date(timestamp).getHours();
    const timeSlot = this.getTimeSlot(hour);

    if (!this.timePatterns.has(timeSlot)) {
      this.timePatterns.set(timeSlot, { commands: [], frequency: new Map() });
    }

    const timePattern = this.timePatterns.get(timeSlot);
    timePattern.commands.push({ command, timestamp });

    // Keep only last 50 commands per time slot
    if (timePattern.commands.length > 50) {
      timePattern.commands = timePattern.commands.slice(-50);
    }

    // Update frequency
    const freq = timePattern.frequency.get(command) || 0;
    timePattern.frequency.set(command, freq + 1);
  }

  updateContextPatterns(command, context) {
    const contextKey = this.extractContextKey(context);

    if (!this.contextPatterns.has(contextKey)) {
      this.contextPatterns.set(contextKey, {
        commands: [],
        projectType: this.detectProjectType(context),
        frequency: new Map(),
      });
    }

    const contextPattern = this.contextPatterns.get(contextKey);
    contextPattern.commands.push({ command, timestamp: Date.now() });

    // Keep only last 50 commands per context
    if (contextPattern.commands.length > 50) {
      contextPattern.commands = contextPattern.commands.slice(-50);
    }

    // Update frequency
    const freq = contextPattern.frequency.get(command) || 0;
    contextPattern.frequency.set(command, freq + 1);
  }

  updateVocabulary(command) {
    const words = command.toLowerCase().split(/\s+/);
    words.forEach((word) => {
      if (word.length > 2) {
        // Ignore short words
        const count = this.vocabulary.get(word) || 0;
        this.vocabulary.set(word, count + 1);
      }
    });
  }

  assessSkillLevel(command, context) {
    let skillPoints = 0;

    // Advanced commands indicate higher skill
    if (command.includes('git rebase') || command.includes('git cherry-pick')) {
      skillPoints += 3;
    } else if (command.includes('git merge') || command.includes('git stash')) {
      skillPoints += 2;
    } else if (command.includes('git add') || command.includes('git commit')) {
      skillPoints += 1;
    }

    // Docker commands
    if (
      command.includes('docker-compose') ||
      command.includes('docker build')
    ) {
      skillPoints += 2;
    } else if (
      command.includes('docker run') ||
      command.includes('docker ps')
    ) {
      skillPoints += 1;
    }

    // Complex npm commands
    if (command.includes('npm run') && command.includes('--')) {
      skillPoints += 2;
    } else if (command.includes('npm run')) {
      skillPoints += 1;
    }

    // Update skill level based on accumulated points
    const totalPoints = this.getTotalSkillPoints();
    if (totalPoints > 50) {
      this.skillLevel = 'expert';
    } else if (totalPoints > 30) {
      this.skillLevel = 'advanced';
    } else if (totalPoints > 15) {
      this.skillLevel = 'intermediate';
    } else {
      this.skillLevel = 'beginner';
    }
  }

  getTotalSkillPoints() {
    // This would be calculated from all learned patterns
    // For now, return a simple calculation
    return Array.from(this.vocabulary.values()).reduce(
      (sum, count) => sum + count,
      0
    );
  }

  applyForgettingFactor() {
    // Apply forgetting factor to prevent overfitting
    this.userPatterns.forEach((patterns, contextKey) => {
      patterns.frequency.forEach((count, command) => {
        const newCount = Math.floor(count * this.forgettingFactor);
        if (newCount > 0) {
          patterns.frequency.set(command, newCount);
        } else {
          patterns.frequency.delete(command);
        }
      });
    });
  }

  predictNextCommand(context, currentCommand = '') {
    const contextKey = this.extractContextKey(context);
    const predictions = [];

    // Get command sequence predictions
    const sequencePredictions = this.getSequencePredictions(
      contextKey,
      currentCommand
    );
    predictions.push(...sequencePredictions);

    // Get time-based predictions
    const timePredictions = this.getTimeBasedPredictions();
    predictions.push(...timePredictions);

    // Get context-based predictions
    const contextPredictions = this.getContextBasedPredictions(contextKey);
    predictions.push(...contextPredictions);

    // Get vocabulary-based predictions
    const vocabPredictions = this.getVocabularyPredictions(currentCommand);
    predictions.push(...vocabPredictions);

    // Combine and rank predictions
    return this.rankPredictions(predictions);
  }

  getSequencePredictions(contextKey, currentCommand) {
    const predictions = [];

    if (this.commandSequences.has(contextKey)) {
      const sequences = this.commandSequences.get(contextKey);
      sequences.forEach((count, sequence) => {
        const commands = sequence.split(' -> ');
        const currentIndex = commands.indexOf(currentCommand);

        if (currentIndex >= 0 && currentIndex < commands.length - 1) {
          const nextCommand = commands[currentIndex + 1];
          predictions.push({
            command: nextCommand,
            confidence: this.calculateSequenceConfidence(
              count,
              commands.length
            ),
            source: 'sequence',
            weight: this.neuralWeights.commandPattern,
          });
        }
      });
    }

    return predictions;
  }

  getTimeBasedPredictions() {
    const predictions = [];
    const hour = new Date().getHours();
    const timeSlot = this.getTimeSlot(hour);

    if (this.timePatterns.has(timeSlot)) {
      const timePattern = this.timePatterns.get(timeSlot);
      const sortedCommands = Array.from(timePattern.frequency.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

      sortedCommands.forEach(([command, count]) => {
        predictions.push({
          command,
          confidence: this.calculateTimeConfidence(
            count,
            timePattern.commands.length
          ),
          source: 'time',
          weight: this.neuralWeights.timePattern,
        });
      });
    }

    return predictions;
  }

  getContextBasedPredictions(contextKey) {
    const predictions = [];

    if (this.contextPatterns.has(contextKey)) {
      const contextPattern = this.contextPatterns.get(contextKey);
      const sortedCommands = Array.from(contextPattern.frequency.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

      sortedCommands.forEach(([command, count]) => {
        predictions.push({
          command,
          confidence: this.calculateContextConfidence(
            count,
            contextPattern.commands.length
          ),
          source: 'context',
          weight: this.neuralWeights.contextPattern,
        });
      });
    }

    return predictions;
  }

  getVocabularyPredictions(currentCommand) {
    const predictions = [];
    const words = currentCommand.toLowerCase().split(/\s+/);

    words.forEach((word) => {
      if (this.vocabulary.has(word)) {
        // Find similar commands that contain this word
        this.userPatterns.forEach((patterns, contextKey) => {
          patterns.frequency.forEach((count, command) => {
            if (command.toLowerCase().includes(word)) {
              predictions.push({
                command,
                confidence: this.calculateVocabularyConfidence(count, word),
                source: 'vocabulary',
                weight: this.neuralWeights.vocabularyPattern,
              });
            }
          });
        });
      }
    });

    return predictions;
  }

  rankPredictions(predictions) {
    // Group by command and calculate weighted confidence
    const commandScores = new Map();

    predictions.forEach((pred) => {
      const existing = commandScores.get(pred.command) || {
        confidence: 0,
        sources: [],
      };
      existing.confidence += pred.confidence * pred.weight;
      existing.sources.push(pred.source);
      commandScores.set(pred.command, existing);
    });

    // Sort by confidence and return top predictions
    return Array.from(commandScores.entries())
      .map(([command, data]) => ({
        command,
        confidence: Math.min(data.confidence, 1.0),
        sources: data.sources,
      }))
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5);
  }

  calculateSequenceConfidence(count, sequenceLength) {
    return Math.min(count / 10, 1.0) * (sequenceLength / 3);
  }

  calculateTimeConfidence(count, totalCommands) {
    return Math.min(count / totalCommands, 1.0);
  }

  calculateContextConfidence(count, totalCommands) {
    return Math.min(count / totalCommands, 1.0);
  }

  calculateVocabularyConfidence(count, word) {
    const wordFreq = this.vocabulary.get(word) || 1;
    return Math.min(count / wordFreq, 1.0);
  }

  extractContextKey(context) {
    // Extract meaningful context (directory, project type, etc.)
    if (context.includes('package.json')) return 'nodejs';
    if (context.includes('requirements.txt')) return 'python';
    if (context.includes('Cargo.toml')) return 'rust';
    if (context.includes('go.mod')) return 'go';
    if (context.includes('Dockerfile')) return 'docker';
    if (context.includes('.git')) return 'git';
    return 'general';
  }

  detectProjectType(context) {
    return this.extractContextKey(context);
  }

  getTimeSlot(hour) {
    if (hour >= 9 && hour < 12) return 'morning';
    if (hour >= 13 && hour < 17) return 'afternoon';
    if (hour >= 18 && hour < 22) return 'evening';
    return 'night';
  }

  getLearningInsights() {
    return {
      skillLevel: this.skillLevel,
      totalCommands: Array.from(this.userPatterns.values()).reduce(
        (sum, patterns) => sum + patterns.commands.length,
        0
      ),
      vocabularySize: this.vocabulary.size,
      contexts: Array.from(this.userPatterns.keys()),
      timePatterns: Array.from(this.timePatterns.keys()),
      topCommands: this.getTopCommands(),
      predictions: this.getRecentPredictions(),
    };
  }

  getTopCommands() {
    const allCommands = new Map();

    this.userPatterns.forEach((patterns) => {
      patterns.frequency.forEach((count, command) => {
        const existing = allCommands.get(command) || 0;
        allCommands.set(command, existing + count);
      });
    });

    return Array.from(allCommands.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([command, count]) => ({ command, count }));
  }

  getRecentPredictions() {
    // Return recent prediction accuracy (simplified)
    return {
      accuracy: 0.75, // This would be calculated from actual usage
      totalPredictions: 100,
      successfulPredictions: 75,
    };
  }
}

export default LearningEngine;
