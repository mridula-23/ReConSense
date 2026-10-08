import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Loader2,
  CheckCircle2,
  Circle,
  ArrowRight,
  ArrowLeft,
  Smartphone,
  FileVideo,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import { useScanContext } from '../context/ScanContext';
import { processVideo } from '../services/api';

export const ProcessingPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    scanState,
    setScanState,
    uploadedVideoFile,
    processingResult,
    setProcessingResult,
    processingStage,
    setProcessingStage,
    processingError,
    setProcessingError,
    setActiveSession,
  } = useScanContext();

  const isUpload = scanState.inputSource === 'upload';

  // Automatically trigger real backend processing for uploaded video
  useEffect(() => {
    if (!isUpload || !uploadedVideoFile || processingResult || processingStage === 'completed') {
      return;
    }

    let isMounted = true;

    const runBackendProcessing = async () => {
      try {
        setProcessingError(null);
        setProcessingStage('uploading');

        // Step 1: Uploading & Video Prep
        await new Promise((r) => setTimeout(r, 200));
        if (!isMounted) return;
        setProcessingStage('processing');

        // Step 2: Send real multipart request to backend API
        const result = await processVideo(uploadedVideoFile, 10);
        if (!isMounted) return;

        // Step 3: Frames Extracted
        setProcessingStage('extracting');
        await new Promise((r) => setTimeout(r, 300));
        if (!isMounted) return;

        // Step 4: Completed
        setProcessingResult(result);
        setProcessingStage('completed');
        setScanState((prev) => ({
          ...prev,
          sessionId: result.session_id,
          uploadedVideoName: result.filename,
          isProcessing: false,
        }));
        setActiveSession((prev) =>
          prev
            ? {
                ...prev,
                id: result.session_id,
                status: 'ready',
              }
            : null
        );
      } catch (err: unknown) {
        if (!isMounted) return;
        const message = err instanceof Error ? err.message : 'Video processing failed';
        setProcessingError(message);
        setProcessingStage('failed');
      }
    };

    runBackendProcessing();

    return () => {
      isMounted = false;
    };
  }, [isUpload, uploadedVideoFile]);

  const handleContinue = () => {
    navigate('/scene');
  };

  const handleBack = () => {
    if (isUpload) {
      navigate('/upload');
    } else {
      navigate('/capture');
    }
  };

  const handleRetry = () => {
    if (uploadedVideoFile) {
      setProcessingResult(null);
      setProcessingError(null);
      setProcessingStage('idle');
    }
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
        padding: '30px 20px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '600px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '30px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px' }}>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--accent-cyan)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Reconstruction Pipeline
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
              Building Your 3D Scene
            </h2>
          </div>

          <button
            onClick={handleBack}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              color: 'var(--text-muted)',
            }}
          >
            <ArrowLeft size={14} />
            <span>Back</span>
          </button>
        </div>

        {/* Input Source & Status Badge */}
        <div
          style={{
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {isUpload ? (
              <FileVideo size={18} style={{ color: 'var(--accent-cyan)' }} />
            ) : (
              <Smartphone size={18} style={{ color: 'var(--accent-emerald)' }} />
            )}
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Source
              </div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {isUpload ? 'Uploaded Video' : 'Phone Capture'}
              </div>
            </div>
          </div>

          <div
            className="font-mono"
            style={{
              fontSize: '11px',
              padding: '4px 8px',
              borderRadius: 'var(--radius-sm)',
              background:
                processingStage === 'completed'
                  ? 'rgba(16, 185, 129, 0.15)'
                  : processingStage === 'failed'
                  ? 'rgba(244, 63, 94, 0.15)'
                  : 'rgba(56, 189, 248, 0.1)',
              color:
                processingStage === 'completed'
                  ? 'var(--accent-emerald)'
                  : processingStage === 'failed'
                  ? 'var(--accent-rose)'
                  : 'var(--accent-cyan)',
              border: `1px solid ${
                processingStage === 'completed'
                  ? 'rgba(16, 185, 129, 0.3)'
                  : processingStage === 'failed'
                  ? 'rgba(244, 63, 94, 0.3)'
                  : 'rgba(56, 189, 248, 0.2)'
              }`,
            }}
          >
            {isUpload
              ? processingStage === 'completed'
                ? 'Video is ready for 3D reconstruction'
                : processingStage === 'uploading'
                ? 'Uploading video...'
                : processingStage === 'processing'
                ? 'Preparing your room video'
                : processingStage === 'extracting'
                ? 'Extracting useful frames'
                : processingStage === 'failed'
                ? 'Processing failed'
                : 'Preparing video'
              : 'Phone capture ready'}
          </div>
        </div>

        {/* Error state if failed */}
        {processingError && (
          <div
            style={{
              background: 'rgba(244, 63, 94, 0.1)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fecdd3', fontSize: '12.5px' }}>
              <AlertCircle size={16} style={{ color: 'var(--accent-rose)', flexShrink: 0 }} />
              <span>{processingError}</span>
            </div>
            <button
              onClick={handleRetry}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(244, 63, 94, 0.2)',
                border: '1px solid rgba(244, 63, 94, 0.4)',
                color: '#fff',
                fontSize: '11.5px',
                cursor: 'pointer',
              }}
            >
              <RotateCcw size={12} />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Real Backend Frame Extraction Summary when completed */}
        {processingResult && (
          <div
            style={{
              background: 'rgba(16, 185, 129, 0.05)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-emerald)', fontSize: '13px', fontWeight: 600 }}>
              <CheckCircle2 size={16} />
              <span>Video dataset prepared successfully</span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '8px',
                fontSize: '12px',
                paddingTop: '4px',
              }}
            >
              <div style={{ background: 'var(--bg-surface-elevated)', padding: '8px 10px', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '10.5px' }}>Total Video Frames</div>
                <div style={{ color: 'var(--text-primary)', fontWeight: 600, marginTop: '2px' }}>
                  {processingResult.video.frame_count} frames ({processingResult.video.duration_seconds}s)
                </div>
              </div>

              <div style={{ background: 'var(--bg-surface-elevated)', padding: '8px 10px', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '10.5px' }}>Extracted Frames</div>
                <div style={{ color: 'var(--accent-cyan)', fontWeight: 600, marginTop: '2px' }}>
                  {processingResult.frames.extracted} sampled
                </div>
              </div>

              <div style={{ background: 'var(--bg-surface-elevated)', padding: '8px 10px', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '10.5px' }}>Usable for 3D</div>
                <div style={{ color: 'var(--accent-emerald)', fontWeight: 600, marginTop: '2px' }}>
                  {processingResult.frames.usable} sharp frames
                </div>
              </div>
            </div>

            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              Session ID: {processingResult.session_id} • Resolution: {processingResult.video.width}×{processingResult.video.height}
            </div>
          </div>
        )}

        {/* Processing Sequence List */}
        <div
          style={{
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          {/* Step 1: Preparing video */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {processingStage === 'completed' || processingStage === 'extracting' || processingStage === 'processing' ? (
              <CheckCircle2 size={18} style={{ color: 'var(--accent-emerald)', flexShrink: 0 }} />
            ) : processingStage === 'uploading' ? (
              <Loader2 size={18} className="spin-animation" style={{ color: 'var(--accent-cyan)', flexShrink: 0 }} />
            ) : (
              <Circle size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            )}
            <span style={{ fontSize: '13.5px', color: 'var(--text-primary)', fontWeight: 500 }}>
              Preparing video
            </span>
          </div>

          {/* Step 2: Extracting useful frames */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {processingStage === 'completed' ? (
              <CheckCircle2 size={18} style={{ color: 'var(--accent-emerald)', flexShrink: 0 }} />
            ) : processingStage === 'processing' || processingStage === 'extracting' ? (
              <Loader2 size={18} className="spin-animation" style={{ color: 'var(--accent-cyan)', flexShrink: 0 }} />
            ) : (
              <Circle size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            )}
            <span
              style={{
                fontSize: '13.5px',
                color: processingStage === 'completed' || processingStage === 'processing' || processingStage === 'extracting' ? 'var(--text-primary)' : 'var(--text-muted)',
                fontWeight: processingStage === 'processing' || processingStage === 'extracting' ? 600 : 500,
              }}
            >
              Extracting useful frames & blur filtering
            </span>
          </div>

          {/* Step 3: Checking room coverage */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Circle size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <span style={{ fontSize: '13.5px', color: 'var(--text-muted)' }}>
              Checking room coverage (Upcoming step)
            </span>
          </div>

          {/* Step 4: Detecting moving objects */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Circle size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <span style={{ fontSize: '13.5px', color: 'var(--text-muted)' }}>
              Detecting moving objects (Upcoming step)
            </span>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}>
          <button
            onClick={handleContinue}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 22px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--accent-cyan)',
              color: '#030712',
              fontWeight: 600,
              fontSize: '13.5px',
              boxShadow: '0 0 14px rgba(56, 189, 248, 0.3)',
              cursor: 'pointer',
            }}
          >
            <span>Continue to 3D Reconstruction</span>
            <ArrowRight size={15} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
};
