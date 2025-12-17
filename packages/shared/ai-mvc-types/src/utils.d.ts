import { AvatarStatus, ProjectStatus } from './types';
export declare const formatFileSize: (bytes: number) => string;
export declare const formatDuration: (seconds: number) => string;
export declare const getStatusColor: (status: AvatarStatus | ProjectStatus) => string;
export declare const getStatusText: (status: AvatarStatus | ProjectStatus) => string;
export declare const validateImageFile: (file: File) => {
  valid: boolean;
  error?: string;
};
export declare const validateAudioFile: (file: File) => {
  valid: boolean;
  error?: string;
};
export declare const generateId: () => string;
export declare const debounce: <T extends (...args: any[]) => any>(
  func: T,
  wait: number,
) => (...args: Parameters<T>) => void;
//# sourceMappingURL=utils.d.ts.map
