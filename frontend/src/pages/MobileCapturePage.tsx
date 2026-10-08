import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Camera,
  CheckCircle2,
  AlertCircle,
  Video,
  Check,
  Loader2,
} from 'lucide-react';
import { processVideo } from '../services/api';

export const MobileCapturePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session') || 'active_session';

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isStreaming, setIsStreaming] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Stop camera helper
  const stopCameraStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
  }, []);

  // Request live camera stream via getUserMedia
  const requestCameraAccess = async () => {
    setCameraError(null);

    // Check mediaDevices support
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError(
        'Direct live streaming is restricted over local HTTP. Use the native Record Room Video option below to capture room scans.'
      );
      return;
    }

    try {
      stopCameraStream();

      // Request rear camera with high definition
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setIsStreaming(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to access camera.';
      setCameraError(
        msg.includes('Permission') || msg.includes('NotAllowedError')
          ? 'Camera access permission was denied. Please allow camera access in your browser settings or use the Record Video button.'
          : msg
      );
    }
  };

  // Handle direct native mobile video capture
  const handleVideoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      try {
        setIsUploading(true);
        setUploadProgress(`Uploading ${file.name} to laptop session...`);
        setCameraError(null);

        // Upload directly to laptop session
        await processVideo(file, 10);

        setIsUploading(false);
        setUploadSuccess(true);
        setUploadProgress('Room video successfully sent to laptop! Laptop is now processing.');
      } catch (err: unknown) {
        setIsUploading(false);
        const msg = err instanceof Error ? err.message : 'Failed to upload video to laptop.';
        setCameraError(msg);
      }
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, [stopCameraStream]);

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
      }}
    >
      {/* Top Status Header */}
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 10,
          background: 'rgba(13, 18, 28, 0.85)',
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
              background: isStreaming ? '#10b981' : uploadSuccess ? '#10b981' : '#38bdf8',
              boxShadow: `0 0 8px ${isStreaming ? '#10b981' : '#38bdf8'}`,
            }}
          />
          <span style={{ fontSize: '12.5px', fontWeight: 600 }}>
            {isStreaming ? 'Live Camera Streaming' : uploadSuccess ? 'Video Processed on Laptop' : 'Phone Synced with Laptop'}
          </span>
        </div>
        <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#94a3b8' }}>
          {sessionId}
        </span>
      </div>

      {/* Main Viewport Container */}
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
          padding: isStreaming ? '0' : '20px',
        }}
      >
        {/* Active Live Video Stream */}
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: isStreaming ? 'block' : 'none',
          }}
        />

        {/* Camera Permission Prompt / Action Card when not streaming */}
        {!isStreaming && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: '16px',
              maxWidth: '360px',
            }}
          >
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: 'rgba(56, 189, 248, 0.1)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#38bdf8',
              }}
            >
              <Camera size={30} />
            </div>

            <div>
              <div style={{ fontSize: '17px', fontWeight: 700, color: '#f8fafc' }}>
                Smartphone Room Capture
              </div>
              <p style={{ fontSize: '12.5px', color: '#94a3b8', marginTop: '6px', lineHeight: 1.45 }}>
                Use your phone's camera to record the room surfaces. Video will be processed directly on your laptop.
              </p>
            </div>

            {/* Error Notification if any */}
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

            {/* Upload Success Feedback */}
            {uploadSuccess && (
              <div
                style={{
                  background: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  fontSize: '12.5px',
                  color: '#6ee7b7',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Check size={16} style={{ color: '#10b981' }} />
                <span>{uploadProgress}</span>
              </div>
            )}

            {/* Camera Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
              {/* Primary Action: Record Video with Native Phone Camera */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                style={{
                  width: '100%',
                  padding: '13px 16px',
                  borderRadius: '10px',
                  backgroundColor: '#38bdf8',
                  color: '#030712',
                  fontWeight: 700,
                  fontSize: '13.5px',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 0 16px rgba(56, 189, 248, 0.35)',
                  cursor: isUploading ? 'not-allowed' : 'pointer',
                }}
              >
                {isUploading ? (
                  <>
                    <Loader2 size={16} className="spin-animation" />
                    <span>Sending to Laptop...</span>
                  </>
                ) : (
                  <>
                    <Video size={17} />
                    <span>Record Room Video with Camera</span>
                  </>
                )}
              </button>

              {/* Secondary Action: Start Live Stream */}
              <button
                type="button"
                onClick={requestCameraAccess}
                disabled={isUploading}
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
                <Camera size={15} />
                <span>Enable Live Camera Stream</span>
              </button>

              {/* Hidden Native Mobile Camera File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                capture="environment"
                onChange={handleVideoFileChange}
                style={{ display: 'none' }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Bottom Sync HUD */}
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          zIndex: 10,
          background: 'rgba(13, 18, 28, 0.85)',
          backdropFilter: 'blur(12px)',
          padding: '12px 16px',
          borderRadius: '12px',
          border: '1px solid #1e293b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={16} style={{ color: '#10b981' }} />
          <span style={{ fontSize: '12px', color: '#cbd5e1' }}>
            Laptop session synced
          </span>
        </div>

        {isStreaming && (
          <button
            onClick={stopCameraStream}
            style={{
              padding: '4px 10px',
              borderRadius: '6px',
              backgroundColor: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              color: '#fb7185',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Stop Stream
          </button>
        )}
      </div>
    </div>
  );
};
