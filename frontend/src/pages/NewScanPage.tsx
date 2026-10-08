import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Smartphone,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { useScanContext } from '../context/ScanContext';

export const NewScanPage: React.FC = () => {
  const navigate = useNavigate();
  const { scanState, setScanState, reconstructionMode, setReconstructionMode } = useScanContext();

  const [scanName, setScanName] = useState(scanState.scanName);
  const [roomType, setRoomType] = useState(scanState.roomType);
  const [mode, setMode] = useState(reconstructionMode);

  const handleContinue = () => {
    setScanState((prev) => ({
      ...prev,
      scanName,
      roomType,
      reconstructionMode: mode,
    }));
    setReconstructionMode(mode);
    navigate('/connect');
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
          maxWidth: '580px',
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
              Step 1 of 6
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
              New Scan
            </h2>
          </div>

          <button
            onClick={() => navigate('/')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              color: 'var(--text-muted)',
            }}
          >
            <ArrowLeft size={14} />
            <span>Cancel</span>
          </button>
        </div>

        {/* Description */}
        <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          Use your phone to capture the room. Your laptop will process the video and build the 3D scene.
        </p>

        {/* Form Inputs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Reconstruction Mode Selector */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Reconstruction Mode
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
              <div
                onClick={() => setMode('reconsense')}
                style={{
                  background: mode === 'reconsense' ? 'rgba(56, 189, 248, 0.08)' : 'var(--bg-surface-elevated)',
                  border: mode === 'reconsense' ? '1px solid var(--accent-cyan)' : '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: mode === 'reconsense' ? '0 0 12px rgba(56, 189, 248, 0.15)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: mode === 'reconsense' ? 'var(--accent-cyan)' : 'var(--text-primary)' }}>
                    ReConSense
                  </span>
                  <div
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      border: mode === 'reconsense' ? '3.5px solid var(--accent-cyan)' : '2px solid var(--border-default)',
                      background: mode === 'reconsense' ? '#fff' : 'transparent',
                    }}
                  />
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.35, margin: 0 }}>
                  Observation-aware reconstruction with coverage analysis & guidance.
                </p>
              </div>

              <div
                onClick={() => setMode('baseline')}
                style={{
                  background: mode === 'baseline' ? 'rgba(56, 189, 248, 0.08)' : 'var(--bg-surface-elevated)',
                  border: mode === 'baseline' ? '1px solid var(--accent-cyan)' : '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: mode === 'baseline' ? '0 0 12px rgba(56, 189, 248, 0.15)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: mode === 'baseline' ? 'var(--accent-cyan)' : 'var(--text-primary)' }}>
                    Original Baseline
                  </span>
                  <div
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      border: mode === 'baseline' ? '3.5px solid var(--accent-cyan)' : '2px solid var(--border-default)',
                      background: mode === 'baseline' ? '#fff' : 'transparent',
                    }}
                  />
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.35, margin: 0 }}>
                  Standard reconstruction without observation and guidance features.
                </p>
              </div>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Scan Name
            </label>
            <input
              type="text"
              value={scanName}
              onChange={(e) => setScanName(e.target.value)}
              placeholder="e.g. Master Bedroom, Office Suite"
              style={{
                width: '100%',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-sm)',
                padding: '9px 12px',
                color: 'var(--text-primary)',
                fontSize: '13px',
                outline: 'none',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Room Category
            </label>
            <select
              value={roomType}
              onChange={(e) => setRoomType(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-sm)',
                padding: '9px 12px',
                color: 'var(--text-primary)',
                fontSize: '13px',
                outline: 'none',
              }}
            >
              <option value="Living Room">Living Room</option>
              <option value="Bedroom">Bedroom</option>
              <option value="Office / Workspace">Office / Workspace</option>
              <option value="Lab / Classroom">Lab / Classroom</option>
              <option value="Hallway / Corridor">Hallway / Corridor</option>
            </select>
          </div>
        </div>

        {/* Next Step Note */}
        <div
          style={{
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '12px',
            color: 'var(--text-secondary)',
          }}
        >
          <Smartphone size={16} style={{ color: 'var(--accent-cyan)', flexShrink: 0 }} />
          <span>Next: Connect your phone to use as a mobile camera.</span>
        </div>

        {/* Bottom Actions */}
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
