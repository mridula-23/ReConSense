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
import type { ViewportMode, DynamicObject } from '../types/dashboard';

interface SceneViewerProps {
  mode: ViewportMode;
  onModeChange: (mode: ViewportMode) => void;
  dynamicObjects: DynamicObject[];
  isStreaming: boolean;
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
  dynamicObjects,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Viewport camera parameters
  const [rotation, setRotation] = useState({ pitch: 0.38, yaw: 0.75 });
  const [zoom, setZoom] = useState(1.0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Layer toggles
  const [showGrid, setShowGrid] = useState(true);
  const [showTrajectory, setShowTrajectory] = useState(true);
  const [showBBoxes, setShowBBoxes] = useState(true);

  // Point cloud data cache
  const pointsRef = useRef<Point3D[]>([]);

  // Generate synthetic 3D point cloud on mount representing an indoor room
  useEffect(() => {
    const points: Point3D[] = [];

    // 1. Room Floor (-Y)
    for (let x = -3.5; x <= 3.5; x += 0.25) {
      for (let z = -3.5; z <= 3.5; z += 0.25) {
        const noise = (Math.random() - 0.5) * 0.04;
        points.push({
          x: x + noise,
          y: -1.5,
          z: z + noise,
          r: 50,
          g: 75,
          b: 110,
          type: 'observed',
        });
      }
    }

    // 2. North Wall (Z = -3.5)
    for (let x = -3.5; x <= 3.5; x += 0.22) {
      for (let y = -1.5; y <= 1.8; y += 0.22) {
        const isNorthWestHole = x < -2.2 && y < -0.2;
        points.push({
          x,
          y,
          z: -3.5 + (Math.random() - 0.5) * 0.05,
          r: isNorthWestHole ? 220 : 70,
          g: isNorthWestHole ? 60 : 130,
          b: isNorthWestHole ? 60 : 180,
          type: isNorthWestHole ? 'unobserved' : 'observed',
        });
      }
    }

    // 3. East Wall (X = 3.5) & Shelves
    for (let z = -3.5; z <= 3.5; z += 0.24) {
      for (let y = -1.5; y <= 1.8; y += 0.24) {
        points.push({
          x: 3.5 + (Math.random() - 0.5) * 0.05,
          y,
          z,
          r: 65,
          g: 120,
          b: 165,
          type: 'observed',
        });
      }
    }

    // 4. Lab Workbench / Table (Center-Left)
    for (let x = -2.0; x <= -0.2; x += 0.15) {
      for (let z = -1.5; z <= 0.8; z += 0.15) {
        points.push({
          x,
          y: -0.6 + (Math.random() - 0.5) * 0.02,
          z,
          r: 30,
          g: 175,
          b: 200,
          type: 'observed',
        });
      }
    }

    // 5. Dynamic Entities (Person & Chair)
    // Dynamic Person at (1.2, 0, -2.4)
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

    // Dynamic Chair at (-0.8, -1.0, -1.6)
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

    // 6. Inpainted Completed Region (North-West Void)
    for (let x = -3.2; x <= -2.0; x += 0.18) {
      for (let y = -1.4; y <= -0.1; y += 0.18) {
        points.push({
          x,
          y,
          z: -3.3 + (Math.random() - 0.5) * 0.05,
          r: 129,
          g: 140,
          b: 248,
          type: 'inpainted',
        });
      }
    }

    pointsRef.current = points;
  }, []);

  // Projection math
  const project = useCallback(
    (
      x: number,
      y: number,
      z: number,
      width: number,
      height: number
    ): { x: number; y: number; z: number; visible: boolean } => {
      // Apply pan
      const px = x + pan.x * 0.01;
      const py = y - pan.y * 0.01;
      const pz = z;

      // Rotation around Y (Yaw)
      const cosY = Math.cos(rotation.yaw);
      const sinY = Math.sin(rotation.yaw);
      const x1 = px * cosY - pz * sinY;
      const z1 = px * sinY + pz * cosY;

      // Rotation around X (Pitch)
      const cosP = Math.cos(rotation.pitch);
      const sinP = Math.sin(rotation.pitch);
      const y2 = py * cosP - z1 * sinP;
      const z2 = py * sinP + z1 * cosP;

      // Camera distance offset
      const dist = 7.0 / zoom;
      const camZ = z2 + dist;

      if (camZ <= 0.1) {
        return { x: 0, y: 0, z: camZ, visible: false };
      }

      const fov = 420;
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

      // Clear dark canvas background
      ctx.fillStyle = '#06090e';
      ctx.fillRect(0, 0, width, height);

      // Draw subtle background viewport grid
      if (showGrid) {
        ctx.lineWidth = 1;
        const gridSize = 4.0;
        const step = 0.8;

        for (let i = -gridSize; i <= gridSize; i += step) {
          // Lines along Z
          const p1 = project(i, -1.5, -gridSize, width, height);
          const p2 = project(i, -1.5, gridSize, width, height);

          if (p1.visible && p2.visible) {
            ctx.strokeStyle = i === 0 ? 'rgba(56, 189, 248, 0.4)' : 'rgba(30, 47, 77, 0.4)';
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }

          // Lines along X
          const p3 = project(-gridSize, -1.5, i, width, height);
          const p4 = project(gridSize, -1.5, i, width, height);

          if (p3.visible && p4.visible) {
            ctx.strokeStyle = i === 0 ? 'rgba(244, 63, 94, 0.4)' : 'rgba(30, 47, 77, 0.4)';
            ctx.beginPath();
            ctx.moveTo(p3.x, p3.y);
            ctx.lineTo(p4.x, p4.y);
            ctx.stroke();
          }
        }
      }

      // Draw Camera Trajectory & Frustums
      if (showTrajectory) {
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

        ctx.strokeStyle = 'rgba(6, 182, 212, 0.75)';
        ctx.lineWidth = 1.5;
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

        // Keyframe camera nodes
        trajectoryPoints.forEach((pt, index) => {
          const pr = project(pt.x, pt.y, pt.z, width, height);
          if (pr.visible) {
            ctx.fillStyle = index === trajectoryPoints.length - 1 ? '#38bdf8' : 'rgba(6, 182, 212, 0.9)';
            ctx.beginPath();
            ctx.arc(pr.x, pr.y, index === trajectoryPoints.length - 1 ? 4.5 : 2.5, 0, Math.PI * 2);
            ctx.fill();

            // Highlight current active camera node with a pulse
            if (index === trajectoryPoints.length - 1) {
              ctx.strokeStyle = '#38bdf8';
              ctx.lineWidth = 1.5;
              ctx.beginPath();
              ctx.arc(pr.x, pr.y, 8, 0, Math.PI * 2);
              ctx.stroke();
            }
          }
        });
      }

      // Draw 3D Dynamic Object Bounding Boxes
      if (showBBoxes && (mode === 'dynamic_filter' || mode === 'point_cloud' || mode === 'dense_mesh')) {
        dynamicObjects.forEach((obj) => {
          const { x, y, z, w, h, d } = obj.boundingCoords;
          const halfW = w / 2;
          const halfD = d / 2;

          // 8 corners of the 3D bounding box
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

          // Draw wireframe box
          ctx.strokeStyle = 'rgba(244, 63, 94, 0.85)';
          ctx.lineWidth = 1.2;
          ctx.setLineDash([3, 3]);

          const edges = [
            [0, 1], [1, 2], [2, 3], [3, 0], // bottom
            [4, 5], [5, 6], [6, 7], [7, 4], // top
            [0, 4], [1, 5], [2, 6], [3, 7], // pillars
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

          // Object Label above bounding box
          const topCenter = project(x, y + h + 0.2, z, width, height);
          if (topCenter.visible) {
            ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
            ctx.strokeStyle = 'rgba(244, 63, 94, 0.6)';
            ctx.lineWidth = 1;
            const text = `${obj.label} (${(obj.confidence * 100).toFixed(0)}%)`;
            ctx.font = '10px "JetBrains Mono", monospace';
            const metrics = ctx.measureText(text);
            const pad = 4;
            ctx.fillRect(
              topCenter.x - metrics.width / 2 - pad,
              topCenter.y - 12,
              metrics.width + pad * 2,
              16
            );
            ctx.strokeRect(
              topCenter.x - metrics.width / 2 - pad,
              topCenter.y - 12,
              metrics.width + pad * 2,
              16
            );
            ctx.fillStyle = '#fb7185';
            ctx.fillText(text, topCenter.x - metrics.width / 2, topCenter.y);
          }
        });
      }

      // Draw Point Cloud
      const pts = pointsRef.current;
      pts.forEach((p) => {
        // Filter points according to selected mode
        if (mode === 'dynamic_filter' && p.type !== 'dynamic') {
          // Dim static points in dynamic filter view
          const pr = project(p.x, p.y, p.z, width, height);
          if (pr.visible) {
            ctx.fillStyle = 'rgba(50, 70, 95, 0.25)';
            ctx.fillRect(pr.x, pr.y, 1.2, 1.2);
          }
          return;
        }

        if (mode === 'coverage_heatmap') {
          const pr = project(p.x, p.y, p.z, width, height);
          if (pr.visible) {
            if (p.type === 'unobserved') {
              ctx.fillStyle = '#ef4444'; // Bright red for blindspots
              ctx.fillRect(pr.x, pr.y, 2.5, 2.5);
            } else {
              ctx.fillStyle = '#10b981'; // Green for observed
              ctx.fillRect(pr.x, pr.y, 1.5, 1.5);
            }
          }
          return;
        }

        if (mode === 'ai_completed') {
          const pr = project(p.x, p.y, p.z, width, height);
          if (pr.visible) {
            if (p.type === 'inpainted') {
              ctx.fillStyle = '#a855f7'; // Purple for AI completed regions
              ctx.fillRect(pr.x, pr.y, 2.2, 2.2);
            } else {
              ctx.fillStyle = `rgb(${p.r}, ${p.g}, ${p.b})`;
              ctx.fillRect(pr.x, pr.y, 1.5, 1.5);
            }
          }
          return;
        }

        // Standard point cloud rendering
        const pr = project(p.x, p.y, p.z, width, height);
        if (pr.visible) {
          ctx.fillStyle = `rgb(${p.r}, ${p.g}, ${p.b})`;
          ctx.fillRect(pr.x, pr.y, mode === 'dense_mesh' ? 2.0 : 1.4, mode === 'dense_mesh' ? 2.0 : 1.4);
        }
      });

      // Axis Orientation Gizmo in bottom-left corner
      const gizmoOrigin = { x: 50, y: height - 50 };
      const gizmoLen = 28;

      const cosY = Math.cos(rotation.yaw);
      const sinY = Math.sin(rotation.yaw);
      const cosP = Math.cos(rotation.pitch);
      const sinP = Math.sin(rotation.pitch);

      // X Axis (Red)
      const gx = {
        x: gizmoOrigin.x + gizmoLen * cosY,
        y: gizmoOrigin.y - gizmoLen * sinY * sinP,
      };
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(gizmoOrigin.x, gizmoOrigin.y);
      ctx.lineTo(gx.x, gx.y);
      ctx.stroke();

      // Y Axis (Green - Up)
      const gy = {
        x: gizmoOrigin.x,
        y: gizmoOrigin.y - gizmoLen * cosP,
      };
      ctx.strokeStyle = '#10b981';
      ctx.beginPath();
      ctx.moveTo(gizmoOrigin.x, gizmoOrigin.y);
      ctx.lineTo(gy.x, gy.y);
      ctx.stroke();

      // Z Axis (Blue - Forward)
      const gz = {
        x: gizmoOrigin.x - gizmoLen * sinY,
        y: gizmoOrigin.y - gizmoLen * cosY * sinP,
      };
      ctx.strokeStyle = '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(gizmoOrigin.x, gizmoOrigin.y);
      ctx.lineTo(gz.x, gz.y);
      ctx.stroke();

      ctx.fillStyle = '#94a3b8';
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.fillText('X', gx.x + 3, gx.y);
      ctx.fillText('Y', gy.x + 3, gy.y);
      ctx.fillText('Z', gz.x + 3, gz.y);
    };

    render();

    // Auto update on canvas resize
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
  }, [mode, project, rotation, zoom, showGrid, showTrajectory, showBBoxes, dynamicObjects]);

  // Mouse interaction for Orbit, Zoom, and Pan
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;

    if (e.buttons === 1) {
      // Orbit rotation
      setRotation((prev) => ({
        yaw: prev.yaw + dx * 0.008,
        pitch: Math.max(-1.4, Math.min(1.4, prev.pitch + dy * 0.008)),
      }));
    } else if (e.buttons === 2 || e.shiftKey) {
      // Pan
      setPan((prev) => ({
        x: prev.x + dx * 0.5,
        y: prev.y + dy * 0.5,
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
    { mode: 'point_cloud', label: 'Sparse SfM', icon: Box },
    { mode: 'dense_mesh', label: 'Dense TSDF', icon: Layers },
    { mode: 'coverage_heatmap', label: 'Coverage Heatmap', icon: PieChart },
    { mode: 'dynamic_filter', label: 'Dynamic Filter', icon: UserX },
    { mode: 'ai_completed', label: 'AI Inpainting', icon: Sparkles },
  ];

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        backgroundColor: '#06090e',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        border: '1px solid var(--border-default)',
        display: 'flex',
        flexDirection: 'column',
      }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Top Floating Viewport Control Bar */}
      <div
        style={{
          position: 'absolute',
          top: 10,
          left: 10,
          right: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 20,
          pointerEvents: 'none',
        }}
      >
        {/* Left: View Modes Switcher */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: 'rgba(11, 16, 27, 0.85)',
            backdropFilter: 'blur(8px)',
            border: '1px solid var(--border-default)',
            padding: '3px',
            borderRadius: 'var(--radius-sm)',
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
                  padding: '5px 9px',
                  borderRadius: 'var(--radius-sm)',
                  background: isActive ? 'var(--bg-surface-3)' : 'transparent',
                  border: isActive ? '1px solid var(--accent-cyan)' : '1px solid transparent',
                  color: isActive ? '#38bdf8' : 'var(--text-secondary)',
                  fontSize: '11px',
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

        {/* Right: Layer Toggles & Viewport Tools */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(11, 16, 27, 0.85)',
            backdropFilter: 'blur(8px)',
            border: '1px solid var(--border-default)',
            padding: '3px 6px',
            borderRadius: 'var(--radius-sm)',
            pointerEvents: 'auto',
          }}
        >
          <button
            onClick={() => setShowGrid(!showGrid)}
            title="Toggle Ground Grid"
            style={{
              padding: '5px',
              borderRadius: 'var(--radius-sm)',
              color: showGrid ? 'var(--accent-cyan)' : 'var(--text-muted)',
            }}
          >
            <Grid size={15} />
          </button>

          <button
            onClick={() => setShowTrajectory(!showTrajectory)}
            title="Toggle Camera Trajectory"
            style={{
              padding: '5px',
              borderRadius: 'var(--radius-sm)',
              color: showTrajectory ? 'var(--accent-cyan)' : 'var(--text-muted)',
            }}
          >
            <Camera size={15} />
          </button>

          <button
            onClick={() => setShowBBoxes(!showBBoxes)}
            title="Toggle Dynamic 3D Bounding Boxes"
            style={{
              padding: '5px',
              borderRadius: 'var(--radius-sm)',
              color: showBBoxes ? 'var(--accent-rose)' : 'var(--text-muted)',
            }}
          >
            <UserX size={15} />
          </button>

          <div style={{ height: '14px', width: '1px', backgroundColor: 'var(--border-subtle)' }} />

          <button
            onClick={resetView}
            title="Reset Camera View"
            style={{
              padding: '5px',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-secondary)',
            }}
          >
            <RotateCcw size={15} />
          </button>
        </div>
      </div>

      {/* Main Interactive WebGL Simulation Canvas */}
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

      {/* Bottom Floating Technical HUD Overlay */}
      <div
        style={{
          position: 'absolute',
          bottom: 10,
          left: 10,
          right: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pointerEvents: 'none',
        }}
      >
        {/* Coordinates HUD */}
        <div
          className="font-mono"
          style={{
            background: 'rgba(11, 16, 27, 0.85)',
            backdropFilter: 'blur(8px)',
            border: '1px solid var(--border-subtle)',
            padding: '4px 10px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '10.5px',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
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

        {/* Render Stats HUD */}
        <div
          className="font-mono"
          style={{
            background: 'rgba(11, 16, 27, 0.85)',
            backdropFilter: 'blur(8px)',
            border: '1px solid var(--border-subtle)',
            padding: '4px 10px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '10.5px',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div>
            <span style={{ color: 'var(--text-muted)' }}>POINTS:</span>{' '}
            <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>
              {mode === 'dense_mesh' ? '1,482,000' : '164,280'}
            </span>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>CAMERAS:</span>{' '}
            <span style={{ color: 'var(--text-primary)' }}>412</span>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>FPS:</span>{' '}
            <span style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>60.0</span>
          </div>
        </div>
      </div>
    </div>
  );
};
