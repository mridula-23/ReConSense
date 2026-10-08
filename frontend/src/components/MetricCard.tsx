import React from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  subValue?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendText?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'cyan' | 'emerald' | 'amber' | 'indigo';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  unit,
  subValue,
  trend,
  trendText,
  icon,
  variant = 'default',
}) => {
  const getAccentColor = () => {
    switch (variant) {
      case 'cyan':
        return 'var(--accent-cyan)';
      case 'emerald':
        return 'var(--accent-emerald)';
      case 'amber':
        return 'var(--accent-amber)';
      case 'indigo':
        return 'var(--accent-indigo)';
      default:
        return 'var(--border-default)';
    }
  };

  return (
    <div
      style={{
        background: 'var(--bg-surface-0)',
        border: '1px solid var(--border-subtle)',
        borderLeft: variant !== 'default' ? `3px solid ${getAccentColor()}` : '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-sm)',
        padding: '8px 10px',
        display: 'flex',
        flexDirection: 'column',
        gap: '3px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: 'var(--text-muted)',
          fontSize: '11px',
          fontWeight: 500,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}
      >
        <span>{label}</span>
        {icon && <span style={{ color: 'var(--text-secondary)', display: 'flex' }}>{icon}</span>}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
        <span
          className="font-mono"
          style={{
            fontSize: '16px',
            fontWeight: 600,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
          }}
        >
          {value}
        </span>
        {unit && (
          <span
            className="font-mono"
            style={{
              fontSize: '11px',
              color: 'var(--text-muted)',
            }}
          >
            {unit}
          </span>
        )}
      </div>

      {(subValue || trendText) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '10.5px',
            color: 'var(--text-secondary)',
            marginTop: '2px',
          }}
        >
          {subValue && <span>{subValue}</span>}
          {trendText && (
            <span
              style={{
                color:
                  trend === 'up'
                    ? 'var(--accent-emerald)'
                    : trend === 'down'
                    ? 'var(--accent-rose)'
                    : 'var(--text-muted)',
                fontFamily: 'var(--font-mono)',
                fontWeight: 500,
              }}
            >
              {trendText}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
