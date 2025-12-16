import type { IPC_CHANNELS } from './channels';
import type {
  AppVersionReqT,
  AppVersionResT,
  OpenExternalReqT,
  OpenExternalResT,
  RunTaskReqT,
  RunTaskResT,
  PtySpawnReqT,
  PtySpawnResT,
  PtyInputReqT,
  PtyWriteReqT,
  PtyResizeReqT,
  PtyKillReqT,
  PtyDataEventT,
  PtyExitEventT,
} from './schemas';

export type IpcMap = {
  [IPC_CHANNELS.APP_VERSION]: {
    req: AppVersionReqT;
    res: AppVersionResT;
  };
  [IPC_CHANNELS.OPEN_EXTERNAL]: {
    req: OpenExternalReqT;
    res: OpenExternalResT;
  };
  [IPC_CHANNELS.RUN_TASK]: {
    req: RunTaskReqT;
    res: RunTaskResT;
  };
  [IPC_CHANNELS.PTY_SPAWN]: {
    req: PtySpawnReqT;
    res: PtySpawnResT;
  };
  [IPC_CHANNELS.PTY_INPUT]: {
    req: PtyInputReqT;
    res: void;
  };
  [IPC_CHANNELS.PTY_RESIZE]: {
    req: PtyResizeReqT;
    res: void;
  };
  [IPC_CHANNELS.PTY_KILL]: {
    req: PtyKillReqT;
    res: void;
  };
};

export type IpcEventMap = {
  [IPC_CHANNELS.PTY_ON_DATA]: PtyDataEventT;
  [IPC_CHANNELS.PTY_ON_EXIT]: PtyExitEventT;
};
