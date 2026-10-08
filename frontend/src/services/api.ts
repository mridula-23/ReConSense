export const getApiBaseUrl = (): string => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (
    typeof window !== 'undefined' &&
    window.location.hostname &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1'
  ) {
    return `${window.location.protocol}//${window.location.hostname}:8000`;
  }
  return 'http://localhost:8000';
};

export interface VideoProcessingResult {
  session_id: string;
  filename: string;
  status: string;
  video: {
    width: number;
    height: number;
    fps: number;
    frame_count: number;
    duration_seconds: number;
  };
  frames: {
    extracted: number;
    usable: number;
    sample_interval: number;
    frames_directory: string;
  };
}

export interface ReconstructionStatusResponse {
  session_id: string;
  status: 'not_started' | 'preparing' | 'extracting_features' | 'matching_features' | 'reconstructing' | 'completed' | 'failed';
  current_message: string;
  message?: string;
  registered_images?: number | null;
  total_input_images?: number | null;
  points_3d?: number | null;
  error?: string | null;
}

export interface ReconstructionResultResponse {
  session_id: string;
  status: string;
  registered_images: number;
  total_input_images: number;
  points_3d: number;
  camera_count: number;
  model_path: string;
  sparse_models_count: number;
}

export interface ReconstructedPoint {
  id: string;
  x: number;
  y: number;
  z: number;
  r: number;
  g: number;
  b: number;
  error?: number;
}

export interface ReconstructionPointsResponse {
  session_id: string;
  count: number;
  points: ReconstructedPoint[];
}

export interface PairingInfoResponse {
  lan_ip: string | null;
  available: boolean;
  backend_port: number;
  frontend_port: number;
  frontend_url?: string | null;
  backend_url?: string | null;
}

export interface PairingSessionResponse {
  session_id: string;
  token: string;
  status: 'waiting' | 'connecting' | 'connected' | 'expired' | 'failed' | 'network_unreachable';
  lan_ip: string | null;
  qr_url: string | null;
  created_at: number;
  expires_at: number;
  expires_in: number;
  device_info: string | null;
  connected_at: number | null;
  error?: string | null;
}

export const fetchPairingInfo = async (): Promise<PairingInfoResponse> => {
  const response = await fetch(`${getApiBaseUrl()}/api/pairing/info`);
  if (!response.ok) {
    throw new Error('Failed to fetch local network pairing info');
  }
  return response.json();
};

export const createPairingSession = async (
  sessionId?: string,
  clientPort: number = window.location.port ? parseInt(window.location.port, 10) : 5173
): Promise<PairingSessionResponse> => {
  const query = new URLSearchParams();
  if (sessionId) query.append('session_id', sessionId);
  query.append('client_port', clientPort.toString());

  const response = await fetch(`${getApiBaseUrl()}/api/pairing/create?${query.toString()}`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error('Failed to create pairing session');
  }
  return response.json();
};

export const fetchPairingStatus = async (sessionId: string): Promise<PairingSessionResponse> => {
  const response = await fetch(`${getApiBaseUrl()}/api/pairing/status/${sessionId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch pairing status');
  }
  return response.json();
};

export const connectPhoneDevice = async (
  sessionId: string,
  token: string,
  deviceInfo: string = 'Smartphone Camera'
): Promise<{ status: string; session_id: string; message: string; device_info: string }> => {
  const response = await fetch(`${getApiBaseUrl()}/api/pairing/connect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      session_id: sessionId,
      token,
      device_info: deviceInfo,
    }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: 'Connection failed' }));
    throw new Error(err.detail || 'Connection failed');
  }
  return response.json();
};

export const getPairingWebSocketUrl = (sessionId: string): string => {
  const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = window.location.hostname || 'localhost';
  return `${wsProtocol}//${host}:8000/ws/pairing/${sessionId}`;
};

export const checkBackendHealth = async () => {
  try {
    const response = await fetch(`${getApiBaseUrl()}/api/health`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch backend health:', error);
    return null;
  }
};

export const processVideo = async (
  file: File,
  sampleInterval = 10
): Promise<VideoProcessingResult> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(
    `${getApiBaseUrl()}/api/videos/process?sample_interval=${sampleInterval}`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: 'Failed to process video' }));
    throw new Error(err.detail || `Server returned ${response.status}`);
  }

  return response.json();
};

export const fetchSessionStatus = async (sessionId: string): Promise<VideoProcessingResult> => {
  const response = await fetch(`${getApiBaseUrl()}/api/videos/${sessionId}/status`);
  if (!response.ok) {
    throw new Error(`Failed to fetch status: ${response.status}`);
  }
  return response.json();
};

export const startReconstruction = async (
  sessionId: string,
  overlap = 10,
  useGpu = true,
  mode: 'reconsense' | 'baseline' = 'reconsense'
): Promise<{ session_id: string; status: string; mode?: string }> => {
  try {
    const response = await fetch(
      `${getApiBaseUrl()}/api/reconstruction/${sessionId}/start?overlap=${overlap}&use_gpu=${useGpu}&mode=${mode}`,
      { method: 'POST' }
    );
    if (!response.ok) {
      const err = await response.json().catch(() => ({ detail: 'Failed to start reconstruction' }));
      throw new Error(err.detail || `Server returned ${response.status}`);
    }
    return response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Backend connection lost. Please ensure the backend server is running.');
    }
    throw error;
  }
};

export const fetchReconstructionStatus = async (
  sessionId: string
): Promise<ReconstructionStatusResponse> => {
  try {
    const response = await fetch(`${getApiBaseUrl()}/api/reconstruction/${sessionId}/status`);
    if (!response.ok) {
      throw new Error(`Failed to fetch reconstruction status: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Backend connection lost while checking reconstruction status.');
    }
    throw error;
  }
};

export const fetchReconstructionResult = async (
  sessionId: string
): Promise<ReconstructionResultResponse> => {
  const response = await fetch(`${getApiBaseUrl()}/api/reconstruction/${sessionId}/result`);
  if (!response.ok) {
    throw new Error(`Failed to fetch reconstruction result: ${response.status}`);
  }
  return response.json();
};

export const fetchReconstructionPoints = async (
  sessionId: string,
  maxPoints = 15000
): Promise<ReconstructionPointsResponse> => {
  const response = await fetch(
    `${getApiBaseUrl()}/api/reconstruction/${sessionId}/points?max_points=${maxPoints}`
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch 3D points: ${response.status}`);
  }
  return response.json();
};
