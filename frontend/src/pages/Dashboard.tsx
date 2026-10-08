import React, { useState } from 'react';
import { ScanProvider, useScanContext } from '../context/ScanContext';
import { HomeView } from './HomeView';
import { NewScanView } from './NewScanView';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { SceneViewer } from '../components/SceneViewer';
import { InspectorPanel } from '../components/InspectorPanel';
import { CheckCircle2 } from 'lucide-react';

const DashboardContent: React.FC = () => {
  const { currentScreen, viewportMode, setViewportMode, movingObjects } = useScanContext();
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(true);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 2500);
  };

  const handleExportModel = (format: 'ply' | 'glb') => {
    showNotification(`Exported 3D scene model as .${format.toUpperCase()}`);
  };

  if (currentScreen === 'home') {
    return <HomeView />;
  }

  if (currentScreen === 'new_scan') {
    return <NewScanView />;
  }

  return (
    <DashboardLayout
      sidebarCollapsed={sidebarCollapsed}
      onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
      onExportModel={handleExportModel}
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

      {/* CENTER: HERO 3D RECONSTRUCTION WORKSPACE */}
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
          movingObjects={movingObjects}
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
        <InspectorPanel />
      </div>
    </DashboardLayout>
  );
};

export const Dashboard: React.FC = () => {
  return (
    <ScanProvider>
      <DashboardContent />
    </ScanProvider>
  );
};
