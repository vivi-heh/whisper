/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { audioSystem } from '../game/AudioSystem';
import { OwlPortrait } from './OwlPortrait';

interface MainMenuProps {
  onPlay: () => void;
  onHowToPlay: () => void;
  onNotebook: () => void;
  onSolutions?: () => void;
  onSettings: () => void;
  onCredits: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  highestRoomReached: number;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onPlay,
  onHowToPlay,
  onNotebook,
  onSolutions,
  onSettings,
  onCredits,
  isMuted,
  onToggleMute,
  highestRoomReached,
}) => {
  return (
    <div className="absolute inset-0 z-40 flex flex-col justify-between items-center bg-[#090706] p-3 sm:p-6 pointer-events-auto select-none overflow-y-auto">
      {/* Top Header */}
      <div className="w-full max-w-4xl flex items-center justify-between border-b border-[#211b16] pb-2 sm:pb-3 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[#d4af37] text-xs">✦</span>
          <span className="text-[10px] sm:text-xs font-serif tracking-widest uppercase text-[#9e8f7a]">
            The Forgotten Signal · Point & Click Mystery
          </span>
        </div>

        <button
          type="button"
          onClick={onToggleMute}
          className="px-2.5 py-1 bg-[#1a1512] hover:bg-[#28211b] border border-[#0d0a08] text-[10px] sm:text-xs font-serif text-[#b8ab94] flex items-center gap-1.5 cursor-pointer rounded"
        >
          <span>{isMuted ? '🔇' : '🎵'}</span>
          <span>{isMuted ? 'Muted' : 'Audio On'}</span>
        </button>
      </div>

      {/* Center Rusty Lake Title Banner */}
      <div className="flex flex-col items-center text-center my-auto py-2 sm:py-4">
        <div className="mb-2 sm:mb-3">
          <OwlPortrait size={52} />
        </div>

        <h1 className="text-2xl sm:text-4xl md:text-5xl font-serif font-bold text-[#e5dbca] tracking-widest uppercase drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
          The Forgotten Signal
        </h1>

        <p className="text-[11px] sm:text-xs md:text-sm font-serif italic text-[#877864] tracking-wider mt-1 mb-4 sm:mb-6">
          An Ancient Tower. Overlapping Whispers. The Birth of CDMA.
        </p>

        {/* Vintage Inked Menu Buttons */}
        <div className="w-68 sm:w-80 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => {
              audioSystem.playButtonClick();
              onPlay();
            }}
            className="w-full py-2.5 sm:py-3.5 px-4 sm:px-6 bg-[#2a2119] hover:bg-[#3d3024] border-2 border-[#0d0a08] text-[#f2e6cf] font-serif text-xs sm:text-sm font-bold tracking-widest uppercase shadow-md transition-all active:scale-98 cursor-pointer rounded-none"
          >
            {highestRoomReached > 1 ? `Continue · Chamber ${highestRoomReached}` : 'Enter The Tower'}
          </button>

          <button
            type="button"
            onClick={() => {
              audioSystem.playButtonClick();
              onHowToPlay();
            }}
            className="w-full py-2 sm:py-2.5 px-4 bg-[#1a1410] hover:bg-[#261e18] border border-[#0d0a08] text-[#c2b49e] font-serif text-[11px] sm:text-xs uppercase tracking-wider transition-all cursor-pointer"
          >
            How To Play
          </button>

          <button
            type="button"
            onClick={() => {
              audioSystem.playButtonClick();
              onNotebook();
            }}
            className="w-full py-2 sm:py-2.5 px-4 bg-[#1a1410] hover:bg-[#261e18] border border-[#0d0a08] text-[#c2b49e] font-serif text-[11px] sm:text-xs uppercase tracking-wider transition-all cursor-pointer"
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
              className="w-full py-2 sm:py-2.5 px-4 bg-[#261f18] hover:bg-[#3d2e1f] border border-[#d4af37]/50 text-[#d4af37] font-serif text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-all shadow cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>📜</span>
              <span>Answers of All Rounds</span>
            </button>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                audioSystem.playButtonClick();
                onSettings();
              }}
              className="flex-1 py-1.5 sm:py-2 bg-[#16110d] hover:bg-[#221a14] border border-[#0d0a08] text-[#998975] font-serif text-[10px] sm:text-xs uppercase tracking-wider transition-all cursor-pointer"
            >
              Settings
            </button>
            <button
              type="button"
              onClick={() => {
                audioSystem.playButtonClick();
                onCredits();
              }}
              className="flex-1 py-1.5 sm:py-2 bg-[#16110d] hover:bg-[#221a14] border border-[#0d0a08] text-[#998975] font-serif text-[10px] sm:text-xs uppercase tracking-wider transition-all cursor-pointer"
            >
              Credits
            </button>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="w-full max-w-4xl flex items-center justify-between text-[9px] sm:text-[10px] text-[#54483a] font-mono border-t border-[#211b16] pt-1.5 shrink-0">
        <span>Hand-inked Art & Jointed Puppet Animation</span>
        <span>HTML5 Canvas 60 FPS Fixed Ratio</span>
      </div>
    </div>
  );
};
