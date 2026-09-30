/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { audioSystem } from '../game/AudioSystem';
import { OwlPortrait } from './OwlPortrait';

interface RotateOrientationPromptProps {
  onDismissOverride?: () => void;
}

export const RotateOrientationPrompt: React.FC<RotateOrientationPromptProps> = ({
  onDismissOverride,
}) => {
  const [isPortrait, setIsPortrait] = useState<boolean>(false);
  const [dismissed, setDismissed] = useState<boolean>(false);

  useEffect(() => {
    const checkOrientation = () => {
      // Check if window is vertical (portrait) and on a mobile/tablet sized viewport
      const portrait = window.innerHeight > window.innerWidth && window.innerWidth <= 1024;
      setIsPortrait(portrait);

      // Reset dismissed state if orientation becomes landscape, so rotating back will remind again
      if (!portrait) {
        setDismissed(false);
      }
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  const handleRequestFullscreenAndLandscape = async () => {
    audioSystem.playButtonClick();
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
      // If screen.orientation API is available, try to lock to landscape
      const screenAny = window.screen as unknown as { orientation?: { lock?: (orientation: string) => Promise<void> } };
      if (screenAny?.orientation?.lock) {
        await screenAny.orientation.lock('landscape');
      }
    } catch {
      // Screen orientation lock may require user manual rotation on iOS/certain browsers
    }
  };

  const handleBypass = () => {
    audioSystem.playButtonClick();
    setDismissed(true);
    onDismissOverride?.();
  };

  // Only show if in portrait mode on a mobile/tablet device and not dismissed
  if (!isPortrait || dismissed) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#070504]/96 backdrop-blur-md p-5 text-center select-none pointer-events-auto">
      <div className="max-w-md w-full bg-[#16120e] border-4 border-[#2b2016] p-6 sm:p-8 shadow-[0_20px_80px_rgba(0,0,0,0.98)] text-[#ded4be] flex flex-col items-center">
        {/* Animated Rotating Phone Indicator */}
        <div className="relative mb-4 flex items-center justify-center">
          <div className="w-18 h-18 rounded-full border-2 border-dashed border-[#d4af37]/40 flex items-center justify-center animate-spin-slow">
            <span className="text-3xl">🧭</span>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Animated turning device icon */}
            <svg
              className="w-10 h-10 text-[#d4af37] animate-pulse"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
              <line x1="12" y1="18" x2="12.01" y2="18" />
            </svg>
          </div>
        </div>

        <div className="mb-2">
          <OwlPortrait size={42} />
        </div>

        <span className="text-[10px] font-mono tracking-widest uppercase text-[#d4af37] font-bold block mb-1">
          Mandate · Optimal Perspective
        </span>

        <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#f5eedc] uppercase tracking-wider mb-2">
          Rotate Device to Landscape
        </h2>

        <p className="text-xs sm:text-sm font-serif italic text-[#c2b49e] leading-relaxed mb-6 max-w-xs">
          "The ancient crystal tower and mysterious apparatus require a horizontal view to reveal their full mechanical secrets."
        </p>

        {/* Action Controls */}
        <div className="w-full flex flex-col gap-2.5">
          <button
            type="button"
            onClick={handleRequestFullscreenAndLandscape}
            className="w-full py-3 bg-[#d4af37] hover:bg-[#fae7b5] text-[#120c06] font-serif text-xs font-bold uppercase tracking-widest cursor-pointer shadow-md transition-all active:scale-98 rounded flex items-center justify-center gap-2"
          >
            <span>⛶</span>
            <span>Enter Landscape View</span>
          </button>

          <button
            type="button"
            onClick={handleBypass}
            className="w-full py-2 bg-[#211a14] hover:bg-[#30251c] text-[#a39480] hover:text-[#ded4be] font-serif text-[11px] uppercase tracking-wider border border-[#382b1e] cursor-pointer rounded transition-all"
          >
            Continue in Portrait Anyway
          </button>
        </div>

        <span className="text-[9px] font-mono text-[#695a49] mt-4">
          Tip: You can lock or unlock your phone’s auto-rotate settings.
        </span>
      </div>
    </div>
  );
};
