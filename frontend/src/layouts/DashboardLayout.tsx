import React from 'react';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { ActionBar } from '../components/ActionBar';
import type {
  SessionInfo,
  SystemHardwareMetrics,
  MobileDeviceConnection,
  ViewportMode,
} from '../types/dashboard';

interface DashboardLayoutProps {
  sessionInfo: SessionInfo;
  hardwareMetrics: SystemHardwareMetrics;
  deviceConnection: MobileDeviceConnection;
  isStreaming: boolean;
  onToggleStream: () => void;
  onRefreshTelemetry: () => void;
  activeMode: ViewportMode;
  onSelectMode: (mode: ViewportMode) => void;
  activeSection: string;
  onSelectSection: (section: string) => void;
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  onRunSparseSfM: () => void;
  onRunDenseFusion: () => void;
  onRunAIInpainting: () => void;
  onExportModel: (format: 'ply' | 'glb' | 'obj') => void;
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  sessionInfo,
  hardwareMetrics,
  deviceConnection,
  isStreaming,
  onToggleStream,
  onRefreshTelemetry,
  activeMode,
  onSelectMode,
  activeSection,
  onSelectSection,
  sidebarCollapsed,
  onToggleSidebar,
  onRunSparseSfM,
  onRunDenseFusion,
  onRunAIInpainting,
  onExportModel,
  children,
}) => {
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
      <Header
        sessionInfo={sessionInfo}
        hardwareMetrics={hardwareMetrics}
        deviceConnection={deviceConnection}
        isStreaming={isStreaming}
        onToggleStream={onToggleStream}
        onRefreshTelemetry={onRefreshTelemetry}
      />

      {/* Main Workspace Area (Sidebar + Center Hero & Telemetry Panels) */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <Sidebar
          activeMode={activeMode}
          onSelectMode={onSelectMode}
          collapsed={sidebarCollapsed}
          onToggleCollapse={onToggleSidebar}
          activeViewSection={activeSection}
          onSelectSection={onSelectSection}
        />

        {/* Dynamic Main Content */}
        <main
          style={{
            flex: 1,
            display: 'flex',
            minWidth: 0,
            minHeight: 0,
            overflow: 'hidden',
            backgroundColor: 'var(--bg-app)',
            padding: '10px',
            gap: '10px',
          }}
        >
          {children}
        </main>
      </div>

      {/* Bottom Action / Pipeline Control Bar */}
      <ActionBar
        isStreaming={isStreaming}
        onToggleStream={onToggleStream}
        onRunSparseSfM={onRunSparseSfM}
        onRunDenseFusion={onRunDenseFusion}
        onRunAIInpainting={onRunAIInpainting}
        onExportModel={onExportModel}
        activeMode={activeMode}
      />
    </div>
  );
};
