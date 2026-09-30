/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { audioSystem } from '../game/AudioSystem';

interface SettingsModalProps {
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const [musicVol, setMusicVol] = useState<number>(50);
  const [sfxVol, setSfxVol] = useState<number>(70);

  const handleMusicChange = (val: number) => {
    setMusicVol(val);
    audioSystem.setMusicVolume(val / 100);
  };

  const handleSfxChange = (val: number) => {
    setSfxVol(val);
    audioSystem.setSfxVolume(val / 100);
    audioSystem.playButtonClick();
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 pointer-events-auto select-none">
      <div className="max-w-md w-full bg-[#1b1510] border-4 border-[#0c0907] p-6 shadow-[0_15px_60px_rgba(0,0,0,0.98)] text-[#ded4be]">
        <div className="flex items-center justify-between border-b-2 border-[#362b21] pb-3 mb-5">
          <h3 className="text-base font-serif font-bold uppercase tracking-wider text-[#e2d7c2]">
            Gramophone & Mechanics
          </h3>
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

        {/* Sliders */}
        <div className="space-y-4 mb-6">
          <div>
            <div className="flex justify-between text-xs font-serif text-[#a89781] mb-1">
              <span>Ambient Orchestra</span>
              <span className="text-[#ded4be] font-bold">{musicVol}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={musicVol}
              onChange={e => handleMusicChange(Number(e.target.value))}
              className="w-full accent-[#3b2d1d] h-2 bg-[#2d241c] rounded-none cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-serif text-[#a89781] mb-1">
              <span>Tower Mechanisms & Spells</span>
              <span className="text-[#ded4be] font-bold">{sfxVol}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={sfxVol}
              onChange={e => handleSfxChange(Number(e.target.value))}
              className="w-full accent-[#3b2d1d] h-2 bg-[#2d241c] rounded-none cursor-pointer"
            />
          </div>
        </div>

        {/* Controls */}
        <div className="bg-[#241c16] p-3.5 border border-[#3d3024] text-xs font-serif text-[#a89781] space-y-1.5 mb-6">
          <div className="flex justify-between">
            <span>Walking:</span>
            <span className="text-[#ded4be] font-bold">W A S D / Arrows / Click</span>
          </div>
          <div className="flex justify-between">
            <span>Inspection:</span>
            <span className="text-[#ded4be] font-bold">Click on objects</span>
          </div>
          <div className="flex justify-between">
            <span>Pause / Menu:</span>
            <span className="text-[#ded4be] font-bold">ESC Key</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            audioSystem.playButtonClick();
            onClose();
          }}
          className="w-full py-2 bg-[#2b2118] hover:bg-[#3d3024] border-2 border-[#0c0907] text-[#ded4be] font-serif text-xs uppercase tracking-widest cursor-pointer shadow-md transition-all active:scale-98 text-center"
        >
          Confirm Settings
        </button>
      </div>
    </div>
  );
};
