import React, { useState } from 'react';
import {
  Smartphone,
  QrCode,
  Upload,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Video,
} from 'lucide-react';
import { useScanContext } from '../context/ScanContext';

export const NewScanView: React.FC = () => {
  const { activeSession, setActiveSession, phoneConnection, setPhoneConnection, setCurrentScreen, resetToHome } = useScanContext();
  
  const [scanName, setScanName] = useState(activeSession?.name || 'My Room Scan');
  const [roomType, setRoomType] = useState(activeSession?.roomType || 'Living Room');
  const [inputMethod, setInputMethod] = useState<'phone' | 'file'>('phone');

  const handleProceed = () => {
    if (activeSession) {
      setActiveSession({
        ...activeSession,
        name: scanName,
        roomType: roomType,
      });
    }
    setCurrentScreen('workspace');
  };

  const simulatePhonePairing = () => {
    setPhoneConnection({
      status: 'connected',
      deviceName: 'Pixel 8 Pro (Frontline Cam)',
      ipAddress: '192.168.1.144',
      videoQuality: '1080p60',
      fps: 60,
      batteryLevel: 92,
    });
  };

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
        padding: '24px',
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '640px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
        }}
      >
        {/* Header Step Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px' }}>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--accent-cyan)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Step 1 of 3
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
              Setup & Connect Phone
            </h2>
          </div>

          <button
            onClick={resetToHome}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              color: 'var(--text-muted)',
              padding: '6px 10px',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <ArrowLeft size={14} />
            <span>Back to Home</span>
          </button>
        </div>

        {/* Room Name & Type */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Scan Name
            </label>
            <input
              type="text"
              value={scanName}
              onChange={(e) => setScanName(e.target.value)}
              placeholder="e.g. Master Bedroom, Robotics Lab"
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
              <option value="Corridor / Hall">Corridor / Hall</option>
            </select>
          </div>
        </div>

        {/* Input Method Switcher */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)' }}>
            Video Source
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <button
              onClick={() => setInputMethod('phone')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px',
                borderRadius: 'var(--radius-sm)',
                background: inputMethod === 'phone' ? 'var(--bg-surface-elevated)' : 'transparent',
                border: inputMethod === 'phone' ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                color: inputMethod === 'phone' ? 'var(--text-primary)' : 'var(--text-muted)',
              }}
            >
              <Smartphone size={18} style={{ color: inputMethod === 'phone' ? 'var(--accent-cyan)' : 'inherit' }} />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '12.5px', fontWeight: 600 }}>Mobile Camera</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Scan with smartphone</div>
              </div>
            </button>

            <button
              onClick={() => setInputMethod('file')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px',
                borderRadius: 'var(--radius-sm)',
                background: inputMethod === 'file' ? 'var(--bg-surface-elevated)' : 'transparent',
                border: inputMethod === 'file' ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                color: inputMethod === 'file' ? 'var(--text-primary)' : 'var(--text-muted)',
              }}
            >
              <Upload size={18} style={{ color: inputMethod === 'file' ? 'var(--accent-cyan)' : 'inherit' }} />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '12.5px', fontWeight: 600 }}>Upload Video</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Select .mp4 or .mov</div>
              </div>
            </button>
          </div>
        </div>

        {/* Phone Pairing Box / Upload Box */}
        {inputMethod === 'phone' ? (
          <div
            style={{
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '18px',
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
            }}
          >
            <div
              style={{
                width: '100px',
                height: '100px',
                background: '#fff',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#030712',
                flexShrink: 0,
              }}
            >
              <QrCode size={80} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Pair Mobile Phone
              </div>
              <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                Open your phone's camera and scan this code to connect your live video stream.
              </p>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                {phoneConnection.status === 'connected' ? (
                  <span className="badge badge-emerald">
                    <CheckCircle2 size={12} />
                    Phone Connected ({phoneConnection.deviceName})
                  </span>
                ) : (
                  <button
                    onClick={simulatePhonePairing}
                    style={{
                      fontSize: '11px',
                      color: 'var(--accent-cyan)',
                      textDecoration: 'underline',
                    }}
                  >
                    Simulate Device Pairing for Demo
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div
            style={{
              background: 'var(--bg-surface-elevated)',
              border: '1px dashed var(--border-default)',
              borderRadius: 'var(--radius-sm)',
              padding: '24px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Video size={24} style={{ color: 'var(--accent-cyan)' }} />
            <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
              Drag and drop an indoor room video file here, or click to browse.
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Supports MP4, MOV up to 4K</span>
          </div>
        )}

        {/* Action Button to Workspace */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
          <button
            onClick={handleProceed}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 22px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--accent-cyan)',
              color: '#030712',
              fontWeight: 600,
              fontSize: '13px',
              boxShadow: '0 0 14px rgba(56, 189, 248, 0.3)',
            }}
          >
            <span>Open 3D Workspace</span>
            <ArrowRight size={15} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
};
