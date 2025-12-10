/**
 * Mode Toggle System
 * Handles switching between atomic, one-shot, and safe modes
 */

class ModeToggleSystem {
  constructor() {
    this.currentMode = 'atomic'; // Default mode
    this.modeDefinitions = {
      atomic: {
        name: 'Atomic Mode',
        description: 'Break tasks into atomic steps, require confirmation for each',
        behavior: {
          stepByStep: true,
          requireConfirmation: true,
          autoExecute: false,
          maxStepsPerResponse: 1
        }
      },
      one_shot: {
        name: 'One-Shot Mode',
        description: 'Complete entire task in one execution',
        behavior: {
          stepByStep: false,
          requireConfirmation: false,
          autoExecute: true,
          maxStepsPerResponse: Infinity
        }
      },
      safe: {
        name: 'Safe Mode',
        description: 'Extra caution with file operations and confirmations',
        behavior: {
          stepByStep: true,
          requireConfirmation: true,
          autoExecute: false,
          maxStepsPerResponse: 1,
          extraValidations: true,
          fileOperationWarnings: true
        }
      }
    };
  }

  /**
   * Get current mode
   * @returns {string} Current mode name
   */
  getCurrentMode() {
    return this.currentMode;
  }

  /**
   * Get current mode definition
   * @returns {Object} Current mode definition
   */
  getCurrentModeDefinition() {
    return this.modeDefinitions[this.currentMode];
  }

  /**
   * Set mode by name
   * @param {string} modeName - 'atomic', 'one_shot', or 'safe'
   * @returns {boolean} True if mode was set successfully
   */
  setMode(modeName) {
    if (this.modeDefinitions[modeName]) {
      this.currentMode = modeName;
      return true;
    }
    return false;
  }

  /**
   * Toggle to atomic mode
   */
  enableAtomicMode() {
    this.currentMode = 'atomic';
    return this.getCurrentModeDefinition();
  }

  /**
   * Toggle to one-shot mode
   */
  enableOneShotMode() {
    this.currentMode = 'one_shot';
    return this.getCurrentModeDefinition();
  }

  /**
   * Toggle to safe mode
   */
  enableSafeMode() {
    this.currentMode = 'safe';
    return this.getCurrentModeDefinition();
  }

  /**
   * Check if current mode requires confirmation
   * @returns {boolean}
   */
  requiresConfirmation() {
    return this.getCurrentModeDefinition().behavior.requireConfirmation;
  }

  /**
   * Check if current mode allows auto-execution
   * @returns {boolean}
   */
  allowsAutoExecution() {
    return this.getCurrentModeDefinition().behavior.autoExecute;
  }

  /**
   * Get maximum steps allowed per response
   * @returns {number}
   */
  getMaxStepsPerResponse() {
    return this.getCurrentModeDefinition().behavior.maxStepsPerResponse;
  }

  /**
   * Check if extra validations are required
   * @returns {boolean}
   */
  requiresExtraValidations() {
    return this.getCurrentModeDefinition().behavior.extraValidations || false;
  }

  /**
   * Check if file operation warnings are required
   * @returns {boolean}
   */
  requiresFileOperationWarnings() {
    return this.getCurrentModeDefinition().behavior.fileOperationWarnings || false;
  }

  /**
   * Process mode-specific command
   * @param {string} command - Mode toggle command
   * @returns {Object} Result of command processing
   */
  processModeCommand(command) {
    const result = {
      success: false,
      message: '',
      newMode: this.currentMode
    };

    const normalizedCommand = command.toLowerCase().trim();

    if (normalizedCommand === 'atomic mode on' || normalizedCommand === 'enable atomic mode') {
      this.enableAtomicMode();
      result.success = true;
      result.message = 'Atomic mode enabled';
      result.newMode = 'atomic';
    }
    else if (normalizedCommand === 'one-shot mode on' || normalizedCommand === 'enable one-shot mode') {
      this.enableOneShotMode();
      result.success = true;
      result.message = 'One-shot mode enabled';
      result.newMode = 'one_shot';
    }
    else if (normalizedCommand === 'safe mode on' || normalizedCommand === 'enable safe mode') {
      this.enableSafeMode();
      result.success = true;
      result.message = 'Safe mode enabled';
      result.newMode = 'safe';
    }
    else {
      result.message = `Unknown mode command: ${command}`;
    }

    return result;
  }
}

module.exports = new ModeToggleSystem();