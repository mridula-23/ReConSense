import os
import sys
import shutil
import subprocess
import threading
import json
import logging
from typing import Dict, Any, Optional, List
from fastapi import HTTPException

logger = logging.getLogger("reconstruction")
logging.basicConfig(level=logging.INFO)

BASE_DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "data"))
FRAMES_DIR = os.path.join(BASE_DATA_DIR, "frames")
RECONSTRUCTION_DIR = os.path.join(BASE_DATA_DIR, "reconstruction")

os.makedirs(RECONSTRUCTION_DIR, exist_ok=True)

# In-memory session reconstruction state tracking
_recon_store: Dict[str, Dict[str, Any]] = {}
_recon_lock = threading.Lock()


def find_colmap_executable() -> str:
    """
    Locates the COLMAP executable on the system.
    Checks environment variable, project tools folder, and system PATH.
    """
    custom_path = os.environ.get("COLMAP_PATH")
    if custom_path and os.path.exists(custom_path):
        return custom_path

    # Check project tools directory
    project_tools_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "tools", "colmap"))
    candidates = [
        os.path.join(project_tools_dir, "bin", "colmap.exe"),
        os.path.join(project_tools_dir, "colmap.exe"),
        os.path.join(project_tools_dir, "bin", "colmap"),
        os.path.join(project_tools_dir, "colmap"),
    ]
    for c in candidates:
        if os.path.exists(c):
            return c

    # Check system PATH
    system_colmap = shutil.which("colmap")
    if system_colmap:
        return system_colmap

    raise FileNotFoundError("COLMAP executable not found. Please ensure COLMAP is installed.")


def parse_colmap_txt_model(model_txt_dir: str) -> Dict[str, Any]:
    """
    Parses cameras.txt, images.txt, and points3D.txt from COLMAP TXT export.
    Returns exact registered image count, 3D point count, and point coordinates.
    """
    cameras_file = os.path.join(model_txt_dir, "cameras.txt")
    images_file = os.path.join(model_txt_dir, "images.txt")
    points_file = os.path.join(model_txt_dir, "points3D.txt")

    registered_images = []
    points_3d = []
    camera_count = 0

    # Parse cameras.txt
    if os.path.exists(cameras_file):
        with open(cameras_file, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#"):
                    camera_count += 1

    # Parse images.txt
    if os.path.exists(images_file):
        with open(images_file, "r", encoding="utf-8") as f:
            lines = f.readlines()
            # In COLMAP images.txt, every image has 2 lines (pose line and 2D points line)
            i = 0
            while i < len(lines):
                line = lines[i].strip()
                if line and not line.startswith("#"):
                    parts = line.split()
                    if len(parts) >= 10:
                        image_id = parts[0]
                        qw, qx, qy, qz = float(parts[1]), float(parts[2]), float(parts[3]), float(parts[4])
                        tx, ty, tz = float(parts[5]), float(parts[6]), float(parts[7])
                        camera_id = parts[8]
                        name = parts[9]
                        registered_images.append({
                            "image_id": image_id,
                            "name": name,
                            "camera_id": camera_id,
                            "qvec": [qw, qx, qy, qz],
                            "tvec": [tx, ty, tz],
                        })
                    i += 2  # skip 2D points line
                else:
                    i += 1

    # Parse points3D.txt
    if os.path.exists(points_file):
        with open(points_file, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#"):
                    parts = line.split()
                    if len(parts) >= 8:
                        point_id = parts[0]
                        x, y, z = float(parts[1]), float(parts[2]), float(parts[3])
                        r, g, b = int(parts[4]), int(parts[5]), int(parts[6])
                        error = float(parts[7])
                        points_3d.append({
                            "id": point_id,
                            "x": x,
                            "y": y,
                            "z": z,
                            "r": r,
                            "g": g,
                            "b": b,
                            "error": error,
                        })

    return {
        "camera_count": camera_count,
        "registered_images_count": len(registered_images),
        "registered_images": registered_images,
        "points_3d_count": len(points_3d),
        "points_3d": points_3d,
    }


def _run_colmap_process(session_id: str, sample_overlap: int = 10, use_gpu: bool = True):
    """
    Executes the real COLMAP reconstruction pipeline in a background thread.
    """
    session_recon_dir = os.path.join(RECONSTRUCTION_DIR, session_id)
    frames_dir = os.path.join(FRAMES_DIR, session_id)
    logs_dir = os.path.join(session_recon_dir, "logs")
    sparse_dir = os.path.join(session_recon_dir, "sparse")
    database_path = os.path.join(session_recon_dir, "database.db")

    os.makedirs(session_recon_dir, exist_ok=True)
    os.makedirs(logs_dir, exist_ok=True)
    os.makedirs(sparse_dir, exist_ok=True)

    def log_message(msg: str):
        logger.info(f"[{session_id}] {msg}")
        with _recon_lock:
            if session_id in _recon_store:
                _recon_store[session_id]["current_message"] = msg

    try:
        colmap_exe = find_colmap_executable()
        gpu_flag = "1" if use_gpu else "0"

        # Count input frames
        input_frame_files = [f for f in os.listdir(frames_dir) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
        total_input_frames = len(input_frame_files)

        if total_input_frames < 2:
            raise ValueError(f"Insufficient frames for reconstruction: found {total_input_frames} frames (need at least 2).")

        with _recon_lock:
            _recon_store[session_id].update({
                "status": "preparing",
                "total_input_images": total_input_frames,
                "colmap_executable": colmap_exe,
            })

        # Step A: Feature Extraction
        log_message("Extracting visual features with COLMAP...")
        with _recon_lock:
            _recon_store[session_id]["status"] = "extracting_features"

        feature_log_path = os.path.join(logs_dir, "feature_extraction.log")
        feature_cmd = [
            colmap_exe,
            "feature_extractor",
            "--database_path", database_path,
            "--image_path", frames_dir,
            "--ImageReader.camera_model", "SIMPLE_RADIAL",
            "--ImageReader.single_camera", "1",
            "--SiftExtraction.use_gpu", gpu_flag,
            "--SiftExtraction.max_image_size", "2000",
        ]

        with open(feature_log_path, "w", encoding="utf-8") as log_file:
            res = subprocess.run(feature_cmd, stdout=log_file, stderr=subprocess.STDOUT, text=True)
            if res.returncode != 0:
                raise RuntimeError(f"Feature extraction failed with return code {res.returncode}. See {feature_log_path}")

        # Step B: Feature Matching (Sequential Matching for video streams)
        log_message("Matching sequential video features...")
        with _recon_lock:
            _recon_store[session_id]["status"] = "matching_features"

        matcher_log_path = os.path.join(logs_dir, "feature_matching.log")
        if total_input_frames <= 35:
            # For short video clips, exhaustive matching gives maximum multi-view connectivity
            matcher_cmd = [
                colmap_exe,
                "exhaustive_matcher",
                "--database_path", database_path,
                "--SiftMatching.use_gpu", gpu_flag,
            ]
        else:
            matcher_cmd = [
                colmap_exe,
                "sequential_matcher",
                "--database_path", database_path,
                "--SequentialMatching.overlap", str(min(sample_overlap, total_input_frames)),
                "--SequentialMatching.loop_detection", "0",
                "--SiftMatching.use_gpu", gpu_flag,
            ]

        with open(matcher_log_path, "w", encoding="utf-8") as log_file:
            res = subprocess.run(matcher_cmd, stdout=log_file, stderr=subprocess.STDOUT, text=True)
            if res.returncode != 0:
                raise RuntimeError(f"Feature matching failed with return code {res.returncode}. See {matcher_log_path}")

        # Step C: Sparse Reconstruction (Mapper)
        log_message("Estimating camera positions & building sparse 3D scene...")
        with _recon_lock:
            _recon_store[session_id]["status"] = "reconstructing"

        mapper_log_path = os.path.join(logs_dir, "mapper.log")
        mapper_cmd = [
            colmap_exe,
            "mapper",
            "--database_path", database_path,
            "--image_path", frames_dir,
            "--output_path", sparse_dir,
            "--Mapper.min_num_matches", "12",
            "--Mapper.init_min_num_inliers", "8",
            "--Mapper.init_max_error", "4.0",
            "--Mapper.abs_pose_min_num_inliers", "8",
        ]

        with open(mapper_log_path, "w", encoding="utf-8") as log_file:
            res = subprocess.run(mapper_cmd, stdout=log_file, stderr=subprocess.STDOUT, text=True)
            if res.returncode != 0:
                raise RuntimeError(f"Sparse mapper failed with return code {res.returncode}. See {mapper_log_path}")

        # Check reconstructed sub-models
        submodels = [d for d in os.listdir(sparse_dir) if os.path.isdir(os.path.join(sparse_dir, d))]
        if not submodels:
            raise RuntimeError("COLMAP completed mapping but produced 0 sparse sub-models (insufficient feature overlap or parallax).")

        # Use primary model (model 0)
        primary_model_dir = os.path.join(sparse_dir, "0")
        if not os.path.exists(primary_model_dir):
            primary_model_dir = os.path.join(sparse_dir, submodels[0])

        # Convert primary binary model to TXT and PLY for inspection & rendering
        txt_out_dir = os.path.join(primary_model_dir, "txt")
        ply_out_path = os.path.join(primary_model_dir, "points3D.ply")
        os.makedirs(txt_out_dir, exist_ok=True)

        converter_cmd_txt = [
            colmap_exe,
            "model_converter",
            "--input_path", primary_model_dir,
            "--output_path", txt_out_dir,
            "--output_type", "TXT",
        ]
        subprocess.run(converter_cmd_txt, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

        converter_cmd_ply = [
            colmap_exe,
            "model_converter",
            "--input_path", primary_model_dir,
            "--output_path", ply_out_path,
            "--output_type", "PLY",
        ]
        subprocess.run(converter_cmd_ply, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

        # Parse real reconstruction output
        parsed_model = parse_colmap_txt_model(txt_out_dir)

        if parsed_model["registered_images_count"] == 0:
            raise RuntimeError("Reconstruction produced 0 registered cameras.")

        result_payload = {
            "session_id": session_id,
            "status": "completed",
            "registered_images": parsed_model["registered_images_count"],
            "total_input_images": total_input_frames,
            "points_3d": parsed_model["points_3d_count"],
            "camera_count": parsed_model["camera_count"],
            "model_path": f"data/reconstruction/{session_id}/sparse/0",
            "sparse_models_count": len(submodels),
            "points_data": parsed_model["points_3d"],
            "registered_cameras": parsed_model["registered_images"],
            "current_message": "Reconstruction complete",
        }

        # Save metadata to disk
        meta_path = os.path.join(session_recon_dir, "reconstruction_result.json")
        with open(meta_path, "w", encoding="utf-8") as f:
            # Exclude huge raw point lists from summary JSON on disk
            disk_meta = {k: v for k, v in result_payload.items() if k != "points_data"}
            disk_meta["sample_points_count"] = len(parsed_model["points_3d"])
            json.dump(disk_meta, f, indent=2)

        with _recon_lock:
            _recon_store[session_id] = result_payload

        log_message(f"Successfully reconstructed {parsed_model['points_3d_count']} 3D points from {parsed_model['registered_images_count']} registered images.")

    except Exception as e:
        logger.error(f"[{session_id}] Reconstruction error: {str(e)}")
        error_payload = {
            "session_id": session_id,
            "status": "failed",
            "error": str(e),
            "current_message": f"Reconstruction failed: {str(e)}",
        }
        with _recon_lock:
            _recon_store[session_id] = error_payload


def start_reconstruction(session_id: str, sample_overlap: int = 10, use_gpu: bool = True) -> Dict[str, Any]:
    """
    Initializes and starts COLMAP reconstruction in a background worker thread.
    """
    frames_dir = os.path.join(FRAMES_DIR, session_id)
    if not os.path.exists(frames_dir):
        raise HTTPException(status_code=404, detail=f"No frame dataset found for session {session_id}")

    with _recon_lock:
        if session_id in _recon_store and _recon_store[session_id].get("status") in ["preparing", "extracting_features", "matching_features", "reconstructing"]:
            return {
                "session_id": session_id,
                "status": _recon_store[session_id]["status"],
                "message": "Reconstruction is already in progress.",
            }

        _recon_store[session_id] = {
            "session_id": session_id,
            "status": "preparing",
            "current_message": "Preparing reconstruction workspace...",
        }

    thread = threading.Thread(
        target=_run_colmap_process,
        args=(session_id, sample_overlap, use_gpu),
        daemon=True,
    )
    thread.start()

    return {
        "session_id": session_id,
        "status": "started",
    }


def get_reconstruction_status(session_id: str) -> Dict[str, Any]:
    """
    Retrieves the current state of a reconstruction session.
    """
    with _recon_lock:
        if session_id in _recon_store:
            data = _recon_store[session_id]
            return {
                "session_id": session_id,
                "status": data.get("status", "not_started"),
                "current_message": data.get("current_message", ""),
                "registered_images": data.get("registered_images"),
                "total_input_images": data.get("total_input_images"),
                "points_3d": data.get("points_3d"),
                "error": data.get("error"),
            }

    # Check disk
    meta_path = os.path.join(RECONSTRUCTION_DIR, session_id, "reconstruction_result.json")
    if os.path.exists(meta_path):
        with open(meta_path, "r", encoding="utf-8") as f:
            disk_data = json.load(f)
            return disk_data

    return {
        "session_id": session_id,
        "status": "not_started",
        "current_message": "Reconstruction has not been started yet.",
    }


def get_reconstruction_result(session_id: str) -> Dict[str, Any]:
    """
    Retrieves complete reconstruction result including registered cameras and model paths.
    """
    with _recon_lock:
        if session_id in _recon_store and _recon_store[session_id].get("status") == "completed":
            data = _recon_store[session_id]
            return {
                "session_id": session_id,
                "status": "completed",
                "registered_images": data.get("registered_images", 0),
                "total_input_images": data.get("total_input_images", 0),
                "points_3d": data.get("points_3d", 0),
                "camera_count": data.get("camera_count", 0),
                "model_path": data.get("model_path", ""),
                "sparse_models_count": data.get("sparse_models_count", 1),
            }

    # Check disk
    meta_path = os.path.join(RECONSTRUCTION_DIR, session_id, "reconstruction_result.json")
    if os.path.exists(meta_path):
        with open(meta_path, "r", encoding="utf-8") as f:
            disk_data = json.load(f)
            return disk_data

    raise HTTPException(status_code=404, detail=f"No completed reconstruction found for session {session_id}")


def get_reconstruction_points(session_id: str, max_points: int = 15000) -> Dict[str, Any]:
    """
    Returns the real 3D point cloud coordinates (x, y, z, r, g, b) for frontend rendering.
    """
    with _recon_lock:
        if session_id in _recon_store and "points_data" in _recon_store[session_id]:
            points = _recon_store[session_id]["points_data"]
            # Downsample if point count exceeds max_points for smooth frontend rendering
            if len(points) > max_points:
                step = len(points) // max_points
                points = points[::step]
            return {
                "session_id": session_id,
                "count": len(points),
                "points": points,
            }

    # Try reading from disk txt
    primary_txt_dir = os.path.join(RECONSTRUCTION_DIR, session_id, "sparse", "0", "txt")
    if os.path.exists(primary_txt_dir):
        parsed = parse_colmap_txt_model(primary_txt_dir)
        points = parsed["points_3d"]
        if len(points) > max_points:
            step = len(points) // max_points
            points = points[::step]
        return {
            "session_id": session_id,
            "count": len(points),
            "points": points,
        }

    raise HTTPException(status_code=404, detail=f"No 3D points found for session {session_id}")
