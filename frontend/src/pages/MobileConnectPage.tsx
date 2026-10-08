import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Camera,
  Wifi,
} from 'lucide-react';
import { connectPhoneDevice } from '../services/api';

export const MobileConnectPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const sessionId = searchParams.get('session');
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [deviceInfo, setDeviceInfo] = useState<string>('Mobile Browser');

  useEffect(() => {
    // Detect mobile device info
    const ua = navigator.userAgent;
    let model = 'Smartphone';
    if (/iPhone/i.test(ua)) model = 'iPhone Camera';
    else if (/Android/i.test(ua)) model = 'Android Phone Camera';
    else if (/iPad/i.test(ua)) model = 'iPad Camera';
    setDeviceInfo(model);

    if (!sessionId || !token) {
      setStatus('error');
      setErrorMessage('Missing session ID or pairing token in QR link. Please scan the QR code again.');
    }
  }, [sessionId, token]);

  const handleConnect = async () => {
    if (!sessionId || !token) {
      setErrorMessage('Invalid QR link parameters.');
      return;
    }

    try {
      setStatus('connecting');
      setErrorMessage(null);

      await connectPhoneDevice(sessionId, token, deviceInfo);
      setStatus('connected');
    } catch (err: unknown) {
      setStatus('error');
      const msg = err instanceof Error ? err.message : 'Unable to connect to laptop.';
      setErrorMessage(msg);
    }
  };

  const handleProceedToCapture = () => {
    navigate(`/mobile/capture?session=${sessionId}`);
  };

  return (
    <div
      style={{
        width: '100%',
        minHeight: '100vh',
        backgroundColor: '#030712',
        color: '#f3f4f6',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        fontFamily: 'var(--font-sans, system-ui, -apple-system, sans-serif)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          background: 'var(--bg-surface, #0d121c)',
          border: '1px solid var(--border-subtle, #1f293d)',
          borderRadius: '16px',
          padding: '28px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.12em',
              color: 'var(--accent-cyan, #38bdf8)',
              textTransform: 'uppercase',
            }}
          >
            ReConSense Mobile
          </div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#ffffff', margin: 0 }}>
            Phone Camera Pairing
          </h1>
          <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0, lineHeight: 1.4 }}>
            Connect this smartphone to stream camera capture into your 3D room scan.
          </p>
        </div>

        {/* Device Icon / Status Badge */}
        <div
          style={{
            background: 'var(--bg-surface-elevated, #131b2a)',
            border: '1px solid var(--border-subtle, #1f293d)',
            borderRadius: '12px',
            padding: '20px 16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              backgroundColor:
                status === 'connected'
                  ? 'rgba(16, 185, 129, 0.15)'
                  : status === 'error'
                  ? 'rgba(244, 63, 94, 0.15)'
                  : 'rgba(56, 189, 248, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color:
                status === 'connected'
                  ? '#10b981'
                  : status === 'error'
                  ? '#f43f5e'
                  : '#38bdf8',
            }}
          >
            {status === 'connected' ? (
              <CheckCircle2 size={28} />
            ) : status === 'error' ? (
              <AlertCircle size={28} />
            ) : (
              <Smartphone size={28} />
            )}
          </div>

          <div>
            <div style={{ fontSize: '15px', fontWeight: 600, color: '#f8fafc' }}>
              {status === 'connected'
                ? 'Phone Connected Successfully!'
                : status === 'connecting'
                ? 'Connecting to Laptop...'
                : status === 'error'
                ? 'Connection Failed'
                : 'Connect this phone to your laptop?'}
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
              Device: <span style={{ color: '#cbd5e1', fontWeight: 500 }}>{deviceInfo}</span>
            </div>
          </div>

          {sessionId && (
            <div
              style={{
                fontSize: '11px',
                fontFamily: 'monospace',
                color: '#64748b',
                background: '#0a0e17',
                padding: '4px 10px',
                borderRadius: '6px',
                border: '1px solid #1e293b',
              }}
            >
              Session: {sessionId}
            </div>
          )}
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div
            style={{
              background: 'rgba(244, 63, 94, 0.1)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              borderRadius: '8px',
              padding: '12px 14px',
              fontSize: '12px',
              color: '#fecdd3',
              lineHeight: 1.4,
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
              <AlertCircle size={15} style={{ color: '#f43f5e', flexShrink: 0 }} />
              <span>Pairing Error</span>
            </div>
            <div>{errorMessage}</div>
            <div style={{ fontSize: '11.5px', color: '#fda4af', marginTop: '4px' }}>
              ✓ Check that phone and laptop are on the same Wi-Fi network.
            </div>
          </div>
        )}

        {/* Action Button */}
        <div>
          {status !== 'connected' ? (
            <button
              onClick={handleConnect}
              disabled={status === 'connecting' || !sessionId || !token}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '10px',
                backgroundColor: status === 'connecting' ? '#1e293b' : '#38bdf8',
                color: status === 'connecting' ? '#94a3b8' : '#030712',
                fontWeight: 700,
                fontSize: '14px',
                border: 'none',
                cursor: status === 'connecting' ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: status === 'connecting' ? 'none' : '0 0 16px rgba(56, 189, 248, 0.4)',
                transition: 'all 0.15s ease',
              }}
            >
              {status === 'connecting' ? (
                <>
                  <Loader2 size={16} className="spin-animation" />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <Wifi size={16} />
                  <span>Connect to Laptop</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleProceedToCapture}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '10px',
                backgroundColor: '#10b981',
                color: '#030712',
                fontWeight: 700,
                fontSize: '14px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 0 16px rgba(16, 185, 129, 0.4)',
              }}
            >
              <Camera size={16} />
              <span>Open Camera View</span>
            </button>
          )}
        </div>

        {/* Local Network Info Note */}
        <div style={{ fontSize: '11px', color: '#64748b', textAlign: 'center', lineHeight: 1.4 }}>
          Connected over local network. Your video frames will be processed on your laptop with GPU acceleration.
        </div>
      </div>
    </div>
  );
};
