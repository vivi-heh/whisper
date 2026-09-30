/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { audioSystem } from '../game/AudioSystem';

interface PedestalPuzzleModalProps {
  pedestalId: string;
  pedestalName: string;
  wizardName: string;
  targetWalshCode: number[];
  hasSealInInventory: boolean;
  sealColor: string;
  sealName: string;
  onSolved: () => void;
  onClose: () => void;
}

export const PedestalPuzzleModal: React.FC<PedestalPuzzleModalProps> = ({
  pedestalName,
  wizardName,
  targetWalshCode,
  hasSealInInventory,
  sealName,
  onSolved,
  onClose,
}) => {
  // 4 toggleable polarity discs: 1 (Solar ✦) or -1 (Lunar ✧)
  const [chips, setChips] = useState<number[]>([1, 1, 1, 1]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const toggleChip = (index: number) => {
    if (isSuccess) return;
    audioSystem.playLeverClick();
    setChips(prev => {
      const next = [...prev];
      next[index] = next[index] === 1 ? -1 : 1;
      return next;
    });
    setFeedback(null);
  };

  const handleInsertSeal = () => {
    if (!hasSealInInventory) {
      audioSystem.playScrambleNoise();
      setFeedback(`The ${sealName} is not in your satchel. Search the chamber.`);
      return;
    }

    const isMatch = chips.every((val, idx) => val === targetWalshCode[idx]);

    if (isMatch) {
      audioSystem.playResonanceSeparation();
      setIsSuccess(true);
      setFeedback('Orthogonal resonance confirmed. The stone socket locks the seal into place.');
      setTimeout(() => {
        onSolved();
      }, 1500);
    } else {
      audioSystem.playScrambleNoise();
      setFeedback('Mechanical catch jammed! The polarity discs do not align with this Archmage’s Walsh signature.');
    }
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 pointer-events-auto">
      {/* Stone Pedestal Close-up (Rusty Lake Inked Stone Face) */}
      <div className="max-w-md w-full bg-[#1b1510] border-4 border-[#0c0907] p-6 shadow-[0_15px_60px_rgba(0,0,0,0.98)] text-center relative select-none">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-[#362b21] mb-4">
          <div className="text-left">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#85735f] font-bold block">
              Pedestal Alignment
            </span>
            <h3 className="text-lg font-serif font-bold text-[#e2d7c2] uppercase tracking-wide">
              {pedestalName} ({wizardName})
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
          Rotate the four stone polarity discs to configure {wizardName}’s orthogonal code before seating the seal.
        </p>

        {/* 4 Inked Stone Polarity Discs */}
        <div className="grid grid-cols-4 gap-2.5 mb-6">
          {chips.map((val, idx) => {
            const isSolar = val === 1;
            return (
              <div
                key={idx}
                onClick={() => toggleChip(idx)}
                className={`p-3 border-2 border-[#0c0907] transition-all cursor-pointer flex flex-col items-center justify-center select-none active:scale-95 ${
                  isSolar
                    ? 'bg-[#3b2d1d] text-[#e0d6c1] shadow-inner'
                    : 'bg-[#1a252c] text-[#8cb3c4] shadow-inner'
                }`}
              >
                <span className="text-[9px] font-mono text-[#786b5c] uppercase mb-1">
                  Disc {idx + 1}
                </span>
                <span className="text-2xl mb-1">{isSolar ? '✦' : '✧'}</span>
                <span className="text-[10px] font-serif uppercase tracking-wider font-bold">
                  {isSolar ? '+1 Sun' : '-1 Moon'}
                </span>
              </div>
            );
          })}
        </div>

        {/* Feedback message */}
        {feedback && (
          <div
            className={`p-2.5 border text-xs font-serif mb-4 leading-relaxed ${
              isSuccess
                ? 'bg-[#1e2e1f] border-[#2f5431] text-[#c2dfc4]'
                : 'bg-[#331818] border-[#5e2626] text-[#dfc2c2]'
            }`}
          >
            {feedback}
          </div>
        )}

        {/* Action Button */}
        <div className="flex gap-2">
          <button
            type="button"
            disabled={isSuccess}
            onClick={() => {
              setChips([...targetWalshCode]);
              audioSystem.playResonanceSeparation();
              setIsSuccess(true);
              setFeedback('Orthogonal resonance confirmed. The stone socket locks the seal into place.');
              setTimeout(() => {
                onSolved();
              }, 900);
            }}
            className="py-2.5 px-3 bg-[#241a14] hover:bg-[#38261e] border border-[#523929] text-[#d4af37] font-serif text-xs uppercase tracking-wider cursor-pointer"
            title="Auto-align Walsh code and seat seal"
          >
            ✦ Auto-Align
          </button>
          <button
            type="button"
            disabled={isSuccess}
            onClick={handleInsertSeal}
            className="flex-1 py-2.5 bg-[#2b2118] hover:bg-[#3d3024] border-2 border-[#0c0907] text-[#ded4be] font-serif text-xs uppercase tracking-widest cursor-pointer shadow-md transition-all active:scale-98 disabled:opacity-50"
          >
            {isSuccess ? '✦ Seat Locked in Place ✦' : `Insert ${sealName}`}
          </button>
        </div>
      </div>
    </div>
  );
};
