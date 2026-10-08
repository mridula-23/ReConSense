import React from 'react';
import { UserX } from 'lucide-react';
import type { DynamicObject } from '../types/dashboard';

interface DynamicObjectsPanelProps {
  dynamicObjects: DynamicObject[];
  onSelectObject?: (obj: DynamicObject) => void;
  selectedObjectId?: string | null;
}

export const DynamicObjectsPanel: React.FC<DynamicObjectsPanelProps> = ({
  dynamicObjects,
  onSelectObject,
  selectedObjectId,
}) => {
  return (
    <div className="tech-panel">
      <div className="tech-panel-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <UserX size={14} style={{ color: 'var(--accent-rose)' }} />
          <span>Dynamic Entity Filtering</span>
        </div>
        <span className="badge badge-rose font-mono">
          {dynamicObjects.length} ENTITIES MASKED
        </span>
      </div>

      <div className="tech-panel-content" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
          Transient motion artifacts segmented and excluded from static room TSDF integration.
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {dynamicObjects.map((obj) => {
            const isSelected = selectedObjectId === obj.id;
            return (
              <div
                key={obj.id}
                onClick={() => onSelectObject?.(obj)}
                style={{
                  background: isSelected ? 'var(--bg-surface-2)' : 'var(--bg-surface-0)',
                  border: isSelected
                    ? '1px solid var(--accent-rose)'
                    : '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '7px 9px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--accent-rose)',
                      }}
                    />
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {obj.label}
                    </span>
                  </div>

                  <span className="badge badge-rose font-mono">
                    {(obj.confidence * 100).toFixed(1)}% CONF
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '10.5px',
                    color: 'var(--text-muted)',
                  }}
                >
                  <span className="font-mono">
                    Frames #{obj.firstSeenFrame} – #{obj.lastSeenFrame}
                  </span>
                  <span className="font-mono" style={{ color: 'var(--accent-rose)' }}>
                    -{obj.maskedPointsCount.toLocaleString()} pts excluded
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
