import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  ArrowRight,
  ArrowLeft,
  Trash2,
  AlertCircle,
  FileVideo,
} from 'lucide-react';
import { useScanContext } from '../context/ScanContext';

const SUPPORTED_EXTENSIONS = ['.mp4', '.mov', '.webm'];
const SUPPORTED_MIME_TYPES = [
  'video/mp4',
  'video/quicktime',
  'video/webm',
];

export const UploadVideoPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    uploadedVideoFile,
    uploadedVideoUrl,
    setUploadedVideo,
    startUploadScan,
    reconstructionMode,
  } = useScanContext();

  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [videoDuration, setVideoDuration] = useState<number | null>(null);
  const [videoDimensions, setVideoDimensions] = useState<{ width: number; height: number } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Validate and handle selected file
  const processFile = (file: File) => {
    setErrorMessage(null);

    const fileNameLower = file.name.toLowerCase();
    const hasValidExtension = SUPPORTED_EXTENSIONS.some((ext) => fileNameLower.endsWith(ext));
    const hasValidMime = file.type ? SUPPORTED_MIME_TYPES.includes(file.type) : true;

    if (!hasValidExtension && !hasValidMime) {
      setErrorMessage('Unsupported video format. Please choose an MP4, MOV, or WebM video.');
      return;
    }

    setUploadedVideo(file);
    setVideoDuration(null);
    setVideoDimensions(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      processFile(droppedFile);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      processFile(selectedFile);
    }
  };

  const handleRemoveVideo = () => {
    setUploadedVideo(null);
    setErrorMessage(null);
    setVideoDuration(null);
    setVideoDimensions(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleVideoLoadedMetadata = () => {
    if (videoRef.current) {
      if (!isNaN(videoRef.current.duration) && isFinite(videoRef.current.duration)) {
        setVideoDuration(videoRef.current.duration);
      }
      if (videoRef.current.videoWidth && videoRef.current.videoHeight) {
        setVideoDimensions({
          width: videoRef.current.videoWidth,
          height: videoRef.current.videoHeight,
        });
      }
    }
  };

  const handleVideoError = () => {
    setErrorMessage('Unsupported video format or corrupted file. Please choose an MP4, MOV, or WebM video.');
  };

  const handleContinue = () => {
    if (!uploadedVideoFile) {
      setErrorMessage('Choose a video to continue.');
      return;
    }

    startUploadScan(uploadedVideoFile);
    navigate('/processing');
  };

  // Helper formatting for actual browser-computed file size
  const formatFileSize = (bytes: number): string => {
    if (bytes >= 1024 * 1024 * 1024) {
      return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
    }
    if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  // Format actual duration if computed
  const formatDuration = (sec: number): string => {
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      style={{
        width: '100%',
        minHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '30px 20px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '620px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--border-subtle)',
            paddingBottom: '14px',
          }}
        >
          <div>
            <div
              style={{
                fontSize: '11px',
                color: 'var(--accent-cyan)',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              Video Input • {reconstructionMode === 'baseline' ? 'Original Baseline' : 'ReConSense'}
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
              Upload a Room Video
            </h2>
          </div>

          <button
            onClick={() => navigate('/')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              color: 'var(--text-muted)',
            }}
          >
            <ArrowLeft size={14} />
            <span>Cancel</span>
          </button>
        </div>

        {/* Description */}
        <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          Choose a video of the room you want to turn into a 3D scene.
        </p>

        {/* Error Alert */}
        {errorMessage && (
          <div
            style={{
              background: 'rgba(244, 63, 94, 0.1)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '12.5px',
              color: '#fecdd3',
            }}
          >
            <AlertCircle size={16} style={{ color: 'var(--accent-rose)', flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Upload Zone or Video Preview */}
        {!uploadedVideoFile || !uploadedVideoUrl ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              height: '240px',
              border: isDragging ? '2px dashed var(--accent-cyan)' : '1px dashed var(--border-default)',
              backgroundColor: isDragging ? 'rgba(56, 189, 248, 0.05)' : 'var(--bg-surface-elevated)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '14px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              padding: '20px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                backgroundColor: 'rgba(56, 189, 248, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-cyan)',
              }}
            >
              <Upload size={22} />
            </div>

            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Drop your video here
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                or
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              style={{
                padding: '7px 16px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                color: 'var(--accent-cyan)',
                fontSize: '12.5px',
                fontWeight: 600,
              }}
            >
              Choose Video
            </button>

            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              MP4, MOV, WebM
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".mp4,.mov,.webm,video/mp4,video/quicktime,video/webm"
              onChange={handleFileInputChange}
              style={{ display: 'none' }}
            />
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
            }}
          >
            {/* File Info Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '12px',
                borderBottom: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                <FileVideo size={18} style={{ color: 'var(--accent-cyan)', flexShrink: 0 }} />
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {uploadedVideoFile.name}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', gap: '8px' }}>
                    <span>{formatFileSize(uploadedVideoFile.size)}</span>
                    {videoDimensions && (
                      <span>• {videoDimensions.width}×{videoDimensions.height}</span>
                    )}
                    {videoDuration !== null && (
                      <span>• {formatDuration(videoDuration)}</span>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRemoveVideo}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '5px 10px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(244, 63, 94, 0.1)',
                  border: '1px solid rgba(244, 63, 94, 0.25)',
                  color: 'var(--accent-rose)',
                  fontSize: '11.5px',
                  fontWeight: 500,
                  flexShrink: 0,
                }}
              >
                <Trash2 size={13} />
                <span>Remove Video</span>
              </button>
            </div>

            {/* Video Player */}
            <div
              style={{
                width: '100%',
                maxHeight: '300px',
                backgroundColor: '#05070c',
                borderRadius: 'var(--radius-sm)',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <video
                ref={videoRef}
                src={uploadedVideoUrl}
                controls
                playsInline
                onLoadedMetadata={handleVideoLoadedMetadata}
                onError={handleVideoError}
                style={{
                  width: '100%',
                  maxHeight: '300px',
                  display: 'block',
                  backgroundColor: '#000',
                }}
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}>
          <button
            onClick={handleContinue}
            disabled={!uploadedVideoFile}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 22px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: uploadedVideoFile ? 'var(--accent-cyan)' : 'var(--bg-surface-elevated)',
              color: uploadedVideoFile ? '#030712' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '13.5px',
              cursor: uploadedVideoFile ? 'pointer' : 'not-allowed',
              border: uploadedVideoFile ? 'none' : '1px solid var(--border-subtle)',
              boxShadow: uploadedVideoFile ? '0 0 14px rgba(56, 189, 248, 0.3)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <span>Continue</span>
            <ArrowRight size={15} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
};
