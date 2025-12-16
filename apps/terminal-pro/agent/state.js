'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.stateManager = void 0;
class StateManager {
  constructor() {
    this.state = {};
  }
  getState() {
    return { ...this.state };
  }
  updateState(updates) {
    this.state = { ...this.state, ...updates };
  }
  setLastCommand(command) {
    this.state.lastCommand = command;
  }
  getLastCommand() {
    return this.state.lastCommand;
  }
  setWorkingDirectory(cwd) {
    this.state.workingDirectory = cwd;
  }
  getWorkingDirectory() {
    return this.state.workingDirectory;
  }
  setEnvironment(env) {
    this.state.environment = env;
  }
  getEnvironment() {
    return this.state.environment;
  }
  setUserContext(context) {
    this.state.userContext = context;
  }
  getUserContext() {
    return this.state.userContext;
  }
  clear() {
    this.state = {};
  }
}
exports.stateManager = new StateManager();
