import React from 'react';
import {
  Layers,
  Smartphone,
  Plus,
  Home,
  Sparkles,
} from 'lucide-react';
import { useScanContext } from '../context/ScanContext';

export const Header: React.FC = () => {
  const { activeSession, phoneConnection, isDemoSampleLoaded, resetToHome, startNewScan } = useScanContext();

  return (
    <header
      style={{
        height: '54px',
        minHeight: '54px',
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 18px',
        gap: '16px',
        zIndex: 50,
      }}
    >
      {/* Brand & Scan Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <button
          onClick={resetToHome}
          title="Return to Home"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <div
            style={{
              width: '26px',
              height: '26px',
              borderRadius: 'var(--radius-sm)',
              background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
            }}
          >
            <Layers size={15} strokeWidth={2.4} />
          </div>

          <span
            style={{
              fontSize: '14.5px',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
            }}
          >
            ReConSense
          </span>
        </button>

        <div style={{ height: '16px', width: '1px', backgroundColor: 'var(--border-subtle)' }} />

        {/* Current Active Scan Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
            {activeSession ? activeSession.name : 'Workspace'}
          </span>
          {activeSession && (
            <span
              className="font-mono"
              style={{
                fontSize: '10px',
                color: 'var(--text-muted)',
                background: 'var(--bg-surface-elevated)',
                padding: '1px 6px',
                borderRadius: '3px',
                border: '1px solid var(--border-subtle)',
              }}
            >
              {activeSession.roomType}
            </span>
          )}

          {isDemoSampleLoaded && (
            <span className="badge badge-indigo" style={{ fontSize: '10px' }}>
              <Sparkles size={11} />
              Sample Demo Room
            </span>
          )}
        </div>
      </div>

      {/* Right Controls: Phone Status & Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Phone Connection Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'var(--bg-surface-elevated)',
            padding: '4px 9px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
          }}
        >
          <Smartphone size={13} style={{ color: phoneConnection.status === 'connected' ? 'var(--accent-emerald)' : 'var(--text-muted)' }} />
          {phoneConnection.status === 'connected' ? (
            <span style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>Phone Connected</span>
          ) : (
            <span style={{ color: 'var(--text-muted)' }}>Phone: Not Connected</span>
          )}
        </div>

        {/* Quick New Scan button */}
        <button
          onClick={() => startNewScan('New Room Scan', 'Living Room')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            padding: '5px 11px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-primary)',
            fontSize: '11.5px',
            fontWeight: 500,
          }}
        >
          <Plus size={13} />
          <span>New Scan</span>
        </button>

        {/* Home button */}
        <button
          onClick={resetToHome}
          title="Return to Home"
          style={{
            padding: '6px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Home size={14} />
        </button>
      </div>
    </header>
  );
};
