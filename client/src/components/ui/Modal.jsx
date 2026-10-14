import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-md' }) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-text-primary/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog Card */}
      <div
        className={`relative w-full ${maxWidth} clay-card p-6 z-10 my-8 shadow-2xl bg-white max-h-[90vh] flex flex-col`}
      >
        <div className="flex items-center justify-between pb-4 border-b border-border-subtle shrink-0">
          <h3 className="text-lg font-bold text-text-primary">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-text-muted hover:text-text-primary hover:bg-background-secondary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 overflow-y-auto pr-1">{children}</div>
      </div>
    </div>
  );
}
