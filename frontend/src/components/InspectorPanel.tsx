import React, { useState } from 'react';
import {
  Workflow,
  PieChart,
  UserX,
  FileText,
  Code,
  CheckCircle2,
  Loader2,
  Clock,
  AlertTriangle,
  HelpCircle,
} from 'lucide-react';
import { useScanContext } from '../context/ScanContext';

type InspectorTab = 'steps' | 'coverage' | 'objects' | 'details' | 'advanced';

export const InspectorPanel: React.FC = () => {
  const {
    activeSession,
    processingSteps,
    roomCoverage,
    movingObjects,
    phoneConnection,
  } = useScanContext();

  const [activeTab, setActiveTab] = useState<InspectorTab>('steps');

  const tabs: { id: InspectorTab; label: string; icon: any; badge?: string }[] = [
    { id: 'steps', label: 'Steps', icon: Workflow },
    { id: 'coverage', label: 'Coverage', icon: PieChart, badge: roomCoverage.isCalculated ? `${roomCoverage.overallCoveragePercent}%` : undefined },
    { id: 'objects', label: 'Objects', icon: UserX, badge: movingObjects.length > 0 ? `${movingObjects.length}` : undefined },
    { id: 'details', label: 'Details', icon: FileText },
    { id: 'advanced', label: 'Advanced', icon: Code },
  ];

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
      {/* Top Tab Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'rgba(5, 7, 12, 0.4)',
          padding: '4px',
          gap: '3px',
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
                gap: '4px',
                padding: '6px 2px',
                borderRadius: 'var(--radius-sm)',
                background: isActive ? 'var(--bg-surface-elevated)' : 'transparent',
                border: isActive ? '1px solid var(--border-subtle)' : '1px solid transparent',
                color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                fontSize: '11px',
                fontWeight: isActive ? 600 : 500,
                fontFamily: 'var(--font-mono)',
              }}
            >
              <Icon size={12} style={{ color: isActive ? 'var(--accent-cyan)' : 'inherit' }} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  style={{
                    fontSize: '8.5px',
                    padding: '0 3px',
                    borderRadius: '2px',
                    background: 'rgba(56, 189, 248, 0.15)',
                    color: 'var(--accent-cyan)',
                  }}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Body Content */}
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
        {/* TAB 1: RECONSTRUCTION STEPS */}
        {activeTab === 'steps' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Reconstruction Workflow
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {processingSteps.map((step) => {
                const isDone = step.status === 'completed';
                const isRunning = step.status === 'processing';

                return (
                  <div
                    key={step.id}
                    style={{
                      background: isRunning ? 'var(--bg-surface-elevated)' : 'rgba(255, 255, 255, 0.02)',
                      border: isRunning ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '8px 10px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
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
                          {step.name}
                        </span>
                      </div>

                      <span className="font-mono" style={{ fontSize: '10px', color: isDone ? 'var(--accent-emerald)' : isRunning ? 'var(--accent-cyan)' : 'var(--text-muted)', fontWeight: 600 }}>
                        {isDone ? 'COMPLETED' : isRunning ? `${step.progressPercent || 0}%` : 'WAITING'}
                      </span>
                    </div>

                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.35 }}>
                      {step.simpleDescription}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: ROOM COVERAGE */}
        {activeTab === 'coverage' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Room Coverage
              </span>
              {roomCoverage.isCalculated && (
                <span className="badge badge-emerald">{roomCoverage.overallCoveragePercent}% COVERED</span>
              )}
            </div>

            {!roomCoverage.isCalculated ? (
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px dashed var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '18px 12px',
                  textAlign: 'center',
                  color: 'var(--text-muted)',
                  fontSize: '11.5px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <PieChart size={20} />
                <div>Coverage will be calculated after scanning the room.</div>
              </div>
            ) : (
              <>
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
                    <div style={{ width: `${roomCoverage.seenPercent || 0}%`, backgroundColor: 'var(--accent-emerald)' }} />
                    <div style={{ width: `${roomCoverage.partiallySeenPercent || 0}%`, backgroundColor: 'var(--accent-amber)' }} />
                    <div style={{ width: `${roomCoverage.unseenPercent || 0}%`, backgroundColor: 'var(--accent-rose)' }} />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: 'var(--text-secondary)' }}>
                    <span style={{ color: 'var(--accent-emerald)' }}>Seen {roomCoverage.seenPercent}%</span>
                    <span style={{ color: 'var(--accent-amber)' }}>Partially Seen {roomCoverage.partiallySeenPercent}%</span>
                    <span style={{ color: 'var(--accent-rose)' }}>Unseen {roomCoverage.unseenPercent}%</span>
                  </div>
                </div>

                {roomCoverage.unseenAreaAlerts.length > 0 && (
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
                      <div style={{ fontWeight: 600 }}>Unseen Areas Detected</div>
                      <div style={{ color: 'var(--text-secondary)', marginTop: '2px', fontSize: '10.5px' }}>
                        {roomCoverage.unseenAreaAlerts[0]}
                      </div>
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '10.5px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Room Areas
                  </span>

                  {roomCoverage.sectors.map((sec, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid var(--border-subtle)',
                        padding: '5px 8px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '11px',
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
                        {sec.coveragePercent !== undefined ? `${sec.coveragePercent}%` : 'Pending'}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* TAB 3: MOVING OBJECTS */}
        {activeTab === 'objects' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Moving Objects Filter
              </span>
              {movingObjects.length > 0 && (
                <span className="badge badge-rose">{movingObjects.length} FILTERED</span>
              )}
            </div>

            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              Moving people or objects in the room are automatically detected and cleaned out from the permanent 3D room.
            </div>

            {movingObjects.length === 0 ? (
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px dashed var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '18px 12px',
                  textAlign: 'center',
                  color: 'var(--text-muted)',
                  fontSize: '11.5px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <UserX size={20} />
                <div>No moving objects detected yet.</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {movingObjects.map((obj) => (
                  <div
                    key={obj.id}
                    style={{
                      background: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '7px 9px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--accent-rose)' }} />
                        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{obj.label}</span>
                      </div>
                      <span className="badge badge-rose">Filtered Out</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: 'var(--text-muted)' }}>
                      <span className="font-mono">{obj.frameRange || 'Tracked in sweep'}</span>
                      {obj.filteredPointCount && (
                        <span className="font-mono" style={{ color: 'var(--accent-rose)' }}>
                          -{obj.filteredPointCount.toLocaleString()} pts
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: SCENE DETAILS */}
        {activeTab === 'details' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Scene Information
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11.5px', color: 'var(--text-secondary)' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '10px', textTransform: 'uppercase' }}>Scan Name</div>
                <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)' }}>{activeSession?.name || 'No active scan'}</div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '10px', textTransform: 'uppercase' }}>Room Type</div>
                <div style={{ fontSize: '12px', color: 'var(--text-primary)' }}>{activeSession?.roomType || 'Indoor Room'}</div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '10px', textTransform: 'uppercase' }}>Video Frames</div>
                <div className="font-mono" style={{ fontSize: '12px', color: 'var(--text-primary)' }}>
                  {activeSession && activeSession.frameCount > 0 ? `${activeSession.frameCount} frames recorded` : '0 frames (Waiting for video)'}
                </div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '10px', textTransform: 'uppercase' }}>Phone Connection</div>
                <div style={{ fontSize: '12px', color: phoneConnection.status === 'connected' ? 'var(--accent-emerald)' : 'var(--text-muted)' }}>
                  {phoneConnection.status === 'connected' ? phoneConnection.deviceName : 'Not connected'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: ADVANCED TECHNICAL DETAILS (For developers & judges) */}
        {activeTab === 'advanced' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Advanced Technical Diagnostics
              </span>
              <span className="badge">DEVELOPER</span>
            </div>

            <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
              Technical reconstruction parameters and perception pipeline metadata.
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '6px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)' }}>SfM Engine:</span> Incremental COLMAP / SuperPoint
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '6px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Segmentation:</span> YOLOv11 + SAM2 Temporal Masking
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '6px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Fusion Model:</span> TSDF Volumetric Raycasting (2.5mm)
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '6px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Inpainting Prior:</span> Observation-Aware Diffusion Model
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
