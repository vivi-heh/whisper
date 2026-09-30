/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { audioSystem } from '../game/AudioSystem';
import { OwlPortrait } from './OwlPortrait';

interface CreditsModalProps {
  onClose: () => void;
}

export const CreditsModal: React.FC<CreditsModalProps> = ({ onClose }) => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 pointer-events-auto select-none">
      <div className="max-w-md w-full bg-[#1b1510] border-4 border-[#0c0907] p-6 shadow-[0_15px_60px_rgba(0,0,0,0.98)] text-center text-[#ded4be]">
        <div className="flex justify-center mb-2">
          <OwlPortrait size={48} />
        </div>
        <h3 className="text-lg font-serif font-bold text-[#e2d7c2] uppercase tracking-wider mb-0.5">
          The Forgotten Signal
        </h3>
        <p className="text-[10px] font-mono text-[#8a7662] uppercase tracking-widest mb-5">
          Archival Credits & Acknowledgments
        </p>

        <div className="space-y-3.5 text-xs font-serif text-[#b8ab94] text-left bg-[#241c16] p-4 border border-[#3d3024] mb-6">
          <div>
            <strong className="text-[#e0d6c1] uppercase text-xs block mb-0.5 font-bold">
              Artistic Inspiration
            </strong>
            <span className="leading-relaxed text-[#a89781]">
              Dedicated to the surreal paper-cutout mysteries of Rusty Lake (Cube Escape, Roots, Paradise) and the atmospheric beauty of Ori and the Blind Forest and Child of Light.
            </span>
          </div>

          <div>
            <strong className="text-[#e0d6c1] uppercase text-xs block mb-0.5 font-bold">
              Telecommunications Theory
            </strong>
            <span className="leading-relaxed text-[#a89781]">
              Code Division Multiple Access (CDMA) — orthogonal Walsh-Hadamard spreading sequences, simultaneous transmission, and cross-correlation rejection.
            </span>
          </div>

          <div>
            <strong className="text-[#e0d6c1] uppercase text-xs block mb-0.5 font-bold">
              Audio Synthesis
            </strong>
            <span className="leading-relaxed text-[#a89781]">
              Procedural Web Audio API soundscape with melancholic cello drones, clockwork mechanisms, and stone friction acoustic synthesis.
            </span>
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
          Return to Menu
        </button>
      </div>
    </div>
  );
};
