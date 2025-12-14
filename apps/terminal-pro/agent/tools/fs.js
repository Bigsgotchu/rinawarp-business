"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readFileTool = readFileTool;
exports.writeFileTool = writeFileTool;
exports.statTool = statTool;
exports.readdirTool = readdirTool;
exports.mkdirTool = mkdirTool;
const promises_1 = require("fs/promises");
async function readFileTool({ path }) {
    try {
        const content = await (0, promises_1.readFile)(path, "utf8");
        process.send?.({
            type: "fs:read:result",
            path,
            content,
        });
    }
    catch (error) {
        process.send?.({
            type: "fs:read:error",
            path,
            error: String(error),
        });
    }
}
async function writeFileTool({ path, content }) {
    try {
        await (0, promises_1.writeFile)(path, content, "utf8");
        process.send?.({
            type: "fs:write:result",
            path,
        });
    }
    catch (error) {
        process.send?.({
            type: "fs:write:error",
            path,
            error: String(error),
        });
    }
}
async function statTool({ path }) {
    try {
        const info = await (0, promises_1.stat)(path);
        process.send?.({
            type: "fs:stat:result",
            path,
            info: {
                isFile: info.isFile(),
                isDirectory: info.isDirectory(),
                size: info.size,
                modified: info.mtime,
            },
        });
    }
    catch (error) {
        process.send?.({
            type: "fs:stat:error",
            path,
            error: String(error),
        });
    }
}
async function readdirTool({ path }) {
    try {
        const items = await (0, promises_1.readdir)(path);
        process.send?.({
            type: "fs:readdir:result",
            path,
            items,
        });
    }
    catch (error) {
        process.send?.({
            type: "fs:readdir:error",
            path,
            error: String(error),
        });
    }
}
async function mkdirTool({ path }) {
    try {
        await (0, promises_1.mkdir)(path, { recursive: true });
        process.send?.({
            type: "fs:mkdir:result",
            path,
        });
    }
    catch (error) {
        process.send?.({
            type: "fs:mkdir:error",
            path,
            error: String(error),
        });
    }
}
