const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

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

export const checkBackendHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`);
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
    `${API_BASE_URL}/api/videos/process?sample_interval=${sampleInterval}`,
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
  const response = await fetch(`${API_BASE_URL}/api/videos/${sessionId}/status`);
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
      `${API_BASE_URL}/api/reconstruction/${sessionId}/start?overlap=${overlap}&use_gpu=${useGpu}&mode=${mode}`,
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
    const response = await fetch(`${API_BASE_URL}/api/reconstruction/${sessionId}/status`);
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
  const response = await fetch(`${API_BASE_URL}/api/reconstruction/${sessionId}/result`);
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
    `${API_BASE_URL}/api/reconstruction/${sessionId}/points?max_points=${maxPoints}`
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch 3D points: ${response.status}`);
  }
  return response.json();
};
