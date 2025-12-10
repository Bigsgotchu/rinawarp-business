import { AvatarStatus, ProjectStatus } from './types';

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export const getStatusColor = (status: AvatarStatus | ProjectStatus): string => {
  switch (status) {
    case AvatarStatus.CREATING:
    case ProjectStatus.CREATING:
      return 'text-blue-600';
    case AvatarStatus.TRAINING:
    case ProjectStatus.PROCESSING:
      return 'text-yellow-600';
    case AvatarStatus.READY:
    case ProjectStatus.READY:
      return 'text-green-600';
    case AvatarStatus.FAILED:
    case ProjectStatus.FAILED:
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
};

export const getStatusText = (status: AvatarStatus | ProjectStatus): string => {
  switch (status) {
    case AvatarStatus.CREATING:
      return 'Creating Avatar';
    case AvatarStatus.TRAINING:
      return 'Training Model';
    case AvatarStatus.READY:
      return 'Ready to Use';
    case AvatarStatus.FAILED:
      return 'Training Failed';
    case ProjectStatus.CREATING:
      return 'Creating Project';
    case ProjectStatus.PROCESSING:
      return 'Generating Video';
    case ProjectStatus.READY:
      return 'Video Ready';
    case ProjectStatus.FAILED:
      return 'Generation Failed';
    default:
      return 'Unknown Status';
  }
};

export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Please upload a valid image file (JPEG, PNG, or WebP)' };
  }

  if (file.size > maxSize) {
    return { valid: false, error: 'Image file size must be less than 10MB' };
  }

  return { valid: true };
};

export const validateAudioFile = (file: File): { valid: boolean; error?: string } => {
  const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3'];
  const maxSize = 100 * 1024 * 1024; // 100MB

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Please upload a valid audio file (MP3, WAV, or OGG)' };
  }

  if (file.size > maxSize) {
    return { valid: false, error: 'Audio file size must be less than 100MB' };
  }

  return { valid: true };
};

export const generateId = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};
