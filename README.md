# ReConSense

## Overview

ReConSense is an AI-powered system that converts a short static indoor room video captured using a mobile phone into an interactive 3D scene.

## Problem Statement

This project is built for HackNEX 2026 – Problem Statement 6 (HNX26EPS06), Mode B. The challenge requires developing a system that processes mobile video to reconstruct an environment in 3D while providing awareness of observed and unobserved regions.

## Proposed Solution

Our proposed workflow utilizes mobile-laptop collaboration. A short room video is captured on a mobile device and transferred to a laptop backend. The system processes these frames to perform a 3D scene reconstruction. It then analyzes the scene to identify observed, partially observed, and unseen regions. It uses AI to complete missing areas, detects dynamic objects to prevent them from being treated as permanent room geometry, and guides the user toward useful missing camera views. Additional captures can refine the reconstruction, and the final scene is displayed in an interactive 3D viewer.

## Core Features

- Mobile-laptop collaboration
- Short room video capture
- 3D scene reconstruction
- Observation-aware scene analysis
- Dynamic-object detection
- Unseen-region detection
- AI-based unseen-region completion
- Observed vs generated provenance
- Confidence information
- Active camera guidance
- Iterative reconstruction refinement
- Interactive 3D viewer

## Main Innovation

The novelty of ReConSense is the integration of observation awareness, dynamic-object awareness, AI completion, provenance, and active camera guidance into an iterative reconstruction loop. 

## High-Level Architecture

Mobile Camera
↓
WebRTC
↓
Laptop Backend
↓
Frame Processing
↓
COLMAP
↓
3D Geometry
↓
Observation Analysis
↓
Dynamic Detection
↓
Unseen Detection
↓
AI Completion
↓
Confidence / Provenance
↓
Camera Guidance
↓
Additional Capture
↓
Refined 3D Scene
↓
Interactive 3D Viewer

## Technology Stack

**Frontend:**
- React
- TypeScript
- Vite
- React Three Fiber
- Three.js
- Tailwind CSS

**Backend:**
- Python
- FastAPI
- Uvicorn
- WebSocket

**Computer Vision / Reconstruction:**
- OpenCV
- COLMAP
- Open3D

**AI:**
- PyTorch
- YOLO or equivalent detector/tracker
- Lightweight practical unseen-region completion approach

**Communication:**
- Browser Camera API
- WebRTC
- WebSocket
- QR-based session pairing

## Hardware Target

Target development hardware:
- Intel i5-13420H
- 16 GB RAM
- NVIDIA RTX 3050 Laptop GPU
- 6 GB VRAM

The implementation should prioritize lightweight, staged processing rather than heavy real-time neural reconstruction.

## Development Strategy

The project will be developed incrementally:

1. Project foundation
2. Frontend dashboard
3. Mobile camera interface
4. Phone-laptop communication
5. Video capture
6. Frame extraction
7. 3D reconstruction
8. Interactive 3D viewer
9. Dynamic-object detection
10. Observation analysis
11. Unseen-region detection
12. AI completion
13. Camera guidance
14. Reconstruction refinement
15. Final demo optimization

## Development Setup

**Backend:**
```bash
cd backend
python -m venv venv
# Activate venv: `venv\Scripts\activate` on Windows or `source venv/bin/activate` on Linux/Mac
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## Project Structure

- `frontend/`: React/Vite web application for the interactive 3D viewer and dashboard.
- `backend/`: Python/FastAPI server for coordinating processing and communicating with the frontend/mobile.
- `ai/`: Scripts and ML models for dynamic object detection and AI-based completion.
- `data/`: Directory for storing input videos, extracted frames, intermediate point clouds, and generated data.
- `models/`: Storage for downloaded weights (e.g., YOLO).
- `docs/`: Project documentation and architecture diagrams.

## Demo Flow

The intended judge demonstration flow:

1. Open dashboard
2. Connect phone through QR
3. Start
