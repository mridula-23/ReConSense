export type AppScreen = 'home' | 'new_scan' | 'workspace';

export type ViewportMode = 'point_cloud' | 'dense_mesh' | 'coverage_heatmap' | 'dynamic_filter' | 'ai_completed';

export type PhoneConnectionStatus = 'disconnected' | 'pairing' | 'connected';

export interface PhoneConnection {
  status: PhoneConnectionStatus;
  deviceName?: string;
  ipAddress?: string;
  videoQuality?: string;
  fps?: number;
  batteryLevel?: number;
}

export interface ScanSession {
  id: string;
  name: string;
  roomType: string;
  createdAt: string;
  status: 'draft' | 'capturing' | 'processing' | 'ready' | 'error';
  frameCount: number;
  keyframeCount: number;
  pointCount?: number;
  meshFacetCount?: number;
}

export interface ProcessingStep {
  id: string;
  name: string;
  simpleDescription: string;
  technicalName?: string;
  status: 'waiting' | 'processing' | 'completed' | 'failed';
  progressPercent?: number;
}

export interface MovingObject {
  id: string;
  label: string;
  confidence?: number;
  status: 'detected' | 'filtered_out';
  frameRange?: string;
  filteredPointCount?: number;
  boundingCoords?: { x: number; y: number; z: number; w: number; h: number; d: number };
}

export interface RoomSectorCoverage {
  name: string;
  status: 'sufficient' | 'partial' | 'unseen';
  coveragePercent?: number;
}

export interface RoomCoverage {
  isCalculated: boolean;
  overallCoveragePercent?: number;
  seenPercent?: number;
  partiallySeenPercent?: number;
  unseenPercent?: number;
  sectors: RoomSectorCoverage[];
  unseenAreaAlerts: string[];
}

export interface GuidanceTip {
  id: string;
  type: 'direction' | 'speed' | 'lighting' | 'success';
  title: string;
  message: string;
}

export interface HardwareInfo {
  gpuName?: string;
  gpuUsagePercent?: number;
  isAvailable: boolean;
}

// Backward compatibility types if needed
export type MobileDeviceConnection = PhoneConnection;
export type SessionInfo = ScanSession;
export type ReconstructionStage = ProcessingStep;
export type DynamicObject = MovingObject;
export type ObservationCoverage = RoomCoverage;
export type GuidanceCue = GuidanceTip;
export type SystemHardwareMetrics = HardwareInfo;
