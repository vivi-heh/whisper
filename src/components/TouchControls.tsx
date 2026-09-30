/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { audioSystem } from '../game/AudioSystem';
import { InteractiveObject } from '../types/game';

interface TouchControlsProps {
  onMoveVector: (vx: number, vy: number) => void;
  onHotspotSense: () => void;
  onInteract: () => void;
  onOpenNotebook: () => void;
  nearbyObject: InteractiveObject | null;
  active: boolean;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  onMoveVector,
  onHotspotSense,
  onInteract,
  onOpenNotebook,
  nearbyObject,
  active,
}) => {
  const [isTouchDevice, setIsTouchDevice] = useState<boolean>(false);
  const [activeDirection, setActiveDirection] = useState<string | null>(null);
  const joystickCenterRef = useRef<{ x: number; y: number } | null>(null);
  const [stickOffset, setStickOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isJoystickActive, setIsJoystickActive] = useState<boolean>(false);

  // Trigger light mobile haptic pulse if available
  const triggerHaptic = (ms: number = 12) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(ms);
      } catch {
        // Ignore on unsupported browsers
      }
    }
  };

  useEffect(() => {
    const checkTouch = () => {
      const hasTouch =
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        window.innerWidth <= 1024;
      setIsTouchDevice(hasTouch);
    };

    checkTouch();
    window.addEventListener('resize', checkTouch);
    return () => window.removeEventListener('resize', checkTouch);
  }, []);

  // Joystick Touch Events
  const handleJoystickStart = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    joystickCenterRef.current = { x: centerX, y: centerY };
    setIsJoystickActive(true);
    triggerHaptic(10);
    audioSystem.playHoverTick();
    handleJoystickMove(e);
  };

  const handleJoystickMove = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!joystickCenterRef.current || e.touches.length === 0) return;
    const touch = e.touches[0];
    const dx = touch.clientX - joystickCenterRef.current.x;
    const dy = touch.clientY - joystickCenterRef.current.y;
    const maxRadius = 42;
    const distance = Math.hypot(dx, dy);

    if (distance === 0) {
      setStickOffset({ x: 0, y: 0 });
      onMoveVector(0, 0);
      return;
    }

    const clampedDist = Math.min(distance, maxRadius);
    const nx = dx / distance;
    const ny = dy / distance;

    setStickOffset({
      x: nx * clampedDist,
      y: ny * clampedDist,
    });

    // Provide analog movement vector
    const intensity = Math.min(1.0, distance / 32);
    onMoveVector(nx * intensity, ny * intensity);
  };

  const handleJoystickEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    joystickCenterRef.current = null;
    setIsJoystickActive(false);
    setStickOffset({ x: 0, y: 0 });
    onMoveVector(0, 0);
  };

  if (!isTouchDevice || !active) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-30 select-none overflow-hidden touch-none">
      {/* --- BOTTOM-LEFT: Virtual Occult Thumbstick --- */}
      <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-8 pointer-events-auto flex flex-col items-center">
        <div
          onTouchStart={handleJoystickStart}
          onTouchMove={handleJoystickMove}
          onTouchEnd={handleJoystickEnd}
          onTouchCancel={handleJoystickEnd}
          className={`relative w-28 h-28 sm:w-32 sm:h-32 rounded-full border-2 border-[#57442f]/80 bg-[#120d09]/75 backdrop-blur-md shadow-[0_4px_25px_rgba(0,0,0,0.85)] flex items-center justify-center transition-colors ${
            isJoystickActive ? 'border-[#d4af37] bg-[#1a1209]/90' : ''
          }`}
          style={{ touchAction: 'none' }}
        >
          {/* Compass Runic Notches */}
          <span className="absolute top-1 text-[9px] font-mono text-[#a89078]/70 pointer-events-none">▲</span>
          <span className="absolute bottom-1 text-[9px] font-mono text-[#a89078]/70 pointer-events-none">▼</span>
          <span className="absolute left-1 text-[9px] font-mono text-[#a89078]/70 pointer-events-none">◀</span>
          <span className="absolute right-1 text-[9px] font-mono text-[#a89078]/70 pointer-events-none">▶</span>

          {/* Central Movable Brass Knob */}
          <div
            className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 border-[#826747] bg-gradient-to-b from-[#382b1d] to-[#1e160e] shadow-lg flex items-center justify-center transition-transform ${
              isJoystickActive ? 'border-[#fae7b5] scale-105 shadow-[0_0_15px_rgba(212,175,55,0.6)]' : ''
            }`}
            style={{
              transform: `translate3d(${stickOffset.x}px, ${stickOffset.y}px, 0)`,
              touchAction: 'none',
            }}
          >
            <div className="w-4 h-4 rounded-full border border-[#d4af37]/60 bg-[#d4af37]/20 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-[#d4af37]" />
            </div>
          </div>
        </div>

        <span className="text-[9px] font-mono tracking-widest text-[#a89078]/70 uppercase mt-1">
          DRAG TO WALK
        </span>
      </div>

      {/* --- BOTTOM-RIGHT: Quick Action & Hotspot Sense Buttons --- */}
      <div className="absolute bottom-4 sm:bottom-6 right-4 sm:right-8 pointer-events-auto flex flex-col items-end gap-3">
        {/* Hotspot Sense Button (Spacebar replacement for Mobile) */}
        <button
          type="button"
          onTouchStart={e => {
            e.stopPropagation();
            triggerHaptic(18);
            onHotspotSense();
          }}
          onClick={e => {
            e.stopPropagation();
            onHotspotSense();
          }}
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-[#17120d]/85 hover:bg-[#261c14] border border-[#5c4632] text-[#e0d3bc] shadow-lg active:scale-95 transition-all cursor-pointer backdrop-blur-md"
          title="Sense Hidden Runes & Hotspots"
        >
          <span className="text-base text-[#d4af37] animate-pulse">👁️</span>
          <span className="font-serif text-xs uppercase tracking-wider font-bold text-[#fae7b5]">
            SENSE (✦)
          </span>
        </button>

        {/* Dynamic Contextual Interact Button (Active when near interactive object) */}
        {nearbyObject ? (
          <button
            type="button"
            onTouchStart={e => {
              e.stopPropagation();
              triggerHaptic(25);
              onInteract();
            }}
            onClick={e => {
              e.stopPropagation();
              onInteract();
            }}
            className="flex items-center gap-2 px-4 py-3 rounded-full bg-[#3d2c16] hover:bg-[#523c1d] border-2 border-[#d4af37] text-[#fae7b5] shadow-[0_0_20px_rgba(212,175,55,0.45)] active:scale-95 transition-all cursor-pointer backdrop-blur-md animate-pulse"
            title={`Interact with ${nearbyObject.name}`}
          >
            <span className="text-lg">✋</span>
            <div className="text-left">
              <span className="text-[9px] font-mono block text-[#d4af37] uppercase leading-none font-bold">
                TAP TO INTERACT
              </span>
              <span className="font-serif text-xs font-bold text-white uppercase tracking-wider truncate max-w-[140px] block">
                {nearbyObject.name}
              </span>
            </div>
          </button>
        ) : (
          <button
            type="button"
            onTouchStart={e => {
              e.stopPropagation();
              triggerHaptic(12);
              onOpenNotebook();
            }}
            onClick={e => {
              e.stopPropagation();
              onOpenNotebook();
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-full bg-[#140e09]/80 hover:bg-[#241a12] border border-[#3d2e1f] text-[#b8a792] shadow-md active:scale-95 transition-all cursor-pointer backdrop-blur-md"
            title="Open Notebook"
          >
            <span className="text-sm">📖</span>
            <span className="font-serif text-[11px] uppercase tracking-wider">Notebook</span>
          </button>
        )}
      </div>
    </div>
  );
};
