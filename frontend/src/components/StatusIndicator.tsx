import React from 'react';

interface StatusIndicatorProps {
  status: 'active' | 'success' | 'warning' | 'error' | 'idle' | 'processing';
  label?: string;
  size?: 'sm' | 'md';
  pulse?: boolean;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  label,
  size = 'md',
  pulse = true,
}) => {
  const getColors = () => {
    switch (status) {
      case 'active':
      case 'success':
        return {
          dot: 'var(--accent-emerald)',
          bg: 'rgba(16, 185, 129, 0.12)',
          border: 'rgba(16, 185, 129, 0.35)',
          text: '#34d399',
        };
      case 'processing':
        return {
          dot: 'var(--accent-cyan)',
          bg: 'rgba(6, 182, 212, 0.12)',
          border: 'rgba(6, 182, 212, 0.35)',
          text: '#38bdf8',
        };
      case 'warning':
        return {
          dot: 'var(--accent-amber)',
          bg: 'rgba(245, 158, 11, 0.12)',
          border: 'rgba(245, 158, 11, 0.35)',
          text: '#fbbf24',
        };
      case 'error':
        return {
          dot: 'var(--accent-rose)',
          bg: 'rgba(244, 63, 94, 0.12)',
          border: 'rgba(244, 63, 94, 0.35)',
          text: '#fb7185',
        };
      case 'idle':
      default:
        return {
          dot: 'var(--text-muted)',
          bg: 'rgba(100, 116, 139, 0.12)',
          border: 'rgba(100, 116, 139, 0.35)',
          text: '#94a3b8',
        };
    }
  };

  const colors = getColors();
  const dotSize = size === 'sm' ? 6 : 8;

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: label ? '2px 8px' : '4px',
        borderRadius: '4px',
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        fontSize: size === 'sm' ? '11px' : '12px',
        fontFamily: 'var(--font-mono)',
        color: colors.text,
        fontWeight: 500,
      }}
    >
      <span
        style={{
          width: dotSize,
          height: dotSize,
          borderRadius: '50%',
          backgroundColor: colors.dot,
          boxShadow: pulse ? `0 0 6px ${colors.dot}` : 'none',
          display: 'inline-block',
        }}
      />
      {label && <span>{label}</span>}
    </div>
  );
};
