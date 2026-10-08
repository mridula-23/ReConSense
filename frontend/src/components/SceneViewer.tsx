import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Camera,
  RotateCcw,
  Grid,
  Sparkles,
  UserX,
  PieChart,
  Box,
  Layers,
} from 'lucide-react';
import type { ViewportMode, MovingObject } from '../types/dashboard';
import { useScanContext } from '../context/ScanContext';

interface SceneViewerProps {
  mode: ViewportMode;
  onModeChange: (mode: ViewportMode) => void;
  movingObjects: MovingObject[];
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
  movingObjects,
}) => {
  const { isDemoSampleLoaded, loadDemoSample, activeSession } = useScanContext();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [rotation, setRotation] = useState({ pitch: 0.38, yaw: 0.75 });
  const [zoom, setZoom] = useState(1.0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const [showGrid, setShowGrid] = useState(true);
  const [showTrajectory, setShowTrajectory] = useState(true);
  const [showBBoxes, setShowBBoxes] = useState(true);

  const pointsRef = useRef<Point3D[]>([]);

  // Generate synthetic points only if demo sample or processed data exists
  useEffect(() => {
    if (!isDemoSampleLoaded && (!activeSession || activeSession.frameCount === 0)) {
      pointsRef.current = [];
      return;
    }

    const points: Point3D[] = [];

    // 1. Room Floor
    for (let x = -3.5; x <= 3.5; x += 0.22) {
      for (let z = -3.5; z <= 3.5; z += 0.22) {
        const noise = (Math.random() - 0.5) * 0.03;
        points.push({
          x: x + noise,
          y: -1.5,
          z: z + noise,
          r: 45,
          g: 70,
          b: 105,
          type: 'observed',
        });
      }
    }

    // 2. North Wall
    for (let x = -3.5; x <= 3.5; x += 0.2) {
      for (let y = -1.5; y <= 1.8; y += 0.2) {
        const isNorthWestHole = x < -2.2 && y < -0.2;
        points.push({
          x,
          y,
          z: -3.5 + (Math.random() - 0.5) * 0.04,
          r: isNorthWestHole ? 220 : 65,
          g: isNorthWestHole ? 55 : 125,
          b: isNorthWestHole ? 55 : 175,
          type: isNorthWestHole ? 'unobserved' : 'observed',
        });
      }
    }

    // 3. East Wall
    for (let z = -3.5; z <= 3.5; z += 0.22) {
      for (let y = -1.5; y <= 1.8; y += 0.22) {
        points.push({
          x: 3.5 + (Math.random() - 0.5) * 0.04,
          y,
          z,
          r: 60,
          g: 115,
          b: 160,
          type: 'observed',
        });
      }
    }

    // 4. Lab Workbench / Table
    for (let x = -2.0; x <= -0.2; x += 0.14) {
      for (let z = -1.5; z <= 0.8; z += 0.14) {
        points.push({
          x,
          y: -0.6 + (Math.random() - 0.5) * 0.02,
          z,
          r: 25,
          g: 165,
          b: 195,
          type: 'observed',
        });
      }
    }

    // 5. Dynamic Entities
    for (let i = 0; i < 280; i++) {
      const theta = Math.random() * Math.PI * 2;
      const radius = Math.random() * 0.35;
      const y = -1.5 + Math.random() * 1.8;
      points.push({
        x: 1.2 + Math.cos(theta) * radius,
        y,
        z: -2.4 + Math.sin(theta) * radius,
        r: 244,
        g: 63,
        b: 94,
        type: 'dynamic',
      });
    }

    for (let i = 0; i < 150; i++) {
      const theta = Math.random() * Math.PI * 2;
      const radius = Math.random() * 0.4;
      const y = -1.5 + Math.random() * 0.85;
      points.push({
        x: -0.8 + Math.cos(theta) * radius,
        y,
        z: -1.6 + Math.sin(theta) * radius,
        r: 244,
        g: 63,
        b: 94,
        type: 'dynamic',
      });
    }

    // 6. Inpainted Region
    for (let x = -3.2; x <= -2.0; x += 0.16) {
      for (let y = -1.4; y <= -0.1; y += 0.16) {
        points.push({
          x,
          y,
          z: -3.3 + (Math.random() - 0.5) * 0.04,
          r: 129,
          g: 140,
          b: 248,
          type: 'inpainted',
        });
      }
    }

    pointsRef.current = points;
  }, [isDemoSampleLoaded, activeSession]);

  // Projection math
  const project = useCallback(
    (
      x: number,
      y: number,
      z: number,
      width: number,
      height: number
    ): { x: number; y: number; z: number; visible: boolean } => {
      const px = x + pan.x * 0.01;
      const py = y - pan.y * 0.01;
      const pz = z;

      const cosY = Math.cos(rotation.yaw);
      const sinY = Math.sin(rotation.yaw);
      const x1 = px * cosY - pz * sinY;
      const z1 = px * sinY + pz * cosY;

      const cosP = Math.cos(rotation.pitch);
      const sinP = Math.sin(rotation.pitch);
      const y2 = py * cosP - z1 * sinP;
      const z2 = py * sinP + z1 * cosP;

      const dist = 7.0 / zoom;
      const camZ = z2 + dist;

      if (camZ <= 0.1) {
        return { x: 0, y: 0, z: camZ, visible: false };
      }

      const fov = 440;
      const projX = width / 2 + (x1 * fov) / camZ;
      const projY = height / 2 - (y2 * fov) / camZ;

      return { x: projX, y: projY, z: camZ, visible: true };
    },
    [pan, rotation, zoom]
  );

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number | null = null;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      // Dark workspace background
      ctx.fillStyle = '#05070c';
      ctx.fillRect(0, 0, width, height);

      // Vignette
      const gradient = ctx.createRadialGradient(
        width / 2,
        height / 2,
        width * 0.1,
        width / 2,
        height / 2,
        width * 0.7
      );
      gradient.addColorStop(0, 'rgba(15, 23, 42, 0.4)');
      gradient.addColorStop(1, 'rgba(5, 7, 12, 0.95)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Ground Wireframe Grid
      if (showGrid) {
        ctx.lineWidth = 1;
        const gridSize = 4.0;
        const step = 0.8;

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

      // Render Camera Path if data exists
      if (showTrajectory && pointsRef.current.length > 0) {
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

        trajectoryPoints.forEach((pt, index) => {
          const pr = project(pt.x, pt.y, pt.z, width, height);
          if (pr.visible) {
            ctx.fillStyle = index === trajectoryPoints.length - 1 ? '#38bdf8' : 'rgba(56, 189, 248, 0.85)';
            ctx.beginPath();
            ctx.arc(pr.x, pr.y, index === trajectoryPoints.length - 1 ? 4 : 2, 0, Math.PI * 2);
            ctx.fill();

            if (index === trajectoryPoints.length - 1) {
              ctx.strokeStyle = '#38bdf8';
              ctx.lineWidth = 1.2;
              ctx.beginPath();
              ctx.arc(pr.x, pr.y, 7, 0, Math.PI * 2);
              ctx.stroke();
            }
          }
        });
      }

      // 3D Moving Object Bounding Boxes
      if (showBBoxes && movingObjects.length > 0 && (mode === 'dynamic_filter' || mode === 'point_cloud' || mode === 'dense_mesh')) {
        movingObjects.forEach((obj) => {
          if (!obj.boundingCoords) return;
          const { x, y, z, w, h, d } = obj.boundingCoords;
          const halfW = w / 2;
          const halfD = d / 2;

          const corners = [
            { x: x - halfW, y: y, z: z - halfD },
            { x: x + halfW, y: y, z: z - halfD },
            { x: x + halfW, y: y, z: z + halfD },
            { x: x - halfW, y: y, z: z + halfD },
            { x: x - halfW, y: y + h, z: z - halfD },
            { x: x + halfW, y: y + h, z: z - halfD },
            { x: x + halfW, y: y + h, z: z + halfD },
            { x: x - halfW, y: y + h, z: z + halfD },
          ];

          const projected = corners.map((c) => project(c.x, c.y, c.z, width, height));

          ctx.strokeStyle = 'rgba(244, 63, 94, 0.8)';
          ctx.lineWidth = 1.1;
          ctx.setLineDash([3, 3]);

          const edges = [
            [0, 1], [1, 2], [2, 3], [3, 0],
            [4, 5], [5, 6], [6, 7], [7, 4],
            [0, 4], [1, 5], [2, 6], [3, 7],
          ];

          edges.forEach(([i, j]) => {
            if (projected[i].visible && projected[j].visible) {
              ctx.beginPath();
              ctx.moveTo(projected[i].x, projected[i].y);
              ctx.lineTo(projected[j].x, projected[j].y);
              ctx.stroke();
            }
          });
          ctx.setLineDash([]);

          const topCenter = project(x, y + h + 0.15, z, width, height);
          if (topCenter.visible) {
            ctx.fillStyle = 'rgba(8, 11, 17, 0.9)';
            ctx.strokeStyle = 'rgba(244, 63, 94, 0.4)';
            ctx.lineWidth = 1;
            const text = obj.confidence ? `${obj.label} (${(obj.confidence * 100).toFixed(0)}%)` : obj.label;
            ctx.font = '10px "JetBrains Mono", monospace';
            const metrics = ctx.measureText(text);
            const pad = 4;
            ctx.fillRect(
              topCenter.x - metrics.width / 2 - pad,
              topCenter.y - 12,
              metrics.width + pad * 2,
              15
            );
            ctx.strokeRect(
              topCenter.x - metrics.width / 2 - pad,
              topCenter.y - 12,
              metrics.width + pad * 2,
              15
            );
            ctx.fillStyle = '#fb7185';
            ctx.fillText(text, topCenter.x - metrics.width / 2, topCenter.y - 1);
          }
        });
      }

      // Render Point Cloud
      const pts = pointsRef.current;
      pts.forEach((p) => {
        if (mode === 'dynamic_filter' && p.type !== 'dynamic') {
          const pr = project(p.x, p.y, p.z, width, height);
          if (pr.visible) {
            ctx.fillStyle = 'rgba(40, 55, 75, 0.2)';
            ctx.fillRect(pr.x, pr.y, 1.1, 1.1);
          }
          return;
        }

        if (mode === 'coverage_heatmap') {
          const pr = project(p.x, p.y, p.z, width, height);
          if (pr.visible) {
            ctx.fillStyle = p.type === 'unobserved' ? '#ef4444' : '#10b981';
            ctx.fillRect(pr.x, pr.y, p.type === 'unobserved' ? 2.2 : 1.4, p.type === 'unobserved' ? 2.2 : 1.4);
          }
          return;
        }

        if (mode === 'ai_completed') {
          const pr = project(p.x, p.y, p.z, width, height);
          if (pr.visible) {
            ctx.fillStyle = p.type === 'inpainted' ? '#a855f7' : `rgb(${p.r}, ${p.g}, ${p.b})`;
            ctx.fillRect(pr.x, pr.y, p.type === 'inpainted' ? 2.0 : 1.4, p.type === 'inpainted' ? 2.0 : 1.4);
          }
          return;
        }

        const pr = project(p.x, p.y, p.z, width, height);
        if (pr.visible) {
          ctx.fillStyle = `rgb(${p.r}, ${p.g}, ${p.b})`;
          ctx.fillRect(pr.x, pr.y, mode === 'dense_mesh' ? 1.8 : 1.3, mode === 'dense_mesh' ? 1.8 : 1.3);
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
      if (canvas && containerRef.current) {
        canvas.width = containerRef.current.clientWidth;
        canvas.height = containerRef.current.clientHeight;
        render();
      }
    };

    const handleWheelEvent = (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
      setZoom((prev) => Math.max(0.4, Math.min(3.5, prev * zoomFactor)));
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    canvas.addEventListener('wheel', handleWheelEvent, { passive: false });

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('wheel', handleWheelEvent);
      if (animId !== null) cancelAnimationFrame(animId);
    };
  }, [mode, project, rotation, zoom, showGrid, showTrajectory, showBBoxes, movingObjects]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;

    if (e.buttons === 1) {
      setRotation((prev) => ({
        yaw: prev.yaw + dx * 0.007,
        pitch: Math.max(-1.4, Math.min(1.4, prev.pitch + dy * 0.007)),
      }));
    } else if (e.buttons === 2 || e.shiftKey) {
      setPan((prev) => ({
        x: prev.x + dx * 0.4,
        y: prev.y + dy * 0.4,
      }));
    }

    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetView = () => {
    setRotation({ pitch: 0.38, yaw: 0.75 });
    setZoom(1.0);
    setPan({ x: 0, y: 0 });
  };

  const modeButtons: { mode: ViewportMode; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
    { mode: 'point_cloud', label: 'Camera Points', icon: Box },
    { mode: 'dense_mesh', label: '3D Room', icon: Layers },
    { mode: 'coverage_heatmap', label: 'Coverage', icon: PieChart },
    { mode: 'dynamic_filter', label: 'Moving Objects', icon: UserX },
    { mode: 'ai_completed', label: 'Filled Areas', icon: Sparkles },
  ];

  const has3DContent = isDemoSampleLoaded || (activeSession && (activeSession.pointCount || 0) > 0);

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
            <Grid size={14} />
            <span style={{ fontSize: '10.5px' }}>Grid</span>
          </button>

          <button
            onClick={() => setShowTrajectory(!showTrajectory)}
            title="Toggle Camera Path"
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
            <Camera size={14} />
            <span style={{ fontSize: '10.5px' }}>Path</span>
          </button>

          <button
            onClick={() => setShowBBoxes(!showBBoxes)}
            title="Toggle Moving Object Boxes"
            style={{
              padding: '5px 7px',
              borderRadius: 'var(--radius-sm)',
              color: showBBoxes ? 'var(--accent-rose)' : 'var(--text-muted)',
              fontSize: '11px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <UserX size={14} />
            <span style={{ fontSize: '10.5px' }}>Objects</span>
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
              <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Waiting for Room Video
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.45 }}>
                Record a video with your mobile camera or upload an indoor room clip to generate this interactive 3D scene.
              </p>
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
              <span>Load Sample Demo Room</span>
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
        {/* Coordinates HUD */}
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
            <span style={{ color: 'var(--text-muted)' }}>PITCH:</span>{' '}
            <span style={{ color: 'var(--text-primary)' }}>{((rotation.pitch * 180) / Math.PI).toFixed(1)}°</span>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>YAW:</span>{' '}
            <span style={{ color: 'var(--text-primary)' }}>{((rotation.yaw * 180) / Math.PI).toFixed(1)}°</span>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>ZOOM:</span>{' '}
            <span style={{ color: 'var(--text-primary)' }}>{zoom.toFixed(2)}x</span>
          </div>
        </div>

        {/* Viewport Telemetry HUD */}
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
            <span style={{ color: 'var(--text-muted)' }}>3D MESH:</span>{' '}
            <span style={{ color: has3DContent ? 'var(--accent-cyan)' : 'var(--text-muted)', fontWeight: 600 }}>
              {has3DContent ? (mode === 'dense_mesh' ? '1.48M facets' : '164.2k pts') : 'Waiting for scan'}
            </span>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>STATUS:</span>{' '}
            <span style={{ color: has3DContent ? 'var(--accent-emerald)' : 'var(--text-muted)', fontWeight: 600 }}>
              {has3DContent ? 'Interactive' : 'Standby'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
