/**
 * Smart Task Splitting Algorithm
 * Intelligently breaks down complex tasks into atomic steps
 */

class SmartTaskSplitter {
  constructor() {
    this.maxStepComplexity = 0.3; // Maximum complexity score per step
    this.operationPatterns = {
      fileOperations: /(create|write|read|delete|modify).*file/i,
      codeChanges: /(edit|change|update|refactor|fix).*code/i,
      systemCommands: /(run|execute|install|build|compile)/i,
      validationChecks: /(verify|validate|check|confirm)/i,
      researchTasks: /(find|search|locate|identify|analyze)/i
    };
  }

  /**
   * Split task into atomic steps
   * @param {string} taskDescription
   * @returns {Array} Array of atomic steps
   */
  splitTask(taskDescription) {
    const steps = [];
    let currentComplexity = 0;

    // Phase 1: Identify major components
    const components = this._identifyComponents(taskDescription);

    // Phase 2: Break each component into steps
    for (const component of components) {
      const componentSteps = this._breakComponentIntoSteps(component);

      for (const step of componentSteps) {
        const stepComplexity = this._calculateStepComplexity(step);

        if (currentComplexity + stepComplexity > this.maxStepComplexity) {
          // Start new step
          steps.push({
            description: step,
            complexity: stepComplexity,
            component: component.name
          });
          currentComplexity = stepComplexity;
        } else {
          // Add to current step or create new if too complex
          if (steps.length > 0) {
            steps[steps.length - 1].description += ` AND ${step}`;
            steps[steps.length - 1].complexity += stepComplexity;
          } else {
            steps.push({
              description: step,
              complexity: stepComplexity,
              component: component.name
            });
          }
          currentComplexity += stepComplexity;
        }
      }
    }

    // Phase 3: Validate and refine steps
    return this._validateAndRefineSteps(steps);
  }

  /**
   * Identify major components in task
   * @private
   */
  _identifyComponents(taskDescription) {
    const components = [];
    const sentences = this._splitIntoSentences(taskDescription);

    let currentComponent = {
      name: `Component ${components.length + 1}`,
      sentences: []
    };

    for (const sentence of sentences) {
      // Check if sentence indicates a new component
      if (this._isComponentBoundary(sentence)) {
        if (currentComponent.sentences.length > 0) {
          components.push(currentComponent);
        }
        currentComponent = {
          name: `Component ${components.length + 1}`,
          sentences: [sentence]
        };
      } else {
        currentComponent.sentences.push(sentence);
      }
    }

    if (currentComponent.sentences.length > 0) {
      components.push(currentComponent);
    }

    return components;
  }

  /**
   * Break component into individual steps
   * @private
   */
  _breakComponentIntoSteps(component) {
    const steps = [];

    for (const sentence of component.sentences) {
      // Check for compound operations that need splitting
      if (this._containsCompoundOperations(sentence)) {
        const subSteps = this._splitCompoundOperations(sentence);
        steps.push(...subSteps);
      } else {
        steps.push(sentence);
      }
    }

    return steps;
  }

  /**
   * Calculate step complexity score
   * @private
   */
  _calculateStepComplexity(step) {
    let complexity = 0.1; // Base complexity

    // Check for file operations
    if (this.operationPatterns.fileOperations.test(step)) {
      complexity += 0.2;
    }

    // Check for code changes
    if (this.operationPatterns.codeChanges.test(step)) {
      complexity += 0.25;
    }

    // Check for system commands
    if (this.operationPatterns.systemCommands.test(step)) {
      complexity += 0.3;
    }

    // Check for multiple operations
    const operations = this._countOperations(step);
    complexity += operations * 0.1;

    return Math.min(1.0, complexity);
  }

  /**
   * Validate and refine steps
   * @private
   */
  _validateAndRefineSteps(steps) {
    const refinedSteps = [];

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const complexity = this._calculateStepComplexity(step.description);

      if (complexity > this.maxStepComplexity) {
        // Step is too complex, split further
        const subSteps = this._splitComplexStep(step.description);
        refinedSteps.push(...subSteps);
      } else {
        refinedSteps.push({
          id: i + 1,
          description: step.description,
          complexity: complexity,
          isAtomic: true,
          requiresConfirmation: true
        });
      }
    }

    return refinedSteps;
  }

  // Helper methods
  _splitIntoSentences(text) {
    return text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  }

  _isComponentBoundary(sentence) {
    const boundaryPatterns = [
      /first(,| then)/i,
      /next(,| step)/i,
      /after that/i,
      /then /i,
      /finally/i,
      /in addition/i,
      /moreover/i
    ];

    return boundaryPatterns.some(pattern => pattern.test(sentence));
  }

  _containsCompoundOperations(sentence) {
    const andCount = (sentence.match(/ and /gi) || []).length;
    const thenCount = (sentence.match(/ then /gi) || []).length;
    return andCount + thenCount > 1;
  }

  _splitCompoundOperations(sentence) {
    return sentence.split(/ and | then /i).map(s => s.trim());
  }

  _countOperations(sentence) {
    return (sentence.match(/ (and|then|also|plus|additionally) /gi) || []).length + 1;
  }

  _splitComplexStep(step) {
    // Simple splitting for complex steps
    const parts = step.split(/ and | then /i);
    return parts.map((part, index) => ({
      description: part.trim(),
      complexity: this._calculateStepComplexity(part.trim()),
      isAtomic: true,
      requiresConfirmation: true
    }));
  }
}

module.exports = new SmartTaskSplitter();