import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Camera,
  ArrowLeft,
  Play,
  Square,
} from 'lucide-react';
import { useScanContext } from '../context/ScanContext';

export const CapturePage: React.FC = () => {
  const navigate = useNavigate();
  const { scanState, startCapture, finishCapture } = useScanContext();

  const handleStart = () => {
    startCapture();
  };

  const handleFinish = () => {
    finishCapture();
    navigate('/processing');
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
          maxWidth: '680px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px' }}>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--accent-cyan)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Step 3 of 6
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
              Capture Room
            </h2>
          </div>

          <button
            onClick={() => navigate('/connect')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              color: 'var(--text-muted)',
            }}
          >
            <ArrowLeft size={14} />
            <span>Back</span>
          </button>
        </div>

        {/* Camera Preview Placeholder Area */}
        <div
          style={{
            height: '320px',
            width: '100%',
            backgroundColor: '#05070c',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {scanState.isCapturing ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="pulse-dot" style={{ backgroundColor: 'var(--accent-rose)', boxShadow: '0 0 10px var(--accent-rose)' }} />
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#f1f5f9' }}>Scanning...</span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Move slowly around the room and capture the walls, floor and corners.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <Camera size={32} style={{ color: 'var(--text-muted)' }} />
              <div style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>
                Camera preview will appear here.
              </div>
            </div>
          )}

          {/* Status badge in corner */}
          <div
            className="font-mono"
            style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              background: 'rgba(13, 18, 28, 0.85)',
              padding: '4px 10px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              fontSize: '11px',
              color: scanState.isCapturing ? '#fb7185' : 'var(--text-secondary)',
            }}
          >
            STATUS: {scanState.isCapturing ? 'SCANNING' : 'READY TO SCAN'}
          </div>
        </div>

        {/* Instructions */}
        <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', textAlign: 'center' }}>
          Move slowly around the room and capture the walls, floor and corners.
        </p>

        {/* Capture Controls */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', paddingTop: '6px' }}>
          {!scanState.isCapturing ? (
            <button
              onClick={handleStart}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 24px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--accent-emerald)',
                color: '#fff',
                fontWeight: 600,
                fontSize: '13.5px',
                boxShadow: '0 0 16px rgba(16, 185, 129, 0.35)',
              }}
            >
              <Play size={15} fill="#fff" />
              <span>Start Capture</span>
            </button>
          ) : (
            <button
              onClick={handleFinish}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 24px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--accent-rose)',
                color: '#fff',
                fontWeight: 600,
                fontSize: '13.5px',
                boxShadow: '0 0 16px rgba(244, 63, 94, 0.35)',
              }}
            >
              <Square size={14} fill="#fff" />
              <span>Finish Capture</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
