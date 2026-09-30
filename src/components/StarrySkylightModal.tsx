/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { audioSystem } from '../game/AudioSystem';

interface StarrySkylightModalProps {
  onSolved: () => void;
  onClose: () => void;
}

interface ConstellationBeacon {
  id: string;
  name: string;
  wizard: string;
  color: string;
  x: number; // percentage
  y: number; // percentage
  locked: boolean;
}

export const StarrySkylightModal: React.FC<StarrySkylightModalProps> = ({ onSolved, onClose }) => {
  const [beacons, setBeacons] = useState<ConstellationBeacon[]>([
    { id: 'b1', name: 'Mount Sylas Beacon', wizard: 'Archmage Sylas', color: '#38bdf8', x: 25, y: 35, locked: false },
    { id: 'b2', name: 'Rowan Forest Spire', wizard: 'Archdruid Rowan', color: '#34d399', x: 75, y: 28, locked: false },
    { id: 'b3', name: 'Vesper Shadow Peak', wizard: 'Mystic Vesper', color: '#c084fc', x: 40, y: 70, locked: false },
    { id: 'b4', name: 'Ignis Volcano Spire', wizard: 'Pyromancer Ignis', color: '#f87171', x: 80, y: 72, locked: false },
    { id: 'b5', name: 'Aurelius Citadel', wizard: 'Grand Seer Aurelius', color: '#fbbf24', x: 50, y: 45, locked: false },
  ]);

  const [reticlePos, setReticlePos] = useState<{ x: number; y: number }>({ x: 50, y: 50 });

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;

    audioSystem.playTelescopeClick();
    setReticlePos({ x: clickX, y: clickY });

    // Check if clicked close to any beacon
    setBeacons(prev =>
      prev.map(b => {
        const dist = Math.hypot(b.x - clickX, b.y - clickY);
        if (dist < 10) {
          audioSystem.playHarmonicResonance();
          return { ...b, locked: true };
        }
        return b;
      })
    );
  };

  const allLocked = beacons.every(b => b.locked);

  const handleSynchronize = () => {
    if (allLocked) {
      audioSystem.playCelestialIgnite();
      onSolved();
    }
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 pointer-events-auto">
      {/* Brass Astrolabe Telescope Dome */}
      <div className="max-w-2xl w-full bg-[#14100c] border-4 border-[#080605] p-6 shadow-[0_25px_80px_rgba(0,0,0,0.98)] text-[#ded4be] flex flex-col justify-between my-auto select-none relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-[#382b1e] pb-3 mb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔭</span>
            <div>
              <h2 className="text-xl font-serif font-bold text-[#f5eedc] uppercase tracking-wider">
                Glass Observatory Telescope
              </h2>
              <span className="text-[10px] font-mono text-[#8a7662]">
                Chamber 4 · Kingdom-Wide Transmission Carrier Alignment
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              audioSystem.playButtonClick();
              onClose();
            }}
            className="w-8 h-8 bg-[#292019] hover:bg-[#3d3025] text-[#ded4be] border border-[#0d0907] flex items-center justify-center text-xs font-serif font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Circular Telescope Viewport */}
        <div
          onClick={handleCanvasClick}
          className="relative w-full h-72 bg-[#050810] border-4 border-[#3d2e1f] rounded-full overflow-hidden mb-4 mx-auto max-w-md shadow-2xl cursor-crosshair flex items-center justify-center"
        >
          {/* Night Sky Background with Stars */}
          <div className="absolute inset-0 pointer-events-none opacity-80">
            {Array.from({ length: 45 }).map((_, i) => (
              <div
                key={i}
                className="absolute bg-white rounded-full"
                style={{
                  left: `${(i * 29) % 100}%`,
                  top: `${(i * 47) % 100}%`,
                  width: `${(i % 3) + 1.5}px`,
                  height: `${(i % 3) + 1.5}px`,
                  opacity: 0.3 + ((i % 5) * 0.15),
                }}
              />
            ))}
          </div>

          {/* Crosshair reticle */}
          <div
            className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 transition-all duration-75"
            style={{ left: `${reticlePos.x}%`, top: `${reticlePos.y}%` }}
          >
            <div className="w-12 h-12 border border-[#d4af37] rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-[#d4af37] rounded-full" />
            </div>
            <div className="absolute left-6 top-1/2 w-4 h-0.5 bg-[#d4af37] -translate-y-1/2" />
            <div className="absolute -left-4 top-1/2 w-4 h-0.5 bg-[#d4af37] -translate-y-1/2" />
            <div className="absolute top-6 left-1/2 h-4 w-0.5 bg-[#d4af37] -translate-x-1/2" />
            <div className="absolute -top-4 left-1/2 h-4 w-0.5 bg-[#d4af37] -translate-x-1/2" />
          </div>

          {/* 5 Kingdom Transmission Beacons */}
          {beacons.map(b => (
            <div
              key={b.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 transition-all"
              style={{ left: `${b.x}%`, top: `${b.y}%` }}
            >
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  b.locked
                    ? 'border-white shadow-[0_0_12px_#fff] scale-125'
                    : 'border-[#544333] hover:border-[#d4af37] animate-pulse'
                }`}
                style={{ backgroundColor: b.locked ? b.color : 'rgba(0,0,0,0.6)' }}
              >
                <span className="text-[10px]">{b.locked ? '✦' : '✧'}</span>
              </div>
              <div className="text-[8px] font-mono text-[#ded4be] bg-black/75 px-1 rounded mt-1 whitespace-nowrap -translate-x-1/4">
                {b.name.split(' ')[0]} {b.locked ? '✓' : ''}
              </div>
            </div>
          ))}
        </div>

        {/* Beacon Status Bar */}
        <div className="grid grid-cols-5 gap-1.5 mb-4 text-center">
          {beacons.map(b => (
            <div
              key={b.id}
              className={`p-1.5 border rounded text-[10px] font-mono ${
                b.locked ? 'bg-[#1b2b1e] border-[#22c55e] text-[#86efac]' : 'bg-[#140e0a] border-[#2e2116] text-[#786754]'
              }`}
            >
              <div className="truncate font-bold">{b.name.split(' ')[0]}</div>
              <div>{b.locked ? 'LOCKED' : 'TARGET'}</div>
            </div>
          ))}
        </div>

        {/* Footer controls */}
        <div className="flex justify-between items-center pt-2 border-t border-[#291f16]">
          <span className="text-xs font-serif italic text-[#8a7864]">
            {allLocked
              ? '✦ All 5 regional transmitter carrier waves locked into telescope!'
              : 'Click on all 5 distant beacon stars through the telescope to lock carrier frequencies.'}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                audioSystem.playHarmonicResonance();
                setBeacons(prev => prev.map(b => ({ ...b, locked: true })));
              }}
              className="px-3 py-2 bg-[#261f18] hover:bg-[#382d22] text-[#d4af37] font-serif text-xs uppercase tracking-wider border border-[#523d2b] cursor-pointer"
              title="Auto-lock all 5 regional beacon stars"
            >
              ✦ Auto-Target Stars
            </button>

            <button
              type="button"
              disabled={!allLocked}
              onClick={handleSynchronize}
              className={`px-5 py-2 font-serif text-xs font-bold border-2 transition-all ${
                allLocked
                  ? 'bg-[#d4af37] hover:bg-[#fae7b5] text-[#140e08] border-[#0a0705] shadow-[0_0_18px_rgba(212,175,55,0.5)] cursor-pointer'
                  : 'bg-[#1b1510] text-[#524334] border-[#292019] cursor-not-allowed'
              }`}
            >
              ✦ Lock Celestial Carriers
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
