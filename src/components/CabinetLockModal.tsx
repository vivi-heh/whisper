/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { audioSystem } from '../game/AudioSystem';

interface CabinetLockModalProps {
  onSolved: () => void;
  onClose: () => void;
}

export const CabinetLockModal: React.FC<CabinetLockModalProps> = ({ onSolved, onClose }) => {
  const symbols1 = ['☀️', '💧', '🔥', '🍃'];
  const symbols2 = ['⭐', '🌙', '💀', '🗝️'];
  const symbols3 = ['👁️', '💎', '👑', '⏳'];

  const [t1, setT1] = useState<number>(0);
  const [t2, setT2] = useState<number>(0);
  const [t3, setT3] = useState<number>(0);
  const [isOpening, setIsOpening] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const rotate = (setter: React.Dispatch<React.SetStateAction<number>>, length: number) => {
    audioSystem.playLeverClick();
    setter(prev => (prev + 1) % length);
    setErrorMsg(null);
  };

  const handleUnlock = () => {
    // Target: Flame (index 2), Moon (index 1), Crystal (index 1)
    if (t1 === 2 && t2 === 1 && t3 === 1) {
      audioSystem.playStoneDoorOpen();
      setIsOpening(true);
      setTimeout(() => {
        audioSystem.playItemPickup();
        onSolved();
      }, 1600);
    } else {
      audioSystem.playScrambleNoise();
      setErrorMsg('The tumblers refuse to turn. The combination is incorrect.');
    }
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 pointer-events-auto">
      {/* Antique Mahogany Velvet Cabinet Face */}
      <div className="max-w-md w-full bg-[#1b1510] border-4 border-[#0c0907] p-6 shadow-[0_15px_60px_rgba(0,0,0,0.98)] text-center relative select-none">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-[#362b21] mb-4">
          <div className="text-left">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#85735f] font-bold block">
              Cabinet Mechanism
            </span>
            <h3 className="text-lg font-serif font-bold text-[#e2d7c2] uppercase tracking-wide">
              Three-Glyph Tumbler Lock
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 bg-[#292018] hover:bg-[#3d3024] text-[#ded4be] border border-[#0d0907] flex items-center justify-center text-xs font-serif font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        <p className="text-xs text-[#a69781] font-serif italic mb-5 leading-relaxed">
          Rotate the three brass tumbler discs to match the riddle:
          <br />
          <em className="text-[#ded4be]">"Born of Fire, veiled by the Moon, sealed within the Crystal."</em>
        </p>

        {/* 3 Tumbler Wheels */}
        <div className="flex justify-center gap-3 mb-6">
          <div className="flex flex-col items-center">
            <button
              type="button"
              onClick={() => rotate(setT1, symbols1.length)}
              className="w-18 h-22 bg-[#261e17] border-2 border-[#0c0907] shadow-inner flex items-center justify-center text-2xl hover:bg-[#382d23] transition-all cursor-pointer select-none"
            >
              {symbols1[t1]}
            </button>
            <span className="text-[9px] text-[#7a6b5a] font-mono mt-1">Wheel I</span>
          </div>

          <div className="flex flex-col items-center">
            <button
              type="button"
              onClick={() => rotate(setT2, symbols2.length)}
              className="w-18 h-22 bg-[#261e17] border-2 border-[#0c0907] shadow-inner flex items-center justify-center text-2xl hover:bg-[#382d23] transition-all cursor-pointer select-none"
            >
              {symbols2[t2]}
            </button>
            <span className="text-[9px] text-[#7a6b5a] font-mono mt-1">Wheel II</span>
          </div>

          <div className="flex flex-col items-center">
            <button
              type="button"
              onClick={() => rotate(setT3, symbols3.length)}
              className="w-18 h-22 bg-[#261e17] border-2 border-[#0c0907] shadow-inner flex items-center justify-center text-2xl hover:bg-[#382d23] transition-all cursor-pointer select-none"
            >
              {symbols3[t3]}
            </button>
            <span className="text-[9px] text-[#7a6b5a] font-mono mt-1">Wheel III</span>
          </div>
        </div>

        {errorMsg && (
          <div className="p-2.5 border border-[#5e2626] bg-[#331818] text-xs font-serif text-[#dfc2c2] mb-4 leading-relaxed">
            {errorMsg}
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setT1(2);
              setT2(1);
              setT3(1);
              audioSystem.playStoneDoorOpen();
              setIsOpening(true);
              setTimeout(() => {
                audioSystem.playItemPickup();
                onSolved();
              }, 800);
            }}
            className="py-2.5 px-3 bg-[#241a14] hover:bg-[#38261e] border border-[#523929] text-[#d4af37] font-serif text-xs uppercase tracking-wider cursor-pointer"
            title="Auto-align cabinet tumblers"
          >
            ✦ Auto-Solve
          </button>
          <button
            type="button"
            disabled={isOpening}
            onClick={handleUnlock}
            className="flex-1 py-2.5 bg-[#2b2118] hover:bg-[#3d3024] border-2 border-[#0c0907] text-[#ded4be] font-serif text-xs uppercase tracking-widest cursor-pointer shadow-md transition-all active:scale-98 disabled:opacity-50"
          >
            {isOpening ? 'Tumblers Springing Open...' : 'Unlock Velvet Drawer'}
          </button>
        </div>
      </div>
    </div>
  );
};
