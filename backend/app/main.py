from fastapi import FastAPI, UploadFile, File, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
from app.services.video_processor import process_uploaded_video, get_session_status

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
