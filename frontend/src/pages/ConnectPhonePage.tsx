import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';
import {
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Wifi,
  ShieldCheck,
} from 'lucide-react';
import { useScanContext } from '../context/ScanContext';
import {
  createPairingSession,
  fetchPairingStatus,
  getPairingWebSocketUrl,
  type PairingSessionResponse,
} from '../services/api';

export const ConnectPhonePage: React.FC = () => {
  const navigate = useNavigate();
  const {
    scanState,
    setScanState,
    setPhoneConnection,
    activeSession,
  } = useScanContext();

  const [pairingSession, setPairingSession] = useState<PairingSessionResponse | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [connectionStatus, setConnectionStatus] = useState<'waiting' | 'connecting' | 'connected' | 'expired' | 'error'>('waiting');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(300);
  const [deviceInfo, setDeviceInfo] = useState<string | null>(null);

  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // Initialize or regenerate pairing session
  const initPairing = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setConnectionStatus('waiting');

    try {
      const sessionId = activeSession?.id || scanState.sessionId || undefined;
      const port = window.location.port ? parseInt(window.location.port, 10) : 5173;
      const session = await createPairingSession(sessionId, port);

      setPairingSession(session);
      setTimeLeft(session.expires_in || 300);

      // Check if LAN IP is detected
      if (!session.lan_ip) {
        setErrorMessage(
          'Unable to determine your laptop\'s local network address. Make sure your laptop is connected to Wi-Fi or Ethernet.'
        );
      }

      // Generate real QR code image
      const dataUrl = await QRCode.toDataURL(session.qr_url, {
        width: 220,
        margin: 2,
        color: {
          dark: '#030712',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'M',
      });
      setQrDataUrl(dataUrl);

      // Update scanState sessionId
      setScanState((prev) => ({
        ...prev,
        sessionId: session.session_id,
      }));

      setIsLoading(false);
    } catch (err: unknown) {
      setIsLoading(false);
      setConnectionStatus('error');
      const msg = err instanceof Error ? err.message : 'Failed to initialize phone pairing session.';
      setErrorMessage(msg);
    }
  }, [activeSession, scanState.sessionId, setScanState]);

  // Handle successful phone connection
  const handlePhoneConnected = useCallback((device: string = 'Smartphone Camera') => {
    setConnectionStatus('connected');
    setDeviceInfo(device);
    setScanState((prev) => ({
      ...prev,
      phoneConnected: true,
      captureStatus: 'ready',
    }));
    setPhoneConnection({
      connected: true,
      deviceId: device,
      deviceType: 'Smartphone',
    });

    if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
  }, [setScanState, setPhoneConnection]);

  // Initial load
  useEffect(() => {
    initPairing();

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, [initPairing]);

  // Setup WebSocket and fallback polling once pairing session is created
  useEffect(() => {
    if (!pairingSession || connectionStatus === 'connected') return;

    const sessionId = pairingSession.session_id;

    // 1. WebSocket real-time connection
    try {
      const wsUrl = getPairingWebSocketUrl(sessionId);
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.event === 'phone_connected' || data.session?.status === 'connected') {
            handlePhoneConnected(data.device_info || data.session?.device_info || 'Smartphone Camera');
          }
        } catch {
          // ignore non-json messages
        }
      };
    } catch {
      // WebSocket failure falls back to HTTP polling seamlessly
    }

    // 2. HTTP Polling fallback (every 1.5 seconds)
    pollTimerRef.current = setInterval(async () => {
      try {
        const res = await fetchPairingStatus(sessionId);
        if (res.status === 'connected') {
          handlePhoneConnected(res.device_info || 'Smartphone Camera');
        } else if (res.status === 'expired') {
          setConnectionStatus('expired');
          if (pollTimerRef.current) clearInterval(pollTimerRef.current);
        }
      } catch {
        // Polling retry
      }
    }, 1500);

    // 3. Countdown timer for TTL
    countdownTimerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setConnectionStatus('expired');
          if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
          if (pollTimerRef.current) clearInterval(pollTimerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, [pairingSession, connectionStatus, handlePhoneConnected]);

  const handleContinue = () => {
    navigate('/capture');
  };

  const formatCountdown = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const isConnected = connectionStatus === 'connected' || scanState.phoneConnected;

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
          maxWidth: '620px',
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
              Phone Capture Flow • Step 2 of 6
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
          Scan the QR code with your phone camera to pair it as the room video capture device.
        </p>

        {/* Main Pairing Box */}
        <div
          style={{
            background: 'var(--bg-surface-elevated)',
            border: `1px solid ${isConnected ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-subtle)'}`,
            borderRadius: 'var(--radius-md)',
            padding: '24px 20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            textAlign: 'center',
            position: 'relative',
          }}
        >
          {isLoading ? (
            <div style={{ height: '220px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <Loader2 size={28} className="spin-animation" style={{ color: 'var(--accent-cyan)' }} />
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Detecting local network & generating pairing QR...
              </div>
            </div>
          ) : isConnected ? (
            // Connected State
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '14px',
                padding: '16px 0',
              }}
            >
              <div
                style={{
                  width: '58px',
                  height: '58px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-emerald)',
                }}
              >
                <CheckCircle2 size={32} />
              </div>

              <div>
                <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Phone Connected Successfully
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  {deviceInfo || 'Smartphone Camera'} is paired and ready for capture.
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(16, 185, 129, 0.08)',
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  fontSize: '12px',
                  color: 'var(--accent-emerald)',
                }}
              >
                <ShieldCheck size={14} />
                <span>Local encrypted session active</span>
              </div>
            </div>
          ) : connectionStatus === 'expired' ? (
            // Expired State
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
                padding: '24px 0',
              }}
            >
              <AlertCircle size={36} style={{ color: 'var(--accent-amber)' }} />
              <div>
                <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  QR Code Expired
                </div>
                <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  The 5-minute security pairing token has expired. Generate a new QR code to continue.
                </div>
              </div>

              <button
                onClick={initPairing}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--accent-cyan)',
                  color: '#030712',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  marginTop: '6px',
                }}
              >
                <RotateCcw size={14} />
                <span>Generate New QR</span>
              </button>
            </div>
          ) : (
            // Active Waiting State with QR
            <>
              <div
                style={{
                  background: '#ffffff',
                  padding: '10px',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
                  display: 'inline-block',
                }}
              >
                {qrDataUrl && (
                  <img
                    src={qrDataUrl}
                    alt="ReConSense Phone Pairing QR Code"
                    style={{ width: '190px', height: '190px', display: 'block' }}
                  />
                )}
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <Loader2 size={14} className="spin-animation" style={{ color: 'var(--accent-cyan)' }} />
                  <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Waiting for phone...
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Scan the QR code with your phone camera to connect.
                </div>
              </div>

              {/* TTL and Network info pill */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  fontSize: '11.5px',
                  color: 'var(--text-muted)',
                  fontFamily: 'var(--font-mono)',
                  background: 'var(--bg-surface)',
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Wifi size={12} style={{ color: 'var(--accent-cyan)' }} />
                  <span>LAN IP: {pairingSession?.lan_ip || '127.0.0.1'}</span>
                </div>

                <div style={{ width: '1px', height: '12px', background: 'var(--border-subtle)' }} />

                <div>
                  <span>Expires in: </span>
                  <span style={{ color: timeLeft < 60 ? 'var(--accent-amber)' : 'var(--text-primary)', fontWeight: 600 }}>
                    {formatCountdown(timeLeft)}
                  </span>
                </div>
              </div>

              <button
                onClick={initPairing}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '11.5px',
                  color: 'var(--accent-cyan)',
                  cursor: 'pointer',
                  background: 'none',
                  border: 'none',
                  padding: '2px 6px',
                }}
              >
                <RotateCcw size={12} />
                <span>Regenerate QR</span>
              </button>
            </>
          )}
        </div>

        {/* Diagnostic Wi-Fi Box when waiting */}
        {!isConnected && (
          <div
            style={{
              background: 'rgba(56, 189, 248, 0.04)',
              border: '1px solid rgba(56, 189, 248, 0.15)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px 14px',
              fontSize: '11.5px',
              color: 'var(--text-muted)',
              lineHeight: 1.45,
            }}
          >
            <div style={{ color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '4px' }}>
              Connection checklist:
            </div>
            <div>✓ Ensure phone and laptop are connected to the same Wi-Fi network.</div>
            <div>✓ Windows Firewall allows inbound connections to ReConSense (port 8000 & 5173).</div>
            <div>✓ Wi-Fi router does not enforce AP client isolation.</div>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div
            style={{
              background: 'rgba(244, 63, 94, 0.1)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '12px',
              color: '#fecdd3',
            }}
          >
            <AlertCircle size={16} style={{ color: 'var(--accent-rose)', flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}>
          <button
            onClick={handleContinue}
            disabled={!isConnected}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 22px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: isConnected ? 'var(--accent-cyan)' : 'var(--bg-surface-elevated)',
              color: isConnected ? '#030712' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '13.5px',
              cursor: isConnected ? 'pointer' : 'not-allowed',
              border: isConnected ? 'none' : '1px solid var(--border-subtle)',
              boxShadow: isConnected ? '0 0 14px rgba(56, 189, 248, 0.3)' : 'none',
              transition: 'all 0.15s ease',
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
