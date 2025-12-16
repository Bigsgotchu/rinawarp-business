/**
 * Risk Detection Heuristic System
 * Performs comprehensive risk assessment before any operation
 */

class RiskDetector {
  constructor() {
    this.riskThreshold = 0.7; // 70% risk score triggers warning
    this.riskFactors = {
      fileOverwrite: 0.9,
      largeOutput: 0.8,
      ambiguousInstruction: 0.85,
      missingDependencies: 0.75,
      unvalidatedPath: 0.95,
      systemModification: 0.88,
    };
  }

  /**
   * Perform comprehensive risk scan
   * @param {Object} operation - Operation details
   * @returns {Object} Risk assessment result
   */
  performRiskScan(operation) {
    const riskReport = {
      operationId: operation.id || 'unknown',
      timestamp: new Date().toISOString(),
      riskFactorsDetected: [],
      riskScore: 0,
      recommendation: 'PROCEED',
    };

    // Check for file overwrite risk
    if (operation.type === 'file_write' && operation.mode === 'overwrite') {
      riskReport.riskFactorsDetected.push({
        factor: 'fileOverwrite',
        description: 'Operation will overwrite existing file',
        severity: this.riskFactors.fileOverwrite,
      });
      riskReport.riskScore += this.riskFactors.fileOverwrite;
    }

    // Check for large output risk
    if (operation.outputSize && operation.outputSize > 1000) {
      riskReport.riskFactorsDetected.push({
        factor: 'largeOutput',
        description: `Large output detected (${operation.outputSize} lines)`,
        severity: this.riskFactors.largeOutput,
      });
      riskReport.riskScore += this.riskFactors.largeOutput;
    }

    // Check for ambiguous instructions
    if (operation.instructionAmbiguity > 0.3) {
      riskReport.riskFactorsDetected.push({
        factor: 'ambiguousInstruction',
        description: `Instruction ambiguity detected (${operation.instructionAmbiguity * 100}%)`,
        severity: this.riskFactors.ambiguousInstruction,
      });
      riskReport.riskScore += this.riskFactors.ambiguousInstruction;
    }

    // Check for missing dependencies
    if (operation.missingDependencies && operation.missingDependencies.length > 0) {
      riskReport.riskFactorsDetected.push({
        factor: 'missingDependencies',
        description: `${operation.missingDependencies.length} missing dependencies detected`,
        severity: this.riskFactors.missingDependencies,
      });
      riskReport.riskScore += this.riskFactors.missingDependencies;
    }

    // Check for unvalidated paths
    if (operation.paths && operation.paths.some((path) => !path.validated)) {
      riskReport.riskFactorsDetected.push({
        factor: 'unvalidatedPath',
        description: 'Unvalidated file paths detected',
        severity: this.riskFactors.unvalidatedPath,
      });
      riskReport.riskScore += this.riskFactors.unvalidatedPath;
    }

    // Calculate final risk assessment
    riskReport.riskScore = Math.min(1.0, riskReport.riskScore); // Cap at 1.0

    if (riskReport.riskScore >= this.riskThreshold) {
      riskReport.recommendation = 'STOP_AND_CONFIRM';
      riskReport.warning = `High risk detected (score: ${riskReport.riskScore.toFixed(2)})`;
    } else if (riskReport.riskScore > 0.3) {
      riskReport.recommendation = 'PROCEED_WITH_CAUTION';
      riskReport.warning = `Moderate risk detected (score: ${riskReport.riskScore.toFixed(2)})`;
    }

    return riskReport;
  }

  /**
   * Validate operation safety
   * @param {Object} operation
   * @returns {boolean} True if operation is safe
   */
  isOperationSafe(operation) {
    const riskReport = this.performRiskScan(operation);
    return riskReport.recommendation === 'PROCEED';
  }
}

module.exports = new RiskDetector();
