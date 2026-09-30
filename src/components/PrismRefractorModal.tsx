/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { audioSystem } from '../game/AudioSystem';

interface PrismRefractorModalProps {
  onSolved: () => void;
  onClose: () => void;
}

export const PrismRefractorModal: React.FC<PrismRefractorModalProps> = ({ onSolved, onClose }) => {
  // 3 Chromatic Prism Rings (Target: all 3 points aligned to North 0°)
  const [angles, setAngles] = useState<[number, number, number]>([90, 210, 300]);

  const targetAngles = [0, 0, 0];

  const handleRotate = (ringIdx: 0 | 1 | 2) => {
    audioSystem.playButtonClick();
    setAngles(prev => {
      const next = [...prev] as [number, number, number];
      next[ringIdx] = (next[ringIdx] + 30) % 360;
      return next;
    });
  };

  const isAligned = angles[0] === targetAngles[0] && angles[1] === targetAngles[1] && angles[2] === targetAngles[2];

  const handleEngage = () => {
    if (isAligned) {
      audioSystem.playPrismAlign();
      onSolved();
    }
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 pointer-events-auto">
      {/* Heavy Steampunk / Rusty Lake Optical Alignment Chamber */}
      <div className="max-w-xl w-full bg-[#17130f] border-4 border-[#0a0705] p-6 shadow-[0_20px_70px_rgba(0,0,0,0.95)] text-[#ded4be] flex flex-col justify-between my-auto select-none relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-[#382b20] pb-3 mb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">💎</span>
            <div>
              <h2 className="text-xl font-serif font-bold text-[#e8ded0] uppercase tracking-wider">
                Harmonic Prism Refractor
              </h2>
              <span className="text-[10px] font-mono text-[#8a7662]">
                Chamber 3 · Optical Carrier Wave Collimation
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

        {/* Optical Alignment Chamber Graphic */}
        <div className="bg-[#0c0e12] border-3 border-[#28221b] p-4 rounded mb-4 flex flex-col items-center justify-center relative shadow-inner">
          <div className="text-[10px] font-mono text-[#a39480] mb-2 uppercase tracking-widest">
            {isAligned ? '✦ CHROMATIC BEAMS COLLIMATED' : 'DISPERSED LIGHT: ALIGN ALL THREE RINGS TO ZERO DEFLECTION'}
          </div>

          {/* SVG Optical Rings */}
          <svg className="w-56 h-56" viewBox="0 0 200 200">
            {/* Background Aperture */}
            <circle cx="100" cy="100" r="90" fill="#070a0e" stroke="#1f1812" strokeWidth="3" />
            <circle cx="100" cy="100" r="70" fill="none" stroke="#2b2118" strokeWidth="1.5" strokeDasharray="4 4" />
            <circle cx="100" cy="100" r="50" fill="none" stroke="#2b2118" strokeWidth="1.5" strokeDasharray="4 4" />
            <circle cx="100" cy="100" r="30" fill="none" stroke="#2b2118" strokeWidth="1.5" strokeDasharray="4 4" />

            {/* Target Alignment Notch at Top (0°) */}
            <line x1="100" y1="5" x2="100" y2="25" stroke="#d4af37" strokeWidth="3" />
            <polygon points="96,25 104,25 100,32" fill="#d4af37" />

            {/* Ring 1: Outer Ruby (Red) */}
            <g transform={`rotate(${angles[0]} 100 100)`}>
              <line x1="100" y1="100" x2="100" y2="20" stroke="#f87171" strokeWidth="3" />
              <circle cx="100" cy="20" r="6" fill="#f87171" stroke="#000" strokeWidth="1.5" />
            </g>

            {/* Ring 2: Middle Emerald (Green) */}
            <g transform={`rotate(${angles[1]} 100 100)`}>
              <line x1="100" y1="100" x2="100" y2="40" stroke="#34d399" strokeWidth="2.5" />
              <circle cx="100" cy="40" r="5.5" fill="#34d399" stroke="#000" strokeWidth="1.5" />
            </g>

            {/* Ring 3: Inner Azure (Blue) */}
            <g transform={`rotate(${angles[2]} 100 100)`}>
              <line x1="100" y1="100" x2="100" y2="60" stroke="#38bdf8" strokeWidth="2.5" />
              <circle cx="100" cy="60" r="5" fill="#38bdf8" stroke="#000" strokeWidth="1.5" />
            </g>

            {/* Central Crystal Prism Core */}
            <polygon
              points="100,82 116,110 84,110"
              fill={isAligned ? 'rgba(255, 255, 255, 0.9)' : 'rgba(215, 235, 255, 0.4)'}
              stroke="#0a0806"
              strokeWidth="2"
              className={isAligned ? 'animate-pulse' : ''}
            />
          </svg>

          {/* Coherent Beam Indicator */}
          {isAligned && (
            <div className="mt-2 text-xs font-mono font-bold text-[#4ade80] animate-pulse">
              ✦ BEAM COHERENCE LOCKED (0° OFFSET)
            </div>
          )}
        </div>

        {/* Tactile Rotation Knobs */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <button
            type="button"
            onClick={() => handleRotate(0)}
            className="p-3 bg-[#241a14] hover:bg-[#36271e] border-2 border-[#542626] text-center cursor-pointer transition-all active:scale-95"
          >
            <div className="text-xs font-serif font-bold text-[#fca5a5] mb-1">Ruby Ring (Outer)</div>
            <div className="text-sm font-mono text-white">{angles[0]}°</div>
            <span className="text-[9px] font-sans text-[#a89582]">+30° Step</span>
          </button>

          <button
            type="button"
            onClick={() => handleRotate(1)}
            className="p-3 bg-[#241a14] hover:bg-[#36271e] border-2 border-[#265438] text-center cursor-pointer transition-all active:scale-95"
          >
            <div className="text-xs font-serif font-bold text-[#86efac] mb-1">Emerald Ring (Mid)</div>
            <div className="text-sm font-mono text-white">{angles[1]}°</div>
            <span className="text-[9px] font-sans text-[#a89582]">+30° Step</span>
          </button>

          <button
            type="button"
            onClick={() => handleRotate(2)}
            className="p-3 bg-[#241a14] hover:bg-[#36271e] border-2 border-[#263b54] text-center cursor-pointer transition-all active:scale-95"
          >
            <div className="text-xs font-serif font-bold text-[#93c5fd] mb-1">Azure Ring (Inner)</div>
            <div className="text-sm font-mono text-white">{angles[2]}°</div>
            <span className="text-[9px] font-sans text-[#a89582]">+30° Step</span>
          </button>
        </div>

        {/* Footer controls */}
        <div className="flex justify-between items-center">
          <span className="text-xs font-serif italic text-[#8a7864]">
            Rotate all three rings until their needles converge at the gold notch (0°).
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setAngles([0, 0, 0]);
                audioSystem.playHarmonicResonance();
              }}
              className="px-3 py-2 bg-[#261f18] hover:bg-[#382d22] text-[#d4af37] font-serif text-xs uppercase tracking-wider border border-[#523d2b] cursor-pointer"
              title="Auto-align optical prism rings"
            >
              ✦ Auto-Align
            </button>

            <button
              type="button"
              disabled={!isAligned}
              onClick={handleEngage}
              className={`px-5 py-2 font-serif text-xs font-bold border-2 transition-all ${
                isAligned
                  ? 'bg-[#d4af37] hover:bg-[#fae7b5] text-[#140e08] border-[#0a0705] shadow-[0_0_15px_rgba(212,175,55,0.4)] cursor-pointer'
                  : 'bg-[#1b1510] text-[#524334] border-[#292019] cursor-not-allowed'
              }`}
            >
              ✦ Focus Coherent Beam
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
