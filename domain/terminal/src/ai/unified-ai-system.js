/**
 * Unified Hybrid AI System
 * Combines LLM + Learning + Local patterns for optimal responses
 */

import AdvancedAIManager from './advanced-ai-manager.js';
import LearningEngine from './learning-engine.js';

class UnifiedAISystem {
  constructor() {
    this.aiManager = new AdvancedAIManager();
    this.learningEngine = new LearningEngine();
    this.currentMode = 'hybrid'; // hybrid, llm, learning, local
    this.performanceMetrics = {
      responseTime: [],
      successRate: 0,
      userSatisfaction: 0,
      totalRequests: 0,
    };

    this.initializeSystem();
  }

  initializeSystem() {
    console.log('🧠 Initializing Unified AI System...');
    console.log('📊 Available modes: hybrid, llm, learning, local');
    console.log(
      '🤖 AI providers:',
      Object.keys(this.aiManager.getProviderStatus())
    );
  }

  async generateResponse(prompt, context = '', options = {}) {
    const startTime = Date.now();
    this.performanceMetrics.totalRequests++;

    try {
      let response;

      switch (this.currentMode) {
        case 'hybrid':
          response = await this.generateHybridResponse(
            prompt,
            context,
            options
          );
          break;
        case 'llm':
          response = await this.generateLLMResponse(prompt, context, options);
          break;
        case 'learning':
          response = await this.generateLearningResponse(
            prompt,
            context,
            options
          );
          break;
        case 'local':
          response = await this.generateLocalResponse(prompt, context, options);
          break;
        default:
          response = await this.generateHybridResponse(
            prompt,
            context,
            options
          );
      }

      // Update performance metrics
      const responseTime = Date.now() - startTime;
      this.updatePerformanceMetrics(responseTime, true);

      // Learn from this interaction
      this.learningEngine.learnFromInteraction(
        prompt,
        context,
        Date.now(),
        response.response
      );

      return {
        ...response,
        mode: this.currentMode,
        responseTime,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Unified AI System Error:', error);
      this.updatePerformanceMetrics(Date.now() - startTime, false);

      return {
        response: "I'm experiencing technical difficulties. Please try again.",
        provider: 'error',
        mode: this.currentMode,
        confidence: 0.1,
        error: error.message,
      };
    }
  }

  async generateHybridResponse(prompt, context, options) {
    // Get predictions from learning engine
    const predictions = this.learningEngine.predictNextCommand(context, prompt);
    const topPrediction = predictions[0];

    // Get LLM response
    const llmResponse = await this.aiManager.generateResponse(
      prompt,
      context,
      options.preferredProvider
    );

    // Combine responses based on confidence
    if (topPrediction && topPrediction.confidence > 0.7) {
      // High confidence prediction - combine with LLM
      return {
        response: `${llmResponse.response}\n\n💡 Suggested next command: \`${topPrediction.command}\``,
        provider: llmResponse.provider,
        confidence: (llmResponse.confidence + topPrediction.confidence) / 2,
        sources: ['llm', 'learning'],
        prediction: topPrediction,
      };
    } else {
      // Low confidence prediction - use LLM primarily
      return {
        ...llmResponse,
        sources: ['llm'],
        prediction: topPrediction,
      };
    }
  }

  async generateLLMResponse(prompt, context, options) {
    return await this.aiManager.generateResponse(
      prompt,
      context,
      options.preferredProvider
    );
  }

  generateLearningResponse(prompt, context, options) {
    const predictions = this.learningEngine.predictNextCommand(context, prompt);

    if (predictions.length > 0) {
      const topPrediction = predictions[0];
      return {
        response: `Based on your patterns, I suggest: \`${topPrediction.command}\`\n\nConfidence: ${(topPrediction.confidence * 100).toFixed(1)}%`,
        provider: 'learning',
        confidence: topPrediction.confidence,
        sources: ['learning'],
        predictions: predictions.slice(0, 3),
      };
    } else {
      return {
        response:
          "I don't have enough data to make a prediction yet. Keep using the terminal and I'll learn your patterns!",
        provider: 'learning',
        confidence: 0.1,
        sources: ['learning'],
      };
    }
  }

  generateLocalResponse(prompt, context, options) {
    // Simple pattern matching for local responses
    const patterns = {
      'git status': 'git add .',
      'git add .': 'git commit -m "your message"',
      'npm install': 'npm start',
      'docker build': 'docker run',
      ls: 'cd ..',
      pwd: 'ls -la',
    };

    const suggestion = patterns[prompt.toLowerCase()];
    if (suggestion) {
      return {
        response: `Local pattern match: \`${suggestion}\``,
        provider: 'local',
        confidence: 0.8,
        sources: ['local'],
      };
    } else {
      return {
        response:
          'No local pattern found. Try using an AI provider for better responses.',
        provider: 'local',
        confidence: 0.1,
        sources: ['local'],
      };
    }
  }

  updatePerformanceMetrics(responseTime, success) {
    this.performanceMetrics.responseTime.push(responseTime);

    // Keep only last 100 response times
    if (this.performanceMetrics.responseTime.length > 100) {
      this.performanceMetrics.responseTime =
        this.performanceMetrics.responseTime.slice(-100);
    }

    // Update success rate
    const totalRequests = this.performanceMetrics.totalRequests;
    const currentSuccesses =
      this.performanceMetrics.successRate * (totalRequests - 1);
    this.performanceMetrics.successRate =
      (currentSuccesses + (success ? 1 : 0)) / totalRequests;
  }

  setMode(mode) {
    const validModes = ['hybrid', 'llm', 'learning', 'local'];
    if (validModes.includes(mode)) {
      this.currentMode = mode;
      console.log(`🔄 Switched to ${mode} mode`);
      return true;
    } else {
      console.error(
        `Invalid mode: ${mode}. Valid modes: ${validModes.join(', ')}`
      );
      return false;
    }
  }

  getMode() {
    return this.currentMode;
  }

  getAvailableModes() {
    return [
      {
        id: 'hybrid',
        name: 'Hybrid Mode',
        description: 'Combines LLM + Learning + Local patterns',
      },
      {
        id: 'llm',
        name: 'LLM Mode',
        description: 'Pure external AI reasoning',
      },
      {
        id: 'learning',
        name: 'Learning Mode',
        description: 'Uses only learned patterns',
      },
      {
        id: 'local',
        name: 'Local Mode',
        description: 'Fallback pattern matching',
      },
    ];
  }

  getProviderStatus() {
    return this.aiManager.getProviderStatus();
  }

  async testProvider(providerKey) {
    return await this.aiManager.testProvider(providerKey);
  }

  getLearningInsights() {
    return this.learningEngine.getLearningInsights();
  }

  getPerformanceMetrics() {
    const avgResponseTime =
      this.performanceMetrics.responseTime.length > 0
        ? this.performanceMetrics.responseTime.reduce((a, b) => a + b, 0) /
          this.performanceMetrics.responseTime.length
        : 0;

    return {
      ...this.performanceMetrics,
      averageResponseTime: Math.round(avgResponseTime),
      totalRequests: this.performanceMetrics.totalRequests,
      successRate: Math.round(this.performanceMetrics.successRate * 100) / 100,
    };
  }

  getSystemStatus() {
    return {
      mode: this.currentMode,
      providers: this.getProviderStatus(),
      learning: this.getLearningInsights(),
      performance: this.getPerformanceMetrics(),
      timestamp: new Date().toISOString(),
    };
  }

  // Context-aware features
  detectProjectType(context) {
    return this.learningEngine.detectProjectType(context);
  }

  getContextualSuggestions(context) {
    const projectType = this.detectProjectType(context);
    const predictions = this.learningEngine.predictNextCommand(context);

    return {
      projectType,
      suggestions: predictions.slice(0, 3),
      skillLevel: this.learningEngine.skillLevel,
    };
  }

  // Advanced UI integration methods
  getAIConfigPanel() {
    return {
      currentMode: this.currentMode,
      availableModes: this.getAvailableModes(),
      providers: this.getProviderStatus(),
      learning: this.getLearningInsights(),
      performance: this.getPerformanceMetrics(),
    };
  }

  getRealTimeStatus() {
    return {
      mode: this.currentMode,
      activeProviders: Object.values(this.getProviderStatus()).filter(
        (p) => p.available
      ).length,
      learningAccuracy: this.getLearningInsights().predictions.accuracy,
      averageResponseTime: this.getPerformanceMetrics().averageResponseTime,
      uptime: process.uptime(),
    };
  }
}

export default UnifiedAISystem;
