import React from 'react';
import {
  Workflow,
  CheckCircle2,
  Loader2,
  Clock,
} from 'lucide-react';
import type { ReconstructionStage } from '../types/dashboard';

interface ReconstructionStatusProps {
  stages: ReconstructionStage[];
  currentStageIndex: number;
}

export const ReconstructionStatus: React.FC<ReconstructionStatusProps> = ({
  stages,
}) => {
  return (
    <div className="tech-panel">
      <div className="tech-panel-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Workflow size={14} style={{ color: 'var(--accent-cyan)' }} />
          <span>3D Reconstruction Pipeline</span>
        </div>
        <span className="badge badge-cyan">
          STAGE 3 / 5 ACTIVE
        </span>
      </div>

      <div className="tech-panel-content" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {stages.map((stage, idx) => {
          const isDone = stage.status === 'completed';
          const isRunning = stage.status === 'in_progress';

          return (
            <div
              key={stage.id}
              style={{
                background: isRunning ? 'var(--bg-surface-2)' : 'var(--bg-surface-0)',
                border: isRunning
                  ? '1px solid var(--accent-cyan)'
                  : '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '8px 10px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Top Row: Stage Name, Icon, Progress */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {isDone ? (
                    <CheckCircle2 size={15} style={{ color: 'var(--accent-emerald)', flexShrink: 0 }} />
                  ) : isRunning ? (
                    <Loader2
                      size={15}
                      style={{
                        color: 'var(--accent-cyan)',
                        animation: 'spin 1s linear infinite',
                        flexShrink: 0,
                      }}
                    />
                  ) : (
                    <Clock size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                  )}
                  <div>
                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: isRunning ? 600 : 500,
                        color: isRunning
                          ? 'var(--text-primary)'
                          : isDone
                          ? 'var(--text-primary)'
                          : 'var(--text-muted)',
                      }}
                    >
                      {idx + 1}. {stage.name}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span
                    className="font-mono"
                    style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      color: isDone
                        ? 'var(--accent-emerald)'
                        : isRunning
                        ? 'var(--accent-cyan)'
                        : 'var(--text-muted)',
                    }}
                  >
                    {isDone ? '100%' : isRunning ? `${stage.progressPercent}%` : 'QUEUED'}
                  </span>
                </div>
              </div>

              {/* Progress bar for running stage */}
              {isRunning && (
                <div
                  style={{
                    height: '4px',
                    width: '100%',
                    backgroundColor: 'var(--bg-surface-0)',
                    borderRadius: '2px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${stage.progressPercent}%`,
                      backgroundColor: 'var(--accent-cyan)',
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
              )}

              {/* Description & submetrics */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '10.5px',
                  color: 'var(--text-muted)',
                }}
              >
                <span>{stage.description}</span>
                {stage.metrics && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {stage.metrics.map((m, mIdx) => (
                      <span key={mIdx} className="font-mono" style={{ color: 'var(--text-secondary)' }}>
                        {m.label}: <strong style={{ color: 'var(--text-primary)' }}>{m.value}</strong>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
