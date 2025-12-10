// Avatar and Personal Model Types
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

export enum AvatarStatus {
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

export enum AvatarStyle {
  REALISTIC = 'realistic',
  ANIMATED = 'animated',
  ARTISTIC = 'artistic',
}

// Music and Video Types
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
  // Extended video support
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

export enum VideoQuality {
  STANDARD = 'standard', // 720p, faster processing
  HIGH = 'high', // 1080p, balanced
  ULTRA = 'ultra', // 4K, premium quality
  CINEMATIC = 'cinematic', // 8K, highest quality
}

export enum VideoResolution {
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

export enum VideoStyle {
  PERFORMANCE = 'performance',
  CONCERT = 'concert',
  DANCE = 'dance',
  NARRATIVE = 'narrative',
  ABSTRACT = 'abstract',
  TEXT_TO_VIDEO = 'text_to_video',
  AI_DANCE = 'ai_dance',
  VIDEO_RECAST = 'video_recast',
}

export enum ProjectStatus {
  CREATING = 'creating',
  PROCESSING = 'processing',
  READY = 'ready',
  FAILED = 'failed',
}

// API Response Types
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
  // Extended processing info
  totalSegments: number;
  completedSegments: number;
  currentSegment?: number;
  segmentProgress?: number;
  processingSpeed?: number; // segments per minute
  memoryUsage?: number;
  gpuUtilization?: number;
}

// WebSocket Events
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

// Configuration Types
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

// Text-to-Video Types
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

// AI Dance Types
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

export enum DanceStyleEnum {
  HIP_HOP = 'hip_hop',
  POP = 'pop',
  ELECTRONIC = 'electronic',
  LATIN = 'latin',
  CONTEMPORARY = 'contemporary',
  BREAKDANCE = 'breakdance',
  JAZZ = 'jazz',
  FREESTYLE = 'freestyle',
}

export enum DanceIntensity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  EXTREME = 'extreme',
}

// Video Recast Types
export interface VideoRecastRequest {
  originalVideo: string; // URL or file path
  newStyle: VideoStyle;
  newMusic?: MusicTrack;
  avatar?: PersonalAvatar;
  intensity: number; // 0-100
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

// Custom AI Agent Types
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
  charisma: number; // 1-10
  expressiveness: number; // 1-10
  creativity: number; // 1-10
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
