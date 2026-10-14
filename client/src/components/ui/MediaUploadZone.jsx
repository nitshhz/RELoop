import React, { useState, useRef } from 'react';
import { Upload, Camera, Image as ImageIcon, X, AlertCircle } from 'lucide-react';
import { Button } from './Button.jsx';
import { CameraModal } from './CameraModal.jsx';

export function MediaUploadZone({
  images = [],
  onChange,
  maxImages = 5,
  maxSizeMB = 5,
  label = 'Upload Photos',
  sublabel = 'Choose from files, gallery, or take a picture directly',
  isAvatar = false,
}) {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [validationError, setValidationError] = useState('');
  const fileInputRef = useRef(null);

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

  function validateAndAddFiles(newFiles) {
    setValidationError('');
    const valid = [];
    const maxBytes = maxSizeMB * 1024 * 1024;

    for (const f of newFiles) {
      if (!allowedTypes.includes(f.type)) {
        setValidationError(`Invalid file type for "${f.name}". Only JPEG, PNG, and WebP are allowed.`);
        return;
      }
      if (f.size > maxBytes) {
        setValidationError(`"${f.name}" is too large. Maximum size is ${maxSizeMB}MB.`);
        return;
      }
      valid.push(f);
    }

    if (isAvatar) {
      // Single image for avatar
      if (valid.length > 0) {
        onChange([valid[0]]);
      }
    } else {
      // Multiple images up to maxImages
      const combined = [...images, ...valid].slice(0, maxImages);
      onChange(combined);
    }
  }

  function handleFileSelect(e) {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      validateAndAddFiles(files);
    }
    // reset input value so re-selecting same file works
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  function handleCameraCapture(file) {
    validateAndAddFiles([file]);
  }

  function handleRemove(index) {
    const updated = images.filter((_, idx) => idx !== index);
    onChange(updated);
  }

  function handleDrag(e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndAddFiles(Array.from(e.dataTransfer.files));
    }
  }

  const reachedMax = !isAvatar && images.length >= maxImages;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-xs font-bold text-text-primary">{label}</label>
          {sublabel && <p className="text-[11px] text-text-muted mt-0.5">{sublabel}</p>}
        </div>
        {!isAvatar && (
          <span className="text-[11px] font-semibold text-text-muted">
            {images.length} / {maxImages}
          </span>
        )}
      </div>

      {/* Upload & Camera Action Box */}
      {!reachedMax && (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-5 text-center transition-all ${
            dragActive
              ? 'border-brand-green bg-brand-green-soft/50 ring-2 ring-brand-green/20'
              : 'border-border-subtle hover:border-brand-green/50 bg-background-secondary/20 hover:bg-background-secondary/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple={!isAvatar}
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            {/* Gallery / File Picker */}
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="w-full sm:w-auto text-xs font-semibold py-2 px-4 shadow-sm"
            >
              <ImageIcon className="w-4 h-4 mr-2 text-brand-green" />
              Choose from Gallery / Files
            </Button>

            <span className="text-xs text-text-muted font-medium hidden sm:inline">or</span>

            {/* Direct Camera Button */}
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => setIsCameraOpen(true)}
              className="w-full sm:w-auto text-xs font-semibold py-2 px-4 shadow-sm"
            >
              <Camera className="w-4 h-4 mr-2" />
              Take Photo with Camera
            </Button>
          </div>

          <p className="text-[11px] text-text-muted mt-3">
            Supports PNG, JPEG, WebP up to {maxSizeMB}MB
          </p>
        </div>
      )}

      {validationError && (
        <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Previews Grid */}
      {images.length > 0 && (
        <div className="flex items-center gap-3 pt-1 flex-wrap">
          {images.map((img, idx) => {
            const previewUrl =
              typeof img === 'string'
                ? img
                : img instanceof File || img instanceof Blob
                ? URL.createObjectURL(img)
                : img?.url || '';

            return (
              <div
                key={idx}
                className="relative group w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border border-border-subtle bg-white shadow-sm shrink-0"
              >
                <img
                  src={previewUrl}
                  alt={`Upload ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleRemove(idx)}
                  className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/60 text-white hover:bg-red-600 transition-colors shadow-sm"
                  title="Remove image"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                {idx === 0 && !isAvatar && (
                  <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-black/70 text-white">
                    Cover
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Live Camera Modal */}
      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
        title={isAvatar ? 'Take Profile Photo' : 'Capture Product Photo'}
      />
    </div>
  );
}
