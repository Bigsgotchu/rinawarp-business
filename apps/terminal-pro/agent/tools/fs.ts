import { readFile, writeFile, stat, readdir, mkdir } from 'fs/promises';
import { join } from 'path';

export async function readFileTool({ path }: { path: string }) {
  try {
    const content = await readFile(path, 'utf8');
    process.send?.({
      type: 'fs:read:result',
      path,
      content,
    });
  } catch (error) {
    process.send?.({
      type: 'fs:read:error',
      path,
      error: String(error),
    });
  }
}

export async function writeFileTool({ path, content }: { path: string; content: string }) {
  try {
    await writeFile(path, content, 'utf8');
    process.send?.({
      type: 'fs:write:result',
      path,
    });
  } catch (error) {
    process.send?.({
      type: 'fs:write:error',
      path,
      error: String(error),
    });
  }
}

export async function statTool({ path }: { path: string }) {
  try {
    const info = await stat(path);
    process.send?.({
      type: 'fs:stat:result',
      path,
      info: {
        isFile: info.isFile(),
        isDirectory: info.isDirectory(),
        size: info.size,
        modified: info.mtime,
      },
    });
  } catch (error) {
    process.send?.({
      type: 'fs:stat:error',
      path,
      error: String(error),
    });
  }
}

export async function readdirTool({ path }: { path: string }) {
  try {
    const items = await readdir(path);
    process.send?.({
      type: 'fs:readdir:result',
      path,
      items,
    });
  } catch (error) {
    process.send?.({
      type: 'fs:readdir:error',
      path,
      error: String(error),
    });
  }
}

export async function mkdirTool({ path }: { path: string }) {
  try {
    await mkdir(path, { recursive: true });
    process.send?.({
      type: 'fs:mkdir:result',
      path,
    });
  } catch (error) {
    process.send?.({
      type: 'fs:mkdir:error',
      path,
      error: String(error),
    });
  }
}
