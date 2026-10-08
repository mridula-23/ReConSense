import os
import cv2
import numpy as np
from typing import Dict, Any, Tuple


def is_frame_usable(
    frame: np.ndarray,
    min_brightness: float = 15.0,
    max_brightness: float = 245.0,
    min_laplacian_var: float = 30.0,
) -> Tuple[bool, Dict[str, float]]:
    """
    Evaluates whether a frame is usable for 3D reconstruction.
    Checks for:
    - Null/empty frame
    - Extreme darkness / black frames
    - Severe overexposure
    - Blur via variance of Laplacian
    """
    if frame is None or frame.size == 0:
        return False, {"brightness": 0.0, "laplacian_var": 0.0}

    # Convert to grayscale for metrics
    if len(frame.shape) == 3:
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    else:
        gray = frame

    brightness = float(np.mean(gray))
    if brightness < min_brightness or brightness > max_brightness:
        return False, {"brightness": brightness, "laplacian_var": 0.0}

    # Variance of the Laplacian to evaluate focus/sharpness
    laplacian_var = float(cv2.Laplacian(gray, cv2.CV_64F).var())
    if laplacian_var < min_laplacian_var:
        return False, {"brightness": brightness, "laplacian_var": laplacian_var}

    return True, {"brightness": brightness, "laplacian_var": laplacian_var}


def extract_frames(
    video_path: str,
    output_directory: str,
    sample_interval: int = 10,
    min_laplacian_var: float = 30.0,
    min_brightness: float = 15.0,
) -> Dict[str, Any]:
    """
    Opens video using OpenCV, reads actual metadata, extracts frames at sample_interval,
    applies quality filtering, and saves usable frames sequentially into output_directory.
    """
    if not os.path.exists(video_path):
        raise FileNotFoundError(f"Video file not found at {video_path}")

    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise ValueError(f"OpenCV could not open video file: {video_path}")

    # Read REAL video metadata
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = float(cap.get(cv2.CAP_PROP_FPS))
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

    if fps > 0 and total_frames > 0:
        duration_seconds = round(total_frames / fps, 2)
    else:
        duration_seconds = 0.0

    os.makedirs(output_directory, exist_ok=True)

    extracted_count = 0
    usable_count = 0
    frame_idx = 0

    # Ensure reasonable sampling interval for short videos
    effective_interval = max(1, sample_interval)

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        if frame_idx % effective_interval == 0:
            extracted_count += 1
            usable, _ = is_frame_usable(
                frame,
                min_brightness=min_brightness,
                min_laplacian_var=min_laplacian_var,
            )

            if usable:
                usable_count += 1
                frame_filename = f"frame_{usable_count:06d}.jpg"
                out_path = os.path.join(output_directory, frame_filename)
                cv2.imwrite(out_path, frame, [int(cv2.IMWRITE_JPEG_QUALITY), 95])

        frame_idx += 1

    cap.release()

    # If video had frames but total extracted was 0 due to interval > total_frames, fallback sample first frame
    if extracted_count == 0 and total_frames > 0:
        cap_retry = cv2.VideoCapture(video_path)
        ret, frame = cap_retry.read()
        if ret and frame is not None:
            extracted_count = 1
            usable, _ = is_frame_usable(frame, min_brightness=min_brightness, min_laplacian_var=min_laplacian_var)
            if usable:
                usable_count = 1
                frame_filename = "frame_000001.jpg"
                out_path = os.path.join(output_directory, frame_filename)
                cv2.imwrite(out_path, frame, [int(cv2.IMWRITE_JPEG_QUALITY), 95])
        cap_retry.release()

    return {
        "video": {
            "width": width,
            "height": height,
            "fps": fps,
            "frame_count": total_frames,
            "duration_seconds": duration_seconds,
        },
        "frames": {
            "extracted": extracted_count,
            "usable": usable_count,
            "sample_interval": effective_interval,
            "output_directory": output_directory,
        },
    }
