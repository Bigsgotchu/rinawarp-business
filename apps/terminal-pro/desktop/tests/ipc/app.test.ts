import { describe, it, expect, vi, beforeEach } from 'vitest';
import { IpcMain } from 'electron';
import { AppHandler } from '../../src/main/ipc/app';
import { IPC_CHANNELS, APP_CONFIG } from '../../src/shared/constants';

// Mock electron IpcMain
const mockIpcMain = {
  handle: vi.fn(),
} as unknown as IpcMain;

describe('AppHandler', () => {
  let appHandler: AppHandler;

  beforeEach(() => {
    vi.clearAllMocks();
    appHandler = new AppHandler();
  });

  describe('register', () => {
    it('should register all IPC handlers', () => {
      appHandler.register(mockIpcMain);

      expect(mockIpcMain.handle).toHaveBeenCalledWith(
        IPC_CHANNELS.APP.GET_VERSION,
        expect.any(Function),
      );
      expect(mockIpcMain.handle).toHaveBeenCalledWith(
        IPC_CHANNELS.APP.OPEN_EXTERNAL,
        expect.any(Function),
      );
      expect(mockIpcMain.handle).toHaveBeenCalledWith(
        IPC_CHANNELS.APP.GET_CONFIG,
        expect.any(Function),
      );
      expect(mockIpcMain.handle).toHaveBeenCalledWith(
        IPC_CHANNELS.APP.SET_CONFIG,
        expect.any(Function),
      );
    });

    it('should not register handlers if already initialized', () => {
      appHandler.register(mockIpcMain);
      appHandler.register(mockIpcMain);

      expect(mockIpcMain.handle).toHaveBeenCalledTimes(4); // Only called once
    });
  });

  describe('handleGetVersion', () => {
    it('should return app version and name', async () => {
      const mockEvent = {};
      const payload = {};

      const result = await (appHandler as any).handleGetVersion(mockEvent, payload);

      expect(result).toEqual({
        version: APP_CONFIG.version,
        name: APP_CONFIG.name,
      });
    });
  });

  describe('handleOpenExternal', () => {
    it('should return success for open external request', async () => {
      const mockEvent = {};
      const payload = { url: 'https://example.com' };

      const result = await (appHandler as any).handleOpenExternal(mockEvent, payload);

      expect(result).toEqual({ success: true });
    });
  });

  describe('handleGetConfig', () => {
    it('should return empty config object', async () => {
      const mockEvent = {};
      const payload = {};

      const result = await (appHandler as any).handleGetConfig(mockEvent, payload);

      expect(result).toEqual({ config: {} });
    });
  });

  describe('handleSetConfig', () => {
    it('should return success for set config request', async () => {
      const mockEvent = {};
      const payload = { theme: 'dark' };

      const result = await (appHandler as any).handleSetConfig(mockEvent, payload);

      expect(result).toEqual({ success: true });
    });
  });

  describe('cleanup', () => {
    it('should reset initialized state', () => {
      appHandler.register(mockIpcMain);
      appHandler.cleanup();

      // Should be able to register again after cleanup
      appHandler.register(mockIpcMain);
      expect(mockIpcMain.handle).toHaveBeenCalledTimes(8); // Called twice now
    });
  });
});
