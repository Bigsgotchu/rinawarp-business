"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shortTermMemory = void 0;
class ShortTermMemoryManager {
    constructor() {
        this.memory = {
            recentCommands: [],
            recentOutputs: [],
            currentSession: {},
            buffer: []
        };
        this.maxCommands = 50;
        this.maxOutputs = 100;
    }
    addCommand(command) {
        this.memory.recentCommands.unshift(command);
        if (this.memory.recentCommands.length > this.maxCommands) {
            this.memory.recentCommands = this.memory.recentCommands.slice(0, this.maxCommands);
        }
    }
    getRecentCommands() {
        return [...this.memory.recentCommands];
    }
    addOutput(output) {
        this.memory.recentOutputs.unshift(output);
        if (this.memory.recentOutputs.length > this.maxOutputs) {
            this.memory.recentOutputs = this.memory.recentOutputs.slice(0, this.maxOutputs);
        }
    }
    getRecentOutputs() {
        return [...this.memory.recentOutputs];
    }
    setSessionValue(key, value) {
        this.memory.currentSession[key] = value;
    }
    getSessionValue(key) {
        return this.memory.currentSession[key];
    }
    getCurrentSession() {
        return { ...this.memory.currentSession };
    }
    clearSession() {
        this.memory.currentSession = {};
    }
    addToBuffer(data) {
        this.memory.buffer.push(data);
    }
    getBuffer() {
        return [...this.memory.buffer];
    }
    clearBuffer() {
        this.memory.buffer = [];
    }
    clear() {
        this.memory = {
            recentCommands: [],
            recentOutputs: [],
            currentSession: {},
            buffer: []
        };
    }
}
exports.shortTermMemory = new ShortTermMemoryManager();
