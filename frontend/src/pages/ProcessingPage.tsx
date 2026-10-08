import React, { useEffect, useRef, useCallback } from 'react';
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
  Box,
} from 'lucide-react';
import { useScanContext } from '../context/ScanContext';
import {
  processVideo,
  startReconstruction,
  fetchReconstructionStatus,
  fetchReconstructionResult,
  fetchReconstructionPoints,
} from '../services/api';

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
    reconstructionResult,
    setReconstructionResult,
    setReconstructionPoints,
    reconstructionStage,
    setReconstructionStage,
    reconstructionMessage,
    setReconstructionMessage,
    reconstructionError,
    setReconstructionError,
    reconstructionMode,
  } = useScanContext();

  const isUpload = scanState.inputSource === 'upload';
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  // Clean up polling on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  const handleStartReconstruction = useCallback(async () => {
    const sessionId = processingResult?.session_id || scanState.sessionId;
    if (!sessionId) {
      setReconstructionError('No active session ID for reconstruction');
      return;
    }

    try {
      setReconstructionError(null);
      setReconstructionStage('preparing');
      setReconstructionMessage(
        reconstructionMode === 'baseline'
          ? 'Initializing Baseline COLMAP reconstruction...'
          : 'Initializing ReConSense COLMAP reconstruction...'
      );

      await startReconstruction(sessionId, 10, true, reconstructionMode);

      // Start polling status
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }

      pollIntervalRef.current = setInterval(async () => {
        try {
          const statusRes = await fetchReconstructionStatus(sessionId);
          setReconstructionStage(statusRes.status);
          setReconstructionMessage(statusRes.current_message || statusRes.message || '');

          if (statusRes.status === 'completed') {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

            // Fetch final result details and points
            const resultData = await fetchReconstructionResult(sessionId);
            setReconstructionResult(resultData);

            try {
              const pointsData = await fetchReconstructionPoints(sessionId);
              setReconstructionPoints(pointsData.points || []);
            } catch {
              // Points might be empty if sparse failed
            }

            setScanState((prev) => ({
              ...prev,
              sceneReady: true,
              reconstructionStatus: 'ready',
            }));

            // Step 7: Automatic navigation to ScenePage after real reconstruction succeeds
            setTimeout(() => {
              navigate('/scene');
            }, 1200);
          } else if (statusRes.status === 'failed') {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
            setReconstructionError(statusRes.current_message || statusRes.message || statusRes.error || 'Reconstruction failed');
          }
        } catch (err) {
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
          setReconstructionError(err instanceof Error ? err.message : 'Failed checking reconstruction status');
        }
      }, 1000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not start reconstruction';
      setReconstructionError(msg);
      setReconstructionStage('failed');
    }
  }, [
    navigate,
    processingResult?.session_id,
    reconstructionMode,
    scanState.sessionId,
    setReconstructionError,
    setReconstructionMessage,
    setReconstructionPoints,
    setReconstructionResult,
    setReconstructionStage,
    setScanState,
  ]);

  // Auto-start reconstruction once dataset is ready
  useEffect(() => {
    if (
      processingResult &&
      (processingStage === 'completed' || processingResult.status === 'completed') &&
      reconstructionStage === 'not_started' &&
      !reconstructionError
    ) {
      handleStartReconstruction();
    }
  }, [processingResult, processingStage, reconstructionStage, reconstructionError, handleStartReconstruction]);

  const handleContinueToScene = () => {
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

  const isReconstructing =
    reconstructionStage === 'preparing' ||
    reconstructionStage === 'extracting_features' ||
    reconstructionStage === 'matching_features' ||
    reconstructionStage === 'reconstructing';

  const isReconstructionCompleted = reconstructionStage === 'completed';

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
          maxWidth: '640px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '22px',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px' }}>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--accent-cyan)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Reconstruction Pipeline • {reconstructionMode === 'baseline' ? 'Original Baseline' : 'ReConSense'}
            </div>
            <h2 style={{ fontSize: '19px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
              Building Your 3D Scene
            </h2>
          </div>

          <button
            onClick={handleBack}
            disabled={isReconstructing}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              color: isReconstructing ? 'var(--text-muted)' : 'var(--text-secondary)',
              cursor: isReconstructing ? 'not-allowed' : 'pointer',
              opacity: isReconstructing ? 0.5 : 1,
            }}
          >
            <ArrowLeft size={14} />
            <span>Back</span>
          </button>
        </div>

        {/* Input Source & Mode & Status Badge */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
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

            <div style={{ width: '1px', height: '24px', background: 'var(--border-subtle)' }} />

            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Mode
              </div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--accent-cyan)' }}>
                {reconstructionMode === 'baseline' ? 'Original Baseline' : 'ReConSense'}
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
                reconstructionStage === 'completed'
                  ? 'rgba(16, 185, 129, 0.15)'
                  : reconstructionStage === 'failed' || processingStage === 'failed'
                  ? 'rgba(244, 63, 94, 0.15)'
                  : isReconstructing
                  ? 'rgba(56, 189, 248, 0.15)'
                  : processingStage === 'completed'
                  ? 'rgba(16, 185, 129, 0.15)'
                  : 'rgba(56, 189, 248, 0.1)',
              color:
                reconstructionStage === 'completed'
                  ? 'var(--accent-emerald)'
                  : reconstructionStage === 'failed' || processingStage === 'failed'
                  ? 'var(--accent-rose)'
                  : isReconstructing
                  ? 'var(--accent-cyan)'
                  : processingStage === 'completed'
                  ? 'var(--accent-emerald)'
                  : 'var(--accent-cyan)',
              border: `1px solid ${
                reconstructionStage === 'completed'
                  ? 'rgba(16, 185, 129, 0.3)'
                  : reconstructionStage === 'failed' || processingStage === 'failed'
                  ? 'rgba(244, 63, 94, 0.3)'
                  : 'rgba(56, 189, 248, 0.2)'
              }`,
            }}
          >
            {reconstructionStage === 'completed'
              ? '3D reconstruction complete'
              : isReconstructing
              ? reconstructionMessage || 'Reconstructing 3D scene...'
              : reconstructionStage === 'failed'
              ? 'Reconstruction failed'
              : processingStage === 'completed'
              ? 'Video is ready for 3D reconstruction'
              : processingStage === 'uploading'
              ? 'Uploading video...'
              : processingStage === 'processing'
              ? 'Preparing your room video'
              : processingStage === 'extracting'
              ? 'Extracting useful frames'
              : processingStage === 'failed'
              ? 'Processing failed'
              : 'Preparing video'}
          </div>
        </div>

        {/* Video Processing Error */}
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

        {/* Reconstruction Error */}
        {reconstructionError && (
          <div
            style={{
              background: 'rgba(244, 63, 94, 0.1)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              borderRadius: 'var(--radius-sm)',
              padding: '14px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fecdd3', fontSize: '13px', fontWeight: 600 }}>
              <AlertCircle size={16} style={{ color: 'var(--accent-rose)', flexShrink: 0 }} />
              <span>3D reconstruction could not be completed.</span>
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '12px', lineHeight: 1.4 }}>
              {reconstructionError}
              <br />
              <span style={{ color: 'var(--text-secondary)' }}>
                Try a video with more movement around the room and fewer blurred frames.
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '4px' }}>
              <button
                onClick={handleStartReconstruction}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(244, 63, 94, 0.2)',
                  border: '1px solid rgba(244, 63, 94, 0.4)',
                  color: '#fff',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                <RotateCcw size={13} />
                <span>Retry Reconstruction</span>
              </button>
            </div>
          </div>
        )}

        {/* Real Backend Frame Extraction Summary when completed */}
        {processingResult && (
          <div
            style={{
              background: 'rgba(16, 185, 129, 0.05)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              borderRadius: 'var(--radius-md)',
              padding: '14px 16px',
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
          </div>
        )}

        {/* Real COLMAP Sparse Reconstruction Result Card */}
        {reconstructionResult && isReconstructionCompleted && (
          <div
            style={{
              background: 'rgba(56, 189, 248, 0.06)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-cyan)', fontSize: '13px', fontWeight: 600 }}>
              <Box size={16} />
              <span>COLMAP Sparse 3D Reconstruction Generated</span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '8px',
                fontSize: '12px',
              }}
            >
              <div style={{ background: 'var(--bg-surface-elevated)', padding: '8px 10px', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '10.5px' }}>Registered Images</div>
                <div style={{ color: 'var(--accent-cyan)', fontWeight: 600, marginTop: '2px' }}>
                  {reconstructionResult.registered_images} / {reconstructionResult.total_input_images}
                </div>
              </div>

              <div style={{ background: 'var(--bg-surface-elevated)', padding: '8px 10px', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '10.5px' }}>Reconstructed 3D Points</div>
                <div style={{ color: 'var(--accent-emerald)', fontWeight: 600, marginTop: '2px' }}>
                  {reconstructionResult.points_3d.toLocaleString()} points
                </div>
              </div>

              <div style={{ background: 'var(--bg-surface-elevated)', padding: '8px 10px', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '10.5px' }}>Camera Models</div>
                <div style={{ color: 'var(--text-primary)', fontWeight: 600, marginTop: '2px' }}>
                  {reconstructionResult.camera_count} camera(s)
                </div>
              </div>
            </div>

            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              Model: {reconstructionResult.model_path || 'sparse/0'}
            </div>
          </div>
        )}

        {/* Reconstruction Sequence List */}
        <div
          style={{
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '18px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          {/* Stage 1: Preparing reconstruction */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {reconstructionStage === 'completed' ||
            reconstructionStage === 'extracting_features' ||
            reconstructionStage === 'matching_features' ||
            reconstructionStage === 'reconstructing' ? (
              <CheckCircle2 size={18} style={{ color: 'var(--accent-emerald)', flexShrink: 0 }} />
            ) : reconstructionStage === 'preparing' ? (
              <Loader2 size={18} className="spin-animation" style={{ color: 'var(--accent-cyan)', flexShrink: 0 }} />
            ) : (
              <Circle size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            )}
            <span
              style={{
                fontSize: '13px',
                color: reconstructionStage !== 'not_started' ? 'var(--text-primary)' : 'var(--text-muted)',
                fontWeight: reconstructionStage === 'preparing' ? 600 : 500,
              }}
            >
              Preparing reconstruction workspace
            </span>
          </div>

          {/* Stage 2: Finding visual features */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {reconstructionStage === 'completed' ||
            reconstructionStage === 'matching_features' ||
            reconstructionStage === 'reconstructing' ? (
              <CheckCircle2 size={18} style={{ color: 'var(--accent-emerald)', flexShrink: 0 }} />
            ) : reconstructionStage === 'extracting_features' ? (
              <Loader2 size={18} className="spin-animation" style={{ color: 'var(--accent-cyan)', flexShrink: 0 }} />
            ) : (
              <Circle size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            )}
            <span
              style={{
                fontSize: '13px',
                color:
                  reconstructionStage === 'extracting_features' ||
                  reconstructionStage === 'matching_features' ||
                  reconstructionStage === 'reconstructing' ||
                  reconstructionStage === 'completed'
                    ? 'var(--text-primary)'
                    : 'var(--text-muted)',
                fontWeight: reconstructionStage === 'extracting_features' ? 600 : 500,
              }}
            >
              Finding visual features (COLMAP SIFT extraction)
            </span>
          </div>

          {/* Stage 3: Matching frames */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {reconstructionStage === 'completed' || reconstructionStage === 'reconstructing' ? (
              <CheckCircle2 size={18} style={{ color: 'var(--accent-emerald)', flexShrink: 0 }} />
            ) : reconstructionStage === 'matching_features' ? (
              <Loader2 size={18} className="spin-animation" style={{ color: 'var(--accent-cyan)', flexShrink: 0 }} />
            ) : (
              <Circle size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            )}
            <span
              style={{
                fontSize: '13px',
                color:
                  reconstructionStage === 'matching_features' ||
                  reconstructionStage === 'reconstructing' ||
                  reconstructionStage === 'completed'
                    ? 'var(--text-primary)'
                    : 'var(--text-muted)',
                fontWeight: reconstructionStage === 'matching_features' ? 600 : 500,
              }}
            >
              Matching frames across room views
            </span>
          </div>

          {/* Stage 4: Estimating camera positions & sparse 3D scene */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {reconstructionStage === 'completed' ? (
              <CheckCircle2 size={18} style={{ color: 'var(--accent-emerald)', flexShrink: 0 }} />
            ) : reconstructionStage === 'reconstructing' ? (
              <Loader2 size={18} className="spin-animation" style={{ color: 'var(--accent-cyan)', flexShrink: 0 }} />
            ) : (
              <Circle size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            )}
            <span
              style={{
                fontSize: '13px',
                color: reconstructionStage === 'reconstructing' || reconstructionStage === 'completed' ? 'var(--text-primary)' : 'var(--text-muted)',
                fontWeight: reconstructionStage === 'reconstructing' ? 600 : 500,
              }}
            >
              Estimating camera positions & building sparse 3D scene
            </span>
          </div>

          {/* Stage 5: Reconstruction complete */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {reconstructionStage === 'completed' ? (
              <CheckCircle2 size={18} style={{ color: 'var(--accent-emerald)', flexShrink: 0 }} />
            ) : (
              <Circle size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            )}
            <span
              style={{
                fontSize: '13px',
                color: reconstructionStage === 'completed' ? 'var(--accent-emerald)' : 'var(--text-muted)',
                fontWeight: reconstructionStage === 'completed' ? 600 : 500,
              }}
            >
              Reconstruction complete
            </span>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}>
          {!isReconstructionCompleted ? (
            <button
              onClick={handleStartReconstruction}
              disabled={isReconstructing || processingStage !== 'completed'}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 22px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: isReconstructing || processingStage !== 'completed' ? 'var(--bg-surface-elevated)' : 'var(--accent-cyan)',
                color: isReconstructing || processingStage !== 'completed' ? 'var(--text-muted)' : '#030712',
                fontWeight: 600,
                fontSize: '13.5px',
                boxShadow: isReconstructing || processingStage !== 'completed' ? 'none' : '0 0 14px rgba(56, 189, 248, 0.3)',
                cursor: isReconstructing || processingStage !== 'completed' ? 'not-allowed' : 'pointer',
              }}
            >
              {isReconstructing ? (
                <>
                  <Loader2 size={15} className="spin-animation" />
                  <span>Reconstructing 3D Scene...</span>
                </>
              ) : (
                <>
                  <span>Continue to 3D Reconstruction</span>
                  <ArrowRight size={15} strokeWidth={2.5} />
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleContinueToScene}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 24px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--accent-emerald)',
                color: '#030712',
                fontWeight: 600,
                fontSize: '13.5px',
                boxShadow: '0 0 14px rgba(16, 185, 129, 0.3)',
                cursor: 'pointer',
              }}
            >
              <span>View 3D Scene</span>
              <ArrowRight size={15} strokeWidth={2.5} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

