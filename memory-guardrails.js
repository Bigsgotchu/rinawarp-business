/**
 * Memory Guardrails System
 * Prevents hallucinations and ensures factual accuracy
 */

class MemoryGuardrails {
  constructor() {
    this.knowledgeBase = new Map();
    this.verificationCache = new Map();
    this.hallucinationPatterns = [
      /invented.*file/i,
      /assumed.*path/i,
      /imagined.*api/i,
      /created.*function/i,
      /generated.*file/i,
      /made up.*dependency/i
    ];
  }

  /**
   * Validate memory accuracy
   * @param {string} statement - Statement to validate
   * @returns {Object} Validation result
   */
  validateMemory(statement) {
    const validationResult = {
      statement: statement,
      isValid: true,
      issues: [],
      confidence: 1.0
    };

    // Check for hallucination patterns
    for (const pattern of this.hallucinationPatterns) {
      if (pattern.test(statement)) {
        validationResult.isValid = false;
        validationResult.issues.push({
          type: 'hallucination_pattern',
          pattern: pattern.toString(),
          severity: 'high'
        });
        validationResult.confidence *= 0.3;
      }
    }

    // Check against knowledge base
    const statementKey = this._generateStatementKey(statement);
    if (this.knowledgeBase.has(statementKey)) {
      const knownFact = this.knowledgeBase.get(statementKey);
      if (!knownFact.verified) {
        validationResult.isValid = false;
        validationResult.issues.push({
          type: 'unverified_knowledge',
          source: knownFact.source,
          severity: 'medium'
        });
        validationResult.confidence *= 0.5;
      }
    } else {
      // Unknown statement - requires verification
      validationResult.issues.push({
        type: 'unknown_statement',
        severity: 'medium',
        recommendation: 'verify_before_use'
      });
      validationResult.confidence *= 0.6;
    }

    return validationResult;
  }

  /**
   * Add verified knowledge to knowledge base
   * @param {string} statement
   * @param {Object} metadata
   */
  addVerifiedKnowledge(statement, metadata) {
    const statementKey = this._generateStatementKey(statement);
    this.knowledgeBase.set(statementKey, {
      statement: statement,
      verified: true,
      source: metadata.source || 'user_input',
      timestamp: new Date().toISOString(),
      ...metadata
    });
  }

  /**
   * Check if operation is based on verified knowledge
   * @param {Object} operation
   * @returns {boolean}
   */
  isOperationVerified(operation) {
    if (!operation.description) return false;

    const validation = this.validateMemory(operation.description);
    return validation.isValid && validation.confidence >= 0.8;
  }

  /**
   * Prevent hallucination by validating all assumptions
   * @param {Array} assumptions
   * @returns {Object} Hallucination prevention report
   */
  preventHallucination(assumptions) {
    const report = {
      assumptionsChecked: assumptions.length,
      issuesFound: 0,
      safeToProceed: true,
      recommendations: []
    };

    for (const assumption of assumptions) {
      const validation = this.validateMemory(assumption);

      if (!validation.isValid) {
        report.issuesFound++;
        report.safeToProceed = false;
        report.recommendations.push({
          assumption: assumption,
          issues: validation.issues,
          action: 'STOP_AND_VERIFY'
        });
      }
    }

    return report;
  }

  /**
   * Generate unique key for statement
   * @private
   */
  _generateStatementKey(statement) {
    return statement.toLowerCase().trim();
  }

  /**
   * Clear verification cache
   */
  clearCache() {
    this.verificationCache.clear();
  }
}

module.exports = new MemoryGuardrails();