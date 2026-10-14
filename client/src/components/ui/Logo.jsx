import React from 'react';
import { Link } from 'react-router-dom';

/**
 * ReLoop Brand Identity Logo Component
 * Renders consistent, high-fidelity branding across the entire site and mobile screens.
 */
export function Logo({
  size = 'md',
  variant = 'full',
  asLink = true,
  className = '',
}) {
  const sizeConfig = {
    sm: {
      box: 'w-7 h-7 rounded-lg',
      img: 'w-7 h-7 rounded-lg',
      text: 'text-base',
      sub: 'text-[9px]',
    },
    md: {
      box: 'w-10 h-10 rounded-xl',
      img: 'w-10 h-10 rounded-xl',
      text: 'text-xl',
      sub: 'text-[10px]',
    },
    lg: {
      box: 'w-12 h-12 rounded-2xl',
      img: 'w-12 h-12 rounded-2xl',
      text: 'text-2xl',
      sub: 'text-xs',
    },
    xl: {
      box: 'w-16 h-16 rounded-2xl',
      img: 'w-16 h-16 rounded-2xl',
      text: 'text-3xl',
      sub: 'text-sm',
    },
  };

  const currentSize = sizeConfig[size] || sizeConfig.md;

  const content = (
    <div className={`flex items-center gap-2.5 shrink-0 group ${className}`}>
      {/* Brand Icon Mark */}
      <div
        className={`${currentSize.box} overflow-hidden shadow-clay-card border border-border-subtle bg-[#F7F5F0] flex items-center justify-center group-hover:scale-105 transition-transform duration-200 shrink-0`}
      >
        <img
          src="/logo.png"
          alt="ReLoop Logo"
          className={`${currentSize.img} object-contain`}
          onError={(e) => {
            // Fallback SVG loop if image fails
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>

      {/* Typography */}
      {variant !== 'iconOnly' && (
        <div className="flex flex-col">
          <span
            className={`${currentSize.text} font-black text-text-primary tracking-tight leading-none`}
          >
            Re<span className="text-brand-green">Loop</span>
          </span>
          {variant === 'full' && (
            <span
              className={`hidden sm:block ${currentSize.sub} text-text-muted font-bold tracking-wider uppercase mt-0.5`}
            >
              Resale Marketplace
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (asLink) {
    return (
      <Link to="/" className="inline-flex focus:outline-none">
        {content}
      </Link>
    );
  }

  return content;
}
