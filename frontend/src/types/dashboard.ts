export type SystemStatus = 'ready' | 'streaming' | 'reconstructing' | 'optimizing' | 'completed' | 'error';

export type ViewportMode = 'point_cloud' | 'dense_mesh' | 'coverage_heatmap' | 'dynamic_filter' | 'ai_completed';

export interface MobileDeviceConnection {
  deviceId: string;
  deviceName: string;
  ipAddress: string;
  status: 'connected' | 'reconnecting' | 'disconnected';
  streamQuality: '1080p60' | '720p60' | '4k30';
  bitrateMbps: number;
  fps: number;
  latencyMs: number;
  packetLossPercent: number;
  signalStrength: 'excellent' | 'good' | 'fair' | 'poor';
  batteryLevel: number;
  temperatureCelsius: number;
}

export interface SessionInfo {
  sessionId: string;
  sessionName: string;
  environmentType: 'Indoor Lab' | 'Office Suite' | 'Residential Room' | 'Corridor';
  operator: string;
  startTime: string;
  durationSeconds: number;
  totalFramesReceived: number;
  keyframesSelected: number;
  totalKeypoints: number;
  sparsePointsCount: number;
  densePointsCount: number;
  storageUsageMb: number;
}

export interface ReconstructionStage {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  progressPercent: number;
  timeElapsed: string;
  estimatedRemaining?: string;
  metrics?: { label: string; value: string }[];
}

export interface DynamicObject {
  id: string;
  label: string;
  category: 'person' | 'chair' | 'pet' | 'bag' | 'moving_object';
  confidence: number;
  status: 'active_tracking' | 'masked_and_excluded' | 'occlusion_tagged';
  firstSeenFrame: number;
  lastSeenFrame: number;
  trackDurationSec: number;
  boundingCoords: { x: number; y: number; z: number; w: number; h: number; d: number };
  maskedPointsCount: number;
}

export interface CoverageSector {
  name: string;
  type: 'floor' | 'ceiling' | 'north_wall' | 'south_wall' | 'east_wall' | 'west_wall' | 'corners' | 'furniture_rears';
  observedPercent: number;
  occludedPercent: number;
  unobservedPercent: number;
  confidenceScore: number;
  status: 'sufficient' | 'partial' | 'critical_blindspot';
}

export interface ObservationCoverage {
  totalCoveragePercent: number;
  observedPercent: number;
  occludedPercent: number;
  unobservedPercent: number;
  confidenceScore: number;
  sectors: CoverageSector[];
  identifiedBlindspots: number;
  inpaintingPriorityZones: number;
}

export interface GuidanceCue {
  id: string;
  type: 'motion_speed' | 'camera_tilt' | 'turn_angle' | 'coverage_warning' | 'lighting';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  actionText: string;
  timestamp: string;
  vectorHint?: { axis: 'pitch' | 'yaw' | 'roll' | 'distance'; degrees: number };
}

export interface SystemHardwareMetrics {
  gpuName: string;
  gpuUsagePercent: number;
  vramUsedGb: number;
  vramTotalGb: number;
  cpuUsagePercent: number;
  ramUsedGb: number;
  ramTotalGb: number;
  cudaVersion: string;
  engineFps: number;
}
