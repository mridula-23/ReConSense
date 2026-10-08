import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  RotateCcw,
  Grid,
  Sparkles,
  PieChart,
  Box,
  Layers,
} from 'lucide-react';
import { useScanContext, type ViewportMode, type DynamicObject } from '../context/ScanContext';

interface SceneViewerProps {
  mode: ViewportMode;
  onModeChange: (mode: ViewportMode) => void;
  movingObjects?: DynamicObject[];
}

interface Point3D {
  x: number;
  y: number;
  z: number;
  r: number;
  g: number;
  b: number;
  type?: 'static' | 'dynamic' | 'observed' | 'unobserved' | 'inpainted';
}

export const SceneViewer: React.FC<SceneViewerProps> = ({
  mode,
  onModeChange,
}) => {
  const {
    isDemoSampleLoaded,
    loadDemoSample,
    reconstructionPoints,
  } = useScanContext();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [rotation, setRotation] = useState({ pitch: 0.38, yaw: 0.75 });
  const [zoom, setZoom] = useState(1.0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const [showGrid, setShowGrid] = useState(true);
  const [showTrajectory, setShowTrajectory] = useState(true);

  const pointsRef = useRef<Point3D[]>([]);

  const hasRealPoints = Boolean(reconstructionPoints && reconstructionPoints.length > 0);
  const has3DContent = isDemoSampleLoaded || hasRealPoints;

  // Load points: real COLMAP points if available, or synthetic demo points if requested
  useEffect(() => {
    if (reconstructionPoints && reconstructionPoints.length > 0) {
      // 1. Real COLMAP 3D points
      let minX = Infinity, maxX = -Infinity;
      let minY = Infinity, maxY = -Infinity;
      let minZ = Infinity, maxZ = -Infinity;

      reconstructionPoints.forEach((p) => {
        if (p.x < minX) minX = p.x;
        if (p.x > maxX) maxX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.y > maxY) maxY = p.y;
        if (p.z < minZ) minZ = p.z;
        if (p.z > maxZ) maxZ = p.z;
      });

      const cx = (minX + maxX) / 2;
      const cy = (minY + maxY) / 2;
      const cz = (minZ + maxZ) / 2;
      const maxDim = Math.max(maxX - minX, maxY - minY, maxZ - minZ, 0.001);
      const scale = 4.0 / maxDim;

      pointsRef.current = reconstructionPoints.map((p) => ({
        x: (p.x - cx) * scale,
        y: (p.y - cy) * scale,
        z: (p.z - cz) * scale,
        r: p.r,
        g: p.g,
        b: p.b,
        type: 'observed',
      }));
      return;
    }

    if (!isDemoSampleLoaded) {
      pointsRef.current = [];
      return;
    }

    // 2. Demo Sample Room Points (synthetic, only for preview)
    const points: Point3D[] = [];

    // Room Floor
    for (let x = -3.5; x <= 3.5; x += 0.22) {
      for (let z = -3.5; z <= 3.5; z += 0.22) {
        const noise = (Math.random() - 0.5) * 0.03;
        points.push({
          x: x + noise,
          y: -1.5,
          z: z + noise,
          r: 45,
          g: 55,
          b: 70,
          type: 'observed',
        });
      }
    }

    // Room Walls
    for (let y = -1.5; y <= 2.2; y += 0.25) {
      for (let x = -3.5; x <= 3.5; x += 0.25) {
        // Back wall
        points.push({
          x,
          y,
          z: -3.5,
          r: 60,
          g: 75,
          b: 95,
          type: x > 1.5 && y < 0 ? 'unobserved' : 'observed',
        });
        // Front wall
        points.push({
          x,
          y,
          z: 3.5,
          r: 50,
          g: 65,
          b: 80,
          type: 'observed',
        });
      }
      for (let z = -3.5; z <= 3.5; z += 0.25) {
        // Left wall
        points.push({
          x: -3.5,
          y,
          z,
          r: 55,
          g: 70,
          b: 90,
          type: 'observed',
        });
        // Right wall
        points.push({
          x: 3.5,
          y,
          z,
          r: 55,
          g: 70,
          b: 90,
          type: z > 1.0 ? 'unobserved' : 'observed',
        });
      }
    }

    // Central Table
    for (let x = -1.2; x <= 1.2; x += 0.12) {
      for (let z = -0.8; z <= 0.8; z += 0.12) {
        points.push({
          x,
          y: -0.6,
          z,
          r: 160,
          g: 130,
          b: 95,
          type: 'observed',
        });
      }
    }

    pointsRef.current = points;
  }, [isDemoSampleLoaded, reconstructionPoints]);

  // Handle Drag / Pan / Rotation
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;

      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;

      if (e.buttons === 1) {
        // Left Click: Orbit / Rotate
        setRotation((prev) => ({
          pitch: Math.max(-1.4, Math.min(1.4, prev.pitch - dy * 0.008)),
          yaw: prev.yaw + dx * 0.008,
        }));
      } else if (e.buttons === 2 || e.buttons === 4) {
        // Right / Middle Click: Pan
        setPan((prev) => ({
          x: prev.x + dx * 0.005,
          y: prev.y - dy * 0.005,
        }));
      }

      setDragStart({ x: e.clientX, y: e.clientY });
    },
    [isDragging, dragStart]
  );

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Zoom on wheel
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
      setZoom((prev) => Math.max(0.3, Math.min(3.5, prev * zoomFactor)));
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  // Projection Helper
  const project = useCallback(
    (
      x: number,
      y: number,
      z: number,
      width: number,
      height: number
    ): { x: number; y: number; z: number; visible: boolean } => {
      const cx = x + pan.x;
      const cy = y + pan.y;
      const cz = z;

      // Yaw rotation
      const cosY = Math.cos(rotation.yaw);
      const sinY = Math.sin(rotation.yaw);
      const x1 = cx * cosY - cz * sinY;
      const z1 = cx * sinY + cz * cosY;

      // Pitch rotation
      const cosP = Math.cos(rotation.pitch);
      const sinP = Math.sin(rotation.pitch);
      const y2 = cy * cosP - z1 * sinP;
      const z2 = cy * sinP + z1 * cosP;

      const cameraDistance = 7.5 / zoom;
      const zEff = z2 + cameraDistance;

      if (zEff <= 0.2) {
        return { x: 0, y: 0, z: zEff, visible: false };
      }

      const fov = 480;
      const px = width / 2 + (x1 * fov) / zEff;
      const py = height / 2 - (y2 * fov) / zEff;

      return {
        x: px,
        y: py,
        z: zEff,
        visible: px >= -50 && px <= width + 50 && py >= -50 && py <= height + 50,
      };
    },
    [rotation, zoom, pan]
  );

  // Render Canvas Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      ctx.fillStyle = '#05070c';
      ctx.fillRect(0, 0, width, height);

      // Render 3D Ground Grid
      if (showGrid) {
        ctx.lineWidth = 1;
        const gridSize = 4;
        const step = 0.5;

        for (let i = -gridSize; i <= gridSize; i += step) {
          const p1 = project(i, -1.5, -gridSize, width, height);
          const p2 = project(i, -1.5, gridSize, width, height);

          if (p1.visible && p2.visible) {
            ctx.strokeStyle = i === 0 ? 'rgba(56, 189, 248, 0.3)' : 'rgba(255, 255, 255, 0.04)';
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }

          const p3 = project(-gridSize, -1.5, i, width, height);
          const p4 = project(gridSize, -1.5, i, width, height);

          if (p3.visible && p4.visible) {
            ctx.strokeStyle = i === 0 ? 'rgba(244, 63, 94, 0.3)' : 'rgba(255, 255, 255, 0.04)';
            ctx.beginPath();
            ctx.moveTo(p3.x, p3.y);
            ctx.lineTo(p4.x, p4.y);
            ctx.stroke();
          }
        }
      }

      // Render Camera Path if in demo mode
      if (showTrajectory && isDemoSampleLoaded && pointsRef.current.length > 0) {
        const trajectoryPoints = [
          { x: 2.2, y: 0.1, z: 2.5 },
          { x: 1.5, y: 0.2, z: 2.0 },
          { x: 0.5, y: 0.15, z: 1.8 },
          { x: -1.0, y: 0.1, z: 1.6 },
          { x: -2.0, y: 0.25, z: 0.8 },
          { x: -2.2, y: 0.3, z: -0.5 },
          { x: -1.6, y: 0.2, z: -1.5 },
          { x: 0.0, y: 0.15, z: -1.8 },
          { x: 1.6, y: 0.25, z: -1.0 },
          { x: 2.0, y: 0.2, z: 0.5 },
        ];

        ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
        ctx.lineWidth = 1.4;
        ctx.beginPath();

        let started = false;
        trajectoryPoints.forEach((pt) => {
          const pr = project(pt.x, pt.y, pt.z, width, height);
          if (pr.visible) {
            if (!started) {
              ctx.moveTo(pr.x, pr.y);
              started = true;
            } else {
              ctx.lineTo(pr.x, pr.y);
            }
          }
        });
        ctx.stroke();
      }

      // Render Point Cloud
      const pts = pointsRef.current;
      pts.forEach((p) => {
        if (mode === 'coverage') {
          const pr = project(p.x, p.y, p.z, width, height);
          if (pr.visible) {
            ctx.fillStyle = p.type === 'unobserved' ? '#ef4444' : '#10b981';
            ctx.fillRect(pr.x, pr.y, p.type === 'unobserved' ? 2.2 : 1.4, p.type === 'unobserved' ? 2.2 : 1.4);
          }
          return;
        }

        const pr = project(p.x, p.y, p.z, width, height);
        if (pr.visible) {
          ctx.fillStyle = `rgb(${p.r}, ${p.g}, ${p.b})`;
          ctx.fillRect(pr.x, pr.y, mode === 'shaded' ? 1.8 : 1.3, mode === 'shaded' ? 1.8 : 1.3);
        }
      });

      // Axis Orientation Gizmo
      const gizmoOrigin = { x: 45, y: height - 45 };
      const gizmoLen = 24;

      const cosY = Math.cos(rotation.yaw);
      const sinY = Math.sin(rotation.yaw);
      const cosP = Math.cos(rotation.pitch);
      const sinP = Math.sin(rotation.pitch);

      const gx = {
        x: gizmoOrigin.x + gizmoLen * cosY,
        y: gizmoOrigin.y - gizmoLen * sinY * sinP,
      };
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(gizmoOrigin.x, gizmoOrigin.y);
      ctx.lineTo(gx.x, gx.y);
      ctx.stroke();

      const gy = {
        x: gizmoOrigin.x,
        y: gizmoOrigin.y - gizmoLen * cosP,
      };
      ctx.strokeStyle = '#10b981';
      ctx.beginPath();
      ctx.moveTo(gizmoOrigin.x, gizmoOrigin.y);
      ctx.lineTo(gy.x, gy.y);
      ctx.stroke();

      const gz = {
        x: gizmoOrigin.x - gizmoLen * sinY,
        y: gizmoOrigin.y - gizmoLen * cosY * sinP,
      };
      ctx.strokeStyle = '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(gizmoOrigin.x, gizmoOrigin.y);
      ctx.lineTo(gz.x, gz.y);
      ctx.stroke();

      ctx.fillStyle = '#64748b';
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.fillText('X', gx.x + 3, gx.y + 3);
      ctx.fillText('Y', gy.x + 3, gy.y + 3);
      ctx.fillText('Z', gz.x + 3, gz.y + 3);
    };

    render();

    const handleResize = () => {
      if (containerRef.current && canvasRef.current) {
        canvasRef.current.width = containerRef.current.clientWidth;
        canvasRef.current.height = containerRef.current.clientHeight;
        render();
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [project, showGrid, showTrajectory, mode, rotation, zoom, pan]);

  const resetView = () => {
    setRotation({ pitch: 0.38, yaw: 0.75 });
    setZoom(1.0);
    setPan({ x: 0, y: 0 });
  };

  const modeButtons: { mode: ViewportMode; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
    { mode: 'shaded', label: '3D Room', icon: Layers },
    { mode: 'wireframe', label: 'Wireframe', icon: Grid },
    { mode: 'pointcloud', label: 'Camera Points', icon: Box },
    { mode: 'coverage', label: 'Coverage', icon: PieChart },
  ];

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        backgroundColor: '#05070c',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        border: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
      }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Top Floating Viewport Control Ribbon */}
      <div
        style={{
          position: 'absolute',
          top: 12,
          left: 14,
          right: 14,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 20,
          pointerEvents: 'none',
        }}
      >
        {/* Left: View Modes Switcher */}
        <div
          className="hud-panel"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
            padding: '3px',
            pointerEvents: 'auto',
          }}
        >
          {modeButtons.map((btn) => {
            const Icon = btn.icon;
            const isActive = mode === btn.mode;
            return (
              <button
                key={btn.mode}
                onClick={() => onModeChange(btn.mode)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '5px 10px',
                  borderRadius: 'var(--radius-sm)',
                  background: isActive ? 'var(--bg-surface-active)' : 'transparent',
                  border: isActive ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid transparent',
                  color: isActive ? '#38bdf8' : 'var(--text-secondary)',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  fontFamily: 'var(--font-mono)',
                }}
              >
                <Icon size={13} />
                <span>{btn.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Layer Toggles & View Reset */}
        <div
          className="hud-panel"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '3px 6px',
            pointerEvents: 'auto',
          }}
        >
          <button
            onClick={() => setShowGrid(!showGrid)}
            title="Toggle Grid"
            style={{
              padding: '5px 7px',
              borderRadius: 'var(--radius-sm)',
              color: showGrid ? 'var(--accent-cyan)' : 'var(--text-muted)',
              fontSize: '11px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Grid size={13} />
            <span style={{ fontSize: '10.5px' }}>Grid</span>
          </button>

          <button
            onClick={() => setShowTrajectory(!showTrajectory)}
            title="Toggle Trajectory"
            style={{
              padding: '5px 7px',
              borderRadius: 'var(--radius-sm)',
              color: showTrajectory ? 'var(--accent-cyan)' : 'var(--text-muted)',
              fontSize: '11px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span style={{ fontSize: '10.5px' }}>Camera Path</span>
          </button>

          <div style={{ height: '14px', width: '1px', backgroundColor: 'var(--border-subtle)' }} />

          <button
            onClick={resetView}
            title="Reset Camera View"
            style={{
              padding: '5px 7px',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <RotateCcw size={13} />
            <span style={{ fontSize: '10.5px' }}>Reset</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Canvas */}
      <canvas
        ref={canvasRef}
        width={1000}
        height={650}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          width: '100%',
          height: '100%',
          cursor: isDragging ? 'grabbing' : 'grab',
          display: 'block',
        }}
      />

      {/* Empty State Overlay when no 3D data exists */}
      {!has3DContent && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <div
            className="hud-panel"
            style={{
              padding: '24px 32px',
              maxWidth: '420px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
              pointerEvents: 'auto',
            }}
          >
            <Box size={32} style={{ color: 'var(--accent-cyan)' }} />
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Your 3D scene will appear here after reconstruction.
              </div>
            </div>

            <button
              onClick={loadDemoSample}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--accent-cyan-subtle)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                color: 'var(--accent-cyan)',
                fontSize: '12px',
                fontWeight: 600,
              }}
            >
              <Sparkles size={14} />
              <span>Preview Demo Room</span>
            </button>
          </div>
        </div>
      )}

      {/* Bottom Floating Technical HUD Overlay */}
      <div
        style={{
          position: 'absolute',
          bottom: 12,
          left: 14,
          right: 14,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pointerEvents: 'none',
        }}
      >
        {/* Controls HUD */}
        <div
          className="hud-panel font-mono"
          style={{
            padding: '4px 12px',
            fontSize: '10.5px',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          <div>
            <span style={{ color: 'var(--text-muted)' }}>CONTROLS:</span>{' '}
            <span style={{ color: 'var(--text-primary)' }}>Drag to Rotate • Scroll to Zoom</span>
          </div>
        </div>

        {/* Viewport Status HUD */}
        <div
          className="hud-panel font-mono"
          style={{
            padding: '4px 12px',
            fontSize: '10.5px',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          <div>
            <span style={{ color: 'var(--text-muted)' }}>SCENE:</span>{' '}
            <span style={{ color: has3DContent ? 'var(--accent-emerald)' : 'var(--text-muted)', fontWeight: 600 }}>
              {has3DContent ? 'Interactive' : 'Waiting for scan data'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
