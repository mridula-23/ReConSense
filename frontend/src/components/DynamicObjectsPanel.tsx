import React from 'react';
import { UserX } from 'lucide-react';
import type { MovingObject } from '../types/dashboard';

interface DynamicObjectsPanelProps {
  dynamicObjects: MovingObject[];
}

export const DynamicObjectsPanel: React.FC<DynamicObjectsPanelProps> = ({ dynamicObjects }) => {
  return (
    <div className="tech-panel">
      <div className="tech-panel-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <UserX size={14} style={{ color: 'var(--accent-rose)' }} />
          <span>Moving Objects</span>
        </div>
        <span className="badge badge-rose">{dynamicObjects.length}</span>
      </div>

      <div className="tech-panel-content" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {dynamicObjects.length === 0 ? (
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>No moving objects detected.</div>
        ) : (
          dynamicObjects.map((obj) => (
            <div key={obj.id} style={{ fontSize: '11px', color: 'var(--text-primary)' }}>
              • {obj.label}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
