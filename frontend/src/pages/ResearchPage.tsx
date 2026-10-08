import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BarChart3 } from 'lucide-react';
import { useScanContext } from '../context/ScanContext';

export const ResearchPage: React.FC = () => {
  const navigate = useNavigate();
  const { reconstructionResult, reconstructionMode } = useScanContext();

  const metrics = [
    { name: 'PSNR (Peak Signal-to-Noise Ratio)', baseline: 'Awaiting evaluation', reconsense: 'Awaiting evaluation', target: 'Higher is better' },
    { name: 'SSIM (Structural Similarity)', baseline: 'Awaiting evaluation', reconsense: 'Awaiting evaluation', target: 'Higher is better' },
    { name: 'LPIPS (Perceptual Loss)', baseline: 'Awaiting evaluation', reconsense: 'Awaiting evaluation', target: 'Lower is better' },
    { name: 'Chamfer Distance (3D Surface Error)', baseline: 'Awaiting evaluation', reconsense: 'Awaiting evaluation', target: 'Lower is better' },
    { name: 'Dimension Error (Room Geometry)', baseline: 'Awaiting evaluation', reconsense: 'Awaiting evaluation', target: 'Lower is better' },
    { name: 'Unseen Region Completion (%)', baseline: '0% (Standard)', reconsense: 'Awaiting evaluation', target: 'Higher is better' },
    { name: 'Observation Room Coverage (%)', baseline: 'Awaiting evaluation', reconsense: 'Awaiting evaluation', target: 'Higher is better' },
    { name: 'Total Processing Time', baseline: 'Awaiting evaluation', reconsense: 'Awaiting evaluation', target: 'Comparative' },
    { name: 'Additional Targeted Frames', baseline: '0 (Fixed)', reconsense: 'Awaiting evaluation', target: 'Adaptive' },
  ];

  return (
    <div
      style={{
        width: '100%',
        minHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '30px 20px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '820px',
          display: 'flex',
          flexDirection: 'column',
          gap: '22px',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px' }}>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--accent-cyan)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Research Benchmark & Evaluation
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
              Original Baseline vs. ReConSense
            </h2>
          </div>

          <button
            onClick={() => navigate('/')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              color: 'var(--text-muted)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <ArrowLeft size={14} />
            <span>Return to Home</span>
          </button>
        </div>

        {/* Fairness Statement Card */}
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-cyan)', fontSize: '13px', fontWeight: 600 }}>
            <BarChart3 size={16} />
            <span>Experimental Evaluation Methodology</span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
            Both reconstruction pipelines are evaluated using the exact same initial indoor room video scan. 
            The <strong>Original Baseline</strong> executes standard unguided Structure-from-Motion without active guidance or dynamic filtering. 
            <strong>ReConSense</strong> performs observation analysis, guides user capture to fill occlusions, and removes dynamic elements.
          </p>
        </div>

        {/* Current Session Comparison Card if Available */}
        {reconstructionResult && (
          <div
            style={{
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Active Session Output</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                Mode: {reconstructionMode === 'baseline' ? 'Original Baseline' : 'ReConSense'} • {reconstructionResult.points_3d.toLocaleString()} Reconstructed 3D Points
              </div>
            </div>
            <div className="font-mono" style={{ fontSize: '11px', color: 'var(--accent-emerald)', background: 'rgba(16, 185, 129, 0.1)', padding: '4px 8px', borderRadius: 'var(--radius-sm)' }}>
              {reconstructionResult.registered_images} / {reconstructionResult.total_input_images} Registered Cameras
            </div>
          </div>
        )}

        {/* Metrics Table */}
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
          }}
        >
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Quantitative Evaluation Metrics
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              Status: Awaiting benchmark dataset run
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--bg-surface-elevated)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '10px 16px', fontWeight: 500 }}>Metric</th>
                <th style={{ padding: '10px 16px', fontWeight: 500 }}>Target</th>
                <th style={{ padding: '10px 16px', fontWeight: 500 }}>Original Baseline</th>
                <th style={{ padding: '10px 16px', fontWeight: 500 }}>ReConSense</th>
              </tr>
            </thead>
            <tbody>
              {metrics.map((m, idx) => (
                <tr
                  key={idx}
                  style={{
                    borderBottom: idx < metrics.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                    background: idx % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.01)',
                  }}
                >
                  <td style={{ padding: '10px 16px', color: 'var(--text-primary)', fontWeight: 500 }}>{m.name}</td>
                  <td style={{ padding: '10px 16px', color: 'var(--text-muted)', fontSize: '11px' }}>{m.target}</td>
                  <td style={{ padding: '10px 16px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{m.baseline}</td>
                  <td style={{ padding: '10px 16px', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>{m.reconsense}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '4px' }}>
          <button
            onClick={() => navigate('/')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 18px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            <ArrowLeft size={14} />
            <span>Back to Home</span>
          </button>
        </div>
      </div>
    </div>
  );
};
