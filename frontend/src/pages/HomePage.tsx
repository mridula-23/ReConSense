import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layers,
  Plus,
  FolderOpen,
  ArrowRight,
  Camera,
  Box,
  Sparkles,
} from 'lucide-react';
import { useScanContext } from '../context/ScanContext';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { previousScans, startNewScan, reconstructionMode, setReconstructionMode } = useScanContext();

  const handleStartScan = () => {
    startNewScan('Room Scan 01', 'Living Room', reconstructionMode);
    navigate('/new-scan');
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
          maxWidth: '720px',
          display: 'flex',
          flexDirection: 'column',
          gap: '36px',
        }}
      >
        {/* Brand & Hero */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
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
            <h1 style={{ fontSize: '32px', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
              ReConSense
            </h1>
            <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--accent-cyan)' }}>
              Observation-aware 3D reconstruction
            </div>
            <p style={{ fontSize: '15px', color: 'var(--text-secondary)', maxWidth: '440px', lineHeight: 1.5, marginTop: '4px' }}>
              Turn a short room video into an interactive 3D scene.
            </p>
          </div>

          {/* Reconstruction Mode Selector */}
          <div
            style={{
              width: '100%',
              maxWidth: '620px',
              marginTop: '10px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              textAlign: 'left',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Reconstruction Mode
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px',
              }}
            >
              {/* Option 1: ReConSense (Default) */}
              <div
                onClick={() => setReconstructionMode('reconsense')}
                style={{
                  background: reconstructionMode === 'reconsense' ? 'rgba(56, 189, 248, 0.08)' : 'var(--bg-surface)',
                  border: reconstructionMode === 'reconsense' ? '1px solid var(--accent-cyan)' : '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: reconstructionMode === 'reconsense' ? '0 0 16px rgba(56, 189, 248, 0.15)' : 'none',
                  position: 'relative',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: '13.5px', fontWeight: 600, color: reconstructionMode === 'reconsense' ? 'var(--accent-cyan)' : 'var(--text-primary)' }}>
                    ReConSense
                  </div>
                  <div
                    style={{
                      width: '14px',
                      height: '14px',
                      borderRadius: '50%',
                      border: reconstructionMode === 'reconsense' ? '4px solid var(--accent-cyan)' : '2px solid var(--border-default)',
                      background: reconstructionMode === 'reconsense' ? '#fff' : 'transparent',
                    }}
                  />
                </div>
                <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
                  Observation-aware reconstruction with coverage analysis, camera guidance, refinement and AI completion.
                </p>
              </div>

              {/* Option 2: Original Baseline */}
              <div
                onClick={() => setReconstructionMode('baseline')}
                style={{
                  background: reconstructionMode === 'baseline' ? 'rgba(56, 189, 248, 0.08)' : 'var(--bg-surface)',
                  border: reconstructionMode === 'baseline' ? '1px solid var(--accent-cyan)' : '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: reconstructionMode === 'baseline' ? '0 0 16px rgba(56, 189, 248, 0.15)' : 'none',
                  position: 'relative',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: '13.5px', fontWeight: 600, color: reconstructionMode === 'baseline' ? 'var(--accent-cyan)' : 'var(--text-primary)' }}>
                    Original Baseline
                  </div>
                  <div
                    style={{
                      width: '14px',
                      height: '14px',
                      borderRadius: '50%',
                      border: reconstructionMode === 'baseline' ? '4px solid var(--accent-cyan)' : '2px solid var(--border-default)',
                      background: reconstructionMode === 'baseline' ? '#fff' : 'transparent',
                    }}
                  />
                </div>
                <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
                  Standard reconstruction without ReConSense observation and guidance features.
                </p>
              </div>
            </div>
          </div>

          {/* Start Options */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '14px',
              width: '100%',
              maxWidth: '620px',
              marginTop: '4px',
            }}
          >
            {/* Primary: Scan with Phone */}
            <div
              onClick={handleStartScan}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                borderRadius: 'var(--radius-md)',
                padding: '18px 16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                textAlign: 'left',
                gap: '10px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: '0 0 16px rgba(56, 189, 248, 0.12)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#38bdf8',
                  fontSize: '14px',
                  fontWeight: 600,
                }}
              >
                <Camera size={18} />
                <span>Scan with Phone</span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
                Capture the room using your phone.
              </p>
            </div>

            {/* Secondary: Upload Video */}
            <div
              onClick={() => navigate('/upload')}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
                padding: '18px 16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                textAlign: 'left',
                gap: '10px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  fontWeight: 600,
                }}
              >
                <Plus size={18} />
                <span>Upload Video</span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
                Use a room video already saved on your computer.
              </p>
            </div>
          </div>
        </div>

        {/* Workflow Overview */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '18px',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-cyan)', fontSize: '12px', fontWeight: 600 }}>
              <Camera size={15} />
              <span>1. Capture Room</span>
            </div>
            <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
              Record a video sweep of the indoor space with your smartphone.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-emerald)', fontSize: '12px', fontWeight: 600 }}>
              <Box size={15} />
              <span>2. Build 3D Scene</span>
            </div>
            <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
              Laptop processes camera paths and builds the 3D room geometry.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-indigo)', fontSize: '12px', fontWeight: 600 }}>
              <Sparkles size={15} />
              <span>3. Room Coverage</span>
            </div>
            <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
              Inspect seen vs unseen areas and fill missing spots.
            </p>
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
