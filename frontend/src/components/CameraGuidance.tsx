import React from 'react';
import {
  Compass,
  AlertCircle,
  CheckCircle2,
  Navigation,
} from 'lucide-react';
import type { GuidanceCue } from '../types/dashboard';

interface CameraGuidanceProps {
  cues: GuidanceCue[];
}

export const CameraGuidance: React.FC<CameraGuidanceProps> = ({ cues }) => {
  return (
    <div className="tech-panel">
      <div className="tech-panel-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Compass size={14} style={{ color: 'var(--accent-cyan)' }} />
          <span>Real-time Mobile Operator Feedback</span>
        </div>
        <span className="badge badge-cyan font-mono">ACTIVE FEEDBACK</span>
      </div>

      <div className="tech-panel-content" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {cues.map((cue) => {
          const isWarning = cue.severity === 'warning';
          const isCritical = cue.severity === 'critical';

          return (
            <div
              key={cue.id}
              style={{
                background: isCritical
                  ? 'rgba(244, 63, 94, 0.08)'
                  : isWarning
                  ? 'rgba(245, 158, 11, 0.08)'
                  : 'var(--bg-surface-0)',
                border: isCritical
                  ? '1px solid rgba(244, 63, 94, 0.3)'
                  : isWarning
                  ? '1px solid rgba(245, 158, 11, 0.3)'
                  : '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '8px 10px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
              }}
            >
              <div style={{ marginTop: '2px', flexShrink: 0 }}>
                {isCritical ? (
                  <AlertCircle size={15} style={{ color: 'var(--accent-rose)' }} />
                ) : isWarning ? (
                  <Navigation size={15} style={{ color: 'var(--accent-amber)' }} />
                ) : (
                  <CheckCircle2 size={15} style={{ color: 'var(--accent-cyan)' }} />
                )}
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span
                    style={{
                      fontSize: '11.5px',
                      fontWeight: 600,
                      color: isCritical
                        ? '#fb7185'
                        : isWarning
                        ? '#fbbf24'
                        : 'var(--text-primary)',
                    }}
                  >
                    {cue.title}
                  </span>
                  <span className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                    {cue.timestamp}
                  </span>
                </div>

                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.35 }}>
                  {cue.actionText}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
