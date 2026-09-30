/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { audioSystem } from '../game/AudioSystem';

interface InspectorLoupeModalProps {
  onClose: () => void;
}

interface LoupeTopic {
  id: string;
  title: string;
  subtitle: string;
  illustration: string;
  lore: string;
  diagramNotes: string[];
}

export const InspectorLoupeModal: React.FC<InspectorLoupeModalProps> = ({ onClose }) => {
  const topics: LoupeTopic[] = [
    {
      id: 'walsh_matrix',
      title: 'Hadamard-Walsh Matrix of Orthogonality',
      subtitle: 'The 4th Order Runic Matrix',
      illustration: '🔣',
      lore: 'Discovered in the tower archives: a four-by-four matrix of alternating positive and negative charges. Each row has zero cross-correlation with every other row. This is the bedrock of CDMA communication.',
      diagramNotes: [
        'H(4) = [ +1 +1 +1 +1 ] · Channel 1 (Sylas)',
        '       [ +1 -1 +1 -1 ] · Channel 2 (Rowan)',
        '       [ +1 +1 -1 -1 ] · Channel 3 (Vesper)',
        '       [ +1 -1 -1 +1 ] · Channel 4 (Ignis)',
        'Inner product <Ci, Cj> = 0 for any i ≠ j.',
      ],
    },
    {
      id: 'astrolabe_clock',
      title: 'The Great Celestial Astrolabe',
      subtitle: 'Synchronous Clock Distribution',
      illustration: '⏱️',
      lore: 'The grandfather clock in Chamber 2 is not a simple timepiece. It broadcasts a shared clock phase across the entire tower so every wizard’s transmission aligns on the exact same microsecond chip boundary.',
      diagramNotes: [
        'Chip Rate: Tc = Tbit / 4',
        'Phase alignment error must be < 10% of chip duration.',
        'Synchronous CDMA guarantees perfect zero cross-talk.',
      ],
    },
    {
      id: 'tower_antenna',
      title: 'The Quartz Crystal Correlator',
      subtitle: 'Matched Filter Demodulation',
      illustration: '🔮',
      lore: 'Inside the quartz dome lies a matched filter. It multiplies the total wireless disturbance by the local user’s code and integrates over time, lifting weak signals out of the noise floor.',
      diagramNotes: [
        '∫ S(t) · C_k(t) dt = E_b for matching user k',
        '∫ S(t) · C_m(t) dt = 0 for unselected user m',
        'Noise is spread across full bandwidth, preserving SNR.',
      ],
    },
  ];

  const [activeTopicIdx, setActiveTopicIdx] = useState<number>(0);
  const activeTopic = topics[activeTopicIdx];

  const handleSelectTopic = (idx: number) => {
    audioSystem.playLensZoom();
    setActiveTopicIdx(idx);
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 pointer-events-auto">
      {/* Brass Magnifying Loupe / Monocular Inspection View */}
      <div className="max-w-2xl w-full bg-[#18130e] border-4 border-[#0a0705] p-6 shadow-[0_20px_70px_rgba(0,0,0,0.95)] text-[#ded4be] flex flex-col justify-between my-auto select-none relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-[#382b1d] pb-3 mb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔍</span>
            <div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#f0e6d2] uppercase tracking-wider">
                Explorer's Magnifying Lens
              </h2>
              <span className="text-[10px] font-mono text-[#8a7662]">
                Detailed Technical Lore & Cryptographic Inscriptions
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              audioSystem.playButtonClick();
              onClose();
            }}
            className="w-8 h-8 bg-[#292019] hover:bg-[#3d3025] text-[#ded4be] border border-[#0d0907] flex items-center justify-center text-xs font-serif font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Tab selection */}
        <div className="flex gap-2 mb-4">
          {topics.map((top, idx) => (
            <button
              key={top.id}
              type="button"
              onClick={() => handleSelectTopic(idx)}
              className={`px-3 py-1.5 text-xs font-serif border transition-all cursor-pointer ${
                idx === activeTopicIdx
                  ? 'bg-[#d4af37] text-black font-bold border-white'
                  : 'bg-[#221a13] text-[#b09e86] border-[#38291b] hover:text-white'
              }`}
            >
              {top.title.split(' ')[0]} {top.illustration}
            </button>
          ))}
        </div>

        {/* Loupe View Content */}
        <div className="bg-[#dfd3bc] text-[#1b1510] p-5 rounded border-2 border-[#2b1f14] shadow-inner mb-4">
          <div className="flex items-center gap-3 border-b border-[#a89980] pb-2 mb-3">
            <span className="text-3xl">{activeTopic.illustration}</span>
            <div>
              <h3 className="text-lg font-serif font-bold text-[#140f0a]">
                {activeTopic.title}
              </h3>
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#634e35]">
                {activeTopic.subtitle}
              </span>
            </div>
          </div>

          <p className="text-xs font-serif leading-relaxed text-[#2d2217] mb-4">
            {activeTopic.lore}
          </p>

          <div className="bg-[#cfbf9e] border border-[#8f7e65] p-3 rounded font-mono text-xs text-[#140e08] space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#523d24] mb-1">
              ✦ Architectural Principles:
            </div>
            {activeTopic.diagramNotes.map((note, i) => (
              <div key={i} className="text-[11px] text-[#241a10]">
                • {note}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#2b2118] hover:bg-[#3d3023] border border-[#4a3a29] text-xs font-serif text-[#ded4be] cursor-pointer"
          >
            Close Lens
          </button>
        </div>
      </div>
    </div>
  );
};
