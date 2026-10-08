import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, Camera, Plus, ArrowLeft, ArrowRight } from 'lucide-react';
import { useScanContext } from '../context/ScanContext';

export const ReConSenseModePage: React.FC = () => {
  const navigate = useNavigate();
  const { startNewScan, setReconstructionMode } = useScanContext();

  const handleStartPhone = () => {
    setReconstructionMode('reconsense');
    startNewScan('Room Scan 01', 'Living Room', 'reconsense');
    navigate('/new-scan');
  };

  const handleStartUpload = () => {
    setReconstructionMode('reconsense');
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
          maxWidth: '680px',
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
            Active Mode: ReConSense
          </div>
        </div>

        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
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
              boxShadow: '0 0 20px rgba(56, 189, 248, 0.3)',
            }}
          >
            <Layers size={22} strokeWidth={2.4} />
          </div>

          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
              RECONSENSE
            </h1>
            <div style={{ fontSize: '13.5px', fontWeight: 500, color: 'var(--accent-cyan)', marginTop: '2px' }}>
              Observation-aware 3D reconstruction
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '480px', lineHeight: 1.45, margin: '8px auto 0' }}>
              Observation-aware reconstruction with real-time coverage analysis, active camera guidance, dynamic object filtering, and targeted refinement.
            </p>
          </div>
        </div>

        {/* Input Methods */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '14px',
            width: '100%',
          }}
        >
          {/* Scan with Phone */}
          <div
            onClick={handleStartPhone}
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              borderRadius: 'var(--radius-md)',
              padding: '22px 18px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '12px',
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
                fontSize: '15px',
                fontWeight: 600,
              }}
            >
              <Camera size={20} />
              <span>Scan with Phone</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
              Capture the room using your smartphone with live guidance.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-cyan)', fontSize: '12px', fontWeight: 500, marginTop: 'auto' }}>
              <span>Start Phone Flow</span>
              <ArrowRight size={13} />
            </div>
          </div>

          {/* Upload Video */}
          <div
            onClick={handleStartUpload}
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              padding: '22px 18px',
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
                gap: '8px',
                color: 'var(--text-primary)',
                fontSize: '15px',
                fontWeight: 600,
              }}
            >
              <Plus size={20} />
              <span>Upload Video</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
              Use a room video already saved on your computer.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-primary)', fontSize: '12px', fontWeight: 500, marginTop: 'auto' }}>
              <span>Upload Video File</span>
              <ArrowRight size={13} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
