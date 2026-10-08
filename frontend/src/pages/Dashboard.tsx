import React, { useState } from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { SceneViewer } from '../components/SceneViewer';
import { ConnectionStatus } from '../components/ConnectionStatus';
import { SessionPanel } from '../components/SessionPanel';
import { ReconstructionStatus } from '../components/ReconstructionStatus';
import { CoveragePanel } from '../components/CoveragePanel';
import { DynamicObjectsPanel } from '../components/DynamicObjectsPanel';
import { CameraGuidance } from '../components/CameraGuidance';
import { MetricCard } from '../components/MetricCard';
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
import { Layers, ShieldAlert, Sparkles, Box, CheckCircle2 } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [viewportMode, setViewportMode] = useState<ViewportMode>('point_cloud');
  const [activeSection, setActiveSection] = useState<string>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleToggleStream = () => {
    setIsStreaming(!isStreaming);
    showNotification(isStreaming ? 'WebRTC stream paused' : 'WebRTC stream active (1080p60)');
  };

  const handleRunSparseSfM = () => {
    setViewportMode('point_cloud');
    showNotification('Executed incremental Bundle Adjustment (412 cameras)');
  };

  const handleRunDenseFusion = () => {
    setViewportMode('dense_mesh');
    showNotification('TSDF Volumetric Fusion: 1.48M facets generated');
  };

  const handleRunAIInpainting = () => {
    setViewportMode('ai_completed');
    showNotification('AI Generative Prior applied to unobserved voids');
  };

  const handleExportModel = (format: 'ply' | 'glb' | 'obj') => {
    showNotification(`Exporting 3D scene representation as .${format.toUpperCase()}`);
  };

  const handleSelectObject = (obj: DynamicObject) => {
    setSelectedObjectId(obj.id === selectedObjectId ? null : obj.id);
    setViewportMode('dynamic_filter');
    showNotification(`Focusing dynamic entity: ${obj.label}`);
  };

  return (
    <DashboardLayout
      sessionInfo={mockSessionInfo}
      hardwareMetrics={mockHardwareMetrics}
      deviceConnection={mockDeviceConnection}
      isStreaming={isStreaming}
      onToggleStream={handleToggleStream}
      onRefreshTelemetry={() => showNotification('Hardware & perception telemetry refreshed')}
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
    >
      {/* Toast Notification */}
      {notification && (
        <div
          style={{
            position: 'fixed',
            bottom: '58px',
            right: '20px',
            background: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid var(--accent-cyan)',
            color: '#f8fafc',
            padding: '8px 14px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '12px',
            fontFamily: 'var(--font-mono)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 14px rgba(0,0,0,0.5)',
          }}
        >
          <CheckCircle2 size={15} style={{ color: 'var(--accent-cyan)' }} />
          <span>{notification}</span>
        </div>
      )}

      {/* Main Center Area: Hero 3D Viewer & Top Telemetry Metrics */}
      <div
        style={{
          flex: '1 1 65%',
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          height: '100%',
        }}
      >
        {/* Quick Top Metrics Ribbon */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '10px',
            flexShrink: 0,
          }}
        >
          <MetricCard
            label="Total Observed Room"
            value="84.6%"
            subValue="Confidence: 91.2%"
            variant="emerald"
            icon={<Layers size={14} />}
          />
          <MetricCard
            label="Sparse Keypoints"
            value="164.2k"
            unit="pts"
            subValue="412 keyframes"
            variant="cyan"
            icon={<Box size={14} />}
          />
          <MetricCard
            label="Dynamic Entities"
            value="3"
            unit="tracked"
            subValue="-42.8k pts masked"
            variant="amber"
            icon={<ShieldAlert size={14} />}
          />
          <MetricCard
            label="AI Inpainting Zones"
            value="2"
            unit="blindspots"
            subValue="Diffusion prior ready"
            variant="indigo"
            icon={<Sparkles size={14} />}
          />
        </div>

        {/* HERO 3D SCENE VIEWER */}
        <div style={{ flex: 1, minHeight: 0 }}>
          <SceneViewer
            mode={viewportMode}
            onModeChange={setViewportMode}
            dynamicObjects={mockDynamicObjects}
            isStreaming={isStreaming}
          />
        </div>
      </div>

      {/* Right Column: Multi-panel Telemetry & Perception Insights */}
      <div
        style={{
          flex: '0 0 380px',
          width: '380px',
          maxWidth: '420px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          height: '100%',
          overflowY: 'auto',
          paddingRight: '2px',
        }}
      >
        {/* Mobile Pairing & WebRTC Ingest */}
        <ConnectionStatus connection={mockDeviceConnection} />

        {/* 3D Reconstruction Pipeline Progress */}
        <ReconstructionStatus
          stages={mockReconstructionStages}
          currentStageIndex={2}
        />

        {/* Observation-Aware Coverage Analysis */}
        <CoveragePanel
          coverage={mockObservationCoverage}
          onInspectBlindspot={(name) => showNotification(`Inspecting sector: ${name}`)}
        />

        {/* Dynamic Object Filtering */}
        <DynamicObjectsPanel
          dynamicObjects={mockDynamicObjects}
          onSelectObject={handleSelectObject}
          selectedObjectId={selectedObjectId}
        />

        {/* Real-time Camera Guidance for Operator */}
        <CameraGuidance cues={mockGuidanceCues} />

        {/* Session Metadata Panel */}
        <SessionPanel session={mockSessionInfo} />
      </div>
    </DashboardLayout>
  );
};
