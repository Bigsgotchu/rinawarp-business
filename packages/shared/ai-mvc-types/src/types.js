'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.DanceIntensity =
  exports.DanceStyleEnum =
  exports.ProjectStatus =
  exports.VideoStyle =
  exports.VideoResolution =
  exports.VideoQuality =
  exports.AvatarStyle =
  exports.AvatarStatus =
    void 0;
var AvatarStatus;
(function (AvatarStatus) {
  AvatarStatus['CREATING'] = 'creating';
  AvatarStatus['TRAINING'] = 'training';
  AvatarStatus['READY'] = 'ready';
  AvatarStatus['FAILED'] = 'failed';
})(AvatarStatus || (exports.AvatarStatus = AvatarStatus = {}));
var AvatarStyle;
(function (AvatarStyle) {
  AvatarStyle['REALISTIC'] = 'realistic';
  AvatarStyle['ANIMATED'] = 'animated';
  AvatarStyle['ARTISTIC'] = 'artistic';
})(AvatarStyle || (exports.AvatarStyle = AvatarStyle = {}));
var VideoQuality;
(function (VideoQuality) {
  VideoQuality['STANDARD'] = 'standard';
  VideoQuality['HIGH'] = 'high';
  VideoQuality['ULTRA'] = 'ultra';
  VideoQuality['CINEMATIC'] = 'cinematic'; // 8K, highest quality
})(VideoQuality || (exports.VideoQuality = VideoQuality = {}));
var VideoResolution;
(function (VideoResolution) {
  VideoResolution['HD_720'] = '1280x720';
  VideoResolution['FHD_1080'] = '1920x1080';
  VideoResolution['UHD_4K'] = '3840x2160';
  VideoResolution['UHD_8K'] = '7680x4320';
})(VideoResolution || (exports.VideoResolution = VideoResolution = {}));
var VideoStyle;
(function (VideoStyle) {
  VideoStyle['PERFORMANCE'] = 'performance';
  VideoStyle['CONCERT'] = 'concert';
  VideoStyle['DANCE'] = 'dance';
  VideoStyle['NARRATIVE'] = 'narrative';
  VideoStyle['ABSTRACT'] = 'abstract';
  VideoStyle['TEXT_TO_VIDEO'] = 'text_to_video';
  VideoStyle['AI_DANCE'] = 'ai_dance';
  VideoStyle['VIDEO_RECAST'] = 'video_recast';
})(VideoStyle || (exports.VideoStyle = VideoStyle = {}));
var ProjectStatus;
(function (ProjectStatus) {
  ProjectStatus['CREATING'] = 'creating';
  ProjectStatus['PROCESSING'] = 'processing';
  ProjectStatus['READY'] = 'ready';
  ProjectStatus['FAILED'] = 'failed';
})(ProjectStatus || (exports.ProjectStatus = ProjectStatus = {}));
var DanceStyleEnum;
(function (DanceStyleEnum) {
  DanceStyleEnum['HIP_HOP'] = 'hip_hop';
  DanceStyleEnum['POP'] = 'pop';
  DanceStyleEnum['ELECTRONIC'] = 'electronic';
  DanceStyleEnum['LATIN'] = 'latin';
  DanceStyleEnum['CONTEMPORARY'] = 'contemporary';
  DanceStyleEnum['BREAKDANCE'] = 'breakdance';
  DanceStyleEnum['JAZZ'] = 'jazz';
  DanceStyleEnum['FREESTYLE'] = 'freestyle';
})(DanceStyleEnum || (exports.DanceStyleEnum = DanceStyleEnum = {}));
var DanceIntensity;
(function (DanceIntensity) {
  DanceIntensity['LOW'] = 'low';
  DanceIntensity['MEDIUM'] = 'medium';
  DanceIntensity['HIGH'] = 'high';
  DanceIntensity['EXTREME'] = 'extreme';
})(DanceIntensity || (exports.DanceIntensity = DanceIntensity = {}));
//# sourceMappingURL=types.js.map
