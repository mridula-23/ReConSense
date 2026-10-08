import React, { useState } from 'react';
import {
  Workflow,
  PieChart,
  UserX,
  Database,
  CheckCircle2,
  Loader2,
  Clock,
  AlertTriangle,
  HelpCircle,
  Battery,
  Thermometer,
} from 'lucide-react';
import type {
  ReconstructionStage,
  ObservationCoverage,
  DynamicObject,
  MobileDeviceConnection,
  SessionInfo,
} from '../types/dashboard';

interface InspectorPanelProps {
  stages: ReconstructionStage[];
  coverage: ObservationCoverage;
  dynamicObjects: DynamicObject[];
  deviceConnection: MobileDeviceConnection;
  sessionInfo: SessionInfo;
  selectedObjectId?: string | null;
  onSelectObject?: (obj: DynamicObject) => void;
  onInspectBlindspot?: (sectorName: string) => void;
}

type InspectorTab = 'pipeline' | 'coverage' | 'entities' | 'session';

export const InspectorPanel: React.FC<InspectorPanelProps> = ({
  stages,
  coverage,
  dynamicObjects,
  deviceConnection,
  sessionInfo,
  selectedObjectId,
  onSelectObject,
  onInspectBlindspot,
}) => {
  const [activeTab, setActiveTab] = useState<InspectorTab>('pipeline');

  const tabs: { id: InspectorTab; label: string; icon: any; badge?: string }[] = [
    { id: 'pipeline', label: 'Pipeline', icon: Workflow, badge: '3/5' },
    { id: 'coverage', label: 'Coverage', icon: PieChart, badge: `${coverage.totalCoveragePercent}%` },
    { id: 'entities', label: 'Entities', icon: UserX, badge: `${dynamicObjects.length}` },
    { id: 'session', label: 'Telemetry', icon: Database },
  ];

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainingSec = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSec.toString().padStart(2, '0')}`;
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Top Tab Switcher */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'rgba(5, 7, 12, 0.4)',
          padding: '4px 6px',
          gap: '4px',
        }}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
                padding: '6px 4px',
                borderRadius: 'var(--radius-sm)',
                background: isActive ? 'var(--bg-surface-elevated)' : 'transparent',
                border: isActive ? '1px solid var(--border-subtle)' : '1px solid transparent',
                color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                fontSize: '11.5px',
                fontWeight: isActive ? 600 : 500,
                fontFamily: 'var(--font-mono)',
              }}
            >
              <Icon size={13} style={{ color: isActive ? 'var(--accent-cyan)' : 'inherit' }} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  style={{
                    fontSize: '9px',
                    padding: '0 4px',
                    borderRadius: '2px',
                    background: isActive ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255,255,255,0.05)',
                    color: isActive ? 'var(--accent-cyan)' : 'var(--text-muted)',
                  }}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Inspector Body Content */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '12px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        {/* TAB 1: PIPELINE STAGES */}
        {activeTab === 'pipeline' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Reconstruction Stages
              </span>
              <span className="badge badge-cyan">STAGE 3 ACTIVE</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {stages.map((stage, idx) => {
                const isDone = stage.status === 'completed';
                const isRunning = stage.status === 'in_progress';

                return (
                  <div
                    key={stage.id}
                    style={{
                      background: isRunning ? 'var(--bg-surface-elevated)' : 'rgba(255, 255, 255, 0.02)',
                      border: isRunning ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '8px 10px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '5px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                        {isDone ? (
                          <CheckCircle2 size={14} style={{ color: 'var(--accent-emerald)', flexShrink: 0 }} />
                        ) : isRunning ? (
                          <Loader2 size={14} className="spin-animation" style={{ color: 'var(--accent-cyan)', flexShrink: 0 }} />
                        ) : (
                          <Clock size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                        )}
                        <span style={{ fontSize: '12px', fontWeight: isRunning ? 600 : 500, color: isDone || isRunning ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                          {idx + 1}. {stage.name}
                        </span>
                      </div>
                      <span className="font-mono" style={{ fontSize: '10.5px', color: isDone ? 'var(--accent-emerald)' : isRunning ? 'var(--accent-cyan)' : 'var(--text-muted)', fontWeight: 600 }}>
                        {isDone ? 'DONE' : isRunning ? `${stage.progressPercent}%` : 'QUEUED'}
                      </span>
                    </div>

                    {isRunning && (
                      <div style={{ height: '3px', width: '100%', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${stage.progressPercent}%`, backgroundColor: 'var(--accent-cyan)', transition: 'width 0.3s ease' }} />
                      </div>
                    )}

                    <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', lineHeight: 1.3 }}>
                      {stage.description}
                    </div>

                    {stage.metrics && (
                      <div style={{ display: 'flex', gap: '8px', paddingTop: '2px' }}>
                        {stage.metrics.map((m, mIdx) => (
                          <span key={mIdx} className="font-mono" style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
                            {m.label}: <strong style={{ color: 'var(--text-primary)' }}>{m.value}</strong>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: COVERAGE ANALYSIS */}
        {activeTab === 'coverage' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Observation Breakdown
              </span>
              <span className="badge badge-emerald">{coverage.totalCoveragePercent}% OBSERVED</span>
            </div>

            {/* Tri-state progress distribution bar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div
                style={{
                  height: '8px',
                  width: '100%',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  borderRadius: 'var(--radius-sm)',
                  overflow: 'hidden',
                  display: 'flex',
                }}
              >
                <div style={{ width: `${coverage.observedPercent}%`, backgroundColor: 'var(--accent-emerald)' }} />
                <div style={{ width: `${coverage.occludedPercent}%`, backgroundColor: 'var(--accent-amber)' }} />
                <div style={{ width: `${coverage.unobservedPercent}%`, backgroundColor: 'var(--accent-rose)' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: 'var(--text-secondary)' }}>
                <span style={{ color: 'var(--accent-emerald)' }}>Observed {coverage.observedPercent}%</span>
                <span style={{ color: 'var(--accent-amber)' }}>Occluded {coverage.occludedPercent}%</span>
                <span style={{ color: 'var(--accent-rose)' }}>Unobserved {coverage.unobservedPercent}%</span>
              </div>
            </div>

            {/* Critical Blindspot Banner */}
            {coverage.identifiedBlindspots > 0 && (
              <div
                style={{
                  background: 'rgba(245, 158, 11, 0.08)',
                  border: '1px solid rgba(245, 158, 11, 0.25)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '8px 10px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                }}
              >
                <AlertTriangle size={14} style={{ color: 'var(--accent-amber)', flexShrink: 0, marginTop: '2px' }} />
                <div style={{ fontSize: '11px', color: '#fde68a' }}>
                  <div style={{ fontWeight: 600 }}>{coverage.identifiedBlindspots} Critical Blindspots Identified</div>
                  <div style={{ color: 'var(--text-secondary)', marginTop: '2px', fontSize: '10.5px' }}>
                    North-West corner requires downward camera angle pass or AI inpainting prior.
                  </div>
                </div>
              </div>
            )}

            {/* Sector Breakdown List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '10.5px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Sector Visibility Index
              </span>

              {coverage.sectors.map((sec, idx) => (
                <div
                  key={idx}
                  onClick={() => onInspectBlindspot?.(sec.name)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-subtle)',
                    padding: '5px 8px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '11px',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {sec.status === 'sufficient' ? (
                      <CheckCircle2 size={12} style={{ color: 'var(--accent-emerald)' }} />
                    ) : sec.status === 'partial' ? (
                      <HelpCircle size={12} style={{ color: 'var(--accent-amber)' }} />
                    ) : (
                      <AlertTriangle size={12} style={{ color: 'var(--accent-rose)' }} />
                    )}
                    <span style={{ color: 'var(--text-primary)' }}>{sec.name}</span>
                  </div>

                  <span
                    className="font-mono"
                    style={{
                      fontWeight: 600,
                      color: sec.status === 'sufficient' ? 'var(--accent-emerald)' : sec.status === 'partial' ? 'var(--accent-amber)' : 'var(--accent-rose)',
                    }}
                  >
                    {sec.observedPercent}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: DYNAMIC ENTITIES */}
        {activeTab === 'entities' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Dynamic Mask Filter
              </span>
              <span className="badge badge-rose">{dynamicObjects.length} ENTITIES</span>
            </div>

            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              Transient motion artifacts masked by YOLOv11 + SAM2 and excluded from static TSDF fusion.
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {dynamicObjects.map((obj) => {
                const isSelected = selectedObjectId === obj.id;
                return (
                  <div
                    key={obj.id}
                    onClick={() => onSelectObject?.(obj)}
                    style={{
                      background: isSelected ? 'var(--bg-surface-elevated)' : 'rgba(255, 255, 255, 0.02)',
                      border: isSelected ? '1px solid var(--accent-rose)' : '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '7px 9px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--accent-rose)' }} />
                        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{obj.label}</span>
                      </div>
                      <span className="badge badge-rose">{(obj.confidence * 100).toFixed(0)}% CONF</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: 'var(--text-muted)' }}>
                      <span className="font-mono">Frames #{obj.firstSeenFrame}–#{obj.lastSeenFrame}</span>
                      <span className="font-mono" style={{ color: 'var(--accent-rose)' }}>-{obj.maskedPointsCount.toLocaleString()} pts</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: MOBILE & SESSION TELEMETRY */}
        {activeTab === 'session' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Hardware & Mobile Ingest
              </span>
              <span className="badge badge-cyan">{deviceConnection.streamQuality}</span>
            </div>

            {/* Mobile Node 2x2 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', padding: '6px 8px', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Bitrate / FPS</div>
                <div className="font-mono" style={{ fontSize: '12px', fontWeight: 600 }}>{deviceConnection.bitrateMbps} Mbps @ {deviceConnection.fps}</div>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', padding: '6px 8px', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Latency / Loss</div>
                <div className="font-mono" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent-emerald)' }}>{deviceConnection.latencyMs} ms ({deviceConnection.packetLossPercent}%)</div>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', padding: '6px 8px', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Battery size={14} style={{ color: 'var(--accent-emerald)' }} />
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Battery</div>
                  <div className="font-mono" style={{ fontSize: '12px', fontWeight: 600 }}>{deviceConnection.batteryLevel}%</div>
                </div>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', padding: '6px 8px', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Thermometer size={14} style={{ color: 'var(--accent-cyan)' }} />
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Core Temp</div>
                  <div className="font-mono" style={{ fontSize: '12px', fontWeight: 600 }}>{deviceConnection.temperatureCelsius}°C</div>
                </div>
              </div>
            </div>

            {/* Session Info Details */}
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '10.5px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Session Properties
              </span>

              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <div><strong>Session:</strong> {sessionInfo.sessionName}</div>
                <div><strong>Operator:</strong> {sessionInfo.operator}</div>
                <div><strong>Environment:</strong> {sessionInfo.environmentType}</div>
                <div className="font-mono"><strong>Duration:</strong> {formatDuration(sessionInfo.durationSeconds)}</div>
                <div className="font-mono"><strong>Keyframes:</strong> {sessionInfo.keyframesSelected} / {sessionInfo.totalFramesReceived.toLocaleString()}</div>
                <div className="font-mono"><strong>Disk Cache:</strong> {sessionInfo.storageUsageMb} MB</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
