import React from 'react';
import {
  Sparkles,
  Navigation,
  Download,
  Play,
} from 'lucide-react';
import { useScanContext } from '../context/ScanContext';

interface ActionBarProps {
  onExportModel: (format: 'ply' | 'glb') => void;
}

export const ActionBar: React.FC<ActionBarProps> = ({
  onExportModel,
}) => {
  const { guidanceTips, runReconstruction } = useScanContext();

  const activeGuidance = guidanceTips.length > 0 ? guidanceTips[0].message : 'Scan the room by slowly panning your camera.';

  return (
    <footer
      style={{
        height: '46px',
        minHeight: '46px',
        backgroundColor: 'var(--bg-surface)',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 18px',
        gap: '16px',
        zIndex: 30,
      }}
    >
      {/* Left: Active Guidance message */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            padding: '4px 10px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '11px',
            maxWidth: '520px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          <Navigation size={13} style={{ color: 'var(--accent-amber)', flexShrink: 0 }} />
          <span style={{ color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '10px', fontWeight: 600 }}>
            Guidance:
          </span>
          <span style={{ color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {activeGuidance}
          </span>
        </div>
      </div>

      {/* Center: Primary Processing Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          onClick={runReconstruction}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 12px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-default)',
            color: 'var(--text-primary)',
            fontSize: '11.5px',
            fontWeight: 500,
          }}
        >
          <Play size={12} style={{ color: 'var(--accent-cyan)' }} />
          <span>Reconstruct 3D Scene</span>
        </button>

        <button
          onClick={runReconstruction}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 12px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-default)',
            color: 'var(--text-primary)',
            fontSize: '11.5px',
            fontWeight: 500,
          }}
        >
          <Sparkles size={12} style={{ color: 'var(--accent-indigo)' }} />
          <span>Fill Missing Areas</span>
        </button>
      </div>

      {/* Right: Export Options */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <button
          onClick={() => onExportModel('ply')}
          title="Export 3D Point Cloud (.PLY)"
          style={{
            padding: '4px 9px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <Download size={12} />
          <span>.PLY</span>
        </button>

        <button
          onClick={() => onExportModel('glb')}
          title="Export 3D Mesh (.GLB)"
          style={{
            padding: '4px 9px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <Download size={12} />
          <span>.GLB</span>
        </button>
      </div>
    </footer>
  );
};
