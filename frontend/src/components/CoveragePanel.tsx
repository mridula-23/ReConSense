import React from 'react';
import {
  PieChart,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import type { ObservationCoverage } from '../types/dashboard';

interface CoveragePanelProps {
  coverage: ObservationCoverage;
  onInspectBlindspot?: (sectorName: string) => void;
}

export const CoveragePanel: React.FC<CoveragePanelProps> = ({
  coverage,
  onInspectBlindspot,
}) => {
  return (
    <div className="tech-panel">
      <div className="tech-panel-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <PieChart size={14} style={{ color: 'var(--accent-emerald)' }} />
          <span>Observation Coverage Analysis</span>
        </div>
        <span className="badge badge-emerald font-mono">
          {coverage.totalCoveragePercent}% COVERED
        </span>
      </div>

      <div className="tech-panel-content" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Coverage Progress Breakdown Bar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
            <span>Volumetric Visibility Distribution</span>
            <span className="font-mono">Conf: {(coverage.confidenceScore * 100).toFixed(1)}%</span>
          </div>

          <div
            style={{
              height: '10px',
              width: '100%',
              backgroundColor: 'var(--bg-surface-0)',
              borderRadius: 'var(--radius-sm)',
              overflow: 'hidden',
              display: 'flex',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div
              style={{
                width: `${coverage.observedPercent}%`,
                backgroundColor: 'var(--accent-emerald)',
                transition: 'width 0.3s ease',
              }}
              title={`Observed: ${coverage.observedPercent}%`}
            />
            <div
              style={{
                width: `${coverage.occludedPercent}%`,
                backgroundColor: 'var(--accent-amber)',
                transition: 'width 0.3s ease',
              }}
              title={`Occluded: ${coverage.occludedPercent}%`}
            />
            <div
              style={{
                width: `${coverage.unobservedPercent}%`,
                backgroundColor: 'var(--accent-rose)',
                transition: 'width 0.3s ease',
              }}
              title={`Unobserved: ${coverage.unobservedPercent}%`}
            />
          </div>

          {/* Legend */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '10.5px',
              color: 'var(--text-secondary)',
              marginTop: '2px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--accent-emerald)', display: 'inline-block' }} />
              <span>Observed ({coverage.observedPercent}%)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--accent-amber)', display: 'inline-block' }} />
              <span>Occluded ({coverage.occludedPercent}%)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--accent-rose)', display: 'inline-block' }} />
              <span>Unobserved ({coverage.unobservedPercent}%)</span>
            </div>
          </div>
        </div>

        {/* Critical Blindspot Alert Box */}
        {coverage.identifiedBlindspots > 0 && (
          <div
            style={{
              background: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: 'var(--radius-sm)',
              padding: '8px 10px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
            }}
          >
            <AlertTriangle size={15} style={{ color: 'var(--accent-amber)', flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '11px', color: '#fef3c7', flex: 1 }}>
              <div style={{ fontWeight: 600 }}>{coverage.identifiedBlindspots} Critical Blindspots Identified</div>
              <div style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>
                North-West corner & under-desk alcove have &lt;45% visibility. Additional mobile pass or AI inpainting suggested.
              </div>
            </div>
          </div>
        )}

        {/* Sector Visibility Table */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ fontSize: '10.5px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Sector Coverage Breakdown
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '160px', overflowY: 'auto' }}>
            {coverage.sectors.map((sec, idx) => (
              <div
                key={idx}
                onClick={() => onInspectBlindspot?.(sec.name)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'var(--bg-surface-0)',
                  padding: '5px 8px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '11px',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {sec.status === 'sufficient' ? (
                    <CheckCircle2 size={12} style={{ color: 'var(--accent-emerald)' }} />
                  ) : sec.status === 'partial' ? (
                    <HelpCircle size={12} style={{ color: 'var(--accent-amber)' }} />
                  ) : (
                    <AlertTriangle size={12} style={{ color: 'var(--accent-rose)' }} />
                  )}
                  <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{sec.name}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    className="font-mono"
                    style={{
                      fontSize: '11px',
                      color:
                        sec.status === 'sufficient'
                          ? 'var(--accent-emerald)'
                          : sec.status === 'partial'
                          ? 'var(--accent-amber)'
                          : 'var(--accent-rose)',
                      fontWeight: 600,
                    }}
                  >
                    {sec.observedPercent}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
