/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { audioSystem } from '../game/AudioSystem';

interface PauseModalProps {
  onResume: () => void;
  onOpenNotebook: () => void;
  onSolutions?: () => void;
  onSettings: () => void;
  onMainMenu: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onOpenNotebook,
  onSolutions,
  onSettings,
  onMainMenu,
}) => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 pointer-events-auto select-none">
      <div className="max-w-xs w-full bg-[#1b1510] border-4 border-[#0c0907] p-6 shadow-[0_15px_60px_rgba(0,0,0,0.98)] text-center text-[#ded4be]">
        <h3 className="text-lg font-serif font-bold text-[#e2d7c2] uppercase tracking-widest mb-5">
          Game Paused
        </h3>

        <div className="flex flex-col gap-2.5">
          <button
            type="button"
            onClick={() => {
              audioSystem.playButtonClick();
              onResume();
            }}
            className="w-full py-2.5 bg-[#2b2118] hover:bg-[#3d3024] border-2 border-[#0c0907] text-[#ded4be] font-serif text-xs uppercase tracking-widest cursor-pointer shadow-md transition-all active:scale-98"
          >
            ▶ Resume Adventure
          </button>

          <button
            type="button"
            onClick={() => {
              audioSystem.playPageTurn();
              onOpenNotebook();
            }}
            className="w-full py-2 bg-[#211a13] hover:bg-[#2d241c] border border-[#0c0907] text-[#c2b49e] font-serif text-xs uppercase tracking-wider transition-all cursor-pointer"
          >
            📖 Explorer’s Grimoire
          </button>

          {onSolutions && (
            <button
              type="button"
              onClick={() => {
                audioSystem.playPageTurn();
                onSolutions();
              }}
              className="w-full py-2 bg-[#2b2116] hover:bg-[#3d2e1f] border border-[#d4af37]/60 text-[#d4af37] font-serif text-xs font-bold uppercase tracking-wider transition-all shadow cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>📜</span>
              <span>Answers of All Rounds</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              audioSystem.playButtonClick();
              onSettings();
            }}
            className="w-full py-2 bg-[#211a13] hover:bg-[#2d241c] border border-[#0c0907] text-[#c2b49e] font-serif text-xs uppercase tracking-wider transition-all cursor-pointer"
          >
            Settings
          </button>

          <button
            type="button"
            onClick={() => {
              audioSystem.playButtonClick();
              onMainMenu();
            }}
            className="w-full py-2 bg-[#16110d] hover:bg-[#221b14] border border-[#0c0907] text-[#8a7a67] font-serif text-xs uppercase tracking-wider transition-all cursor-pointer"
          >
            Main Menu
          </button>
        </div>
      </div>
    </div>
  );
};
