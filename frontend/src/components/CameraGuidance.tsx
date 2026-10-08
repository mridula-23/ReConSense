import React from 'react';
import { Compass, CheckCircle2 } from 'lucide-react';
import type { GuidanceTip } from '../types/dashboard';

interface CameraGuidanceProps {
  cues: GuidanceTip[];
}

export const CameraGuidance: React.FC<CameraGuidanceProps> = ({ cues }) => {
  return (
    <div className="tech-panel">
      <div className="tech-panel-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Compass size={14} style={{ color: 'var(--accent-cyan)' }} />
          <span>Camera Guidance</span>
        </div>
      </div>

      <div className="tech-panel-content" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {cues.map((cue) => (
          <div
            key={cue.id}
            style={{
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '8px 10px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
            }}
          >
            <CheckCircle2 size={15} style={{ color: 'var(--accent-cyan)', marginTop: '2px', flexShrink: 0 }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {cue.title}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                {cue.message}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
