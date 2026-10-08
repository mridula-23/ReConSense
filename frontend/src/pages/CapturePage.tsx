import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Camera,
  ArrowLeft,
  ArrowRight,
  Wifi,
  Smartphone,
  Loader2,
  Radio,
} from 'lucide-react';
import { useScanContext } from '../context/ScanContext';
import { getCameraWebSocketUrl, type VideoProcessingResult } from '../services/api';

export const CapturePage: React.FC = () => {
  const navigate = useNavigate();
  const {
    scanState,
    setScanState,
    setProcessingResult,
    setActiveSession,
    phoneConnection,
  } = useScanContext();

  const sessionId = scanState.sessionId || 'active_session';

  // Refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // States
  const [hasReceivedFrame, setHasReceivedFrame] = useState(false);
  const [isPhoneRecording, setIsPhoneRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadPercent, setUploadPercent] = useState<number | null>(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Waiting for camera feed from phone...');

  // Draw received base64 JPEG frame onto canvas
  const renderFrameToCanvas = useCallback((frameDataUrl: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      setHasReceivedFrame(true);
    };
    img.src = frameDataUrl;
  }, []);

  // Auto transition to processing page upon upload completion
  const handleUploadCompleted = useCallback((result?: VideoProcessingResult) => {
    setIsUploading(false);
    setIsPhoneRecording(false);
    setStatusMessage('Video upload complete! Moving to 3D reconstruction...');

    if (result) {
      setProcessingResult(result);
      setScanState((prev) => ({
        ...prev,
        sessionId: result.session_id || prev.sessionId,
        uploadedVideoName: result.filename || prev.uploadedVideoName,
        isProcessing: false,
        captureFinished: true,
        captureStatus: 'finished',
      }));
      setActiveSession((prev) =>
        prev
          ? {
              ...prev,
              id: result.session_id || prev.id,
              status: 'ready',
            }
          : null
      );
    }

    // Auto navigate to ProcessingPage
    setTimeout(() => {
      navigate('/processing');
    }, 600);
  }, [navigate, setActiveSession, setProcessingResult, setScanState]);

  // Connect to live camera WebSocket channel
  useEffect(() => {
    if (!sessionId) return;

    try {
      const wsUrl = getCameraWebSocketUrl(sessionId);
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setWsConnected(true);
        setStatusMessage('Connected to live camera channel. Waiting for stream...');
      };

      ws.onclose = () => {
        setWsConnected(false);
      };

      ws.onerror = () => {
        setWsConnected(false);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.event === 'frame' && data.data) {
            renderFrameToCanvas(data.data);
            setStatusMessage('Streaming live phone camera');
          } else if (data.event === 'camera_started' || data.event === 'camera_ready') {
            setStatusMessage('Phone camera is active');
          } else if (data.event === 'recording_started') {
            setIsPhoneRecording(true);
            setRecordingSeconds(data.duration || 0);
            setStatusMessage('Phone is recording room scan');
          } else if (data.event === 'recording_progress') {
            setIsPhoneRecording(true);
            if (typeof data.duration === 'number') {
              setRecordingSeconds(data.duration);
            }
          } else if (data.event === 'recording_stopped') {
            setIsPhoneRecording(false);
            setStatusMessage('Recording stopped. Preparing upload...');
          } else if (data.event === 'upload_started') {
            setIsUploading(true);
            setUploadPercent(0);
            setStatusMessage('Receiving recorded video from phone...');
          } else if (data.event === 'upload_progress') {
            setIsUploading(true);
            if (typeof data.percent === 'number') {
              setUploadPercent(data.percent);
              setStatusMessage(`Uploading video from phone (${data.percent}%)...`);
            }
          } else if (data.event === 'upload_completed') {
            handleUploadCompleted(data.result);
          }
        } catch {
          // Non-JSON binary or string message
        }
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
  }, [sessionId, renderFrameToCanvas, handleUploadCompleted]);

  const formatTimer = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div
      style={{
        width: '100%',
        minHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 20px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '740px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--border-subtle)',
            paddingBottom: '12px',
          }}
        >
          <div>
            <div
              style={{
                fontSize: '11px',
                color: 'var(--accent-cyan)',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              Phone Capture Flow • Step 3 of 6
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
              Live Phone Camera Feed
            </h2>
          </div>

          <button
            onClick={() => navigate('/connect')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              color: 'var(--text-muted)',
              cursor: 'pointer',
            }}
          >
            <ArrowLeft size={14} />
            <span>Back</span>
          </button>
        </div>

        {/* Live Camera Feed Container */}
        <div
          style={{
            width: '100%',
            height: '380px',
            backgroundColor: '#05070c',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Top Live Banner Overlay */}
          <div
            style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              right: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              zIndex: 10,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(13, 18, 28, 0.85)',
                backdropFilter: 'blur(10px)',
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <Radio size={14} style={{ color: hasReceivedFrame ? 'var(--accent-emerald)' : 'var(--accent-cyan)' }} />
              <span style={{ fontSize: '11.5px', fontWeight: 700, letterSpacing: '0.04em', color: 'var(--text-primary)' }}>
                LIVE PHONE CAMERA
              </span>
            </div>

            {/* Recording / Stream State Pill */}
            {isPhoneRecording ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(244, 63, 94, 0.2)',
                  border: '1px solid rgba(244, 63, 94, 0.4)',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-sm)',
                  backdropFilter: 'blur(8px)',
                }}
              >
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--accent-rose)',
                    boxShadow: '0 0 8px var(--accent-rose)',
                  }}
                />
                <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#ffffff' }}>
                  RECORDING
                </span>
                <span style={{ fontSize: '12px', fontFamily: 'monospace', fontWeight: 700, color: '#ffffff' }}>
                  {formatTimer(recordingSeconds)}
                </span>
              </div>
            ) : hasReceivedFrame ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  padding: '5px 10px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '11.5px',
                  color: 'var(--accent-emerald)',
                  fontWeight: 600,
                  backdropFilter: 'blur(8px)',
                }}
              >
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-emerald)' }} />
                <span>Camera Active</span>
              </div>
            ) : (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(56, 189, 248, 0.1)',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  padding: '5px 10px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '11px',
                  color: 'var(--accent-cyan)',
                  backdropFilter: 'blur(8px)',
                }}
              >
                <Loader2 size={12} className="spin-animation" />
                <span>Waiting for phone feed</span>
              </div>
            )}
          </div>

          {/* Canvas Rendering Phone Frames */}
          <canvas
            ref={canvasRef}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              display: hasReceivedFrame ? 'block' : 'none',
            }}
          />

          {/* Placeholder when waiting for initial frame */}
          {!hasReceivedFrame && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
                textAlign: 'center',
                padding: '20px',
              }}
            >
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  background: 'rgba(56, 189, 248, 0.08)',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-cyan)',
                }}
              >
                <Camera size={26} />
              </div>

              <div>
                <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {statusMessage}
                </div>
                <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Press <strong style={{ color: 'var(--accent-cyan)' }}>Open Rear Camera</strong> and{' '}
                  <strong style={{ color: 'var(--accent-emerald)' }}>Start Recording</strong> on your phone.
                </div>
              </div>
            </div>
          )}

          {/* Live Upload Notification Overlay when phone uploads */}
          {isUploading && (
            <div
              style={{
                position: 'absolute',
                bottom: '16px',
                left: '16px',
                right: '16px',
                background: 'rgba(13, 18, 28, 0.92)',
                backdropFilter: 'blur(12px)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                zIndex: 30,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Loader2 size={18} className="spin-animation" style={{ color: 'var(--accent-cyan)' }} />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Uploading Video from Phone...
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                    Processing room video dataset on laptop
                  </div>
                </div>
              </div>

              {uploadPercent !== null && (
                <span style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                  {uploadPercent}%
                </span>
              )}
            </div>
          )}
        </div>

        {/* Secondary Device & Status HUD */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '10px',
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '12px 14px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Smartphone size={16} style={{ color: 'var(--accent-emerald)' }} />
            <div>
              <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Phone Device
              </div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {phoneConnection.deviceId || 'Connected Smartphone'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Camera size={16} style={{ color: 'var(--accent-cyan)' }} />
            <div>
              <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Camera Mode
              </div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {hasReceivedFrame ? 'Rear Environment' : 'Standby'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Wifi size={16} style={{ color: wsConnected ? 'var(--accent-emerald)' : 'var(--accent-amber)' }} />
            <div>
              <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                LAN Channel
              </div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {wsConnected ? 'Connected (Low Latency)' : 'Connecting...'}
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div
          style={{
            fontSize: '12.5px',
            color: 'var(--text-secondary)',
            textAlign: 'center',
            lineHeight: 1.5,
          }}
        >
          Hold your phone steadily and record a smooth scan around the room. When you press{' '}
          <strong style={{ color: '#ffffff' }}>Stop Recording</strong> on your phone, the video will automatically upload and begin 3D reconstruction here.
        </div>

        {/* Bottom Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}>
          <button
            onClick={() => navigate('/processing')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            <span>Skip to Processing</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
