import { ffmpegTool } from './tool.ffmpeg.js';
import { fsTool } from './tool.fs.js';
export class ToolRegistry {
  constructor(config) {
    this.config = config;
    this.tools = {
      'ffmpeg.concat': ffmpegTool('concat'),
      'ffmpeg.probe': ffmpegTool('probe'),
      'fs.read': fsTool('read'),
      'fs.write': fsTool('write'),
      'fs.list': fsTool('list'),
    };
  }
  subset(names = []) {
    const out = {};
    for (const n of names) if (this.tools[n]) out[n] = this.tools[n];
    return out;
  }
  signature() {
    return Object.keys(this.tools);
  }
}
