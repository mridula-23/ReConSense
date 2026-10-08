import React from 'react';
import {
  Layers,
  Plus,
  Box,
  FolderOpen,
  ArrowRight,
  Sparkles,
  Camera,
} from 'lucide-react';
import { useScanContext } from '../context/ScanContext';

export const HomeView: React.FC = () => {
  const { startNewScan, loadDemoSample, previousScans, setActiveSession, setCurrentScreen } = useScanContext();

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: 'var(--bg-app)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '30px 20px',
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '780px',
          display: 'flex',
          flexDirection: 'column',
          gap: '36px',
        }}
      >
        {/* Hero Title & Subtitle */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: '0 0 20px rgba(56, 189, 248, 0.35)',
            }}
          >
            <Layers size={24} strokeWidth={2.4} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <h1
              style={{
                fontSize: '32px',
                fontWeight: 700,
                letterSpacing: '-0.03em',
                color: 'var(--text-primary)',
              }}
            >
              ReConSense
            </h1>
            <p
              style={{
                fontSize: '15px',
                color: 'var(--text-secondary)',
                maxWidth: '480px',
                lineHeight: 1.5,
              }}
            >
              Turn a phone video of any indoor room into an interactive, observation-aware 3D scene.
            </p>
          </div>

          {/* Primary Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '10px' }}>
            <button
              onClick={() => startNewScan('Living Room Scan', 'Living Room')}
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
                boxShadow: '0 0 16px rgba(56, 189, 248, 0.35)',
              }}
            >
              <Plus size={16} strokeWidth={2.5} />
              <span>Start New Scan</span>
            </button>

            <button
              onClick={loadDemoSample}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-default)',
                color: 'var(--text-primary)',
                fontWeight: 500,
                fontSize: '13.5px',
              }}
            >
              <Sparkles size={16} style={{ color: 'var(--accent-indigo)' }} />
              <span>Try Demo Sample</span>
            </button>
          </div>
        </div>

        {/* How it Works / Workflow Overview */}
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
              <span>1. Capture Video</span>
            </div>
            <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
              Walk through the room with your phone to record a smooth sweep.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-emerald)', fontSize: '12px', fontWeight: 600 }}>
              <Box size={15} />
              <span>2. 3D Reconstruction</span>
            </div>
            <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
              Automated camera pose alignment, moving object removal, and 3D surface generation.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-indigo)', fontSize: '12px', fontWeight: 600 }}>
              <Sparkles size={15} />
              <span>3. Coverage & AI Fill</span>
            </div>
            <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
              Identifies unseen blindspots and uses generative AI to complete the scene.
            </p>
          </div>
        </div>

        {/* Previous Scans Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Previous Room Scans
            </span>
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
              <FolderOpen size={22} style={{ color: 'var(--text-muted)' }} />
              <div>Your previous scans will appear here.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {previousScans.map((scan) => (
                <div
                  key={scan.id}
                  onClick={() => {
                    setActiveSession(scan);
                    setCurrentScreen('workspace');
                  }}
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'border-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent-cyan)')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Box size={16} style={{ color: 'var(--accent-cyan)' }} />
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{scan.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{scan.roomType} • Created {scan.createdAt}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-cyan)', fontSize: '12px', fontWeight: 500 }}>
                    <span>Open 3D View</span>
                    <ArrowRight size={14} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
