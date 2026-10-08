import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Camera,
  CheckCircle2,
  AlertCircle,
  Video,
  Check,
  Loader2,
  Square,
  Play,
  RotateCcw,
  Wifi,
  Sparkles,
} from 'lucide-react';
import { processVideo, getCameraWebSocketUrl } from '../services/api';

export const MobileCapturePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session') || 'active_session';

  // Media Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const frameIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // States
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadPercent, setUploadPercent] = useState<number>(0);
  const [uploadStatusText, setUploadStatusText] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);

  // Check Secure Context / MediaDevices availability
  const isSecure = typeof window !== 'undefined' ? window.isSecureContext : true;
  const hasMediaDevices = typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia;

  // Initialize camera streaming WebSocket connection
  useEffect(() => {
    if (!sessionId) return;

    try {
      const wsUrl = getCameraWebSocketUrl(sessionId);
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setWsConnected(true);
        // Send initial mobile presence
        ws.send(
          JSON.stringify({
            event: 'camera_ready',
            session_id: sessionId,
            device_role: 'mobile',
          })
        );
      };

      ws.onclose = () => {
        setWsConnected(false);
      };

      ws.onerror = () => {
        setWsConnected(false);
      };
    } catch {
      setWsConnected(false);
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [sessionId]);

  // Helper to send WebSocket events
  const sendWsEvent = (eventPayload: Record<string, unknown>) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify(eventPayload));
      } catch {
        // Safe fail
      }
    }
  };

  // Stop camera tracks and frame loop
  const stopCamera = useCallback(() => {
    if (frameIntervalRef.current) {
      clearInterval(frameIntervalRef.current);
      frameIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  }, []);

  // Frame streaming loop: Captures ~10 fps lightweight JPEG frames and sends over WebSocket
  const startFrameStreaming = useCallback(() => {
    if (frameIntervalRef.current) clearInterval(frameIntervalRef.current);

    frameIntervalRef.current = setInterval(() => {
      if (!videoRef.current || !canvasRef.current || !isCameraActive) return;
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (video.readyState < 2) return; // HAVE_CURRENT_DATA

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Downscale to 480x270 for fast low-latency LAN preview
      canvas.width = 480;
      canvas.height = 270;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      try {
        const frameData = canvas.toDataURL('image/jpeg', 0.55);
        sendWsEvent({
          event: 'frame',
          session_id: sessionId,
          data: frameData,
        });
      } catch {
        // Ignore frame serialize errors
      }
    }, 100); // 10 fps
  }, [isCameraActive, sessionId]);

  // Open Real Phone Rear Camera
  const handleStartCamera = async () => {
    setCameraError(null);

    if (!hasMediaDevices) {
      setCameraError(
        !isSecure
          ? 'Mobile browser requires a secure HTTPS context for live streaming over LAN. Please use the native "Record Room Video with Camera" button below.'
          : 'Direct live streaming is unavailable on this browser. Please use the native "Record Room Video with Camera" button below.'
      );
      return;
    }

    try {
      stopCamera();

      // Request rear-facing environment camera
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setIsCameraActive(true);
      sendWsEvent({
        event: 'camera_started',
        session_id: sessionId,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to access rear camera.';
      if (msg.includes('Permission') || msg.includes('NotAllowedError')) {
        setCameraError('Camera permission denied. Please allow camera permissions in browser settings or use the native video recorder.');
      } else {
        setCameraError(`Camera error: ${msg}. You can still use the native video recorder.`);
      }
    }
  };

  // Start live frame stream when camera becomes active
  useEffect(() => {
    if (isCameraActive) {
      startFrameStreaming();
    } else {
      if (frameIntervalRef.current) {
        clearInterval(frameIntervalRef.current);
        frameIntervalRef.current = null;
      }
    }
  }, [isCameraActive, startFrameStreaming]);

  // Start Recording via MediaRecorder
  const handleStartRecording = () => {
    if (!streamRef.current) {
      setCameraError('Camera stream is not active.');
      return;
    }

    try {
      recordedChunksRef.current = [];
      setRecordingSeconds(0);

      // Determine best supported MIME type
      let mimeType = 'video/webm;codecs=vp8';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        if (MediaRecorder.isTypeSupported('video/webm')) {
          mimeType = 'video/webm';
        } else if (MediaRecorder.isTypeSupported('video/mp4')) {
          mimeType = 'video/mp4';
        } else {
          mimeType = '';
        }
      }

      const options = mimeType ? { mimeType } : undefined;
      const mediaRecorder = new MediaRecorder(streamRef.current, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        handleRecordingStopped();
      };

      // Start recording with 1s timeslices
      mediaRecorder.start(1000);
      setIsRecording(true);

      // Start recording timer
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => {
          const next = prev + 1;
          sendWsEvent({
            event: 'recording_progress',
            session_id: sessionId,
            duration: next,
          });
          return next;
        });
      }, 1000);

      sendWsEvent({
        event: 'recording_started',
        session_id: sessionId,
        duration: 0,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'MediaRecorder failed to start.';
      setCameraError(`Recording failed: ${msg}. Try native video record.`);
    }
  };

  // Stop Recording
  const handleStopRecording = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    setIsRecording(false);
    sendWsEvent({
      event: 'recording_stopped',
      session_id: sessionId,
      duration: recordingSeconds,
    });
  };

  // Process and upload recorded video blob
  const handleRecordingStopped = async () => {
    stopCamera();

    const chunks = recordedChunksRef.current;
    if (chunks.length === 0) {
      setCameraError('No video data captured. Please try recording again.');
      return;
    }

    // Determine extension
    const mime = chunks[0].type || 'video/webm';
    const ext = mime.includes('mp4') ? '.mp4' : '.webm';
    const blob = new Blob(chunks, { type: mime });
    const videoFile = new File([blob], `phone_scan_${sessionId}${ext}`, { type: mime });

    await uploadRecordedFile(videoFile);
  };

  // Real Upload Handler with progress tracking
  const uploadRecordedFile = async (file: File) => {
    try {
      setIsUploading(true);
      setUploadPercent(0);
      setUploadStatusText('Uploading video to laptop...');
      setCameraError(null);

      sendWsEvent({
        event: 'upload_started',
        session_id: sessionId,
        filename: file.name,
      });

      const result = await processVideo(file, 10, sessionId, (percent) => {
        setUploadPercent(percent);
        setUploadStatusText(`Uploading video... ${percent}%`);
        sendWsEvent({
          event: 'upload_progress',
          session_id: sessionId,
          percent,
        });
      });

      setIsUploading(false);
      setUploadSuccess(true);
      setUploadPercent(100);
      setUploadStatusText('Video uploaded successfully!');

      sendWsEvent({
        event: 'upload_completed',
        session_id: sessionId,
        result,
      });
    } catch (err: unknown) {
      setIsUploading(false);
      const msg = err instanceof Error ? err.message : 'Failed to upload video to laptop.';
      setCameraError(msg);
      sendWsEvent({
        event: 'upload_failed',
        session_id: sessionId,
        error: msg,
      });
    }
  };

  // Native Video File Picker Fallback Handler
  const handleNativeVideoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      await uploadRecordedFile(file);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, [stopCamera]);

  const formatTimer = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div
      style={{
        width: '100%',
        minHeight: '100vh',
        backgroundColor: '#030712',
        color: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px',
        position: 'relative',
        fontFamily: 'var(--font-sans, system-ui, -apple-system, sans-serif)',
        boxSizing: 'border-box',
      }}
    >
      {/* Offscreen canvas for frame capture */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Top Header Card */}
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 10,
          background: 'rgba(13, 18, 28, 0.9)',
          backdropFilter: 'blur(12px)',
          padding: '12px 16px',
          borderRadius: '12px',
          border: '1px solid #1e293b',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: isRecording ? '#f43f5e' : isCameraActive ? '#10b981' : uploadSuccess ? '#10b981' : '#38bdf8',
              boxShadow: isRecording
                ? '0 0 10px #f43f5e'
                : isCameraActive
                ? '0 0 8px #10b981'
                : '0 0 8px #38bdf8',
            }}
          />
          <span style={{ fontSize: '12.5px', fontWeight: 600 }}>
            {isRecording
              ? 'Recording Room Video...'
              : isCameraActive
              ? 'Rear Camera Live'
              : uploadSuccess
              ? 'Video Upload Complete'
              : isUploading
              ? 'Uploading to Laptop'
              : 'Phone Paired'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#94a3b8' }}>
          <Wifi size={12} style={{ color: wsConnected ? '#10b981' : '#f59e0b' }} />
          <span style={{ fontFamily: 'monospace' }}>{sessionId.slice(0, 10)}</span>
        </div>
      </div>

      {/* Main Center Area */}
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          margin: '14px 0',
          borderRadius: '16px',
          overflow: 'hidden',
          backgroundColor: '#070b14',
          border: '1px solid #1e293b',
          minHeight: '360px',
        }}
      >
        {/* Real Live Camera Video Viewport */}
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: isCameraActive ? 'block' : 'none',
          }}
        />

        {/* Live Recording HUD Overlay */}
        {isCameraActive && (
          <div
            style={{
              position: 'absolute',
              top: '16px',
              left: '16px',
              right: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              zIndex: 20,
            }}
          >
            {isRecording ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(244, 63, 94, 0.25)',
                  border: '1px solid rgba(244, 63, 94, 0.5)',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  backdropFilter: 'blur(8px)',
                }}
              >
                <span
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: '#f43f5e',
                    boxShadow: '0 0 10px #f43f5e',
                  }}
                />
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#ffffff', letterSpacing: '0.04em' }}>
                  REC
                </span>
                <span style={{ fontSize: '13px', fontFamily: 'monospace', fontWeight: 700, color: '#ffffff' }}>
                  {formatTimer(recordingSeconds)}
                </span>
              </div>
            ) : (
              <div
                style={{
                  background: 'rgba(16, 185, 129, 0.2)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  padding: '5px 12px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#6ee7b7',
                  backdropFilter: 'blur(8px)',
                }}
              >
                ● LIVE PREVIEW
              </div>
            )}
          </div>
        )}

        {/* Initial Camera Permission / Start Card (when not active or when uploading) */}
        {!isCameraActive && !uploadSuccess && !isUploading && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: '16px',
              padding: '24px 20px',
              maxWidth: '360px',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'rgba(56, 189, 248, 0.12)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#38bdf8',
              }}
            >
              <Camera size={32} />
            </div>

            <div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#f8fafc' }}>
                ReConSense Room Scan
              </div>
              <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '6px', lineHeight: 1.45 }}>
                Open your phone's rear camera to record and stream the room directly to your laptop for 3D reconstruction.
              </p>
            </div>

            {/* Error Notification */}
            {cameraError && (
              <div
                style={{
                  background: 'rgba(244, 63, 94, 0.12)',
                  border: '1px solid rgba(244, 63, 94, 0.3)',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  fontSize: '12px',
                  color: '#fecdd3',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                }}
              >
                <AlertCircle size={16} style={{ color: '#f43f5e', flexShrink: 0, marginTop: '2px' }} />
                <span>{cameraError}</span>
              </div>
            )}

            {/* Primary Action Button */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
              <button
                type="button"
                onClick={handleStartCamera}
                style={{
                  width: '100%',
                  padding: '13px 18px',
                  borderRadius: '10px',
                  backgroundColor: '#38bdf8',
                  color: '#030712',
                  fontWeight: 700,
                  fontSize: '14px',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 0 18px rgba(56, 189, 248, 0.35)',
                  cursor: 'pointer',
                }}
              >
                <Camera size={18} />
                <span>Open Rear Camera</span>
              </button>

              {/* Native Recording Fallback Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  width: '100%',
                  padding: '11px 16px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid #334155',
                  color: '#cbd5e1',
                  fontWeight: 600,
                  fontSize: '12.5px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                }}
              >
                <Video size={16} />
                <span>Record Room Video with Camera</span>
              </button>
            </div>
          </div>
        )}

        {/* Uploading State Card */}
        {isUploading && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: '16px',
              padding: '28px 20px',
              maxWidth: '360px',
            }}
          >
            <Loader2 size={36} className="spin-animation" style={{ color: '#38bdf8' }} />

            <div>
              <div style={{ fontSize: '17px', fontWeight: 700, color: '#f8fafc' }}>
                Recording Completed
              </div>
              <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>
                {uploadStatusText || 'Uploading video to laptop...'}
              </div>
            </div>

            {/* Real Progress Bar */}
            <div
              style={{
                width: '100%',
                height: '8px',
                backgroundColor: '#1e293b',
                borderRadius: '4px',
                overflow: 'hidden',
                margin: '6px 0',
              }}
            >
              <div
                style={{
                  width: `${uploadPercent}%`,
                  height: '100%',
                  backgroundColor: '#38bdf8',
                  borderRadius: '4px',
                  transition: 'width 0.2s ease',
                  boxShadow: '0 0 10px rgba(56, 189, 248, 0.5)',
                }}
              />
            </div>

            <div style={{ fontSize: '12px', fontFamily: 'monospace', color: '#38bdf8', fontWeight: 600 }}>
              {uploadPercent}% uploaded
            </div>
          </div>
        )}

        {/* Upload Success & Building Scene Card */}
        {uploadSuccess && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: '16px',
              padding: '28px 20px',
              maxWidth: '360px',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#10b981',
              }}
            >
              <CheckCircle2 size={36} />
            </div>

            <div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#f8fafc' }}>
                Video Uploaded Successfully!
              </div>
              <div style={{ fontSize: '13.5px', color: '#38bdf8', fontWeight: 600, marginTop: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <Sparkles size={16} />
                <span>Building your 3D scene...</span>
              </div>
            </div>

            <p style={{ fontSize: '12.5px', color: '#94a3b8', lineHeight: 1.45 }}>
              Your laptop is currently extracting frames and reconstructing the 3D model with GPU acceleration.
            </p>

            <div
              style={{
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                padding: '10px 16px',
                borderRadius: '8px',
                fontSize: '12.5px',
                color: '#a7f3d0',
                fontWeight: 600,
              }}
            >
              You can return to your laptop now.
            </div>

            <button
              type="button"
              onClick={() => {
                setUploadSuccess(false);
                setUploadPercent(0);
                setIsCameraActive(false);
              }}
              style={{
                marginTop: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              <RotateCcw size={13} />
              <span>Record Another Room Scan</span>
            </button>
          </div>
        )}

        {/* Hidden Native File Input Fallback */}
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          capture="environment"
          onChange={handleNativeVideoChange}
          style={{ display: 'none' }}
        />
      </div>

      {/* Bottom Controls Bar */}
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          zIndex: 10,
          background: 'rgba(13, 18, 28, 0.9)',
          backdropFilter: 'blur(12px)',
          padding: '14px 16px',
          borderRadius: '12px',
          border: '1px solid #1e293b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {isCameraActive ? (
          !isRecording ? (
            <button
              type="button"
              onClick={handleStartRecording}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '10px',
                backgroundColor: '#10b981',
                color: '#030712',
                fontWeight: 700,
                fontSize: '14px',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 0 16px rgba(16, 185, 129, 0.4)',
                cursor: 'pointer',
              }}
            >
              <Play size={18} fill="#030712" />
              <span>Start Recording</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleStopRecording}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '10px',
                backgroundColor: '#f43f5e',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '14px',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 0 20px rgba(244, 63, 94, 0.5)',
                cursor: 'pointer',
              }}
            >
              <Square size={16} fill="#ffffff" />
              <span>Stop Recording & Process</span>
            </button>
          )
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#94a3b8' }}>
            <Check size={15} style={{ color: '#10b981' }} />
            <span>Laptop session synced via LAN</span>
          </div>
        )}
      </div>
    </div>
  );
};
