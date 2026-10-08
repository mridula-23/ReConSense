import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ScanProvider } from './context/ScanContext';
import { AppShell } from './layouts/AppShell';
import { HomePage } from './pages/HomePage';
import { ReConSenseModePage } from './pages/ReConSenseModePage';
import { BaselineModePage } from './pages/BaselineModePage';
import { ResearchPage } from './pages/ResearchPage';
import { UploadVideoPage } from './pages/UploadVideoPage';
import { NewScanPage } from './pages/NewScanPage';
import { ConnectPhonePage } from './pages/ConnectPhonePage';
import { CapturePage } from './pages/CapturePage';
import { ProcessingPage } from './pages/ProcessingPage';
import { ScenePage } from './pages/ScenePage';
import { CoveragePage } from './pages/CoveragePage';
import { GuidancePage } from './pages/GuidancePage';
import { RefinePage } from './pages/RefinePage';
import { ResultPage } from './pages/ResultPage';
import { SettingsPage } from './pages/SettingsPage';
import { MobileConnectPage } from './pages/MobileConnectPage';
import { MobileCapturePage } from './pages/MobileCapturePage';
import './App.css';

export function App() {
  return (
    <ScanProvider>
      <BrowserRouter>
        <Routes>
          {/* Mobile phone pairing & streaming standalone routes */}
          <Route path="/mobile/connect" element={<MobileConnectPage />} />
          <Route path="/mobile/capture" element={<MobileCapturePage />} />

          {/* Desktop Web Application Shell */}
          <Route element={<AppShell />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/reconsense" element={<ReConSenseModePage />} />
            <Route path="/baseline" element={<BaselineModePage />} />
            <Route path="/research" element={<ResearchPage />} />
            <Route path="/upload" element={<UploadVideoPage />} />
            <Route path="/new-scan" element={<NewScanPage />} />
            <Route path="/connect" element={<ConnectPhonePage />} />
            <Route path="/capture" element={<CapturePage />} />
            <Route path="/processing" element={<ProcessingPage />} />
            <Route path="/scene" element={<ScenePage />} />
            <Route path="/coverage" element={<CoveragePage />} />
            <Route path="/guidance" element={<GuidancePage />} />
            <Route path="/refine" element={<RefinePage />} />
            <Route path="/result" element={<ResultPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ScanProvider>
  );
}

export default App;

