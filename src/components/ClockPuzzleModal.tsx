/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { audioSystem } from '../game/AudioSystem';

interface ClockPuzzleModalProps {
  onSolved: () => void;
  onClose: () => void;
}

export const ClockPuzzleModal: React.FC<ClockPuzzleModalProps> = ({ onSolved, onClose }) => {
  // Eclipse alignment: Sun Hour Hand at 12 (Zenith), Moon Minute Hand at 6 (Abyss)
  const [hourAngle, setHourAngle] = useState<number>(3);
  const [minuteAngle, setMinuteAngle] = useState<number>(12);
  const [isOpening, setIsOpening] = useState<boolean>(false);
  const [isHandCreeping, setIsHandCreeping] = useState<boolean>(false);

  const rotateHour = () => {
    audioSystem.playLeverClick();
    setHourAngle(prev => (prev % 12) + 1);
  };

  const rotateMinute = () => {
    audioSystem.playLeverClick();
    setMinuteAngle(prev => (prev % 12) + 1);
  };

  const handleInspectGears = () => {
    if (hourAngle === 12 && minuteAngle === 6) {
      audioSystem.playStoneDoorOpen();
      setIsOpening(true);
      setTimeout(() => {
        setIsHandCreeping(true);
        audioSystem.playItemPickup();
      }, 700);
      setTimeout(() => {
        onSolved();
      }, 2300);
    } else {
      audioSystem.playScrambleNoise();
    }
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 pointer-events-auto">
      {/* Heavy vintage dark oak astrolabe face */}
      <div className="max-w-md w-full bg-[#1b1510] border-4 border-[#0c0907] p-6 shadow-[0_15px_60px_rgba(0,0,0,0.98)] text-center relative select-none">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-[#362b21] mb-4">
          <div className="text-left">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#85735f] font-bold block">
              Occult Horology
            </span>
            <h3 className="text-lg font-serif font-bold text-[#e2d7c2] uppercase tracking-wide">
              The Grandfather Astrolabe
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

        {/* Cryptic Clue Plaque */}
        <div className="bg-[#261e17] p-3 border border-[#3d3024] mb-5 text-xs text-[#c2b49e] font-serif italic leading-relaxed">
          "The Hour of the Eclipse: When the Sun (+1) crowns the Zenith [XII], and the Moon (-1) descends into the Abyss [VI], the clockwork shall yield its secret."
        </div>

        {/* Clock Face Display (Rusty Lake Style) */}
        <div className="relative w-64 h-64 mx-auto mb-5 bg-[#251d16] rounded-full border-4 border-[#0c0907] shadow-inner flex items-center justify-center overflow-hidden">
          {/* Inner ring */}
          <div className="absolute inset-2 rounded-full border border-dashed border-[#574433]" />

          {/* Numbers / Symbols */}
          <span className="absolute top-2.5 font-serif font-bold text-[#e0d6c1] text-xs">XII ☀️</span>
          <span className="absolute right-3.5 font-serif font-bold text-[#8f7e69] text-xs">III</span>
          <span className="absolute bottom-2.5 font-serif font-bold text-[#5c8a9e] text-xs">VI 🌙</span>
          <span className="absolute left-3.5 font-serif font-bold text-[#8f7e69] text-xs">IX</span>

          {/* Swinging Pendulum */}
          <div className="absolute bottom-6 w-1 h-20 bg-[#69533c] origin-top animate-pendulum" />

          {/* Hour Hand (Sun) */}
          <div
            onClick={rotateHour}
            style={{ transform: `rotate(${hourAngle * 30}deg)` }}
            className="absolute w-2 h-16 bg-[#d4af37] border border-[#0c0907] rounded-none origin-bottom bottom-1/2 left-[calc(50%-4px)] shadow-md transition-transform duration-300 cursor-pointer hover:brightness-110 z-10"
            title="Advance Sun Hand"
          />

          {/* Minute Hand (Moon) */}
          <div
            onClick={rotateMinute}
            style={{ transform: `rotate(${minuteAngle * 30}deg)` }}
            className="absolute w-1.5 h-24 bg-[#5c8a9e] border border-[#0c0907] rounded-none origin-bottom bottom-1/2 left-[calc(50%-3px)] shadow-md transition-transform duration-300 cursor-pointer hover:brightness-110 z-10"
            title="Advance Moon Hand"
          />

          {/* Center Brass Nut */}
          <div className="w-5 h-5 rounded-full bg-[#8a6e3d] border-2 border-[#0c0907] z-20 shadow-md" />

          {/* Creepy Mechanical Hand Emerging when Solved */}
          {isHandCreeping && (
            <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-30">
              <span className="text-4xl animate-bounce">🦾🌲</span>
              <span className="text-xs font-serif font-bold text-[#dcd2bb] uppercase tracking-wider mt-2">
                A mechanical arm surrenders the Emerald Seal.
              </span>
            </div>
          )}
        </div>

        {/* Hand Controls */}
        <div className="flex gap-2 justify-center mb-4">
          <button
            type="button"
            onClick={rotateHour}
            className="px-3.5 py-1.5 bg-[#2b2219] hover:bg-[#3d3023] border border-[#0c0907] text-[#ded4be] text-xs font-serif uppercase tracking-wider cursor-pointer"
          >
            Turn Sun Hand ({hourAngle})
          </button>
          <button
            type="button"
            onClick={rotateMinute}
            className="px-3.5 py-1.5 bg-[#2b2219] hover:bg-[#3d3023] border border-[#0c0907] text-[#8cb3c4] text-xs font-serif uppercase tracking-wider cursor-pointer"
          >
            Turn Moon Hand ({minuteAngle})
          </button>
        </div>

        {/* Unlock Action Button */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setHourAngle(12);
              setMinuteAngle(6);
              audioSystem.playStoneDoorOpen();
              setIsOpening(true);
              setTimeout(() => {
                setIsHandCreeping(true);
                audioSystem.playItemPickup();
              }, 400);
              setTimeout(() => {
                onSolved();
              }, 1200);
            }}
            className="py-2.5 px-3 bg-[#241a14] hover:bg-[#38261e] border border-[#523929] text-[#d4af37] font-serif text-xs uppercase tracking-wider cursor-pointer"
            title="Auto-solve eclipse alignment"
          >
            ✦ Auto-Solve
          </button>
          <button
            type="button"
            disabled={isOpening}
            onClick={handleInspectGears}
            className="flex-1 py-2.5 bg-[#2b2118] hover:bg-[#3d3024] border-2 border-[#0c0907] text-[#ded4be] font-serif text-xs uppercase tracking-widest cursor-pointer shadow-md transition-all active:scale-98 disabled:opacity-50"
          >
            {isOpening ? 'Mechanism Releasing...' : 'Engage Clockwork Catch'}
          </button>
        </div>
      </div>
    </div>
  );
};
