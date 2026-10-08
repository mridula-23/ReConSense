import React, { useState } from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { SceneViewer } from '../components/SceneViewer';
import { InspectorPanel } from '../components/InspectorPanel';
import {
  mockDeviceConnection,
  mockSessionInfo,
  mockHardwareMetrics,
  mockReconstructionStages,
  mockDynamicObjects,
  mockObservationCoverage,
  mockGuidanceCues,
} from '../mock/mockData';
import type { ViewportMode, DynamicObject } from '../types/dashboard';
import { CheckCircle2 } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [viewportMode, setViewportMode] = useState<ViewportMode>('point_cloud');
  const [activeSection, setActiveSection] = useState<string>('point_cloud');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(true);
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 2600);
  };

  const handleToggleStream = () => {
    setIsStreaming(!isStreaming);
    showNotification(isStreaming ? 'WebRTC ingest stream paused' : 'WebRTC stream active (1080p60)');
  };

  const handleRunSparseSfM = () => {
    setViewportMode('point_cloud');
    showNotification('Executed incremental Bundle Adjustment (412 cameras registered)');
  };

  const handleRunDenseFusion = () => {
    setViewportMode('dense_mesh');
    showNotification('TSDF Volumetric Fusion: 1.48M facets generated');
  };

  const handleRunAIInpainting = () => {
    setViewportMode('ai_completed');
    showNotification('Observation-Aware Diffusion Prior applied to blindspots');
  };

  const handleExportModel = (format: 'ply' | 'glb' | 'obj') => {
    showNotification(`Exported scene model as .${format.toUpperCase()}`);
  };

  const handleSelectObject = (obj: DynamicObject) => {
    setSelectedObjectId(obj.id === selectedObjectId ? null : obj.id);
    setViewportMode('dynamic_filter');
    showNotification(`Selected dynamic mask: ${obj.label}`);
  };

  return (
    <DashboardLayout
      sessionInfo={mockSessionInfo}
      hardwareMetrics={mockHardwareMetrics}
      deviceConnection={mockDeviceConnection}
      isStreaming={isStreaming}
      onToggleStream={handleToggleStream}
      activeMode={viewportMode}
      onSelectMode={setViewportMode}
      activeSection={activeSection}
      onSelectSection={setActiveSection}
      sidebarCollapsed={sidebarCollapsed}
      onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
      onRunSparseSfM={handleRunSparseSfM}
      onRunDenseFusion={handleRunDenseFusion}
      onRunAIInpainting={handleRunAIInpainting}
      onExportModel={handleExportModel}
      guidanceCue={mockGuidanceCues[0]}
    >
      {/* Toast Notification */}
      {notification && (
        <div
          className="hud-panel font-mono"
          style={{
            position: 'fixed',
            bottom: '56px',
            right: '24px',
            padding: '7px 14px',
            fontSize: '11.5px',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#f8fafc',
            border: '1px solid var(--accent-cyan)',
          }}
        >
          <CheckCircle2 size={14} style={{ color: 'var(--accent-cyan)' }} />
          <span>{notification}</span>
        </div>
      )}

      {/* CENTER: HERO 3D RECONSTRUCTION WORKSPACE (Dominate View) */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <SceneViewer
          mode={viewportMode}
          onModeChange={setViewportMode}
          dynamicObjects={mockDynamicObjects}
          isStreaming={isStreaming}
        />
      </div>

      {/* RIGHT: CONTEXTUAL INSPECTOR PANEL */}
      <div
        style={{
          flex: '0 0 340px',
          width: '340px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <InspectorPanel
          stages={mockReconstructionStages}
          coverage={mockObservationCoverage}
          dynamicObjects={mockDynamicObjects}
          deviceConnection={mockDeviceConnection}
          sessionInfo={mockSessionInfo}
          selectedObjectId={selectedObjectId}
          onSelectObject={handleSelectObject}
          onInspectBlindspot={(name) => showNotification(`Inspecting sector: ${name}`)}
        />
      </div>
    </DashboardLayout>
  );
};
