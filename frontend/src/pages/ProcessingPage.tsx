import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Loader2,
  CheckCircle2,
  Circle,
  ArrowRight,
  ArrowLeft,
  Smartphone,
  FileVideo,
} from 'lucide-react';
import { useScanContext } from '../context/ScanContext';

export const ProcessingPage: React.FC = () => {
  const navigate = useNavigate();
  const { scanState } = useScanContext();

  const isUpload = scanState.inputSource === 'upload';

  const handleContinue = () => {
    navigate('/scene');
  };

  const handleBack = () => {
    if (isUpload) {
      navigate('/upload');
    } else {
      navigate('/capture');
    }
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
              Reconstruction Pipeline
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
              Building Your 3D Scene
            </h2>
          </div>

          <button
            onClick={handleBack}
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

        {/* Input Source & Status Badge */}
        <div
          style={{
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {isUpload ? (
              <FileVideo size={18} style={{ color: 'var(--accent-cyan)' }} />
            ) : (
              <Smartphone size={18} style={{ color: 'var(--accent-emerald)' }} />
            )}
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Source
              </div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {isUpload ? 'Uploaded Video' : 'Phone Capture'}
              </div>
            </div>
          </div>

          <div
            className="font-mono"
            style={{
              fontSize: '11px',
              padding: '4px 8px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(56, 189, 248, 0.1)',
              color: 'var(--accent-cyan)',
              border: '1px solid rgba(56, 189, 248, 0.2)',
            }}
          >
            {isUpload && scanState.uploadedVideoName ? 'Video ready' : 'Ready for processing'}
          </div>
        </div>

        {/* Processing Sequence List */}
        <div
          style={{
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          {/* Step 1 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <CheckCircle2 size={18} style={{ color: 'var(--accent-emerald)', flexShrink: 0 }} />
            <span style={{ fontSize: '13.5px', color: 'var(--text-primary)', fontWeight: 500 }}>
              Preparing video
            </span>
          </div>

          {/* Step 2 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Loader2 size={18} className="spin-animation" style={{ color: 'var(--accent-cyan)', flexShrink: 0 }} />
            <span style={{ fontSize: '13.5px', color: 'var(--text-primary)', fontWeight: 600 }}>
              Building the scene
            </span>
          </div>

          {/* Step 3 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Circle size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <span style={{ fontSize: '13.5px', color: 'var(--text-muted)' }}>
              Checking room coverage
            </span>
          </div>

          {/* Step 4 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Circle size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <span style={{ fontSize: '13.5px', color: 'var(--text-muted)' }}>
              Detecting moving objects
            </span>
          </div>
        </div>

        {/* Honest System Notice */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px dashed var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '12px 14px',
            fontSize: '12px',
            color: 'var(--text-muted)',
            textAlign: 'center',
          }}
        >
          {isUpload
            ? 'Processing will begin when the video processing service is connected.'
            : 'Processing services are not connected yet.'}
        </div>

        {/* Actions */}
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
            <span>Continue to Scene</span>
            <ArrowRight size={15} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
};
