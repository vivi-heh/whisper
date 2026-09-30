/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { audioSystem } from '../game/AudioSystem';

interface HowToPlayModalProps {
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose }) => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 pointer-events-auto select-none">
      <div className="max-w-xl w-full bg-[#1b1510] border-4 border-[#0c0907] p-6 sm:p-7 shadow-[0_15px_60px_rgba(0,0,0,0.98)] text-left my-auto text-[#ded4be]">
        <div className="flex items-center justify-between border-b-2 border-[#362b21] pb-3 mb-5">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#85735f] block font-bold">
              Field Manual
            </span>
            <h2 className="text-xl font-serif font-bold text-[#e2d7c2] uppercase tracking-wide">
              How To Play
            </h2>
          </div>
          <button
            type="button"
            onClick={() => {
              audioSystem.playButtonClick();
              onClose();
            }}
            className="w-7 h-7 bg-[#292018] hover:bg-[#3d3024] text-[#ded4be] border border-[#0d0907] flex items-center justify-center text-xs font-serif font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3.5 mb-6 text-xs font-serif text-[#b8ab94]">
          <div className="bg-[#241c16] p-3.5 border border-[#3d3024] flex items-start gap-3">
            <span className="text-xl shrink-0">🚶‍♂️</span>
            <div>
              <strong className="text-[#e0d6c1] uppercase text-xs block mb-0.5 font-bold">
                1. Movement
              </strong>
              <p className="leading-relaxed text-[#a89781]">
                Walk through each chamber using <strong>W A S D</strong>, <strong>Arrow Keys</strong>, or click anywhere on the floorboards.
              </p>
            </div>
          </div>

          <div className="bg-[#241c16] p-3.5 border border-[#3d3024] flex items-start gap-3">
            <span className="text-xl shrink-0">🔍</span>
            <div>
              <strong className="text-[#e0d6c1] uppercase text-xs block mb-0.5 font-bold">
                2. Point-and-Click Inspection
              </strong>
              <p className="leading-relaxed text-[#a89781]">
                Click on statues, paintings, books, candles, and levers to inspect them. Everything required to solve each room is hidden within its walls.
              </p>
            </div>
          </div>

          <div className="bg-[#241c16] p-3.5 border border-[#3d3024] flex items-start gap-3">
            <span className="text-xl shrink-0">💎</span>
            <div>
              <strong className="text-[#e0d6c1] uppercase text-xs block mb-0.5 font-bold">
                3. The Orthogonal Seals
              </strong>
              <p className="leading-relaxed text-[#a89781]">
                Collect seals and configure their polarity discs. Notice how each unique orthogonal code isolates a single transmission while cancelling interference.
              </p>
            </div>
          </div>

          <div className="bg-[#241c16] p-3.5 border border-[#3d3024] flex items-start gap-3">
            <span className="text-xl shrink-0">🦉</span>
            <div>
              <strong className="text-[#e0d6c1] uppercase text-xs block mb-0.5 font-bold">
                4. Mr. Owl's Counsel
              </strong>
              <p className="leading-relaxed text-[#a89781]">
                If you find yourself stuck, consult Mr. Owl for progressive hints ranging from subtle cues to direct solutions.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            audioSystem.playButtonClick();
            onClose();
          }}
          className="w-full py-2.5 bg-[#2b2118] hover:bg-[#3d3024] border-2 border-[#0c0907] text-[#ded4be] font-serif text-xs uppercase tracking-widest cursor-pointer shadow-md transition-all active:scale-98 text-center"
        >
          Return to Chamber
        </button>
      </div>
    </div>
  );
};
