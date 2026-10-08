import React from 'react';
import {
  Eye,
  Box,
  PieChart,
  UserX,
  Compass,
  FileText,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import type { ViewportMode } from '../types/dashboard';

interface SidebarProps {
  activeMode: ViewportMode;
  onSelectMode: (mode: ViewportMode) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  activeViewSection: string;
  onSelectSection: (section: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeMode,
  onSelectMode,
  collapsed,
  onToggleCollapse,
  activeViewSection,
  onSelectSection,
}) => {
  const navItems = [
    {
      id: 'overview',
      label: 'Main Dashboard',
      icon: Eye,
      badge: 'LIVE',
      mode: 'point_cloud' as ViewportMode,
    },
    {
      id: 'point_cloud',
      label: 'Sparse SfM View',
      icon: Box,
      mode: 'point_cloud' as ViewportMode,
    },
    {
      id: 'dense_mesh',
      label: 'Dense TSDF Mesh',
      icon: Box,
      mode: 'dense_mesh' as ViewportMode,
    },
    {
      id: 'coverage',
      label: 'Coverage Analysis',
      icon: PieChart,
      badge: '84.6%',
      mode: 'coverage_heatmap' as ViewportMode,
    },
    {
      id: 'dynamic_objects',
      label: 'Dynamic Filter',
      icon: UserX,
      badge: '3 DET',
      mode: 'dynamic_filter' as ViewportMode,
    },
    {
      id: 'ai_completed',
      label: 'AI Scene Completion',
      icon: Sparkles,
      badge: 'NEW',
      mode: 'ai_completed' as ViewportMode,
    },
    {
      id: 'guidance',
      label: 'Mobile Guidance',
      icon: Compass,
      mode: 'point_cloud' as ViewportMode,
    },
    {
      id: 'logs',
      label: 'Pipeline Logs',
      icon: FileText,
      mode: 'point_cloud' as ViewportMode,
    },
  ];

  return (
    <aside
      style={{
        width: collapsed ? '56px' : '220px',
        minWidth: collapsed ? '56px' : '220px',
        backgroundColor: 'var(--bg-surface-0)',
        borderRight: '1px solid var(--border-default)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'width 0.2s ease',
        userSelect: 'none',
        zIndex: 40,
      }}
    >
      {/* Top Navigation Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', padding: '8px 6px', gap: '4px' }}>
        <div
          style={{
            padding: '6px 8px',
            fontSize: '10px',
            fontWeight: 700,
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
            letterSpacing: '0.06em',
            display: collapsed ? 'none' : 'block',
          }}
        >
          Perception Pipeline
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            activeViewSection === item.id || (item.mode && activeMode === item.mode && activeViewSection === 'overview');

          return (
            <button
              key={item.id}
              onClick={() => {
                onSelectSection(item.id);
                if (item.mode) {
                  onSelectMode(item.mode);
                }
              }}
              title={collapsed ? item.label : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: collapsed ? '10px 0' : '8px 10px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                borderRadius: 'var(--radius-sm)',
                background: isActive ? 'var(--bg-surface-2)' : 'transparent',
                borderLeft: isActive ? '3px solid var(--accent-cyan)' : '3px solid transparent',
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: isActive ? 600 : 400,
                fontSize: '12.5px',
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'var(--bg-surface-1)';
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
                <span style={{ flex: 1, textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.label}
                </span>
              )}

              {!collapsed && item.badge && (
                <span
                  className="font-mono"
                  style={{
                    fontSize: '9.5px',
                    padding: '1px 5px',
                    borderRadius: '3px',
                    background: item.id === 'ai_completed' ? 'var(--accent-indigo-subtle)' : 'var(--accent-cyan-subtle)',
                    color: item.id === 'ai_completed' ? '#a5b4fc' : '#38bdf8',
                    border: `1px solid ${item.id === 'ai_completed' ? 'rgba(99,102,241,0.3)' : 'rgba(6,182,212,0.3)'}`,
                    fontWeight: 600,
                  }}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Session Tools & Collapse Button */}
      <div
        style={{
          borderTop: '1px solid var(--border-subtle)',
          padding: '8px 6px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}
      >
        <button
          onClick={onToggleCollapse}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px',
            justifyContent: collapsed ? 'center' : 'flex-start',
            color: 'var(--text-muted)',
            borderRadius: 'var(--radius-sm)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--bg-surface-1)';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--text-muted)';
          }}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          {!collapsed && <span style={{ fontSize: '11.5px' }}>Collapse Panel</span>}
        </button>
      </div>
    </aside>
  );
};
