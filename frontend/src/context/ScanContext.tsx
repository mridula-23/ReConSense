import React, { createContext, useContext, useState } from 'react';
import type {
  VideoProcessingResult,
  ReconstructionResultResponse,
  ReconstructedPoint,
  ReconstructionStatusResponse,
} from '../services/api';

export type ViewportMode = 'shaded' | 'wireframe' | 'pointcloud' | 'coverage';
export type ReconstructionMode = 'reconsense' | 'baseline';

export interface CoverageSection {
  id: string;
  name: string;
  category: 'seen' | 'low_views' | 'unseen';
  status: string;
}

export interface GuidanceTip {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
}

export interface DynamicObject {
  id: string;
  name: string;
  confidence: number;
}

export interface ProcessingStep {
  id: string;
  label: string;
  status: 'done' | 'active' | 'pending';
}

export interface ScanSession {
  id: string;
  name: string;
  roomType: string;
  status: 'idle' | 'connected' | 'capturing' | 'processing' | 'ready' | 'error';
  createdAt: string;
}

export interface ScanState {
  scanName: string;
  roomType: string;
  reconstructionMode: ReconstructionMode;
  inputSource: 'phone' | 'upload';
  uploadedVideoName: string | null;
  uploadedVideoSize: number | null;
  sessionId: string | null;
  phoneConnected: boolean;
  captureStatus: 'idle' | 'ready' | 'scanning' | 'finished';
  isCapturing: boolean;
  captureFinished: boolean;
  isProcessing: boolean;
  processingStatus: 'idle' | 'preparing' | 'reconstructing' | 'checking_coverage' | 'completed' | 'disconnected';
  sceneReady: boolean;
  reconstructionStatus: 'not_started' | 'in_progress' | 'waiting' | 'ready' | 'error';
  coverageReady: boolean;
  coverageStatus: 'not_calculated' | 'ready';
}

export interface PhoneConnectionState {
  connected: boolean;
  deviceId?: string;
  deviceType?: string;
}

interface ScanContextType {
  scanState: ScanState;
  setScanState: React.Dispatch<React.SetStateAction<ScanState>>;
  reconstructionMode: ReconstructionMode;
  setReconstructionMode: (mode: ReconstructionMode) => void;
  activeSession: ScanSession | null;
  setActiveSession: React.Dispatch<React.SetStateAction<ScanSession | null>>;
  previousScans: { id: string; name: string; date: string; roomType?: string; createdAt?: string }[];
  viewportMode: ViewportMode;
  setViewportMode: (mode: ViewportMode) => void;
  phoneConnection: PhoneConnectionState;
  setPhoneConnection: React.Dispatch<React.SetStateAction<PhoneConnectionState>>;
  processingSteps: ProcessingStep[];
  roomCoverage: CoverageSection[] | null;
  movingObjects: DynamicObject[];
  guidanceTips: GuidanceTip[];
  isDemoSampleLoaded: boolean;
  currentScreen?: string;
  setCurrentScreen?: (screen: string) => void;
  uploadedVideoFile: File | null;
  uploadedVideoUrl: string | null;
  setUploadedVideo: (file: File | null) => void;
  processingResult: VideoProcessingResult | null;
  setProcessingResult: React.Dispatch<React.SetStateAction<VideoProcessingResult | null>>;
  processingStage: 'idle' | 'uploading' | 'processing' | 'extracting' | 'completed' | 'failed';
  setProcessingStage: React.Dispatch<React.SetStateAction<'idle' | 'uploading' | 'processing' | 'extracting' | 'completed' | 'failed'>>;
  processingError: string | null;
  setProcessingError: React.Dispatch<React.SetStateAction<string | null>>;
  reconstructionResult: ReconstructionResultResponse | null;
  setReconstructionResult: React.Dispatch<React.SetStateAction<ReconstructionResultResponse | null>>;
  reconstructionPoints: ReconstructedPoint[] | null;
  setReconstructionPoints: React.Dispatch<React.SetStateAction<ReconstructedPoint[] | null>>;
  reconstructionStage: ReconstructionStatusResponse['status'];
  setReconstructionStage: React.Dispatch<React.SetStateAction<ReconstructionStatusResponse['status']>>;
  reconstructionMessage: string;
  setReconstructionMessage: React.Dispatch<React.SetStateAction<string>>;
  reconstructionError: string | null;
  setReconstructionError: React.Dispatch<React.SetStateAction<string | null>>;
  startNewScan: (name?: string, roomType?: string, mode?: ReconstructionMode) => void;
  startUploadScan: (file: File, name?: string, mode?: ReconstructionMode) => void;
  connectPhone: () => void;
  startCapture: () => void;
  finishCapture: () => void;
  startProcessing: () => void;
  loadDemoSample: () => void;
  runReconstruction?: () => void;
  resetToHome: () => void;
  resetAll: () => void;
}

const defaultScanState: ScanState = {
  scanName: 'Room Scan 01',
  roomType: 'Living Room',
  reconstructionMode: 'reconsense',
  inputSource: 'phone',
  uploadedVideoName: null,
  uploadedVideoSize: null,
  sessionId: null,
  phoneConnected: false,
  captureStatus: 'ready',
  isCapturing: false,
  captureFinished: false,
  isProcessing: false,
  processingStatus: 'disconnected',
  sceneReady: false,
  reconstructionStatus: 'waiting',
  coverageReady: false,
  coverageStatus: 'not_calculated',
};

const defaultProcessingSteps: ProcessingStep[] = [
  { id: '1', label: 'Preparing video', status: 'done' },
  { id: '2', label: 'Building the scene', status: 'active' },
  { id: '3', label: 'Checking room coverage', status: 'pending' },
  { id: '4', label: 'Detecting moving objects', status: 'pending' },
];

const ScanContext = createContext<ScanContextType | undefined>(undefined);

export const ScanProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [scanState, setScanState] = useState<ScanState>(defaultScanState);
  const [activeSession, setActiveSession] = useState<ScanSession | null>({
    id: 'SCAN-2026-INIT',
    name: 'Room Scan 01',
    roomType: 'Living Room',
    status: 'idle',
    createdAt: new Date().toLocaleDateString(),
  });
  const [previousScans, setPreviousScans] = useState<{ id: string; name: string; date: string; roomType?: string; createdAt?: string }[]>([]);
  const [viewportMode, setViewportMode] = useState<ViewportMode>('shaded');
  const [phoneConnection, setPhoneConnection] = useState<PhoneConnectionState>({
    connected: false,
  });
  const [processingSteps] = useState<ProcessingStep[]>(defaultProcessingSteps);
  const [roomCoverage, setRoomCoverage] = useState<CoverageSection[] | null>(null);
  const [movingObjects, setMovingObjects] = useState<DynamicObject[]>([]);
  const [guidanceTips, setGuidanceTips] = useState<GuidanceTip[]>([]);
  const [isDemoSampleLoaded, setIsDemoSampleLoaded] = useState<boolean>(false);
  const [currentScreen, setCurrentScreen] = useState<string>('home');

  const [uploadedVideoFile, setUploadedVideoFile] = useState<File | null>(null);
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string | null>(null);
  const [processingResult, setProcessingResult] = useState<VideoProcessingResult | null>(null);
  const [processingStage, setProcessingStage] = useState<'idle' | 'uploading' | 'processing' | 'extracting' | 'completed' | 'failed'>('idle');
  const [processingError, setProcessingError] = useState<string | null>(null);

  const setUploadedVideo = (file: File | null) => {
    if (uploadedVideoUrl) {
      URL.revokeObjectURL(uploadedVideoUrl);
    }
    setUploadedVideoFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setUploadedVideoUrl(url);
      setScanState((prev) => ({
        ...prev,
        inputSource: 'upload',
        uploadedVideoName: file.name,
        uploadedVideoSize: file.size,
      }));
    } else {
      setUploadedVideoUrl(null);
      setScanState((prev) => ({
        ...prev,
        uploadedVideoName: null,
        uploadedVideoSize: null,
      }));
    }
  };

  const setReconstructionMode = (mode: ReconstructionMode) => {
    setScanState((prev) => ({
      ...prev,
      reconstructionMode: mode,
    }));
  };

  const startUploadScan = (file: File, name?: string, mode?: ReconstructionMode) => {
    if (uploadedVideoUrl) {
      URL.revokeObjectURL(uploadedVideoUrl);
    }
    const url = URL.createObjectURL(file);
    setUploadedVideoFile(file);
    setUploadedVideoUrl(url);
    setProcessingResult(null);
    setProcessingStage('idle');
    setProcessingError(null);
    const scanName = name || file.name.replace(/\.[^/.]+$/, '') || 'Uploaded Video Scan';
    setScanState((prev) => ({
      ...defaultScanState,
      reconstructionMode: mode || prev.reconstructionMode || 'reconsense',
      scanName,
      inputSource: 'upload',
      uploadedVideoName: file.name,
      uploadedVideoSize: file.size,
      captureFinished: true,
      captureStatus: 'finished',
    }));
    setActiveSession({
      id: `SCAN-${Date.now().toString().slice(-4)}`,
      name: scanName,
      roomType: 'Indoor Room',
      status: 'idle',
      createdAt: new Date().toLocaleDateString(),
    });
    setIsDemoSampleLoaded(false);
    setRoomCoverage(null);
    setMovingObjects([]);
    setGuidanceTips([]);
  };

  const startNewScan = (name?: string, roomType?: string, mode?: ReconstructionMode) => {
    if (uploadedVideoUrl) {
      URL.revokeObjectURL(uploadedVideoUrl);
      setUploadedVideoUrl(null);
      setUploadedVideoFile(null);
    }
    setProcessingResult(null);
    setProcessingStage('idle');
    setProcessingError(null);
    const scanName = name || 'Room Scan';
    const room = roomType || 'Indoor Room';
    setScanState((prev) => ({
      ...defaultScanState,
      reconstructionMode: mode || prev.reconstructionMode || 'reconsense',
      inputSource: 'phone',
      scanName,
      roomType: room,
    }));
    setActiveSession({
      id: `SCAN-${Date.now().toString().slice(-4)}`,
      name: scanName,
      roomType: room,
      status: 'idle',
      createdAt: new Date().toLocaleDateString(),
    });
    setIsDemoSampleLoaded(false);
    setRoomCoverage(null);
    setMovingObjects([]);
    setGuidanceTips([]);
  };

  const connectPhone = () => {
    setScanState((prev) => ({
      ...prev,
      phoneConnected: true,
      captureStatus: 'ready',
    }));
    setPhoneConnection({
      connected: true,
      deviceId: 'PHONE-CAM-01',
      deviceType: 'Smartphone',
    });
  };

  const startCapture = () => {
    setScanState((prev) => ({
      ...prev,
      isCapturing: true,
      captureStatus: 'scanning',
    }));
  };

  const finishCapture = () => {
    setScanState((prev) => ({
      ...prev,
      isCapturing: false,
      captureFinished: true,
      captureStatus: 'finished',
    }));
  };

  const startProcessing = () => {
    setScanState((prev) => ({
      ...prev,
      isProcessing: true,
      processingStatus: 'disconnected',
      sceneReady: false,
      reconstructionStatus: 'waiting',
    }));
  };

  const loadDemoSample = () => {
    setIsDemoSampleLoaded(true);
    setScanState((prev) => ({
      ...prev,
      sceneReady: true,
      coverageReady: true,
      reconstructionStatus: 'ready',
      coverageStatus: 'ready',
    }));
    setRoomCoverage([
      { id: '1', name: 'Main North Wall', category: 'seen', status: 'Captured' },
      { id: '2', name: 'Center Living Area Floor', category: 'seen', status: 'Captured' },
      { id: '3', name: 'South Dining Corner', category: 'low_views', status: 'Limited angles' },
      { id: '4', name: 'Behind Bookshelf Nook', category: 'unseen', status: 'Occluded / Missing' },
    ]);
    setGuidanceTips([
      {
        id: '1',
        title: 'South Dining Corner',
        description: 'Sweep camera 30 degrees right to resolve occlusion.',
        severity: 'medium',
      },
    ]);
  };

  const [reconstructionResult, setReconstructionResult] = useState<ReconstructionResultResponse | null>(null);
  const [reconstructionPoints, setReconstructionPoints] = useState<ReconstructedPoint[] | null>(null);
  const [reconstructionStage, setReconstructionStage] = useState<ReconstructionStatusResponse['status']>('not_started');
  const [reconstructionMessage, setReconstructionMessage] = useState<string>('Ready for reconstruction');
  const [reconstructionError, setReconstructionError] = useState<string | null>(null);

  const resetAll = () => {
    if (uploadedVideoUrl) {
      URL.revokeObjectURL(uploadedVideoUrl);
      setUploadedVideoUrl(null);
      setUploadedVideoFile(null);
    }
    setProcessingResult(null);
    setProcessingStage('idle');
    setProcessingError(null);
    setReconstructionResult(null);
    setReconstructionPoints(null);
    setReconstructionStage('not_started');
    setReconstructionMessage('Ready for reconstruction');
    setReconstructionError(null);
    if (scanState.sceneReady && activeSession) {
      setPreviousScans((prev) => [
        {
          id: activeSession.id,
          name: activeSession.name,
          date: new Date().toLocaleDateString(),
          roomType: activeSession.roomType,
          createdAt: activeSession.createdAt,
        },
        ...prev,
      ]);
    }
    setScanState(defaultScanState);
    setIsDemoSampleLoaded(false);
    setRoomCoverage(null);
    setMovingObjects([]);
    setGuidanceTips([]);
  };

  const resetToHome = () => {
    resetAll();
  };

  return (
    <ScanContext.Provider
      value={{
        scanState,
        setScanState,
        reconstructionMode: scanState.reconstructionMode,
        setReconstructionMode,
        activeSession,
        setActiveSession,
        previousScans,
        viewportMode,
        setViewportMode,
        phoneConnection,
        setPhoneConnection,
        processingSteps,
        roomCoverage,
        movingObjects,
        guidanceTips,
        isDemoSampleLoaded,
        currentScreen,
        setCurrentScreen,
        uploadedVideoFile,
        uploadedVideoUrl,
        setUploadedVideo,
        processingResult,
        setProcessingResult,
        processingStage,
        setProcessingStage,
        processingError,
        setProcessingError,
        reconstructionResult,
        setReconstructionResult,
        reconstructionPoints,
        setReconstructionPoints,
        reconstructionStage,
        setReconstructionStage,
        reconstructionMessage,
        setReconstructionMessage,
        reconstructionError,
        setReconstructionError,
        startNewScan,
        startUploadScan,
        connectPhone,
        startCapture,
        finishCapture,
        startProcessing,
        loadDemoSample,
        runReconstruction: loadDemoSample,
        resetToHome,
        resetAll,
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

