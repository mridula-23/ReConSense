import React, { useRef, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export const MobileCapturePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session') || 'active_session';

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        setCameraError(null);
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setIsStreaming(true);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Unable to access smartphone camera.';
        setCameraError(msg);
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div
      style={{
        width: '100%',
        minHeight: '100vh',
        backgroundColor: '#000000',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top Overlay HUD */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 10,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(10px)',
          padding: '10px 16px',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: isStreaming ? '#10b981' : '#f59e0b' }} />
          <span style={{ fontSize: '12px', fontWeight: 600 }}>
            {isStreaming ? 'Phone Connected & Streaming' : 'Connecting Camera...'}
          </span>
        </div>
        <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#94a3b8' }}>
          {sessionId}
        </span>
      </div>

      {/* Video Viewport */}
      <div
        style={{
          width: '100%',
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          margin: '12px 0',
          borderRadius: '16px',
          overflow: 'hidden',
          backgroundColor: '#05070c',
          border: '1px solid #1e293b',
        }}
      >
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />

        {cameraError && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px',
              textAlign: 'center',
              gap: '12px',
              background: 'rgba(5, 7, 12, 0.92)',
            }}
          >
            <AlertCircle size={36} style={{ color: '#f43f5e' }} />
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#fecdd3' }}>Camera Permission Needed</div>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>
              Please allow camera access in your mobile browser to scan the room.
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls / Feedback */}
      <div
        style={{
          width: '100%',
          zIndex: 10,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(10px)',
          padding: '14px 16px',
          borderRadius: '14px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          textAlign: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#38bdf8', fontWeight: 600 }}>
          <CheckCircle2 size={16} />
          <span>Laptop is synced with this phone camera</span>
        </div>
        <div style={{ fontSize: '11.5px', color: '#94a3b8' }}>
          Follow instructions on your laptop screen to perform room coverage capture.
        </div>
      </div>
    </div>
  );
};
