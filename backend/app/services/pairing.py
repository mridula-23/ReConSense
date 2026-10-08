import socket
import time
import secrets
import logging
from typing import Dict, Any, Optional, List
from fastapi import WebSocket

logger = logging.getLogger("pairing")

# 5 minutes expiration
PAIRING_TOKEN_TTL_SECONDS = 300

# In-memory pairing sessions
_pairing_store: Dict[str, Dict[str, Any]] = {}
_active_websockets: Dict[str, List[WebSocket]] = {}


def get_lan_ip() -> Optional[str]:
    """
    Detects the host machine's active local network IPv4 address (e.g. 192.168.x.x, 10.x.x.x).
    """
    # Method 1: Connect UDP socket to public IP (no packets sent, asks OS for routing interface)
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.settimeout(0.5)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        if ip and not ip.startswith("127."):
            return ip
    except Exception as e:
        logger.debug(f"UDP routing detection failed: {e}")

    # Method 2: Inspect host interfaces
    try:
        hostname = socket.gethostname()
        _, _, ip_list = socket.gethostbyname_ex(hostname)
        for ip in ip_list:
            if ip.startswith("192.168.") or ip.startswith("10."):
                return ip
            if ip.startswith("172."):
                parts = ip.split(".")
                if len(parts) >= 2 and 16 <= int(parts[1]) <= 31:
                    return ip
        # Fallback to any non-loopback
        for ip in ip_list:
            if not ip.startswith("127."):
                return ip
    except Exception as e:
        logger.warning(f"Hostname interface detection failed: {e}")

    return None


def create_pairing_session(
    session_id: Optional[str] = None,
    client_port: int = 5173,
    custom_lan_ip: Optional[str] = None
) -> Dict[str, Any]:
    """
    Creates or refreshes a secure pairing session with a short-lived token and reachable mobile URL.
    """
    if not session_id:
        session_id = f"sess_phone_{secrets.token_hex(4)}"

    lan_ip = custom_lan_ip or get_lan_ip()
    token = secrets.token_urlsafe(16)
    now = time.time()
    expires_at = now + PAIRING_TOKEN_TTL_SECONDS

    # Format mobile URL for scanning
    host_ip = lan_ip if lan_ip else "127.0.0.1"
    qr_url = f"http://{host_ip}:{client_port}/mobile/connect?session={session_id}&token={token}"

    session_data = {
        "session_id": session_id,
        "token": token,
        "status": "waiting",
        "lan_ip": lan_ip,
        "qr_url": qr_url,
        "created_at": now,
        "expires_at": expires_at,
        "expires_in": PAIRING_TOKEN_TTL_SECONDS,
        "device_info": None,
        "connected_at": None,
    }

    _pairing_store[session_id] = session_data
    logger.info(f"Created pairing session {session_id} with token {token[:6]}... (LAN IP: {lan_ip})")
    return session_data


def get_pairing_session(session_id: str) -> Optional[Dict[str, Any]]:
    """
    Retrieves the pairing session status and handles expiration.
    """
    session = _pairing_store.get(session_id)
    if not session:
        return None

    now = time.time()
    if session["status"] == "waiting" and now > session.get("expires_at", 0):
        session["status"] = "expired"

    remaining = max(0, int(session.get("expires_at", 0) - now))
    session["expires_in"] = remaining
    return session


async def connect_phone_device(
    session_id: str,
    token: str,
    device_info: str = "Smartphone Camera"
) -> Dict[str, Any]:
    """
    Authenticates a phone's pairing token and marks the session as connected.
    Notifies any connected laptop WebSockets.
    """
    session = _pairing_store.get(session_id)
    if not session:
        raise ValueError(f"Session {session_id} not found.")

    now = time.time()
    if now > session.get("expires_at", 0):
        session["status"] = "expired"
        raise ValueError("This pairing QR code has expired. Please regenerate a new QR code.")

    if session["token"] != token:
        raise ValueError("Invalid pairing token.")

    session["status"] = "connected"
    session["device_info"] = device_info
    session["connected_at"] = now

    logger.info(f"Phone successfully connected to session {session_id} (Device: {device_info})")

    # Broadcast to laptop WebSockets
    if session_id in _active_websockets:
        sockets = list(_active_websockets[session_id])
        for ws in sockets:
            try:
                await ws.send_json({
                    "event": "phone_connected",
                    "session_id": session_id,
                    "device_info": device_info,
                    "connected_at": now,
                })
            except Exception as e:
                logger.debug(f"Failed to send to WebSocket: {e}")

    return {
        "status": "connected",
        "session_id": session_id,
        "device_info": device_info,
        "message": "Phone connected successfully.",
    }


def register_websocket(session_id: str, ws: WebSocket):
    if session_id not in _active_websockets:
        _active_websockets[session_id] = []
    _active_websockets[session_id].append(ws)


def unregister_websocket(session_id: str, ws: WebSocket):
    if session_id in _active_websockets:
        if ws in _active_websockets[session_id]:
            _active_websockets[session_id].remove(ws)
        if not _active_websockets[session_id]:
            del _active_websockets[session_id]
