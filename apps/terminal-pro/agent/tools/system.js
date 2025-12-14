"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSystemInfo = getSystemInfo;
exports.getDiskUsage = getDiskUsage;
exports.getMemoryUsage = getMemoryUsage;
exports.getUptime = getUptime;
exports.getSystemLogs = getSystemLogs;
exports.formatBytes = formatBytes;
exports.getMemoryPercent = getMemoryPercent;
const child_process_1 = require("child_process");
const util_1 = require("util");
const os_1 = __importDefault(require("os"));
const execAsync = (0, util_1.promisify)(child_process_1.exec);
async function getSystemInfo() {
    const memTotal = os_1.default.totalmem();
    const memFree = os_1.default.freemem();
    return {
        platform: os_1.default.platform(),
        arch: os_1.default.arch(),
        hostname: os_1.default.hostname(),
        uptime: os_1.default.uptime(),
        cpus: os_1.default.cpus().length,
        totalMemory: memTotal,
        freeMemory: memFree,
        loadAverage: os_1.default.loadavg(),
        nodeVersion: process.version
    };
}
async function getDiskUsage() {
    try {
        const { stdout } = await execAsync("df -h");
        return stdout;
    }
    catch (error) {
        throw new Error(`Failed to get disk usage: ${error}`);
    }
}
async function getMemoryUsage() {
    try {
        const { stdout } = await execAsync("free -h");
        return stdout;
    }
    catch (error) {
        throw new Error(`Failed to get memory usage: ${error}`);
    }
}
async function getUptime() {
    try {
        const { stdout } = await execAsync("uptime");
        return stdout;
    }
    catch (error) {
        throw new Error(`Failed to get uptime: ${error}`);
    }
}
async function getSystemLogs(lines = 50) {
    try {
        const { stdout } = await execAsync(`journalctl -n ${lines} --no-pager`);
        return stdout;
    }
    catch (error) {
        try {
            const { stdout } = await execAsync(`dmesg | tail -${lines}`);
            return stdout;
        }
        catch (fallbackError) {
            throw new Error(`Failed to get system logs: ${error}`);
        }
    }
}
function formatBytes(bytes) {
    if (bytes === 0)
        return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
function getMemoryPercent() {
    const total = os_1.default.totalmem();
    const free = os_1.default.freemem();
    const used = total - free;
    return Math.round((used / total) * 100);
}
