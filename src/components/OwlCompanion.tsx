/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { OwlHint } from '../types/game';
import { audioSystem } from '../game/AudioSystem';
import { OwlPortrait } from './OwlPortrait';

interface OwlCompanionProps {
  hints: OwlHint[];
  currentHintIndex: number;
  onAdvanceHint: () => void;
  onSolvePuzzle: () => void;
  onClose: () => void;
}

export const OwlCompanion: React.FC<OwlCompanionProps> = ({
  hints,
  currentHintIndex,
  onAdvanceHint,
  onSolvePuzzle,
  onClose,
}) => {
  const currentHint = hints[currentHintIndex] || hints[0];

  const handleNextHint = () => {
    audioSystem.playOwlHoot();
    onAdvanceHint();
  };

  return (
    <div className="fixed bottom-14 sm:bottom-24 left-3 sm:left-6 z-40 max-w-[calc(100vw-24px)] sm:max-w-sm pointer-events-auto">
      {/* Eerie Mr. Owl vintage consultation note */}
      <div className="bg-[#191512] border-2 border-[#090807] p-4 shadow-[0_8px_40px_rgba(0,0,0,0.95)] text-[#ded4be] text-left select-none">
        <div className="flex items-start justify-between border-b border-[#2d241d] pb-2 mb-2.5">
          <div className="flex items-center gap-2.5">
            <OwlPortrait size={34} />
            <div>
              <h4 className="text-xs font-serif font-bold uppercase tracking-wider text-[#ded4be]">
                Mr. Owl's Counsel
              </h4>
              <span className="text-[9px] text-[#7a6b5a] font-mono">
                Guidance Level {currentHint.level} of 4
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-5 h-5 text-xs text-[#8a7a67] hover:text-[#ded4be] flex items-center justify-center cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Cryptic advice */}
        <p className="text-xs font-serif italic text-[#c2b59f] leading-relaxed mb-3">
          "{currentHint.text}"
        </p>

        {/* Buttons */}
        <div className="flex gap-2">
          {currentHint.level < 4 ? (
            <button
              type="button"
              onClick={handleNextHint}
              className="flex-1 py-1.5 px-3 bg-[#261f19] hover:bg-[#382e25] border border-[#0d0a08] text-[#ded4be] text-xs font-serif uppercase tracking-wider transition-all cursor-pointer text-center"
            >
              Whisper Deeper Clue →
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                audioSystem.playResonanceSeparation();
                onSolvePuzzle();
              }}
              className="flex-1 py-1.5 px-3 bg-[#4a1c1c] hover:bg-[#612424] border border-[#0d0a08] text-[#f2e6cf] text-xs font-serif font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md text-center"
            >
              ✦ Unravel with Sorcery (Skip)
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
