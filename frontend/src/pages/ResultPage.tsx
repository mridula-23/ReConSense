import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Download,
  PieChart,
  UserX,
  Plus,
  Home,
} from 'lucide-react';
import { SceneViewer } from '../components/SceneViewer';
import { useScanContext } from '../context/ScanContext';

export const ResultPage: React.FC = () => {
  const navigate = useNavigate();
  const { viewportMode, setViewportMode, movingObjects, resetAll, isDemoSampleLoaded, reconstructionMode } = useScanContext();

  const isBaseline = reconstructionMode === 'baseline';

  const handleStartNew = () => {
    resetAll();
    navigate(isBaseline ? '/baseline' : '/reconsense');
  };

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
      {/* 3D Scene Viewer */}
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

      {/* Right Side Control Panel */}
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
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <div style={{ fontSize: '11px', color: isBaseline ? 'var(--accent-amber)' : 'var(--accent-emerald)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {isBaseline ? 'Baseline 3D Scene' : 'ReConSense 3D Scene'}
              </div>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  padding: '2px 7px',
                  borderRadius: '999px',
                  border: `1px solid ${isBaseline ? 'rgba(245, 158, 11, 0.4)' : 'rgba(56, 189, 248, 0.4)'}`,
                  background: isBaseline ? 'rgba(245, 158, 11, 0.1)' : 'rgba(56, 189, 248, 0.1)',
                  color: isBaseline ? 'var(--accent-amber)' : 'var(--accent-cyan)',
                  textTransform: 'uppercase',
                }}
              >
                {isBaseline ? 'Original Baseline' : 'ReConSense'}
              </span>
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
              {isBaseline ? 'Standard Reconstruction' : 'Refined 3D Scene'}
            </h2>
          </div>

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
            <div style={{ fontSize: '13px', fontWeight: 600, color: isDemoSampleLoaded ? 'var(--accent-emerald)' : 'var(--text-secondary)' }}>
              {isDemoSampleLoaded ? (isBaseline ? 'Standard Baseline Reconstructed' : 'Completed 3D Room') : 'Scene not available yet'}
            </div>
          </div>

          {/* Action List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {!isBaseline && (
              <>
                <button
                  onClick={() => navigate('/coverage')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '9px 12px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    fontSize: '12px',
                    textAlign: 'left',
                  }}
                >
                  <PieChart size={15} style={{ color: 'var(--accent-emerald)' }} />
                  <span>View Coverage</span>
                </button>

                <button
                  onClick={() => navigate('/scene')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '9px 12px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    fontSize: '12px',
                    textAlign: 'left',
                  }}
                >
                  <UserX size={15} style={{ color: 'var(--accent-rose)' }} />
                  <span>View Moving Objects</span>
                </button>
              </>
            )}

            <button
              onClick={() => navigate('/research')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 12px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                fontSize: '12px',
                textAlign: 'left',
              }}
            >
              <PieChart size={15} style={{ color: 'var(--accent-cyan)' }} />
              <span>Research Comparison</span>
            </button>

            <button
              disabled={!isDemoSampleLoaded}
              title={!isDemoSampleLoaded ? 'Available after reconstruction' : 'Export 3D Model'}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 12px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                color: isDemoSampleLoaded ? 'var(--text-primary)' : 'var(--text-muted)',
                fontSize: '12px',
                cursor: isDemoSampleLoaded ? 'pointer' : 'not-allowed',
                textAlign: 'left',
              }}
            >
              <Download size={15} style={{ color: isDemoSampleLoaded ? 'var(--accent-cyan)' : 'var(--text-muted)' }} />
              <span>{isDemoSampleLoaded ? 'Export 3D Model (.GLB)' : 'Export 3D Model (Available after reconstruction)'}</span>
            </button>
          </div>
        </div>

        {/* Bottom Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            onClick={handleStartNew}
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
            <Plus size={15} />
            <span>Start New Scan</span>
          </button>

          <button
            onClick={() => navigate('/')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '9px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'transparent',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              fontSize: '12.5px',
            }}
          >
            <Home size={14} />
            <span>Return to Home</span>
          </button>
        </div>
      </div>
    </div>
  );
};
