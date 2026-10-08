import React from 'react';
import {
  Box,
  Layers,
  Sparkles,
  Navigation,
  Download,
} from 'lucide-react';
import type { ViewportMode, GuidanceCue } from '../types/dashboard';

interface ActionBarProps {
  isStreaming: boolean;
  onToggleStream: () => void;
  onRunSparseSfM: () => void;
  onRunDenseFusion: () => void;
  onRunAIInpainting: () => void;
  onExportModel: (format: 'ply' | 'glb' | 'obj') => void;
  activeMode: ViewportMode;
  guidanceCue?: GuidanceCue;
}

export const ActionBar: React.FC<ActionBarProps> = ({
  onRunSparseSfM,
  onRunDenseFusion,
  onRunAIInpainting,
  onExportModel,
  activeMode,
  guidanceCue,
}) => {
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
      {/* Left: Real-time Live Guidance Cue for Mobile Operator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
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
            maxWidth: '460px',
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
            {guidanceCue ? guidanceCue.actionText : 'Scanning velocity optimal. Continue path sweep.'}
          </span>
        </div>
      </div>

      {/* Center: Primary Pipeline Execution Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <button
          onClick={onRunSparseSfM}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            padding: '5px 11px',
            borderRadius: 'var(--radius-sm)',
            background: activeMode === 'point_cloud' ? 'var(--bg-surface-active)' : 'var(--bg-surface-elevated)',
            border: activeMode === 'point_cloud' ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
            color: activeMode === 'point_cloud' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
            fontSize: '11.5px',
            fontWeight: 500,
            fontFamily: 'var(--font-mono)',
          }}
        >
          <Box size={13} />
          <span>Sparse SfM</span>
        </button>

        <button
          onClick={onRunDenseFusion}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            padding: '5px 11px',
            borderRadius: 'var(--radius-sm)',
            background: activeMode === 'dense_mesh' ? 'var(--bg-surface-active)' : 'var(--bg-surface-elevated)',
            border: activeMode === 'dense_mesh' ? '1px solid var(--accent-emerald)' : '1px solid var(--border-subtle)',
            color: activeMode === 'dense_mesh' ? 'var(--accent-emerald)' : 'var(--text-secondary)',
            fontSize: '11.5px',
            fontWeight: 500,
            fontFamily: 'var(--font-mono)',
          }}
        >
          <Layers size={13} />
          <span>Dense TSDF</span>
        </button>

        <button
          onClick={onRunAIInpainting}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            padding: '5px 11px',
            borderRadius: 'var(--radius-sm)',
            background: activeMode === 'ai_completed' ? 'var(--bg-surface-active)' : 'var(--bg-surface-elevated)',
            border: activeMode === 'ai_completed' ? '1px solid var(--accent-indigo)' : '1px solid var(--border-subtle)',
            color: activeMode === 'ai_completed' ? 'var(--accent-indigo)' : 'var(--text-secondary)',
            fontSize: '11.5px',
            fontWeight: 500,
            fontFamily: 'var(--font-mono)',
          }}
        >
          <Sparkles size={13} />
          <span>AI Inpainting</span>
        </button>
      </div>

      {/* Right: Export Format Options */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <button
          onClick={() => onExportModel('ply')}
          title="Export Point Cloud (.PLY)"
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
