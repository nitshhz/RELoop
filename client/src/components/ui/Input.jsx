import React, { forwardRef } from 'react';

export const Input = forwardRef(function Input(
  {
    label,
    error,
    helperText,
    icon: Icon,
    className = '',
    containerClassName = '',
    ...props
  },
  ref
) {
  return (
    <div className={`w-full ${containerClassName}`}>
      {label && (
        <label className="block text-xs font-semibold text-text-primary mb-1.5 tracking-wide">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 pointer-events-none text-text-muted">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          ref={ref}
          className={`w-full clay-input py-2.5 text-sm ${
            Icon ? 'pl-10 pr-4' : 'px-4'
          } ${error ? 'border-red-400 focus:border-red-500' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-600 mt-1.5 font-medium">{error}</p>}
      {helperText && !error && (
        <p className="text-xs text-text-muted mt-1">{helperText}</p>
      )}
    </div>
  );
});

export const Textarea = forwardRef(function Textarea(
  {
    label,
    error,
    helperText,
    rows = 4,
    className = '',
    containerClassName = '',
    ...props
  },
  ref
) {
  return (
    <div className={`w-full ${containerClassName}`}>
      {label && (
        <label className="block text-xs font-semibold text-text-primary mb-1.5 tracking-wide">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        rows={rows}
        className={`w-full clay-input p-3 text-sm ${
          error ? 'border-red-400 focus:border-red-500' : ''
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-600 mt-1.5 font-medium">{error}</p>}
      {helperText && !error && (
        <p className="text-xs text-text-muted mt-1">{helperText}</p>
      )}
    </div>
  );
});
