import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Cinematic First-Visit Intro Animation for ReLoop
 * Plays a smooth zoom-in followed by an elegant fade-out of the ReLoop brand mark.
 * Stored in sessionStorage so it only plays once per session on first site open.
 * Can be manually replayed by visiting with ?intro=true.
 */
export function IntroSplash() {
  const [shouldRender, setShouldRender] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Check if intro was already played in this session, or forced via URL param
    const searchParams = new URLSearchParams(location.search);
    const forceIntro = searchParams.get('intro') === 'true' || searchParams.get('splash') === 'true';
    const hasSeenIntro = sessionStorage.getItem('reloop_intro_seen');

    if (!hasSeenIntro || forceIntro) {
      setShouldRender(true);
      sessionStorage.setItem('reloop_intro_seen', 'true');

      // Phase 1: Hold and let zoom-in finish (~2.4s)
      const fadeTimer = setTimeout(() => {
        setIsFadingOut(true);
      }, 2400);

      // Phase 2: Complete smooth fade-out and unmount (~3.3s total)
      const unmountTimer = setTimeout(() => {
        setShouldRender(false);
      }, 3300);

      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(unmountTimer);
      };
    }
  }, [location.search]);

  function handleDismiss() {
    setIsFadingOut(true);
    setTimeout(() => {
      setShouldRender(false);
    }, 280);
  }

  if (!shouldRender) return null;

  return (
    <div
      onClick={handleDismiss}
      className={`fixed inset-0 z-[99999] flex items-center justify-center cursor-pointer select-none overflow-hidden transition-opacity duration-700 ease-out ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{
        backgroundColor: '#0D130F',
      }}
      aria-hidden="true"
    >
      {/* Dynamic Ambient Glow Behind Logo */}
      <div
        className="absolute w-[500px] h-[500px] rounded-full pointer-events-none filter blur-3xl animate-pulse"
        style={{
          background: 'radial-gradient(circle, rgba(53, 107, 80, 0.45) 0%, rgba(78, 155, 115, 0.2) 40%, transparent 70%)',
          animationDuration: '2s',
        }}
      />

      {/* Subtle Noise / Radial Grid Overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.15) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Main Animated Container: Zoom in then fade */}
      <div
        className={`relative z-10 flex flex-col items-center justify-center text-center px-6 transition-all ease-out ${
          isFadingOut
            ? 'scale-115 opacity-0 duration-700 filter blur-sm'
            : 'animate-reloop-intro'
        }`}
      >
        {/* Brand Icon Mark */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl p-3 bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl flex items-center justify-center mb-5 group">
          <img
            src="/logo.png"
            alt="ReLoop"
            className="w-full h-full object-contain filter drop-shadow-[0_4px_12px_rgba(53,107,80,0.6)]"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>

        {/* Brand Typography with Gradient Accent */}
        <h1 className="text-5xl sm:text-7xl font-black text-white tracking-tight leading-none drop-shadow-lg">
          Re<span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-green-400 bg-clip-text text-transparent">Loop</span>
        </h1>

        {/* Brand Tagline */}
        <p className="mt-3 text-sm sm:text-base font-semibold text-emerald-100/80 tracking-wider uppercase drop-shadow">
          Resale Marketplace
        </p>

        {/* Circular Commerce Mission */}
        <div className="mt-4 flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-medium tracking-wide">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span>Buy smarter. Sell easier. Waste less.</span>
        </div>
      </div>

      {/* Subtle Skip Hint in bottom right */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          handleDismiss();
        }}
        className="absolute bottom-6 right-6 text-[11px] font-semibold text-white/50 hover:text-white/90 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 transition-colors"
      >
        Click anywhere to skip
      </button>
    </div>
  );
}
