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


def get_local_lan_ip() -> Optional[str]:
    """
    Detects the host machine's active local network IPv4 address (e.g. 192.168.x.x, 10.x.x.x, 172.16-31.x.x).
    Filters out virtual adapters (VirtualBox, VMware, Docker, WSL, Loopback) and unassigned 169.254.x.x addresses.
    """
    VIRTUAL_NAME_KEYWORDS = [
        "virtualbox", "vmware", "vethernet", "loopback", "docker",
        "wsl", "tailscale", "hamachi", "tap", "tun", "pseudo", "vbox"
    ]
    VIRTUAL_SUBNETS = ["192.168.56.", "169.254.", "127."]

    def is_valid_lan_ip(ip: str) -> bool:
        if not ip:
            return False
        if any(ip.startswith(prefix) for prefix in VIRTUAL_SUBNETS):
            return False
        # Private LAN IPv4 ranges
        if ip.startswith("192.168.") or ip.startswith("10."):
            return True
        if ip.startswith("172."):
            parts = ip.split(".")
            if len(parts) >= 2 and parts[1].isdigit() and 16 <= int(parts[1]) <= 31:
                return True
        return False

    # Method 1: Ask OS for primary routing interface via UDP socket
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.settimeout(0.5)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        if is_valid_lan_ip(ip):
            logger.info(f"Detected active routing LAN IP: {ip}")
            return ip
    except Exception as e:
        logger.debug(f"UDP socket routing check failed: {e}")

    # Method 2: Inspect physical network interfaces via psutil
    try:
        import psutil
        stats = psutil.net_if_stats()
        addrs = psutil.net_if_addrs()

        # Prioritize Wi-Fi and Ethernet
        for iface_name, iface_addrs in addrs.items():
            name_lower = iface_name.lower()
            if any(k in name_lower for k in VIRTUAL_NAME_KEYWORDS):
                continue

            iface_stat = stats.get(iface_name)
            if iface_stat and not iface_stat.isup:
                continue

            for addr in iface_addrs:
                if addr.family == socket.AF_INET and is_valid_lan_ip(addr.address):
                    logger.info(f"Found active physical LAN IP on interface '{iface_name}': {addr.address}")
                    return addr.address
    except Exception as e:
        logger.warning(f"psutil interface check failed: {e}")

    # Method 3: Standard socket fallback
    try:
        hostname = socket.gethostname()
        _, _, ip_list = socket.gethostbyname_ex(hostname)
        for ip in ip_list:
            if is_valid_lan_ip(ip):
                return ip
    except Exception as e:
        logger.warning(f"Hostname fallback check failed: {e}")

    return None


def get_lan_ip() -> Optional[str]:
    return get_local_lan_ip()


def create_pairing_session(
    session_id: Optional[str] = None,
    client_port: int = 5173,
    custom_lan_ip: Optional[str] = None
) -> Dict[str, Any]:
    """
    Creates or refreshes a secure pairing session with a short-lived token and reachable mobile URL.
    Ensures QR URL never contains localhost or 127.0.0.1.
    """
    if not session_id:
        session_id = f"sess_phone_{secrets.token_hex(4)}"

    lan_ip = custom_lan_ip or get_local_lan_ip()
    token = secrets.token_urlsafe(16)
    now = time.time()
    expires_at = now + PAIRING_TOKEN_TTL_SECONDS

    # STRICT RULE: Only generate QR URL if a valid reachable LAN IP is detected
    qr_url = None
    status = "waiting"
    error = None

    if lan_ip:
        qr_url = f"http://{lan_ip}:{client_port}/mobile/connect?session={session_id}&token={token}"
    else:
        status = "network_unreachable"
        error = "Unable to determine your laptop's LAN address. Make sure Wi-Fi is enabled and connected to the same network as your phone."

    session_data = {
        "session_id": session_id,
        "token": token,
        "status": status,
        "lan_ip": lan_ip,
        "qr_url": qr_url,
        "created_at": now,
        "expires_at": expires_at,
        "expires_in": PAIRING_TOKEN_TTL_SECONDS,
        "device_info": None,
        "connected_at": None,
        "error": error,
    }

    _pairing_store[session_id] = session_data
    logger.info(f"Created pairing session {session_id} (LAN IP: {lan_ip}, Status: {status})")
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
