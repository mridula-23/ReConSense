import React from 'react';
import {
  Play,
  Pause,
  Box,
  Layers,
  Sparkles,
} from 'lucide-react';
import type { ViewportMode } from '../types/dashboard';

interface ActionBarProps {
  isStreaming: boolean;
  onToggleStream: () => void;
  onRunSparseSfM: () => void;
  onRunDenseFusion: () => void;
  onRunAIInpainting: () => void;
  onExportModel: (format: 'ply' | 'glb' | 'obj') => void;
  activeMode: ViewportMode;
}

export const ActionBar: React.FC<ActionBarProps> = ({
  isStreaming,
  onToggleStream,
  onRunSparseSfM,
  onRunDenseFusion,
  onRunAIInpainting,
  onExportModel,
  activeMode,
}) => {
  return (
    <div
      style={{
        height: '46px',
        minHeight: '46px',
        backgroundColor: 'var(--bg-surface-0)',
        borderTop: '1px solid var(--border-default)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 14px',
        gap: '12px',
        zIndex: 30,
      }}
    >
      {/* Left: Stream Control & Pipeline Execution */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          onClick={onToggleStream}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: 'var(--radius-sm)',
            background: isStreaming ? 'var(--accent-rose)' : 'var(--accent-emerald)',
            color: '#fff',
            fontWeight: 600,
            fontSize: '11.5px',
            boxShadow: isStreaming ? '0 0 10px rgba(244, 63, 94, 0.4)' : '0 0 10px rgba(16, 185, 129, 0.4)',
          }}
        >
          {isStreaming ? <Pause size={14} /> : <Play size={14} />}
          <span>{isStreaming ? 'Stop Ingest' : 'Start Capture'}</span>
        </button>

        <div style={{ height: '18px', width: '1px', backgroundColor: 'var(--border-subtle)' }} />

        <button
          onClick={onRunSparseSfM}
          className="badge"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            padding: '5px 10px',
            cursor: 'pointer',
            backgroundColor: activeMode === 'point_cloud' ? 'var(--bg-surface-3)' : 'var(--bg-surface-2)',
            border: activeMode === 'point_cloud' ? '1px solid var(--accent-cyan)' : '1px solid var(--border-default)',
            color: 'var(--text-primary)',
          }}
        >
          <Box size={13} style={{ color: 'var(--accent-cyan)' }} />
          <span>Sparse SfM</span>
        </button>

        <button
          onClick={onRunDenseFusion}
          className="badge"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            padding: '5px 10px',
            cursor: 'pointer',
            backgroundColor: activeMode === 'dense_mesh' ? 'var(--bg-surface-3)' : 'var(--bg-surface-2)',
            border: activeMode === 'dense_mesh' ? '1px solid var(--accent-emerald)' : '1px solid var(--border-default)',
            color: 'var(--text-primary)',
          }}
        >
          <Layers size={13} style={{ color: 'var(--accent-emerald)' }} />
          <span>Dense TSDF Fusion</span>
        </button>

        <button
          onClick={onRunAIInpainting}
          className="badge badge-indigo"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            padding: '5px 10px',
            cursor: 'pointer',
            backgroundColor: activeMode === 'ai_completed' ? 'rgba(99, 102, 241, 0.25)' : undefined,
          }}
        >
          <Sparkles size={13} />
          <span>Observation AI Completion</span>
        </button>
      </div>

      {/* Right: Export Options */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
          Export Scene:
        </span>
        <button
          onClick={() => onExportModel('ply')}
          style={{
            padding: '4px 8px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-surface-1)',
            border: '1px solid var(--border-subtle)',
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-secondary)',
          }}
        >
          .PLY (Point Cloud)
        </button>
        <button
          onClick={() => onExportModel('glb')}
          style={{
            padding: '4px 8px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-surface-1)',
            border: '1px solid var(--border-subtle)',
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-secondary)',
          }}
        >
          .GLB (3D Mesh)
        </button>
      </div>
    </div>
  );
};
