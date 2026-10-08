import React, { createContext, useContext, useState } from 'react';
import type {
  AppScreen,
  ViewportMode,
  PhoneConnection,
  ScanSession,
  ProcessingStep,
  MovingObject,
  RoomCoverage,
  GuidanceTip,
  HardwareInfo,
} from '../types/dashboard';

interface ScanContextType {
  currentScreen: AppScreen;
  setCurrentScreen: (screen: AppScreen) => void;
  viewportMode: ViewportMode;
  setViewportMode: (mode: ViewportMode) => void;
  
  phoneConnection: PhoneConnection;
  setPhoneConnection: React.Dispatch<React.SetStateAction<PhoneConnection>>;
  
  activeSession: ScanSession | null;
  setActiveSession: (session: ScanSession | null) => void;
  previousScans: ScanSession[];
  
  processingSteps: ProcessingStep[];
  setProcessingSteps: React.Dispatch<React.SetStateAction<ProcessingStep[]>>;
  
  roomCoverage: RoomCoverage;
  setRoomCoverage: React.Dispatch<React.SetStateAction<RoomCoverage>>;
  
  movingObjects: MovingObject[];
  setMovingObjects: React.Dispatch<React.SetStateAction<MovingObject[]>>;
  
  guidanceTips: GuidanceTip[];
  setGuidanceTips: React.Dispatch<React.SetStateAction<GuidanceTip[]>>;
  
  hardwareInfo: HardwareInfo;
  
  isDemoSampleLoaded: boolean;
  loadDemoSample: () => void;
  startNewScan: (scanName: string, roomType: string) => void;
  runReconstruction: () => void;
  resetToHome: () => void;
}

const defaultProcessingSteps: ProcessingStep[] = [
  {
    id: 'step-1',
    name: '1. Camera & Scene Setup',
    simpleDescription: 'Tracking camera movement and finding matching points',
    technicalName: 'Feature Tracking & Sparse SfM',
    status: 'waiting',
  },
  {
    id: 'step-2',
    name: '2. 3D Room Reconstruction',
    simpleDescription: 'Building room walls, floor, and furniture shapes',
    technicalName: 'TSDF Volumetric Fusion',
    status: 'waiting',
  },
  {
    id: 'step-3',
    name: '3. Clean Moving Objects',
    simpleDescription: 'Detecting and removing people or moving items from static room',
    technicalName: 'Dynamic Entity Segmentation',
    status: 'waiting',
  },
  {
    id: 'step-4',
    name: '4. Fill Missing Areas',
    simpleDescription: 'Intelligently completing areas behind furniture or unreached spots',
    technicalName: 'Observation-Aware Diffusion Prior',
    status: 'waiting',
  },
];

const defaultRoomCoverage: RoomCoverage = {
  isCalculated: false,
  sectors: [],
  unseenAreaAlerts: [],
};

const ScanContext = createContext<ScanContextType | undefined>(undefined);

export const ScanProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('home');
  const [viewportMode, setViewportMode] = useState<ViewportMode>('point_cloud');
  
  // Honest Phone Connection state (starts disconnected until real mobile pairs)
  const [phoneConnection, setPhoneConnection] = useState<PhoneConnection>({
    status: 'disconnected',
  });

  const [activeSession, setActiveSession] = useState<ScanSession | null>(null);
  const [previousScans, setPreviousScans] = useState<ScanSession[]>([]);
  
  const [processingSteps, setProcessingSteps] = useState<ProcessingStep[]>(defaultProcessingSteps);
  const [roomCoverage, setRoomCoverage] = useState<RoomCoverage>(defaultRoomCoverage);
  const [movingObjects, setMovingObjects] = useState<MovingObject[]>([]);
  const [guidanceTips, setGuidanceTips] = useState<GuidanceTip[]>([]);
  
  const [hardwareInfo] = useState<HardwareInfo>({
    gpuName: 'Host Processing Node',
    isAvailable: true,
  });

  const [isDemoSampleLoaded, setIsDemoSampleLoaded] = useState<boolean>(false);

  const startNewScan = (scanName: string, roomType: string) => {
    const newSession: ScanSession = {
      id: `SCAN-${Date.now().toString().slice(-4)}`,
      name: scanName.trim() || 'Living Room Scan',
      roomType: roomType || 'Indoor Room',
      createdAt: new Date().toLocaleDateString(),
      status: 'draft',
      frameCount: 0,
      keyframeCount: 0,
    };
    setActiveSession(newSession);
    setIsDemoSampleLoaded(false);
    setProcessingSteps(defaultProcessingSteps);
    setRoomCoverage(defaultRoomCoverage);
    setMovingObjects([]);
    setGuidanceTips([
      {
        id: 'tip-1',
        type: 'direction',
        title: 'Ready for Video',
        message: 'Connect your phone or upload a video clip to begin scanning.',
      },
    ]);
    setCurrentScreen('new_scan');
  };

  const loadDemoSample = () => {
    const sampleSession: ScanSession = {
      id: 'DEMO-ROOM-01',
      name: 'Sample Living Room & Workspace',
      roomType: 'Workspace / Lab',
      createdAt: new Date().toLocaleDateString(),
      status: 'ready',
      frameCount: 480,
      keyframeCount: 120,
      pointCount: 164280,
      meshFacetCount: 1482000,
    };
    setActiveSession(sampleSession);
    setIsDemoSampleLoaded(true);
    setProcessingSteps([
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
    ]);
    setRoomCoverage({
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
        { name: 'North-West Blind Corner', status: 'unseen', coveragePercent: 38.4 },
      ],
      unseenAreaAlerts: ['North-West corner behind desk has unseen areas.'],
    });
    setMovingObjects([
      {
        id: 'DYN-01',
        label: 'Walking Person',
        confidence: 0.98,
        status: 'filtered_out',
        frameRange: 'Frames #140–#1820',
        filteredPointCount: 26400,
        boundingCoords: { x: 1.2, y: 0.0, z: -2.4, w: 0.6, h: 1.8, d: 0.5 },
      },
      {
        id: 'DYN-02',
        label: 'Moved Chair',
        confidence: 0.94,
        status: 'filtered_out',
        frameRange: 'Frames #320–#2800',
        filteredPointCount: 11200,
        boundingCoords: { x: -0.8, y: 0.0, z: -1.6, w: 0.7, h: 0.9, d: 0.7 },
      },
    ]);
    setGuidanceTips([
      {
        id: 'tip-1',
        type: 'direction',
        title: 'Unseen Corner Detected',
        message: 'Tilt camera downwards towards the North-West corner behind the table to complete the scan.',
      },
    ]);
    setCurrentScreen('workspace');
  };

  const runReconstruction = () => {
    if (!activeSession) return;
    setProcessingSteps((prev) =>
      prev.map((step, idx) =>
        idx === 0
          ? { ...step, status: 'completed', progressPercent: 100 }
          : idx === 1
          ? { ...step, status: 'processing', progressPercent: 65 }
          : step
      )
    );
  };

  const resetToHome = () => {
    if (activeSession && activeSession.status === 'ready' && !previousScans.some((s) => s.id === activeSession.id)) {
      setPreviousScans((prev) => [activeSession, ...prev]);
    }
    setCurrentScreen('home');
  };

  return (
    <ScanContext.Provider
      value={{
        currentScreen,
        setCurrentScreen,
        viewportMode,
        setViewportMode,
        phoneConnection,
        setPhoneConnection,
        activeSession,
        setActiveSession,
        previousScans,
        processingSteps,
        setProcessingSteps,
        roomCoverage,
        setRoomCoverage,
        movingObjects,
        setMovingObjects,
        guidanceTips,
        setGuidanceTips,
        hardwareInfo,
        isDemoSampleLoaded,
        loadDemoSample,
        startNewScan,
        runReconstruction,
        resetToHome,
      }}
    >
      {children}
    </ScanContext.Provider>
  );
};

export const useScanContext = () => {
  const context = useContext(ScanContext);
  if (!context) {
    throw new Error('useScanContext must be used within a ScanProvider');
  }
  return context;
};
