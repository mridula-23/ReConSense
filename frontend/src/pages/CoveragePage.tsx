import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
} from 'lucide-react';
import { useScanContext } from '../context/ScanContext';

export const CoveragePage: React.FC = () => {
  const navigate = useNavigate();
  const { roomCoverage, isDemoSampleLoaded } = useScanContext();

  const handleContinue = () => {
    navigate('/guidance');
  };

  return (
    <div
      style={{
        width: '100%',
        minHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '30px 20px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '620px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '22px',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px' }}>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--accent-cyan)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Step 5 of 8
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
              Room Coverage
            </h2>
          </div>

          <button
            onClick={() => navigate('/scene')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              color: 'var(--text-muted)',
            }}
          >
            <ArrowLeft size={14} />
            <span>Back to 3D Scene</span>
          </button>
        </div>

        {/* Explanation */}
        <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          This view shows which parts of the room have been captured clearly.
        </p>

        {/* Coverage Sections */}
        {roomCoverage && isDemoSampleLoaded ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {roomCoverage.map((sec) => (
              <div
                key={sec.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '12.5px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {sec.category === 'seen' ? (
                    <CheckCircle2 size={15} style={{ color: 'var(--accent-emerald)' }} />
                  ) : sec.category === 'low_views' ? (
                    <HelpCircle size={15} style={{ color: 'var(--accent-amber)' }} />
                  ) : (
                    <AlertTriangle size={15} style={{ color: 'var(--accent-rose)' }} />
                  )}
                  <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{sec.name}</span>
                </div>

                <span
                  style={{
                    fontSize: '11.5px',
                    fontWeight: 600,
                    color:
                      sec.category === 'seen'
                        ? 'var(--accent-emerald)'
                        : sec.category === 'low_views'
                        ? 'var(--accent-amber)'
                        : 'var(--accent-rose)',
                  }}
                >
                  {sec.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              background: 'var(--bg-surface-elevated)',
              border: '1px dashed var(--border-default)',
              borderRadius: 'var(--radius-md)',
              padding: '24px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
              Coverage information will appear after reconstruction.
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                <div style={{ fontSize: '12px', color: 'var(--accent-emerald)', fontWeight: 600 }}>Seen</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Waiting for scan data</div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                <div style={{ fontSize: '12px', color: 'var(--accent-amber)', fontWeight: 600 }}>Not enough views</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Waiting for scan data</div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                <div style={{ fontSize: '12px', color: 'var(--accent-rose)', fontWeight: 600 }}>Unseen</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Waiting for scan data</div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}>
          <button
            onClick={handleContinue}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 22px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--accent-cyan)',
              color: '#030712',
              fontWeight: 600,
              fontSize: '13.5px',
              boxShadow: '0 0 14px rgba(56, 189, 248, 0.3)',
            }}
          >
            <span>Continue</span>
            <ArrowRight size={15} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
};

