import React from 'react';
import { PieChart, CheckCircle2, AlertTriangle, HelpCircle } from 'lucide-react';
import type { RoomCoverage } from '../types/dashboard';

interface CoveragePanelProps {
  coverage: RoomCoverage;
}

export const CoveragePanel: React.FC<CoveragePanelProps> = ({ coverage }) => {
  return (
    <div className="tech-panel">
      <div className="tech-panel-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <PieChart size={14} style={{ color: 'var(--accent-emerald)' }} />
          <span>Room Coverage</span>
        </div>
        {coverage.isCalculated && (
          <span className="badge badge-emerald">{coverage.overallCoveragePercent}%</span>
        )}
      </div>

      <div className="tech-panel-content" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {!coverage.isCalculated ? (
          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
            Coverage will be calculated after video processing.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {coverage.sectors.map((sec, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  {sec.status === 'sufficient' ? <CheckCircle2 size={12} color="#10b981" /> : sec.status === 'partial' ? <HelpCircle size={12} color="#f59e0b" /> : <AlertTriangle size={12} color="#f43f5e" />}
                  <span>{sec.name}</span>
                </div>
                <span>{sec.coveragePercent !== undefined ? `${sec.coveragePercent}%` : 'Pending'}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
