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
  const { viewportMode, setViewportMode, movingObjects, resetAll, isDemoSampleLoaded } = useScanContext();

  const handleStartNew = () => {
    resetAll();
    navigate('/');
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
            <div style={{ fontSize: '11px', color: 'var(--accent-emerald)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Final 3D Scene
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
              Your 3D Scene
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
              {isDemoSampleLoaded ? 'Completed 3D Room' : 'Scene not available yet'}
            </div>
          </div>

          {/* Action List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
