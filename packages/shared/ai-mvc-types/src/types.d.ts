export interface PersonalAvatar {
  id: string;
  userId: string;
  name: string;
  description?: string;
  status: AvatarStatus;
  createdAt: Date;
  updatedAt: Date;
  trainingImages: string[];
  modelPath?: string;
  previewImage?: string;
}
export declare enum AvatarStatus {
  CREATING = 'creating',
  TRAINING = 'training',
  READY = 'ready',
  FAILED = 'failed',
}
export interface AvatarTrainingRequest {
  name: string;
  description?: string;
  images: File[];
  style?: AvatarStyle;
}
export declare enum AvatarStyle {
  REALISTIC = 'realistic',
  ANIMATED = 'animated',
  ARTISTIC = 'artistic',
}
export interface MusicTrack {
  id: string;
  name: string;
  artist?: string;
  duration: number;
  filePath: string;
  uploadedAt: Date;
  metadata?: MusicMetadata;
}
export interface MusicMetadata {
  title?: string;
  artist?: string;
  album?: string;
  genre?: string;
  year?: number;
  bitrate?: number;
  sampleRate?: number;
}
export interface VideoProject {
  id: string;
  name: string;
  userId: string;
  musicTrack: MusicTrack;
  avatar?: PersonalAvatar;
  style: VideoStyle;
  status: ProjectStatus;
  createdAt: Date;
  updatedAt: Date;
  outputPath?: string;
  previewPath?: string;
  duration: number;
  segments?: VideoSegment[];
  quality: VideoQuality;
  resolution: VideoResolution;
  estimatedProcessingTime?: number;
  processingChunks?: ProcessingChunk[];
}
export interface VideoSegment {
  id: string;
  startTime: number;
  endTime: number;
  duration: number;
  status: ProjectStatus;
  outputPath?: string;
  thumbnail?: string;
}
export declare enum VideoQuality {
  STANDARD = 'standard', // 720p, faster processing
  HIGH = 'high', // 1080p, balanced
  ULTRA = 'ultra', // 4K, premium quality
  CINEMATIC = 'cinematic',
}
export declare enum VideoResolution {
  HD_720 = '1280x720',
  FHD_1080 = '1920x1080',
  UHD_4K = '3840x2160',
  UHD_8K = '7680x4320',
}
export interface ProcessingChunk {
  segmentId: string;
  startTime: number;
  endTime: number;
  status: ProjectStatus;
  progress: number;
  error?: string;
}
export declare enum VideoStyle {
  PERFORMANCE = 'performance',
  CONCERT = 'concert',
  DANCE = 'dance',
  NARRATIVE = 'narrative',
  ABSTRACT = 'abstract',
  TEXT_TO_VIDEO = 'text_to_video',
  AI_DANCE = 'ai_dance',
  VIDEO_RECAST = 'video_recast',
}
export declare enum ProjectStatus {
  CREATING = 'creating',
  PROCESSING = 'processing',
  READY = 'ready',
  FAILED = 'failed',
}
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
export interface UploadResponse {
  fileId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadUrl?: string;
}
export interface ProcessingStatus {
  projectId: string;
  status: ProjectStatus;
  progress: number;
  currentStep: string;
  estimatedTimeRemaining?: number;
  totalSegments: number;
  completedSegments: number;
  currentSegment?: number;
  segmentProgress?: number;
  processingSpeed?: number;
  memoryUsage?: number;
  gpuUtilization?: number;
}
export interface WebSocketEvent {
  type: string;
  data: any;
  timestamp: Date;
}
export interface ProcessingUpdateEvent extends WebSocketEvent {
  type: 'processing_update';
  data: ProcessingStatus;
}
export interface AvatarTrainingUpdateEvent extends WebSocketEvent {
  type: 'avatar_training_update';
  data: {
    avatarId: string;
    status: AvatarStatus;
    progress: number;
    currentStep: string;
  };
}
export interface AppConfig {
  maxFileSize: number;
  allowedAudioFormats: string[];
  allowedImageFormats: string[];
  maxTrainingImages: number;
  minTrainingImages: number;
  processingTimeout: number;
}
export interface AIConfig {
  openaiApiKey?: string;
  stableDiffusionApiKey?: string;
  avatarTrainingService?: string;
  awsRegion?: string;
  s3Bucket?: string;
}
export interface TextToVideoRequest {
  prompt: string;
  duration: number;
  style?: string;
  quality: VideoQuality;
  resolution: VideoResolution;
  negativePrompt?: string;
  seed?: number;
}
export interface TextToVideoResponse {
  videoUrl: string;
  thumbnailUrl: string;
  duration: number;
  fileSize: number;
  processingTime: number;
  seed: number;
}
export interface DanceGenerationRequest {
  musicTrack: MusicTrack;
  danceStyle: DanceStyleEnum;
  intensity: DanceIntensity;
  avatar?: PersonalAvatar;
  customMoves?: string[];
  duration: number;
  quality: VideoQuality;
  resolution: VideoResolution;
}
export declare enum DanceStyleEnum {
  HIP_HOP = 'hip_hop',
  POP = 'pop',
  ELECTRONIC = 'electronic',
  LATIN = 'latin',
  CONTEMPORARY = 'contemporary',
  BREAKDANCE = 'breakdance',
  JAZZ = 'jazz',
  FREESTYLE = 'freestyle',
}
export declare enum DanceIntensity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  EXTREME = 'extreme',
}
export interface VideoRecastRequest {
  originalVideo: string;
  newStyle: VideoStyle;
  newMusic?: MusicTrack;
  avatar?: PersonalAvatar;
  intensity: number;
  preserveOriginal: boolean;
  quality: VideoQuality;
  resolution: VideoResolution;
}
export interface VideoRecastResponse {
  recastVideoUrl: string;
  originalVideoUrl: string;
  styleChanges: string[];
  processingTime: number;
  fileSize: number;
}
export interface MusicVideoAgent {
  id: string;
  name: string;
  userId: string;
  personality: AgentPersonality;
  musicStyle: MusicStylePreference;
  danceStyle: DanceStyle;
  visualStyle: VisualStyle;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  description?: string;
}
export interface AgentPersonality {
  energy: 'low' | 'medium' | 'high' | 'extreme';
  mood: 'happy' | 'melancholic' | 'energetic' | 'calm' | 'dramatic';
  charisma: number;
  expressiveness: number;
  creativity: number;
}
export interface MusicStylePreference {
  genre: string;
  tempo: 'slow' | 'medium' | 'fast' | 'variable';
  intensity: 'low' | 'moderate' | 'high' | 'extreme';
  instruments: string[];
  mood: string[];
}
export interface DanceStyle {
  type: 'freestyle' | 'choreographed' | 'expressive' | 'minimal';
  complexity: 'simple' | 'moderate' | 'complex' | 'expert';
  energy: 'low' | 'medium' | 'high' | 'extreme';
  movements: string[];
}
export interface VisualStyle {
  lighting: 'natural' | 'dramatic' | 'neon' | 'vintage' | 'futuristic';
  colorPalette: string[];
  effects: string[];
  cameraWork: 'static' | 'dynamic' | 'cinematic' | 'documentary';
  atmosphere: string;
}
//# sourceMappingURL=types.d.ts.map
