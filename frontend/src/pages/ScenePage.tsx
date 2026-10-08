import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  PieChart,
  Sparkles,
} from 'lucide-react';
import { SceneViewer } from '../components/SceneViewer';
import { useScanContext } from '../context/ScanContext';

export const ScenePage: React.FC = () => {
  const navigate = useNavigate();
  const { viewportMode, setViewportMode, movingObjects, loadDemoSample, isDemoSampleLoaded } = useScanContext();

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
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--accent-cyan)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Step 4 of 8
            </div>
            <h2 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
              3D Scene
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
              {isDemoSampleLoaded ? 'Interactive 3D Room' : 'Waiting for reconstruction'}
            </div>
          </div>

          <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.45 }}>
            Rotate, zoom, pan, or reset the viewport perspective.
          </p>

          {!isDemoSampleLoaded && (
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

