import React from 'react';
import {
  Layers,
  Smartphone,
  Cpu,
  Radio,
  Sliders,
} from 'lucide-react';
import type { SystemHardwareMetrics, SessionInfo, MobileDeviceConnection } from '../types/dashboard';

interface HeaderProps {
  sessionInfo: SessionInfo;
  hardwareMetrics: SystemHardwareMetrics;
  deviceConnection: MobileDeviceConnection;
  isStreaming: boolean;
  onToggleStream?: () => void;
  onOpenSettings?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  sessionInfo,
  hardwareMetrics,
  deviceConnection,
  isStreaming,
  onToggleStream,
  onOpenSettings,
}) => {
  return (
    <header
      style={{
        height: '56px',
        minHeight: '56px',
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        gap: '20px',
        zIndex: 50,
      }}
    >
      {/* Brand & Subtitle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            width: '28px',
            height: '28px',
            borderRadius: 'var(--radius-sm)',
            background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 0 10px rgba(56, 189, 248, 0.3)',
          }}
        >
          <Layers size={16} strokeWidth={2.4} />
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontSize: '15px',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                color: 'var(--text-primary)',
              }}
            >
              ReConSense
            </span>
            <span
              className="font-mono"
              style={{
                fontSize: '10px',
                padding: '1px 6px',
                borderRadius: '3px',
                background: 'var(--accent-cyan-subtle)',
                color: 'var(--accent-cyan)',
                border: '1px solid rgba(56, 189, 248, 0.2)',
                fontWeight: 600,
              }}
            >
              WORKSTATION
            </span>
          </div>
          <div
            style={{
              fontSize: '10.5px',
              color: 'var(--text-muted)',
              lineHeight: 1.1,
            }}
          >
            Observation-aware 3D indoor scene reconstruction
          </div>
        </div>
      </div>

      {/* Center & Right Status Elements */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Session ID Pill */}
        <div
          className="font-mono"
          style={{
            fontSize: '11.5px',
            color: 'var(--text-secondary)',
            background: 'var(--bg-surface-elevated)',
            padding: '4px 10px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span style={{ color: 'var(--text-muted)' }}>SESSION</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{sessionInfo.sessionId}</span>
        </div>

        {/* Mobile Pairing Status Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
            background: 'var(--bg-surface-elevated)',
            padding: '4px 10px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
            fontSize: '11.5px',
            fontFamily: 'var(--font-mono)',
          }}
        >
          <Smartphone size={13} style={{ color: 'var(--accent-cyan)' }} />
          <span style={{ color: 'var(--text-secondary)' }}>{deviceConnection.deviceName.split(' ')[0]}</span>
          <span className="pulse-dot" />
          <span style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>SYNCED</span>
        </div>

        {/* GPU Status Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
            background: 'var(--bg-surface-elevated)',
            padding: '4px 10px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
            fontSize: '11.5px',
            fontFamily: 'var(--font-mono)',
          }}
        >
          <Cpu size={13} style={{ color: 'var(--accent-indigo)' }} />
          <span style={{ color: 'var(--text-secondary)' }}>RTX 4090</span>
          <span style={{ color: 'var(--accent-indigo)', fontWeight: 600 }}>{hardwareMetrics.gpuUsagePercent}%</span>
        </div>

        {/* Live Stream / Capture Trigger Button */}
        <button
          onClick={onToggleStream}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            borderRadius: 'var(--radius-sm)',
            background: isStreaming ? 'var(--accent-rose-subtle)' : 'var(--accent-emerald-subtle)',
            border: `1px solid ${isStreaming ? 'rgba(244, 63, 94, 0.35)' : 'rgba(16, 185, 129, 0.35)'}`,
            color: isStreaming ? '#fb7185' : '#34d399',
            fontSize: '11.5px',
            fontWeight: 600,
            fontFamily: 'var(--font-mono)',
          }}
        >
          <Radio size={13} />
          <span>{isStreaming ? 'PAUSE INGEST' : 'STREAM LIVE'}</span>
        </button>

        {/* Settings Icon */}
        <button
          onClick={onOpenSettings}
          title="System Settings & Presets"
          style={{
            padding: '7px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Sliders size={14} />
        </button>
      </div>
    </header>
  );
};
