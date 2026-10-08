import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Layers,
  Settings,
  Home,
  ChevronRight,
} from 'lucide-react';

export const FlowHeader: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const flowSteps = [
    { path: '/', label: 'Home' },
    { path: '/new-scan', label: 'New Scan' },
    { path: '/connect', label: 'Connect' },
    { path: '/capture', label: 'Capture' },
    { path: '/processing', label: 'Processing' },
    { path: '/scene', label: '3D Scene' },
    { path: '/coverage', label: 'Coverage' },
    { path: '/guidance', label: 'Guidance' },
    { path: '/refine', label: 'Refine' },
    { path: '/result', label: 'Result' },
  ];

  return (
    <header
      style={{
        height: '56px',
        minHeight: '56px',
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
      {/* Brand & Subtitle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={() => navigate('/')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: 'var(--radius-sm)',
              background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
            }}
          >
            <Layers size={16} strokeWidth={2.4} />
          </div>

          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '14.5px', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)', lineHeight: 1.1 }}>
              ReConSense
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', lineHeight: 1.1 }}>
              Observation-aware 3D reconstruction
            </div>
          </div>
        </button>
      </div>

      {/* Step Flow Breadcrumb Navigation */}
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '3px',
          overflowX: 'auto',
          padding: '4px 6px',
          background: 'rgba(5, 7, 12, 0.4)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        {flowSteps.map((step, idx) => {
          const isActive = location.pathname === step.path;

          return (
            <React.Fragment key={step.path}>
              <NavLink
                to={step.path}
                style={{
                  padding: '4px 8px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? '#38bdf8' : 'var(--text-muted)',
                  background: isActive ? 'var(--bg-surface-elevated)' : 'transparent',
                  border: isActive ? '1px solid var(--border-subtle)' : '1px solid transparent',
                  transition: 'all 0.12s ease',
                }}
              >
                {step.label}
              </NavLink>

              {idx < flowSteps.length - 1 && (
                <ChevronRight size={11} style={{ color: 'rgba(255,255,255,0.15)', flexShrink: 0 }} />
              )}
            </React.Fragment>
          );
        })}
      </nav>

      {/* Right Action Icons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          onClick={() => navigate('/')}
          title="Home"
          style={{
            padding: '6px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Home size={14} />
        </button>

        <button
          onClick={() => navigate('/settings')}
          title="Settings"
          style={{
            padding: '6px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Settings size={14} />
        </button>
      </div>
    </header>
  );
};
