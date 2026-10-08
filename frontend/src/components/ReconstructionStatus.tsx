import React from 'react';
import { Workflow, CheckCircle2, Loader2, Clock } from 'lucide-react';
import type { ProcessingStep } from '../types/dashboard';

interface ReconstructionStatusProps {
  stages: ProcessingStep[];
}

export const ReconstructionStatus: React.FC<ReconstructionStatusProps> = ({ stages }) => {
  return (
    <div className="tech-panel">
      <div className="tech-panel-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Workflow size={14} style={{ color: 'var(--accent-cyan)' }} />
          <span>Processing Steps</span>
        </div>
      </div>

      <div className="tech-panel-content" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {stages.map((step) => (
          <div key={step.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11.5px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {step.status === 'completed' ? <CheckCircle2 size={13} color="#10b981" /> : step.status === 'processing' ? <Loader2 size={13} color="#38bdf8" className="spin-animation" /> : <Clock size={13} color="#64748b" />}
              <span>{step.name}</span>
            </div>
            <span style={{ fontSize: '10px', color: '#64748b' }}>{step.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
