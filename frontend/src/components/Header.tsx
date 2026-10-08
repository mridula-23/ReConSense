import React from 'react';
import {
  Activity,
  Cpu,
  HardDrive,
  Radio,
  Layers,
  RefreshCw,
} from 'lucide-react';
import { StatusIndicator } from './StatusIndicator';
import type { SystemHardwareMetrics, SessionInfo, MobileDeviceConnection } from '../types/dashboard';

interface HeaderProps {
  sessionInfo: SessionInfo;
  hardwareMetrics: SystemHardwareMetrics;
  deviceConnection: MobileDeviceConnection;
  isStreaming: boolean;
  onToggleStream?: () => void;
  onRefreshTelemetry?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  sessionInfo,
  hardwareMetrics,
  deviceConnection,
  isStreaming,
  onToggleStream,
  onRefreshTelemetry,
}) => {
  return (
    <header
      style={{
        height: '52px',
        minHeight: '52px',
        backgroundColor: 'var(--bg-surface-0)',
        borderBottom: '1px solid var(--border-default)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        gap: '16px',
        zIndex: 50,
      }}
    >
      {/* Brand & Mode Identification */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: 'var(--radius-sm)',
              background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: '0 0 12px rgba(6, 182, 212, 0.4)',
            }}
          >
            <Layers size={16} strokeWidth={2.5} />
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
              <span className="badge badge-cyan">v1.0-RC</span>
            </div>
            <div
              style={{
                fontSize: '10px',
                color: 'var(--text-muted)',
                letterSpacing: '0.02em',
                lineHeight: 1,
              }}
            >
              Observation-Aware 3D Indoor Reconstruction
            </div>
          </div>
        </div>

        <div
          style={{
            height: '24px',
            width: '1px',
            backgroundColor: 'var(--border-subtle)',
          }}
        />

        {/* Live Session Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontSize: '11px',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            Session:
          </span>
          <span
            className="font-mono"
            style={{
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--text-primary)',
              background: 'var(--bg-surface-1)',
              padding: '2px 8px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            {sessionInfo.sessionId}
          </span>
          <StatusIndicator
            status={isStreaming ? 'active' : 'idle'}
            label={isStreaming ? 'LIVE CAPTURE' : 'STANDBY'}
            size="sm"
          />
        </div>
      </div>

      {/* Center/Right: Hardware Telemetry HUD */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
        {/* Hardware Status Pills */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: 'var(--bg-surface-1)',
            padding: '4px 10px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          {/* GPU Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Activity size={13} style={{ color: 'var(--accent-cyan)' }} />
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>GPU:</span>
            <span className="font-mono" style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
              {hardwareMetrics.gpuUsagePercent}%
            </span>
          </div>

          <div style={{ height: '14px', width: '1px', backgroundColor: 'var(--border-subtle)' }} />

          {/* VRAM Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <HardDrive size={13} style={{ color: 'var(--accent-indigo)' }} />
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>VRAM:</span>
            <span className="font-mono" style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
              {hardwareMetrics.vramUsedGb}/{hardwareMetrics.vramTotalGb} GB
            </span>
          </div>

          <div style={{ height: '14px', width: '1px', backgroundColor: 'var(--border-subtle)' }} />

          {/* CPU Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Cpu size={13} style={{ color: 'var(--accent-emerald)' }} />
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>CPU:</span>
            <span className="font-mono" style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
              {hardwareMetrics.cpuUsagePercent}%
            </span>
          </div>

          <div style={{ height: '14px', width: '1px', backgroundColor: 'var(--border-subtle)' }} />

          {/* WebRTC Latency */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Radio size={13} style={{ color: deviceConnection.latencyMs < 30 ? 'var(--accent-emerald)' : 'var(--accent-amber)' }} />
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Latency:</span>
            <span className="font-mono" style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
              {deviceConnection.latencyMs} ms
            </span>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={onToggleStream}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              background: isStreaming ? 'rgba(244, 63, 94, 0.15)' : 'var(--accent-cyan-subtle)',
              border: `1px solid ${isStreaming ? 'var(--accent-rose)' : 'var(--accent-cyan)'}`,
              color: isStreaming ? '#fb7185' : '#38bdf8',
              fontSize: '11.5px',
              fontWeight: 600,
              fontFamily: 'var(--font-mono)',
            }}
          >
            <Radio size={13} />
            {isStreaming ? 'PAUSE INGEST' : 'STREAM LIVE'}
          </button>

          <button
            onClick={onRefreshTelemetry}
            title="Refresh Telemetry"
            style={{
              padding: '7px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-surface-1)',
              border: '1px solid var(--border-default)',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>
    </header>
  );
};
