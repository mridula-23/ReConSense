from fastapi import FastAPI, UploadFile, File, Query, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from app.services.video_processor import process_uploaded_video, get_session_status
from app.services.reconstruction import (
    start_reconstruction,
    get_reconstruction_status,
    get_reconstruction_result,
    get_reconstruction_points,
)
from app.services.pairing import (
    get_lan_ip,
    create_pairing_session,
    get_pairing_session,
    connect_phone_device,
    register_websocket,
    unregister_websocket,
)

app = FastAPI(title="ReConSense Backend")

# Enable CORS for local and LAN mobile development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ConnectDeviceRequest(BaseModel):
    session_id: str
    token: str
    device_info: Optional[str] = "Smartphone Camera"


@app.get("/api/health")
async def health_check():
    return {
        "status": "ok",
        "service": "ReConSense backend",
        "lan_ip": get_lan_ip(),
    }


# --- Phone Pairing & Network Endpoints ---

@app.get("/api/pairing/info")
async def pairing_info():
    """
    Returns the host machine's active local network IPv4 address for QR pairing.
    """
    ip = get_lan_ip()
    frontend_url = f"http://{ip}:5173" if ip else None
    backend_url = f"http://{ip}:8000" if ip else None
    return {
        "lan_ip": ip,
        "available": ip is not None,
        "backend_port": 8000,
        "frontend_port": 5173,
        "frontend_url": frontend_url,
        "backend_url": backend_url,
    }


@app.post("/api/pairing/create")
async def create_pairing(
    session_id: Optional[str] = Query(None),
    client_port: Optional[int] = Query(5173),
):
    """
    Creates or retrieves an active pairing session with short-lived token and LAN reachable URL.
    """
    return create_pairing_session(session_id=session_id, client_port=client_port, force_new=False)


@app.post("/api/pairing/regenerate")
async def regenerate_pairing(
    session_id: Optional[str] = Query(None),
    client_port: Optional[int] = Query(5173),
):
    """
    Forces generation of a fresh QR token for an existing or new session.
    """
    return create_pairing_session(session_id=session_id, client_port=client_port, force_new=True)


@app.get("/api/pairing/status/{session_id}")
async def pairing_status(session_id: str):
    """
    Returns the current pairing state (waiting, connected, expired).
    """
    session = get_pairing_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Pairing session not found")
    return session


@app.post("/api/pairing/connect")
async def connect_device(req: ConnectDeviceRequest):
    """
    Mobile endpoint: validates QR pairing token and connects the mobile device to the laptop session.
    """
    try:
        return await connect_phone_device(
            session_id=req.session_id,
            token=req.token,
            device_info=req.device_info or "Smartphone Camera",
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.websocket("/ws/pairing/{session_id}")
async def pairing_websocket(websocket: WebSocket, session_id: str):
    """
    WebSocket endpoint for laptop to receive instant push notification when phone pairs.
    """
    await websocket.accept()
    register_websocket(session_id, websocket)
    try:
        # Send initial status
        session = get_pairing_session(session_id)
        if session:
            await websocket.send_json({
                "event": "status_update",
                "session": session,
            })
        while True:
            # Keep connection alive
            await websocket.receive_text()
    except WebSocketDisconnect:
        unregister_websocket(session_id, websocket)
    except Exception:
        unregister_websocket(session_id, websocket)


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
    mode: Optional[str] = Query("reconsense"),
):
    """
    Starts the real COLMAP sparse 3D reconstruction pipeline for an existing session.
    """
    return start_reconstruction(session_id, sample_overlap=overlap, use_gpu=use_gpu, mode=mode)


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
