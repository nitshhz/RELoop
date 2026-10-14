import React from 'react';
import { Loader2 } from 'lucide-react';

export function Button({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  className = '',
  onClick,
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-semibold transition-all focus:outline-none select-none disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 rounded-lg gap-1.5',
    md: 'text-sm px-4 py-2.5 rounded-xl gap-2 min-h-[44px]',
    lg: 'text-base px-6 py-3.5 rounded-2xl gap-2.5 min-h-[48px]',
    icon: 'p-2 rounded-xl min-h-[40px] min-w-[40px]',
  };

  const variantStyles = {
    primary: 'clay-button-primary',
    secondary: 'clay-button-secondary',
    terracotta: 'clay-button-terracotta',
    outline: 'border border-border-subtle bg-white hover:bg-background-secondary text-text-primary shadow-sm',
    ghost: 'text-text-primary hover:bg-background-secondary rounded-xl',
    danger: 'bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-sm',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
}
