import React, { useRef, useState, useEffect } from 'react';
import {
  PenTool,
  Eraser,
  RotateCcw,
  Trash2,
  Check,
  X,
  Palette,
  Sparkles,
} from 'lucide-react';
import { Button } from './Button.jsx';

const COLOR_PALETTE = [
  { name: 'Forest Green', hex: '#1C3F3A' },
  { name: 'Emerald', hex: '#10B981' },
  { name: 'Charcoal', hex: '#1E293B' },
  { name: 'Ocean Blue', hex: '#0EA5E9' },
  { name: 'Sunset Amber', hex: '#F59E0B' },
  { name: 'Crimson Red', hex: '#EF4444' },
  { name: 'Purple', hex: '#8B5CF6' },
  { name: 'White', hex: '#FFFFFF' },
];

const STROKE_SIZES = [
  { label: 'Fine', size: 3 },
  { label: 'Medium', size: 6 },
  { label: 'Thick', size: 12 },
];

export function ScribblePadModal({ isOpen, onClose, onSaveScribble }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#1C3F3A');
  const [isEraser, setIsEraser] = useState(false);
  const [strokeSize, setStrokeSize] = useState(4);
  const [history, setHistory] = useState([]);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    // Small delay to ensure canvas element is mounted and sized
    const timer = setTimeout(() => {
      initCanvas();
    }, 50);

    return () => clearTimeout(timer);
  }, [isOpen]);

  function initCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();

    // Support Retina displays
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Initial fill background white
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Save initial blank state
    saveState();
  }

  function saveState() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory((prev) => [...prev.slice(-15), snapshot]); // keep up to 15 undo steps
  }

  function handleUndo() {
    if (history.length <= 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const nextHistory = [...history];
    nextHistory.pop(); // remove current
    const previous = nextHistory[nextHistory.length - 1];
    setHistory(nextHistory);

    if (previous) {
      ctx.putImageData(previous, 0, 0);
    }
  }

  function handleClear() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, rect.width, rect.height);
    saveState();
    setHasDrawn(false);
  }

  function getPointerPos(e) {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  }

  function startDrawing(e) {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { x, y } = getPointerPos(e);

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = strokeSize;
    ctx.strokeStyle = isEraser ? '#FFFFFF' : color;

    setIsDrawing(true);
    setHasDrawn(true);
  }

  function draw(e) {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { x, y } = getPointerPos(e);

    ctx.lineTo(x, y);
    ctx.stroke();
  }

  function stopDrawing(e) {
    if (!isDrawing) return;
    e.preventDefault();
    setIsDrawing(false);
    saveState();
  }

  function handleConfirm() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `scribble-${Date.now()}.png`, {
          type: 'image/png',
        });
        onSaveScribble(file);
        onClose();
      },
      'image/png',
      0.95
    );
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-border-subtle dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-border-subtle dark:border-slate-800 flex items-center justify-between bg-background-secondary/40 dark:bg-slate-850">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-brand-green/10 dark:bg-emerald-950/60 text-brand-green dark:text-emerald-400 flex items-center justify-center shadow-inner">
              <PenTool className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-text-primary dark:text-slate-100 flex items-center gap-2">
                <span>Scribble Pad</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-brand-green-soft text-brand-green dark:bg-emerald-950/80 dark:text-emerald-300">
                  Touch & Pen Ready
                </span>
              </h3>
              <p className="text-[11px] text-text-muted dark:text-slate-400">
                Draw a quick sketch, meetup map, or highlight product details
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-text-muted hover:text-text-primary dark:hover:text-slate-100 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-3 border-b border-border-subtle dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-wrap items-center justify-between gap-2.5 text-xs">
          {/* Colors */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-semibold text-text-muted dark:text-slate-400 mr-1">
              Color:
            </span>
            {COLOR_PALETTE.map((c) => {
              const isActive = !isEraser && color === c.hex;
              return (
                <button
                  key={c.name}
                  type="button"
                  title={c.name}
                  onClick={() => {
                    setColor(c.hex);
                    setIsEraser(false);
                  }}
                  className={`w-6 h-6 rounded-full border transition-all ${
                    isActive
                      ? 'scale-110 ring-2 ring-brand-green ring-offset-2 dark:ring-offset-slate-900 border-black/20'
                      : 'hover:scale-105 border-black/10 dark:border-white/20'
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
              );
            })}
          </div>

          {/* Stroke & Tools */}
          <div className="flex items-center gap-1.5 ml-auto">
            {/* Eraser */}
            <button
              type="button"
              onClick={() => setIsEraser(!isEraser)}
              className={`p-1.5 rounded-xl border transition-colors flex items-center gap-1 text-[11px] font-medium ${
                isEraser
                  ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-800 shadow-sm'
                  : 'bg-background-secondary/60 text-text-muted border-border-subtle hover:text-text-primary dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
              }`}
              title="Eraser"
            >
              <Eraser className="w-3.5 h-3.5" />
              <span>Eraser</span>
            </button>

            {/* Stroke Size Chips */}
            <div className="flex items-center rounded-xl bg-background-secondary/60 dark:bg-slate-800 p-0.5 border border-border-subtle dark:border-slate-700">
              {STROKE_SIZES.map((s) => (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => setStrokeSize(s.size)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                    strokeSize === s.size
                      ? 'bg-white dark:bg-slate-700 text-brand-green dark:text-emerald-300 shadow-sm'
                      : 'text-text-muted hover:text-text-primary dark:text-slate-400'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Undo */}
            <button
              type="button"
              onClick={handleUndo}
              disabled={history.length <= 1}
              className="p-1.5 rounded-xl text-text-muted hover:text-text-primary dark:text-slate-400 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="Undo stroke"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Clear */}
            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 rounded-xl text-text-muted hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
              title="Clear all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="relative p-3 bg-slate-100 dark:bg-slate-950 flex-1 flex items-center justify-center min-h-[300px] sm:min-h-[360px]">
          <div className="relative w-full h-[320px] sm:h-[380px] bg-white rounded-2xl shadow-inner overflow-hidden border border-border-subtle dark:border-slate-800 touch-none cursor-crosshair">
            <canvas
              ref={canvasRef}
              className="w-full h-full block"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />

            {!hasDrawn && (
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-slate-300 dark:text-slate-400/40 select-none">
                <PenTool className="w-10 h-10 mb-2 opacity-40 animate-pulse" />
                <p className="text-xs font-medium">Scribble or draw here with finger, pen, or mouse</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-border-subtle dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-3">
          <p className="text-[11px] text-text-muted dark:text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Drawings are verified for safety before sending</span>
          </p>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleConfirm}
              disabled={!hasDrawn}
              className="gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Attach Scribble</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
