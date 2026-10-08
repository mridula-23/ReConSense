import React from 'react';
import {
  Box,
  Layers,
  PieChart,
  UserX,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import type { ViewportMode } from '../types/dashboard';

interface SidebarProps {
  activeMode: ViewportMode;
  onSelectMode: (mode: ViewportMode) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeMode,
  onSelectMode,
  collapsed,
  onToggleCollapse,
}) => {
  const navItems = [
    {
      id: 'point_cloud',
      label: 'Camera Points',
      sublabel: 'Sparse Points',
      icon: Box,
      mode: 'point_cloud' as ViewportMode,
      shortcut: '1',
    },
    {
      id: 'dense_mesh',
      label: '3D Room Mesh',
      sublabel: 'Surface Mesh',
      icon: Layers,
      mode: 'dense_mesh' as ViewportMode,
      shortcut: '2',
    },
    {
      id: 'coverage',
      label: 'Room Coverage',
      sublabel: 'Seen vs Unseen',
      icon: PieChart,
      mode: 'coverage_heatmap' as ViewportMode,
      shortcut: '3',
    },
    {
      id: 'dynamic_objects',
      label: 'Moving Objects',
      sublabel: 'Filtered Items',
      icon: UserX,
      mode: 'dynamic_filter' as ViewportMode,
      shortcut: '4',
    },
    {
      id: 'ai_completed',
      label: 'Filled Areas',
      sublabel: 'AI Completed',
      icon: Sparkles,
      mode: 'ai_completed' as ViewportMode,
      shortcut: '5',
    },
  ];

  return (
    <aside
      style={{
        width: collapsed ? '58px' : '196px',
        minWidth: collapsed ? '58px' : '196px',
        backgroundColor: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'width 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
        userSelect: 'none',
        zIndex: 40,
      }}
    >
      {/* Viewport View Modes */}
      <div style={{ display: 'flex', flexDirection: 'column', padding: '10px 6px', gap: '4px' }}>
        {!collapsed && (
          <div
            style={{
              padding: '6px 8px 8px 8px',
              fontSize: '10px',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              letterSpacing: '0.08em',
            }}
          >
            Scene Views
          </div>
        )}

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeMode === item.mode;

          return (
            <button
              key={item.id}
              onClick={() => onSelectMode(item.mode)}
              title={collapsed ? `${item.label} (${item.shortcut})` : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: collapsed ? '10px 0' : '8px 10px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                borderRadius: 'var(--radius-sm)',
                background: isActive ? 'var(--bg-surface-elevated)' : 'transparent',
                border: isActive ? '1px solid var(--border-subtle)' : '1px solid transparent',
                borderLeft: isActive ? '3px solid var(--accent-cyan)' : '3px solid transparent',
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: isActive ? 600 : 400,
                fontSize: '12px',
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }
              }}
            >
              <Icon size={16} style={{ color: isActive ? 'var(--accent-cyan)' : 'inherit', flexShrink: 0 }} />

              {!collapsed && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.label}
                  </span>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                    {item.sublabel}
                  </span>
                </div>
              )}

              {!collapsed && item.shortcut && (
                <span
                  className="font-mono"
                  style={{
                    fontSize: '9.5px',
                    color: 'var(--text-muted)',
                    background: 'rgba(255,255,255,0.04)',
                    padding: '1px 4px',
                    borderRadius: '3px',
                  }}
                >
                  {item.shortcut}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Collapse Toggle */}
      <div
        style={{
          borderTop: '1px solid var(--border-subtle)',
          padding: '8px 6px',
        }}
      >
        <button
          onClick={onToggleCollapse}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '7px 8px',
            width: '100%',
            justifyContent: collapsed ? 'center' : 'flex-start',
            color: 'var(--text-muted)',
            borderRadius: 'var(--radius-sm)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--text-muted)';
          }}
        >
          {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
          {!collapsed && <span style={{ fontSize: '11px' }}>Collapse Sidebar</span>}
        </button>
      </div>
    </aside>
  );
};
