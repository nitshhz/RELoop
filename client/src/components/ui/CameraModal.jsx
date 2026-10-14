import React, { useState, useEffect, useRef } from 'react';
import { Camera, RefreshCw, X, Check, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { Button } from './Button.jsx';

export function CameraModal({ isOpen, onClose, onCapture, title = 'Take a Photo' }) {
  const [stream, setStream] = useState(null);
  const [facingMode, setFacingMode] = useState('environment'); // default to back camera for items, switchable to selfie
  const [capturedBlob, setCapturedBlob] = useState(null);
  const [capturedPreview, setCapturedPreview] = useState(null);
  const [cameraError, setCameraError] = useState('');
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [isShutterActive, setIsShutterActive] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileFallbackRef = useRef(null);

  // Check available video devices
  useEffect(() => {
    if (!isOpen) return;

    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      navigator.mediaDevices
        .enumerateDevices()
        .then((devices) => {
          const videoInputs = devices.filter((d) => d.kind === 'videoinput');
          setHasMultipleCameras(videoInputs.length > 1);
        })
        .catch(() => {});
    }
  }, [isOpen]);

  // Start video stream when modal opens or facingMode flips
  useEffect(() => {
    if (!isOpen || capturedBlob) return;

    let active = true;
    let localStream = null;

    async function startCamera() {
      setCameraError('');
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Camera access is not supported by your browser.');
        }

        const constraints = {
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        };

        localStream = await navigator.mediaDevices.getUserMedia(constraints);
        if (active) {
          setStream(localStream);
          if (videoRef.current) {
            videoRef.current.srcObject = localStream;
          }
        } else {
          localStream.getTracks().forEach((track) => track.stop());
        }
      } catch (err) {
        console.warn('[Camera Access Error]', err);
        if (active) {
          if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
            setCameraError('Camera access was blocked. Please enable camera permission in your browser or select an image from files.');
          } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
            setCameraError('No camera found on this device. Please select an image from files.');
          } else {
            setCameraError(err.message || 'Unable to access camera.');
          }
        }
      }
    }

    startCamera();

    return () => {
      active = false;
      if (localStream) {
        localStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [isOpen, facingMode, capturedBlob]);

  // Stop media stream on close
  function handleClose() {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    }
    setCapturedBlob(null);
    if (capturedPreview) {
      URL.revokeObjectURL(capturedPreview);
      setCapturedPreview(null);
    }
    setCameraError('');
    onClose();
  }

  function handleSnap() {
    if (!videoRef.current || !canvasRef.current) return;

    setIsShutterActive(true);
    setTimeout(() => setIsShutterActive(false), 200);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        setCapturedBlob(blob);
        const previewUrl = URL.createObjectURL(blob);
        setCapturedPreview(previewUrl);

        // Turn off live stream while previewing
        if (stream) {
          stream.getTracks().forEach((t) => t.stop());
          setStream(null);
        }
      },
      'image/jpeg',
      0.92
    );
  }

  function handleRetake() {
    if (capturedPreview) {
      URL.revokeObjectURL(capturedPreview);
      setCapturedPreview(null);
    }
    setCapturedBlob(null);
  }

  function handleConfirm() {
    if (!capturedBlob) return;
    const file = new File([capturedBlob], `camera-${Date.now()}.jpg`, {
      type: 'image/jpeg',
    });
    onCapture(file);
    handleClose();
  }

  function toggleCamera() {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    }
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  }

  function handleFallbackFile(e) {
    const file = e.target.files?.[0];
    if (file) {
      onCapture(file);
      handleClose();
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl overflow-hidden max-w-lg w-full shadow-2xl border border-border-subtle flex flex-col">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-border-subtle flex items-center justify-between bg-background-secondary/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-brand-green/10 text-brand-green flex items-center justify-center font-bold">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-text-primary">{title}</h3>
              <p className="text-[11px] text-text-muted">
                {capturedBlob ? 'Review your snapshot' : 'Position item in frame and snap'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-full hover:bg-black/5 text-text-muted hover:text-text-primary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewport / Video Area */}
        <div className="relative bg-black aspect-4/3 flex items-center justify-center overflow-hidden">
          {cameraError ? (
            <div className="p-6 text-center text-white space-y-3 max-w-xs">
              <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
              <p className="text-xs font-semibold text-white/90">{cameraError}</p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => fileFallbackRef.current?.click()}
                className="bg-white/20 text-white hover:bg-white/30 border-white/30 text-xs"
              >
                <ImageIcon className="w-4 h-4 mr-1.5" />
                Select Photo from Files
              </Button>
              <input
                ref={fileFallbackRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFallbackFile}
              />
            </div>
          ) : capturedPreview ? (
            <img
              src={capturedPreview}
              alt="Snapshot"
              className="w-full h-full object-cover"
            />
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
              />

              {/* Shutter Flash Animation */}
              {isShutterActive && (
                <div className="absolute inset-0 bg-white opacity-80 pointer-events-none transition-opacity" />
              )}

              {/* Camera Switch Toggle */}
              {hasMultipleCameras && (
                <button
                  type="button"
                  onClick={toggleCamera}
                  className="absolute top-3 right-3 p-2.5 rounded-full bg-black/50 text-white hover:bg-black/75 backdrop-blur-sm transition-all"
                  title="Switch camera"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              )}
            </>
          )}

          {/* Hidden Canvas for Frame Capture */}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white flex items-center justify-between border-t border-border-subtle">
          {capturedBlob ? (
            <>
              <Button variant="secondary" onClick={handleRetake} size="sm">
                Retake
              </Button>
              <Button variant="primary" onClick={handleConfirm} size="sm">
                <Check className="w-4 h-4 mr-1.5" />
                Use Photo
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={handleClose} size="sm">
                Cancel
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  variant="primary"
                  onClick={handleSnap}
                  disabled={!stream || !!cameraError}
                  className="px-6 rounded-full font-bold shadow-md"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Take Photo
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
