/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { NotebookPage } from '../types/game';
import { audioSystem } from '../game/AudioSystem';

interface NotebookModalProps {
  pages: NotebookPage[];
  onClose: () => void;
  onOpenSolutions?: () => void;
}

export const NotebookModal: React.FC<NotebookModalProps> = ({ pages, onClose, onOpenSolutions }) => {
  const [activePageIndex, setActivePageIndex] = useState<number>(0);
  const activePage = pages[activePageIndex];

  const handlePageChange = (idx: number) => {
    audioSystem.playPageTurn();
    setActivePageIndex(idx);
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 pointer-events-auto">
      {/* Heavy Leather-Bound Grimoire / Rusty Lake Roots style */}
      <div className="max-w-3xl w-full bg-[#1b1510] border-4 border-[#0c0907] p-6 sm:p-8 shadow-[0_15px_60px_rgba(0,0,0,0.98)] text-[#ded4be] flex flex-col justify-between my-auto relative select-none">
        {/* Book Header */}
        <div className="flex items-center justify-between border-b-2 border-[#362a20] pb-3 mb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📓</span>
            <div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#e0d6c1] uppercase tracking-wider">
                The Explorer's Grimoire
              </h2>
              <span className="text-[10px] font-mono text-[#8a7662]">
                Recovered Tower Notes & Telemetry Sketches
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              audioSystem.playButtonClick();
              onClose();
            }}
            className="w-8 h-8 bg-[#2b221a] hover:bg-[#3d3024] text-[#ded4be] border border-[#0d0907] flex items-center justify-center text-xs font-serif font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Parchment Bookmark Tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1 items-center justify-between">
          <div className="flex gap-2">
            {pages.map((p, idx) => {
              const isCurrent = idx === activePageIndex;
              return (
                <button
                  key={p.pageNumber}
                  type="button"
                  onClick={() => handlePageChange(idx)}
                  className={`px-3 py-1.5 text-xs font-serif border-2 transition-all cursor-pointer whitespace-nowrap ${
                    isCurrent
                      ? 'bg-[#e2d6bf] border-[#0c0907] text-[#1b1510] font-bold shadow-md -translate-y-0.5'
                      : p.unlocked
                      ? 'bg-[#292018] border-[#3d3024] text-[#b0a08a] hover:text-[#e0d6c1]'
                      : 'bg-[#14100c] border-[#221a14] text-[#4a3d31] cursor-not-allowed'
                  }`}
                >
                  Page {p.pageNumber} {p.unlocked ? '' : '🔒'}
                </button>
              );
            })}
          </div>

          {onOpenSolutions && (
            <button
              type="button"
              onClick={() => {
                audioSystem.playPageTurn();
                onOpenSolutions();
              }}
              className="px-3 py-1.5 text-xs font-serif font-bold bg-[#2e2318] hover:bg-[#423120] border-2 border-[#d4af37]/70 text-[#d4af37] shadow cursor-pointer whitespace-nowrap ml-auto"
            >
              📜 Answers of All Rounds ➔
            </button>
          )}
        </div>

        {/* Page Sheet (Aged Yellowed Parchment Paper) */}
        {activePage && activePage.unlocked ? (
          <div className="bg-[#dfd3bc] p-5 sm:p-6 border-2 border-[#16110c] text-[#1b1510] flex-1 flex flex-col justify-between shadow-inner">
            <div>
              <div className="flex justify-between items-center border-b border-[#a89980] pb-1.5 mb-3">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#786148] font-bold">
                  Entry 0{activePage.pageNumber} · {activePage.cdmaPrinciple}
                </span>
                <span className="text-[10px] font-serif italic text-[#786148]">
                  Ancient Runic Record
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#1a140e] mb-3">
                {activePage.title}
              </h3>

              {/* Hand-inked Sketch Card */}
              <div className="bg-[#cfbf9e] p-3.5 border border-[#8f7e65] mb-4 flex items-center gap-4">
                <div className="w-14 h-14 bg-[#211a14] border border-[#0d0907] flex items-center justify-center text-2xl text-[#ded4be] shrink-0">
                  {activePage.illustrationType === 'many_voices' && '🌀'}
                  {activePage.illustrationType === 'unique_codes' && '🔣'}
                  {activePage.illustrationType === 'wrong_decoder' && '⚡'}
                  {activePage.illustrationType === 'cdma_network' && '📡'}
                </div>
                <p className="text-xs font-serif italic text-[#3b2e21] leading-relaxed">
                  "{activePage.loreText}"
                </p>
              </div>

              <p className="text-xs sm:text-sm font-serif leading-relaxed text-[#292017]">
                {activePage.description}
              </p>
            </div>

            <div className="mt-4 pt-2.5 border-t border-[#a89980] flex justify-between text-[9.5px] font-mono text-[#7a6854]">
              <span>Tower Communication Log #{activePage.pageNumber}</span>
              <span>Deciphered through Orthogonal Walsh Seals</span>
            </div>
          </div>
        ) : (
          <div className="bg-[#dfd3bc] p-12 border-2 border-[#16110c] flex-1 flex flex-col items-center justify-center text-center text-[#1b1510]">
            <span className="text-3xl text-[#5a4837] mb-2">🔒</span>
            <h4 className="text-sm font-serif font-bold uppercase tracking-wider mb-1">
              Page Encrypted
            </h4>
            <p className="text-xs font-serif italic text-[#5a4837] max-w-sm">
              The ink is faded and veiled by runic wards. Solve the chamber mystery to unlock this knowledge.
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-4 flex justify-between items-center text-xs font-serif text-[#a89781]">
          <span>Flip through entries using tabs above</span>
          <button
            type="button"
            onClick={() => {
              audioSystem.playButtonClick();
              onClose();
            }}
            className="px-4 py-2 bg-[#2d2218] hover:bg-[#3d3024] text-[#ded4be] border border-[#0c0907] font-serif text-xs uppercase tracking-wider cursor-pointer"
          >
            Close Grimoire
          </button>
        </div>
      </div>
    </div>
  );
};
