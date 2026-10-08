import os
import uuid
import shutil
import json
from typing import Dict, Any, Optional
from fastapi import UploadFile, HTTPException
from .frame_extractor import extract_frames

BASE_DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "data"))
INPUT_VIDEOS_DIR = os.path.join(BASE_DATA_DIR, "input_videos")
FRAMES_DIR = os.path.join(BASE_DATA_DIR, "frames")
SESSIONS_DIR = os.path.join(BASE_DATA_DIR, "sessions")

# Ensure required directories exist
os.makedirs(INPUT_VIDEOS_DIR, exist_ok=True)
os.makedirs(FRAMES_DIR, exist_ok=True)
os.makedirs(SESSIONS_DIR, exist_ok=True)

# In-memory sessions store + file backup
_session_store: Dict[str, Dict[str, Any]] = {}

ALLOWED_EXTENSIONS = {".mp4", ".mov", ".webm", ".avi", ".mkv", ".m4v"}


def get_session_status(session_id: str) -> Dict[str, Any]:
    """
    Returns the real processing status and metadata for a session.
    """
    if session_id in _session_store:
        return _session_store[session_id]

    # Try loading from disk
    meta_path = os.path.join(SESSIONS_DIR, f"{session_id}.json")
    if os.path.exists(meta_path):
        try:
            with open(meta_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                _session_store[session_id] = data
                return data
        except Exception:
            pass

    raise HTTPException(status_code=404, detail=f"Session {session_id} not found")


async def process_uploaded_video(
    file: UploadFile,
    session_id: Optional[str] = None,
    sample_interval: int = 10,
) -> Dict[str, Any]:
    """
    Validates the uploaded video, writes to data/input_videos/,
    extracts usable frames to data/frames/<session_id>/, and returns actual metadata.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="Uploaded file has no filename.")

    # Validate file extension
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported video format '{ext}'. Allowed: {', '.join(sorted(ALLOWED_EXTENSIONS))}",
        )

    # Generate or use provided session ID
    if not session_id:
        session_id = f"sess_{uuid.uuid4().hex[:12]}"

    video_save_path = os.path.join(INPUT_VIDEOS_DIR, f"{session_id}{ext}")
    frames_output_dir = os.path.join(FRAMES_DIR, session_id)

    # Record initial state
    _session_store[session_id] = {
        "session_id": session_id,
        "filename": file.filename,
        "status": "uploading",
    }

    try:
        # Save uploaded video file stream to disk
        with open(video_save_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        _session_store[session_id]["status"] = "processing"

        # Execute frame extraction and quality filtering
        extraction_result = extract_frames(
            video_path=video_save_path,
            output_directory=frames_output_dir,
            sample_interval=sample_interval,
        )

        response_data = {
            "session_id": session_id,
            "filename": file.filename,
            "status": "completed",
            "video": extraction_result["video"],
            "frames": {
                "extracted": extraction_result["frames"]["extracted"],
                "usable": extraction_result["frames"]["usable"],
                "sample_interval": extraction_result["frames"]["sample_interval"],
                "frames_directory": f"data/frames/{session_id}",
            },
        }

        # Update in-memory registry and save to sessions disk cache
        _session_store[session_id] = response_data
        meta_path = os.path.join(SESSIONS_DIR, f"{session_id}.json")
        with open(meta_path, "w", encoding="utf-8") as f:
            json.dump(response_data, f, indent=2)

        return response_data

    except Exception as e:
        error_info = {
            "session_id": session_id,
            "filename": file.filename,
            "status": "failed",
            "error": str(e),
        }
        _session_store[session_id] = error_info
        raise HTTPException(status_code=500, detail=f"Video processing failed: {str(e)}")
