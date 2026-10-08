import type {
  PhoneConnection,
  ScanSession,
  ProcessingStep,
  MovingObject,
  RoomCoverage,
  GuidanceTip,
  HardwareInfo,
} from '../types/dashboard';

export const mockDeviceConnection: PhoneConnection = {
  status: 'connected',
  deviceName: 'Pixel 8 Pro (Frontline Cam)',
  ipAddress: '192.168.1.144:8554',
  videoQuality: '1080p60',
  fps: 60,
  batteryLevel: 88,
};

export const mockSessionInfo: ScanSession = {
  id: 'DEMO-ROOM-01',
  name: 'Sample Living Room & Workspace',
  roomType: 'Workspace / Lab',
  createdAt: '2026-10-08',
  status: 'ready',
  frameCount: 480,
  keyframeCount: 120,
  pointCount: 164280,
  meshFacetCount: 1482000,
};

export const mockHardwareMetrics: HardwareInfo = {
  gpuName: 'NVIDIA GeForce RTX 4090 Mobile',
  gpuUsagePercent: 64,
  isAvailable: true,
};

export const mockReconstructionStages: ProcessingStep[] = [
  {
    id: 'step-1',
    name: '1. Camera & Scene Setup',
    simpleDescription: 'Tracking camera movement and finding matching points',
    technicalName: 'Feature Tracking & Sparse SfM',
    status: 'completed',
    progressPercent: 100,
  },
  {
    id: 'step-2',
    name: '2. 3D Room Reconstruction',
    simpleDescription: 'Building room walls, floor, and furniture shapes',
    technicalName: 'TSDF Volumetric Fusion',
    status: 'completed',
    progressPercent: 100,
  },
  {
    id: 'step-3',
    name: '3. Clean Moving Objects',
    simpleDescription: 'Detecting and removing people or moving items from static room',
    technicalName: 'Dynamic Entity Segmentation',
    status: 'completed',
    progressPercent: 100,
  },
  {
    id: 'step-4',
    name: '4. Fill Missing Areas',
    simpleDescription: 'Intelligently completing areas behind furniture or unreached spots',
    technicalName: 'Observation-Aware Diffusion Prior',
    status: 'waiting',
    progressPercent: 0,
  },
];

export const mockDynamicObjects: MovingObject[] = [
  {
    id: 'DYN-OBJ-01',
    label: 'Walking Person',
    confidence: 0.984,
    status: 'filtered_out',
    frameRange: 'Frames #140–#1820',
    filteredPointCount: 26400,
    boundingCoords: { x: 1.2, y: 0.0, z: -2.4, w: 0.6, h: 1.8, d: 0.5 },
  },
  {
    id: 'DYN-OBJ-02',
    label: 'Moved Chair',
    confidence: 0.942,
    status: 'filtered_out',
    frameRange: 'Frames #320–#2800',
    filteredPointCount: 11200,
    boundingCoords: { x: -0.8, y: 0.0, z: -1.6, w: 0.7, h: 0.9, d: 0.7 },
  },
];

export const mockObservationCoverage: RoomCoverage = {
  isCalculated: true,
  overallCoveragePercent: 84.6,
  seenPercent: 78.2,
  partiallySeenPercent: 12.8,
  unseenPercent: 9.0,
  sectors: [
    { name: 'Floor Plane', status: 'sufficient', coveragePercent: 96.4 },
    { name: 'Main Wall & Desk', status: 'sufficient', coveragePercent: 91.8 },
    { name: 'Side Shelving', status: 'partial', coveragePercent: 76.5 },
    { name: 'Ceiling', status: 'sufficient', coveragePercent: 88.0 },
    { name: 'North-West Corner', status: 'unseen', coveragePercent: 38.4 },
  ],
  unseenAreaAlerts: ['North-West corner behind desk has unseen areas.'],
};

export const mockGuidanceCues: GuidanceTip[] = [
  {
    id: 'CUE-01',
    type: 'direction',
    title: 'Unseen Corner Detected',
    message: 'Tilt camera downwards towards the North-West corner behind the table to complete the scan.',
  },
];
