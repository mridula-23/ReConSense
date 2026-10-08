from fastapi import FastAPI, UploadFile, File, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
from app.services.video_processor import process_uploaded_video, get_session_status
from app.services.reconstruction import (
    start_reconstruction,
    get_reconstruction_status,
    get_reconstruction_result,
    get_reconstruction_points,
)

app = FastAPI(title="ReConSense Backend")

# Enable CORS for local frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health_check():
    return {
        "status": "ok",
        "service": "ReConSense backend"
    }


# --- Video Processing Endpoints ---

@app.post("/api/videos/process")
async def process_video(
    file: UploadFile = File(...),
    sample_interval: Optional[int] = Query(10, ge=1, le=120),
):
    """
    Accepts a video upload, validates it, extracts frames with quality filtering,
    and returns real metadata.
    """
    return await process_uploaded_video(file, sample_interval=sample_interval)


@app.get("/api/videos/{session_id}/status")
async def session_status(session_id: str):
    """
    Returns the processing status and dataset metadata for a given session.
    """
    return get_session_status(session_id)


# --- 3D Sparse Reconstruction Endpoints ---

@app.post("/api/reconstruction/{session_id}/start")
async def trigger_reconstruction(
    session_id: str,
    overlap: Optional[int] = Query(10, ge=2, le=30),
    use_gpu: Optional[bool] = Query(True),
):
    """
    Starts the real COLMAP sparse 3D reconstruction pipeline for an existing session.
    """
    return start_reconstruction(session_id, sample_overlap=overlap, use_gpu=use_gpu)


@app.get("/api/reconstruction/{session_id}/status")
async def reconstruction_status(session_id: str):
    """
    Returns the real-time stage of the COLMAP reconstruction pipeline.
    """
    return get_reconstruction_status(session_id)


@app.get("/api/reconstruction/{session_id}/result")
async def reconstruction_result(session_id: str):
    """
    Returns the final registered camera count, point count, and model paths.
    """
    return get_reconstruction_result(session_id)


@app.get("/api/reconstruction/{session_id}/points")
async def reconstruction_points(
    session_id: str,
    max_points: Optional[int] = Query(15000, ge=100, le=50000),
):
    """
    Returns the real reconstructed 3D point cloud coordinates for visualization.
    """
    return get_reconstruction_points(session_id, max_points=max_points)
