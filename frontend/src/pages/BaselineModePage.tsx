import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Plus, ArrowLeft, ArrowRight } from 'lucide-react';
import { useScanContext } from '../context/ScanContext';

export const BaselineModePage: React.FC = () => {
  const navigate = useNavigate();
  const { setReconstructionMode } = useScanContext();

  const handleStartUpload = () => {
    setReconstructionMode('baseline');
    navigate('/upload');
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
          maxWidth: '620px',
          display: 'flex',
          flexDirection: 'column',
          gap: '28px',
        }}
      >
        {/* Header / Brand */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            onClick={() => navigate('/')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              color: 'var(--text-muted)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            <ArrowLeft size={14} />
            <span>Back to Mode Selection</span>
          </button>

          <div
            className="font-mono"
            style={{
              fontSize: '11px',
              padding: '4px 8px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(56, 189, 248, 0.1)',
              color: 'var(--accent-cyan)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
            }}
          >
            Active Mode: Original Baseline
          </div>
        </div>

        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-default)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-cyan)',
            }}
          >
            <Box size={22} />
          </div>

          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
              ORIGINAL BASELINE
            </h1>
            <div style={{ fontSize: '13.5px', fontWeight: 500, color: 'var(--accent-cyan)', marginTop: '2px' }}>
              Standard video-to-3D reconstruction
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '460px', lineHeight: 1.45, margin: '8px auto 0' }}>
              Standard video-to-3D reconstruction without ReConSense observation and guidance features.
            </p>
          </div>
        </div>

        {/* Primary Baseline Input: Upload Video */}
        <div
          onClick={handleStartUpload}
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            padding: '24px 20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '12px',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              color: 'var(--text-primary)',
              fontSize: '15px',
              fontWeight: 600,
            }}
          >
            <Plus size={20} style={{ color: 'var(--accent-cyan)' }} />
            <span>Upload Video</span>
          </div>
          <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
            Use the same room video used for the baseline comparison.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-cyan)', fontSize: '12.5px', fontWeight: 500, marginTop: '4px' }}>
            <span>Proceed to Video Upload</span>
            <ArrowRight size={14} />
          </div>
        </div>
      </div>
    </div>
  );
};
