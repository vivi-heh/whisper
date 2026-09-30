/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface DialogueBoxProps {
  speaker: string;
  text: string;
  onDismiss: () => void;
}

export const DialogueBox: React.FC<DialogueBoxProps> = ({ speaker, text, onDismiss }) => {
  return (
    <div
      onClick={onDismiss}
      className="fixed bottom-14 sm:bottom-20 left-1/2 -translate-x-1/2 z-40 max-w-2xl w-[94%] pointer-events-auto cursor-pointer"
    >
      {/* Stark Rusty Lake vintage dialogue card */}
      <div className="bg-[#120f0d] border-2 border-[#090807] p-4 shadow-[0_4px_30px_rgba(0,0,0,0.9)] text-[#ece3cf] text-left">
        <div className="flex items-center justify-between border-b border-[#28211b] pb-1.5 mb-2">
          <span className="text-[10px] font-serif uppercase tracking-widest text-[#a89578] font-bold">
            {speaker}
          </span>
          <span className="text-[9px] font-mono text-[#57493b]">
            [click to dismiss]
          </span>
        </div>
        <p className="text-sm font-serif italic text-[#ded4bf] leading-relaxed">
          "{text}"
        </p>
      </div>
    </div>
  );
};
