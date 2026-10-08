import React from 'react';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { ActionBar } from '../components/ActionBar';
import { useScanContext } from '../context/ScanContext';

interface DashboardLayoutProps {
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  onExportModel: (format: 'ply' | 'glb') => void;
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  sidebarCollapsed,
  onToggleSidebar,
  onExportModel,
  children,
}) => {
  const { viewportMode, setViewportMode } = useScanContext();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: 'var(--bg-app)',
      }}
    >
      {/* Top Telemetry Header */}
      <Header />

      {/* Main Workstation Workspace */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <Sidebar
          activeMode={viewportMode}
          onSelectMode={setViewportMode}
          collapsed={sidebarCollapsed}
          onToggleCollapse={onToggleSidebar}
        />

        <main
          style={{
            flex: 1,
            display: 'flex',
            minWidth: 0,
            minHeight: 0,
            overflow: 'hidden',
            backgroundColor: 'var(--bg-app)',
            padding: '10px 12px',
            gap: '12px',
          }}
        >
          {children}
        </main>
      </div>

      {/* Bottom Command / Guidance Bar */}
      <ActionBar onExportModel={onExportModel} />
    </div>
  );
};
