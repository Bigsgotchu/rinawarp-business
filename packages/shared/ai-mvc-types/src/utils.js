'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.debounce =
  exports.generateId =
  exports.validateAudioFile =
  exports.validateImageFile =
  exports.getStatusText =
  exports.getStatusColor =
  exports.formatDuration =
  exports.formatFileSize =
    void 0;
const types_1 = require('./types');
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
exports.formatFileSize = formatFileSize;
const formatDuration = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};
exports.formatDuration = formatDuration;
const getStatusColor = (status) => {
  switch (status) {
    case types_1.AvatarStatus.CREATING:
    case types_1.ProjectStatus.CREATING:
      return 'text-blue-600';
    case types_1.AvatarStatus.TRAINING:
    case types_1.ProjectStatus.PROCESSING:
      return 'text-yellow-600';
    case types_1.AvatarStatus.READY:
    case types_1.ProjectStatus.READY:
      return 'text-green-600';
    case types_1.AvatarStatus.FAILED:
    case types_1.ProjectStatus.FAILED:
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
};
exports.getStatusColor = getStatusColor;
const getStatusText = (status) => {
  switch (status) {
    case types_1.AvatarStatus.CREATING:
      return 'Creating Avatar';
    case types_1.AvatarStatus.TRAINING:
      return 'Training Model';
    case types_1.AvatarStatus.READY:
      return 'Ready to Use';
    case types_1.AvatarStatus.FAILED:
      return 'Training Failed';
    case types_1.ProjectStatus.CREATING:
      return 'Creating Project';
    case types_1.ProjectStatus.PROCESSING:
      return 'Generating Video';
    case types_1.ProjectStatus.READY:
      return 'Video Ready';
    case types_1.ProjectStatus.FAILED:
      return 'Generation Failed';
    default:
      return 'Unknown Status';
  }
};
exports.getStatusText = getStatusText;
const validateImageFile = (file) => {
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
exports.validateImageFile = validateImageFile;
const validateAudioFile = (file) => {
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
exports.validateAudioFile = validateAudioFile;
const generateId = () => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};
exports.generateId = generateId;
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};
exports.debounce = debounce;
//# sourceMappingURL=utils.js.map
