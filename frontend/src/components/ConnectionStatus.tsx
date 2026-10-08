import React from 'react';
import {
  Smartphone,
  Battery,
  Thermometer,
} from 'lucide-react';
import type { MobileDeviceConnection } from '../types/dashboard';

interface ConnectionStatusProps {
  connection: MobileDeviceConnection;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ connection }) => {
  return (
    <div className="tech-panel">
      <div className="tech-panel-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Smartphone size={14} style={{ color: 'var(--accent-cyan)' }} />
          <span>Mobile Capture Node</span>
        </div>
        <span className="badge badge-emerald">
          <span className="pulse-dot" style={{ width: 5, height: 5 }} />
          WEBRTC SYNC
        </span>
      </div>

      <div className="tech-panel-content" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {/* Device identity & IP */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-surface-0)',
            padding: '8px 10px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
              {connection.deviceName}
            </div>
            <div className="font-mono" style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
              {connection.ipAddress} • ID: {connection.deviceId}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span className="badge badge-cyan">{connection.streamQuality}</span>
          </div>
        </div>

        {/* 2x2 Telemetry Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
          {/* Bitrate & FPS */}
          <div
            style={{
              background: 'var(--bg-surface-0)',
              padding: '6px 8px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Bitrate / FPS
            </div>
            <div className="font-mono" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
              {connection.bitrateMbps} <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Mbps</span> @ {connection.fps}
            </div>
          </div>

          {/* Latency & Loss */}
          <div
            style={{
              background: 'var(--bg-surface-0)',
              padding: '6px 8px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Latency / Loss
            </div>
            <div className="font-mono" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--accent-emerald)' }}>
              {connection.latencyMs} <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>ms</span> / {connection.packetLossPercent}%
            </div>
          </div>

          {/* Battery & Health */}
          <div
            style={{
              background: 'var(--bg-surface-0)',
              padding: '6px 8px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Battery size={15} style={{ color: connection.batteryLevel > 30 ? 'var(--accent-emerald)' : 'var(--accent-amber)' }} />
            <div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Battery</div>
              <div className="font-mono" style={{ fontSize: '12px', fontWeight: 600 }}>
                {connection.batteryLevel}%
              </div>
            </div>
          </div>

          {/* Device Temperature */}
          <div
            style={{
              background: 'var(--bg-surface-0)',
              padding: '6px 8px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Thermometer size={15} style={{ color: 'var(--accent-cyan)' }} />
            <div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Core Temp</div>
              <div className="font-mono" style={{ fontSize: '12px', fontWeight: 600 }}>
                {connection.temperatureCelsius}°C
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
