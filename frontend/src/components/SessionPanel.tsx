import React from 'react';
import { Database } from 'lucide-react';
import type { ScanSession } from '../types/dashboard';

interface SessionPanelProps {
  session: ScanSession;
}

export const SessionPanel: React.FC<SessionPanelProps> = ({ session }) => {
  return (
    <div className="tech-panel">
      <div className="tech-panel-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Database size={14} style={{ color: 'var(--accent-indigo)' }} />
          <span>Session Info</span>
        </div>
      </div>

      <div className="tech-panel-content" style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11.5px' }}>
        <div><strong>Name:</strong> {session.name}</div>
        <div><strong>Type:</strong> {session.roomType}</div>
        <div><strong>Frames:</strong> {session.frameCount}</div>
      </div>
    </div>
  );
};
