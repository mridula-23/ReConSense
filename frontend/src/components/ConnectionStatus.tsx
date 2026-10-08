import React from 'react';
import { Smartphone, Battery } from 'lucide-react';
import type { PhoneConnection } from '../types/dashboard';

interface ConnectionStatusProps {
  connection: PhoneConnection;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ connection }) => {
  return (
    <div className="tech-panel">
      <div className="tech-panel-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Smartphone size={14} style={{ color: 'var(--accent-cyan)' }} />
          <span>Mobile Phone</span>
        </div>
        {connection.status === 'connected' ? (
          <span className="badge badge-emerald">CONNECTED</span>
        ) : (
          <span className="badge">DISCONNECTED</span>
        )}
      </div>

      <div className="tech-panel-content" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ fontSize: '12px', fontWeight: 600 }}>
          {connection.deviceName || 'No phone connected'}
        </div>
        {connection.batteryLevel !== undefined && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-secondary)' }}>
            <Battery size={14} />
            <span>Battery: {connection.batteryLevel}%</span>
          </div>
        )}
      </div>
    </div>
  );
};
