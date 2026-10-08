import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Smartphone,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { useScanContext } from '../context/ScanContext';

export const ConnectPhonePage: React.FC = () => {
  const navigate = useNavigate();
  const { scanState, connectPhone } = useScanContext();

  const handleContinue = () => {
    navigate('/capture');
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
              Step 2 of 6
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
              Connect Your Phone
            </h2>
          </div>

          <button
            onClick={() => navigate('/new-scan')}
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

        {/* Description */}
        <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          Your phone will act as the camera while this laptop processes the scan.
        </p>

        {/* Phone Connection Box */}
        <div
          style={{
            background: 'var(--bg-surface-elevated)',
            border: '1px dashed var(--border-default)',
            borderRadius: 'var(--radius-md)',
            padding: '32px 20px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              backgroundColor: scanState.phoneConnected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: scanState.phoneConnected ? 'var(--accent-emerald)' : 'var(--text-muted)',
            }}
          >
            <Smartphone size={22} />
          </div>

          <div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
              {scanState.phoneConnected ? 'Phone Connected' : 'Phone connection will be available here.'}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Status: <span style={{ color: scanState.phoneConnected ? 'var(--accent-emerald)' : 'var(--text-secondary)', fontWeight: 600 }}>{scanState.phoneConnected ? 'Connected' : 'Not connected'}</span>
            </div>
          </div>

          {!scanState.phoneConnected && (
            <button
              onClick={connectPhone}
              style={{
                fontSize: '11.5px',
                color: 'var(--accent-cyan)',
                textDecoration: 'underline',
                marginTop: '4px',
              }}
            >
              Simulate Connection for Testing
            </button>
          )}
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
            <span>Continue to Capture</span>
            <ArrowRight size={15} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
};
