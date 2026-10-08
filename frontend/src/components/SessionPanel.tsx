import React from 'react';
import { Database, User } from 'lucide-react';
import type { SessionInfo } from '../types/dashboard';

interface SessionPanelProps {
  session: SessionInfo;
}

export const SessionPanel: React.FC<SessionPanelProps> = ({ session }) => {
  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainingSec = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="tech-panel">
      <div className="tech-panel-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Database size={14} style={{ color: 'var(--accent-indigo)' }} />
          <span>Active Session Metadata</span>
        </div>
        <span className="badge font-mono">{formatDuration(session.durationSeconds)}</span>
      </div>

      <div className="tech-panel-content" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {/* Session Name & Operator */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
            {session.sessionName}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
            <User size={12} />
            <span>{session.operator}</span>
            <span>•</span>
            <span>{session.environmentType}</span>
          </div>
        </div>

        {/* Stats 2x2 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px', marginTop: '4px' }}>
          <div
            style={{
              background: 'var(--bg-surface-0)',
              padding: '6px 8px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Keyframes / Total
            </div>
            <div className="font-mono" style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
              {session.keyframesSelected} <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>/ {session.totalFramesReceived.toLocaleString()}</span>
            </div>
          </div>

          <div
            style={{
              background: 'var(--bg-surface-0)',
              padding: '6px 8px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Sparse 3D Vertices
            </div>
            <div className="font-mono" style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--accent-cyan)' }}>
              {(session.sparsePointsCount / 1000).toFixed(1)}k <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>pts</span>
            </div>
          </div>

          <div
            style={{
              background: 'var(--bg-surface-0)',
              padding: '6px 8px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Dense Mesh Triangles
            </div>
            <div className="font-mono" style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--accent-emerald)' }}>
              {(session.densePointsCount / 1000000).toFixed(2)}M <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>facets</span>
            </div>
          </div>

          <div
            style={{
              background: 'var(--bg-surface-0)',
              padding: '6px 8px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Disk Cache
            </div>
            <div className="font-mono" style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
              {session.storageUsageMb} <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>MB</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
