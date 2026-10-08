import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  PieChart,
  Sparkles,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { SceneViewer } from '../components/SceneViewer';
import { useScanContext } from '../context/ScanContext';

export const ScenePage: React.FC = () => {
  const navigate = useNavigate();
  const {
    viewportMode,
    setViewportMode,
    movingObjects,
    loadDemoSample,
    isDemoSampleLoaded,
    reconstructionResult,
    reconstructionStage,
    reconstructionError,
    reconstructionMode,
  } = useScanContext();

  const [showAdvanced, setShowAdvanced] = useState(false);

  const hasRealReconstruction = Boolean(
    reconstructionResult && reconstructionResult.points_3d > 0 && reconstructionStage === 'completed'
  );

  const isFailed = reconstructionStage === 'failed' || Boolean(reconstructionError);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        padding: '12px',
        gap: '12px',
        overflow: 'hidden',
      }}
    >
      {/* 3D Scene Viewer - Hero Workspace */}
      <div
        style={{
          flex: 1,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
        }}
      >
        <SceneViewer
          mode={viewportMode}
          onModeChange={setViewportMode}
          movingObjects={movingObjects}
        />
      </div>

      {/* Right Side Status Panel */}
      <div
        style={{
          width: '320px',
          height: '100%',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '16px',
          overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--accent-cyan)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Step 4 of 8 • {reconstructionMode === 'baseline' ? 'Original Baseline Scene' : 'ReConSense Scene'}
            </div>
            <h2 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
              3D Scene
            </h2>
          </div>

          {/* Scene Status Card */}
          <div
            style={{
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Scene Status
            </div>
            <div
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: hasRealReconstruction || isDemoSampleLoaded
                  ? 'var(--accent-emerald)'
                  : isFailed
                  ? 'var(--accent-rose)'
                  : 'var(--text-secondary)',
              }}
            >
              {hasRealReconstruction
                ? '3D reconstruction ready'
                : isDemoSampleLoaded
                ? 'Interactive 3D Room (Demo)'
                : isFailed
                ? '3D reconstruction could not be completed.'
                : 'Waiting for reconstruction'}
            </div>
          </div>

          {/* Failed Notice with Guidance */}
          {isFailed && (
            <div
              style={{
                background: 'rgba(244, 63, 94, 0.08)',
                border: '1px solid rgba(244, 63, 94, 0.25)',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 12px',
                fontSize: '12px',
                color: 'var(--text-muted)',
                lineHeight: 1.4,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-rose)', fontWeight: 600, marginBottom: '4px' }}>
                <AlertCircle size={14} />
                <span>Reconstruction Notice</span>
              </div>
              Try a video with more movement around the room and fewer blurred frames.
            </div>
          )}

          {/* Real COLMAP Metrics */}
          {hasRealReconstruction && reconstructionResult && (
            <div
              style={{
                background: 'rgba(16, 185, 129, 0.05)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                borderRadius: 'var(--radius-sm)',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-emerald)', fontSize: '12px', fontWeight: 600 }}>
                <CheckCircle2 size={14} />
                <span>Real COLMAP Sparse Model</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Registered Images:</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                  {reconstructionResult.registered_images} / {reconstructionResult.total_input_images}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Sparse 3D Points:</span>
                <span style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>
                  {reconstructionResult.points_3d.toLocaleString()}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Cameras Calibrated:</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                  {reconstructionResult.camera_count}
                </span>
              </div>
            </div>
          )}

          <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.45 }}>
            Rotate, zoom, pan, or reset the viewport perspective.
          </p>

          {/* Advanced Details Collapsible */}
          {reconstructionResult && (
            <div
              style={{
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                overflow: 'hidden',
              }}
            >
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 10px',
                  background: 'var(--bg-surface-elevated)',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                }}
              >
                <span>Advanced Details</span>
                {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>

              {showAdvanced && (
                <div
                  style={{
                    padding: '10px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    fontSize: '11px',
                    background: 'var(--bg-surface)',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Pipeline:</span>
                    <span style={{ color: 'var(--accent-cyan)' }}>COLMAP 3.11</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Mode:</span>
                    <span style={{ color: 'var(--accent-cyan)' }}>
                      {reconstructionMode === 'baseline' ? 'Original Baseline' : 'ReConSense'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Status:</span>
                    <span style={{ color: 'var(--text-primary)' }}>{reconstructionResult.status}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Points:</span>
                    <span style={{ color: 'var(--accent-emerald)' }}>{reconstructionResult.points_3d}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Registered:</span>
                    <span style={{ color: 'var(--text-primary)' }}>{reconstructionResult.registered_images}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Workspace:</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '10px', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {reconstructionResult.session_id}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {!isDemoSampleLoaded && !hasRealReconstruction && (
            <button
              onClick={loadDemoSample}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '8px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--accent-indigo-subtle)',
                border: '1px solid rgba(129, 140, 248, 0.3)',
                color: 'var(--accent-indigo)',
                fontSize: '12px',
                fontWeight: 500,
              }}
            >
              <Sparkles size={14} />
              <span>Preview Demo Room</span>
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            onClick={() => navigate('/coverage')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '9px 12px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              fontSize: '12.5px',
              fontWeight: 500,
            }}
          >
            <PieChart size={15} style={{ color: 'var(--accent-emerald)' }} />
            <span>Room Coverage</span>
          </button>

          <button
            onClick={() => navigate('/coverage')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--accent-cyan)',
              color: '#030712',
              fontWeight: 600,
              fontSize: '13px',
              boxShadow: '0 0 12px rgba(56, 189, 248, 0.3)',
            }}
          >
            <span>Continue</span>
            <ArrowRight size={15} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
};


