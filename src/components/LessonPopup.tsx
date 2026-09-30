/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LessonData } from '../types/game';
import { audioSystem } from '../game/AudioSystem';

interface LessonPopupProps {
  lesson: LessonData;
  onContinue: () => void;
}

export const LessonPopup: React.FC<LessonPopupProps> = ({ lesson, onContinue }) => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 pointer-events-auto">
      {/* Aged Archival Document / Rusty Lake Polaroid style */}
      <div className="max-w-md w-full bg-[#e3d8c2] border-4 border-[#1f1914] p-6 sm:p-7 shadow-[0_10px_50px_rgba(0,0,0,0.95)] text-[#1b1510] text-left relative select-none">
        {/* Archival Ink Stamp */}
        <div className="flex items-center justify-between border-b-2 border-[#1f1914] pb-2 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">📜</span>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#786148] font-bold block">
                Kingdom Archives · File No. 0{lesson.roomNumber}
              </span>
              <h2 className="text-lg font-serif font-bold text-[#1f1914] uppercase tracking-wide">
                {lesson.title}
              </h2>
            </div>
          </div>

          <div className="border border-[#782828] text-[#782828] text-[9px] font-mono px-2 py-0.5 uppercase tracking-tighter rotate-[-4deg] font-bold">
            CONFIDENTIAL
          </div>
        </div>

        {/* Subtitle */}
        <p className="text-xs font-serif italic text-[#544435] mb-4">
          {lesson.subtitle}
        </p>

        {/* Archival Body */}
        <div className="bg-[#d5c7ad] p-4 border border-[#3b3024] space-y-2.5 mb-5 text-xs font-serif leading-relaxed text-[#211a14]">
          {lesson.explanation.map((para, idx) => (
            <p key={idx}>{para}</p>
          ))}

          <div className="pt-2.5 border-t border-[#8c775d] mt-2">
            <span className="text-[9.5px] font-mono uppercase tracking-widest text-[#694228] font-bold block mb-0.5">
              ✦ The Principle of CDMA:
            </span>
            <p className="text-xs font-bold text-[#1a140f]">
              {lesson.cdmaTakeaway}
            </p>
          </div>
        </div>

        {/* Vintage Inked Button */}
        <button
          type="button"
          onClick={() => {
            audioSystem.playPageTurn();
            onContinue();
          }}
          className="w-full py-3 bg-[#241c16] hover:bg-[#382c23] border-2 border-[#0d0907] text-[#e3d8c2] font-serif text-xs uppercase tracking-widest cursor-pointer shadow-md transition-all active:scale-98 text-center"
        >
          Fold Document & Continue →
        </button>
      </div>
    </div>
  );
};
