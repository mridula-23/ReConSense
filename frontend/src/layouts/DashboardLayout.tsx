import React from 'react';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { ActionBar } from '../components/ActionBar';
import type {
  SessionInfo,
  SystemHardwareMetrics,
  MobileDeviceConnection,
  ViewportMode,
  GuidanceCue,
} from '../types/dashboard';

interface DashboardLayoutProps {
  sessionInfo: SessionInfo;
  hardwareMetrics: SystemHardwareMetrics;
  deviceConnection: MobileDeviceConnection;
  isStreaming: boolean;
  onToggleStream: () => void;
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
  guidanceCue?: GuidanceCue;
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  sessionInfo,
  hardwareMetrics,
  deviceConnection,
  isStreaming,
  onToggleStream,
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
  guidanceCue,
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
      />

      {/* Main Workstation Workspace */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <Sidebar
          activeMode={activeMode}
          onSelectMode={onSelectMode}
          collapsed={sidebarCollapsed}
          onToggleCollapse={onToggleSidebar}
          activeViewSection={activeSection}
          onSelectSection={onSelectSection}
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
      <ActionBar
        isStreaming={isStreaming}
        onToggleStream={onToggleStream}
        onRunSparseSfM={onRunSparseSfM}
        onRunDenseFusion={onRunDenseFusion}
        onRunAIInpainting={onRunAIInpainting}
        onExportModel={onExportModel}
        activeMode={activeMode}
        guidanceCue={guidanceCue}
      />
    </div>
  );
};
