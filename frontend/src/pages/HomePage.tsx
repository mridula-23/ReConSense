import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layers,
  FolderOpen,
  ArrowRight,
  Box,
} from 'lucide-react';
import { useScanContext } from '../context/ScanContext';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { previousScans, setReconstructionMode } = useScanContext();

  const handleEnterReConSense = () => {
    setReconstructionMode('reconsense');
    navigate('/reconsense');
  };

  const handleEnterBaseline = () => {
    setReconstructionMode('baseline');
    navigate('/baseline');
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
        padding: '40px 20px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '680px',
          display: 'flex',
          flexDirection: 'column',
          gap: '36px',
        }}
      >
        {/* Brand & Hero */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: '0 0 24px rgba(56, 189, 248, 0.35)',
            }}
          >
            <Layers size={24} strokeWidth={2.4} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <h1 style={{ fontSize: '30px', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
              ReConSense
            </h1>
            <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--accent-cyan)' }}>
              Observation-aware 3D reconstruction
            </div>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', maxWidth: '440px', lineHeight: 1.5, marginTop: '2px' }}>
              Turn a short room video into an interactive 3D scene.
            </p>
          </div>

          {/* Mode Selection Cards */}
          <div
            style={{
              width: '100%',
              marginTop: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              textAlign: 'left',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Select Reconstruction Mode
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '14px',
              }}
            >
              {/* Option 1: ReConSense */}
              <div
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid rgba(56, 189, 248, 0.4)',
                  borderRadius: 'var(--radius-md)',
                  padding: '20px 18px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '14px',
                  boxShadow: '0 0 18px rgba(56, 189, 248, 0.1)',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-cyan)' }}>
                    <Layers size={18} />
                    <span style={{ fontSize: '15px', fontWeight: 600 }}>ReConSense</span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.45, margin: 0 }}>
                    Observation-aware reconstruction with coverage analysis, camera guidance, refinement and AI completion.
                  </p>
                </div>

                <button
                  onClick={handleEnterReConSense}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    width: '100%',
                    padding: '9px 14px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--accent-cyan)',
                    color: '#030712',
                    fontWeight: 600,
                    fontSize: '12.5px',
                    cursor: 'pointer',
                    boxShadow: '0 0 10px rgba(56, 189, 248, 0.25)',
                  }}
                >
                  <span>Enter ReConSense</span>
                  <ArrowRight size={14} />
                </button>
              </div>

              {/* Option 2: Original Baseline */}
              <div
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-md)',
                  padding: '20px 18px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '14px',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                    <Box size={18} style={{ color: 'var(--text-secondary)' }} />
                    <span style={{ fontSize: '15px', fontWeight: 600 }}>Original Baseline</span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.45, margin: 0 }}>
                    Standard video-to-3D reconstruction without ReConSense observation and guidance features.
                  </p>
                </div>

                <button
                  onClick={handleEnterBaseline}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    width: '100%',
                    padding: '9px 14px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    fontWeight: 600,
                    fontSize: '12.5px',
                    cursor: 'pointer',
                  }}
                >
                  <span>Enter Original Baseline</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Previous Scans Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Previous Scans
          </div>

          {previousScans.length === 0 ? (
            <div
              style={{
                background: 'var(--bg-surface)',
                border: '1px dashed var(--border-default)',
                borderRadius: 'var(--radius-md)',
                padding: '24px',
                textAlign: 'center',
                color: 'var(--text-muted)',
                fontSize: '12.5px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <FolderOpen size={20} />
              <span>No previous scans yet.</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {previousScans.map((scan) => (
                <div
                  key={scan.id}
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Box size={16} style={{ color: 'var(--accent-cyan)' }} />
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{scan.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Created {scan.date}</div>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate('/scene')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: 'var(--accent-cyan)',
                      fontSize: '12px',
                      fontWeight: 500,
                    }}
                  >
                    <span>Open 3D Scene</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
