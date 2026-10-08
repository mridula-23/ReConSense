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
