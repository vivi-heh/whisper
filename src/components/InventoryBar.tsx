/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { InventoryItem } from '../types/game';
import { audioSystem } from '../game/AudioSystem';
import { OwlPortrait } from './OwlPortrait';

interface InventoryBarProps {
  items: InventoryItem[];
  selectedItemId: string | null;
  onSelectItem: (itemId: string) => void;
  onOpenNotebook: () => void;
  onOpenOwl: () => void;
  onOpenLoupe?: () => void;
  onTriggerSense?: () => void;
  onOpenSolutions?: () => void;
  onPause: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  hasUnreadNotebook?: boolean;
  currentObjective: string;
}

export const InventoryBar: React.FC<InventoryBarProps> = ({
  items,
  selectedItemId,
  onSelectItem,
  onOpenNotebook,
  onOpenOwl,
  onOpenLoupe,
  onTriggerSense,
  onOpenSolutions,
  onPause,
  isMuted,
  onToggleMute,
  hasUnreadNotebook,
  currentObjective,
}) => {
  return (
    <div className="fixed bottom-1 sm:bottom-2.5 left-1/2 -translate-x-1/2 z-30 max-w-5xl w-[96%] sm:w-[94%] pointer-events-auto pb-[env(safe-area-inset-bottom)]">
      {/* Rustic, hand-inked inventory tray optimized for mobile & desktop */}
      <div className="bg-[#181411]/95 backdrop-blur-sm border-2 border-[#0a0807] p-1.5 sm:p-2 shadow-2xl flex flex-row items-center justify-between gap-1.5 sm:gap-3 text-[#dcd2bb]">
        {/* Objective Note - shown with truncation on mobile */}
        <div className="hidden md:flex items-center gap-1.5 text-xs font-serif italic text-[#a39783] shrink-0 max-w-xs truncate">
          <span className="text-[#d4af37]">✦</span>
          <span className="uppercase text-[9px] sm:text-[10px] tracking-wider text-[#dcd2bb] not-italic font-bold truncate">
            {currentObjective}
          </span>
        </div>

        {/* Tactile Square Inventory Slots */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {Array.from({ length: 5 }).map((_, idx) => {
            const item = items[idx];
            const isSelected = item && selectedItemId === item.id;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  if (item) {
                    audioSystem.playButtonClick();
                    onSelectItem(item.id);
                  }
                }}
                className={`w-9 h-9 sm:w-11 sm:h-11 border-2 transition-all flex flex-col items-center justify-center relative select-none rounded-none ${
                  item
                    ? isSelected
                      ? 'bg-[#2b2216] border-[#d4af37] shadow-[0_0_10px_rgba(212,175,55,0.4)] scale-105'
                      : 'bg-[#1b1510] border-[#382b1d] hover:border-[#d4af37]'
                    : 'bg-[#120f0d] border-[#2c241c] hover:border-[#4a3d30] cursor-pointer'
                }`}
                title={item ? `${item.name}: ${item.description}` : 'Empty Satchel Slot'}
              >
                {item ? (
                  <>
                    <span className="text-base sm:text-lg filter drop-shadow">{item.icon}</span>
                    <span className="text-[6.5px] sm:text-[7.5px] font-serif uppercase tracking-tight text-[#b8ab94] truncate max-w-[36px] sm:max-w-[42px] leading-none mt-0.5">
                      {item.name.split(' ')[0]}
                    </span>
                  </>
                ) : (
                  <span className="text-xs text-[#28221b]">·</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Action Tools */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 ml-auto">
          {onTriggerSense && (
            <button
              type="button"
              onClick={onTriggerSense}
              className="px-2 py-1 sm:px-2.5 sm:py-1.5 bg-[#201a15] hover:bg-[#33281f] border border-[#0d0a08] text-[#d4af37] text-[10px] sm:text-xs font-serif uppercase tracking-wider cursor-pointer"
              title="Reveal all secrets in chamber [SPACE]"
            >
              ✦ Sense
            </button>
          )}

          {onOpenLoupe && (
            <button
              type="button"
              onClick={onOpenLoupe}
              className="hidden sm:inline-block px-2.5 py-1.5 bg-[#201a15] hover:bg-[#33281f] border border-[#0d0a08] text-[#ded4be] text-xs font-serif uppercase tracking-wider cursor-pointer"
              title="Inspect ancient technical inscriptions"
            >
              🔍 Lore
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              audioSystem.playPageTurn();
              onOpenNotebook();
            }}
            className="relative px-2 py-1 sm:px-3 sm:py-1.5 bg-[#241e19] hover:bg-[#3d3023] border border-[#0d0a08] text-[#dcd2bb] text-[10px] sm:text-xs font-serif uppercase tracking-wider cursor-pointer"
          >
            <span>Notes</span>
            {hasUnreadNotebook && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#d4af37] rounded-full" />
            )}
          </button>

          {onOpenSolutions && (
            <button
              type="button"
              onClick={() => {
                audioSystem.playPageTurn();
                onOpenSolutions();
              }}
              className="px-2 py-1 sm:px-2.5 sm:py-1.5 bg-[#261f18] hover:bg-[#3d2e1f] border border-[#d4af37]/60 text-[#d4af37] text-[10px] sm:text-xs font-serif font-bold uppercase tracking-wider cursor-pointer shadow flex items-center gap-1"
              title="View Complete Answers for All Rounds"
            >
              <span>📜</span>
              <span>Answers</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              audioSystem.playOwlHoot();
              onOpenOwl();
            }}
            className="px-2 py-1 sm:px-2.5 sm:py-1 bg-[#241e19] hover:bg-[#3d3023] border border-[#0d0a08] text-[#dcd2bb] text-[10px] sm:text-xs font-serif uppercase tracking-wider cursor-pointer flex items-center gap-1"
            title="Consult Mr. Owl"
          >
            <OwlPortrait size={14} />
            <span className="hidden sm:inline">Hint</span>
          </button>

          <button
            type="button"
            onClick={onToggleMute}
            className="w-7 h-7 sm:w-8 sm:h-8 bg-[#1a1512] hover:bg-[#28211c] border border-[#0d0a08] text-xs text-[#b8ab94] flex items-center justify-center cursor-pointer"
            title="Toggle Audio"
          >
            {isMuted ? '🔇' : '🎵'}
          </button>

          <button
            type="button"
            onClick={onPause}
            className="w-7 h-7 sm:w-8 sm:h-8 bg-[#1a1512] hover:bg-[#28211c] border border-[#0d0a08] text-xs text-[#b8ab94] flex items-center justify-center cursor-pointer font-bold"
            title="Pause [ESC]"
          >
            ⏸
          </button>
        </div>
      </div>
    </div>
  );
};
