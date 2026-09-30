/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { audioSystem } from '../game/AudioSystem';

interface SolutionsModalProps {
  onClose: () => void;
  onJumpToRoom?: (roomIndex: number) => void;
  onGrantAllJewels?: () => void;
}

export const SolutionsModal: React.FC<SolutionsModalProps> = ({
  onClose,
  onJumpToRoom,
  onGrantAllJewels,
}) => {
  const [activeRound, setActiveRound] = useState<number>(1);
  const [grantedNotification, setGrantedNotification] = useState<boolean>(false);

  const rounds = [
    {
      round: 1,
      name: 'Chamber 1',
      title: 'Chamber 1: The Chamber of Many Voices',
      subtitle: 'CDMA Principle: Simultaneous Transmission on a Shared Medium',
      overview: 'Four ancient wizard statues cast their signals into the quartz receiving dome at the same instant without interfering with each other.',
      steps: [
        {
          num: '1',
          name: 'Engage the Clockwork Lever',
          detail: 'Click the large brass lever standing to the left of the central Quartz Tower. The lever clicks DOWN into gear. The four wizard statues immediately begin transmitting simultaneous energy waves into the airwaves.',
          badge: 'Trigger Transmissions',
        },
        {
          num: '2',
          name: 'Inspect the Scholars’ Portrait for the Azure Seal',
          detail: 'Click the framed oil painting on the left stone wall above the lever. Press the hidden mechanical catch behind the gilded frame. The secret latch clicks open, dropping the Azure Seal (Archmage Sylas) [1, 1, 1, 1] 💎 into your inventory satchel.',
          badge: 'Collect Jewel: Azure Seal 💎',
        },
        {
          num: '3',
          name: 'Insert Azure Seal into Quartz Tower',
          detail: 'With the Azure Seal in your satchel, click the Quartz Tower receiving dome on the center table. The dome resonates and decodes Sylas’s clear voice from the multi-user energy storm (Orthogonal Inner Product despreading).',
          badge: 'Despread Signal',
        },
        {
          num: '4',
          name: 'Ascend to Chamber 2',
          detail: 'The runic barrier on the Arched Stone Portal on the far right dissipates. Click the portal to advance to Chamber 2.',
          badge: 'Portal Unlocked',
        },
      ],
    },
    {
      round: 2,
      name: 'Chamber 2',
      title: 'Chamber 2: The Hall of Unique Seals',
      subtitle: 'CDMA Principle: Orthogonal Walsh-Hadamard Chip Codes',
      overview: 'Collect all four archmages’ unique orthogonal seals and configure their polarity discs to reconstruct the bridge.',
      steps: [
        {
          num: '1',
          name: 'Grandfather Astrolabe Clock Puzzle',
          detail: 'Click the grandfather clock on the left. The parchment clue says: "Sun (+1) crowns Zenith [XII], Moon (-1) descends into Abyss [VI]".\n• Turn Sun Hour Hand to XII (12 o’clock, Zenith).\n• Turn Moon Minute Hand to VI (6 o’clock, Abyss).\n• Click "Engage Clockwork Catch". A mechanical arm emerges, surrendering the Emerald Seal [1, -1, 1, -1] 🌲.',
          badge: 'Collect Jewel: Emerald Seal 🌲',
        },
        {
          num: '2',
          name: 'Velvet Display Cabinet Lock',
          detail: 'Click the ornate mahogany cabinet in the center. Rotate the three brass tumblers to:\n1. Sun (☀️)  ·  2. Flame (🔥)  ·  3. Leaf (🍃)\nClick "Unlock Velvet Cabinet". The velvet drawer slides open, providing both the Amethyst Seal [1, 1, -1, -1] 🔮 and Ruby Seal [1, -1, -1, 1] 🔥.',
          badge: 'Collect Jewels: Amethyst 🔮 & Ruby 🔥',
        },
        {
          num: '3',
          name: 'Align Four Pedestals (Walsh Polarity Discs)',
          detail: 'Click each stone pedestal and configure its 4 polarity discs to match the wizard’s orthogonal Walsh sequence, then click "Lock Polarity":\n• Pedestal 1 (Sylas, Blue): [+1, +1, +1, +1] (✦, ✦, ✦, ✦)\n• Pedestal 2 (Rowan, Green): [+1, -1, +1, -1] (✦, ✧, ✦, ✧)\n• Pedestal 3 (Vesper, Purple): [+1, +1, -1, -1] (✦, ✦, ✧, ✧)\n• Pedestal 4 (Ignis, Red): [+1, -1, -1, +1] (✦, ✧, ✧, ✦)',
          badge: 'Walsh Codes Configured',
        },
        {
          num: '4',
          name: 'Cross the Crystal Bridge',
          detail: 'Once all four pedestals are locked, the glowing Luminous Crystal Bridge solidifies across the chasm. Click the Ascending Staircase Door on the right to enter Chamber 3.',
          badge: 'Bridge Solidified',
        },
      ],
    },
    {
      round: 3,
      name: 'Chamber 3',
      title: 'Chamber 3: The Interference Chamber',
      subtitle: 'CDMA Principle: Cross-Correlation Rejection (Inner Product = 0)',
      overview: 'Demonstrate how multiplying the superimposed waveform by an orthogonal code rejects all other users’ signals to zero.',
      steps: [
        {
          num: '1',
          name: 'Harmonic Prism Refractor (Left Tripod)',
          detail: 'Click the iron tripod on the left holding the crystal optical prism. Rotate the 3 chromatic rings until all three dials align to North (0°):\n• Red Ring: Rotate to 0°\n• Green Ring: Rotate to 0°\n• Blue Ring: Rotate to 0°\nClick "Focus Coherent Beam". A brilliant optical carrier ray strikes the Spectral Oscilloscope Mirror.',
          badge: 'Carrier Beam Focused',
        },
        {
          num: '2',
          name: 'Spectral Oscilloscope Mirror',
          detail: 'Click the obsidian mirror on the wall. The green phosphor trace displays the composite waveform: S(t) = [+2, 0, +2, 0] (the sum of Sylas [+1, +1, +1, +1] and Rowan [+1, -1, +1, -1]). Read the inscribed mathematical law: "MULTIPLY BY DESIRED USER CODE TO CANCEL INTERFERENCE".',
          badge: 'Waveform Analyzed',
        },
        {
          num: '3',
          name: 'Interference Correlator Console (Center Desk)',
          detail: 'Click the desk console:\n1. First select the Mismatched Filter (Vesper Code [+1, +1, -1, -1]) and advance the chip slider to 4 chips: Observe the inner product calculation: (+2)(1) + (0)(1) + (+2)(-1) + (0)(-1) = 2 - 2 = 0V. The needle drops to ZERO and produces static noise.\n2. Next, select Archmage Sylas Filter [+1, +1, +1, +1] and advance slider to 4 chips: Observe (+2)(1) + (0)(1) + (+2)(1) + (0)(1) = +4V. The needle swings to MAXIMUM (+4V).\n3. Click "Lock Orthogonal Filter & Open Apex Door".',
          badge: 'Zero Interference Proven',
        },
        {
          num: '4',
          name: 'Enter the Apex Observatory',
          detail: 'Click the unlocked heavy stone portal on the far right to ascend to Chamber 4.',
          badge: 'Apex Door Open',
        },
      ],
    },
    {
      round: 4,
      name: 'Chamber 4',
      title: 'Chamber 4: The Apex Observatory',
      subtitle: 'CDMA Principle: 5-Channel Multi-User Spectrum Convergence & Demodulation',
      overview: 'The highest chamber beneath the celestial heavens. Align all 5 regional wizard frequencies to restore global CDMA communication.',
      steps: [
        {
          num: '1',
          name: 'Celestial Altar of Five Jewels',
          detail: 'Click the stone altar on the left. Insert all 5 resonance jewels into their matching orthogonal rank sockets:\n• Rank 01: Azure Jewel (Sylas 💎) [+1, +1, +1, +1]\n• Rank 02: Emerald Jewel (Rowan 🌲) [+1, -1, +1, -1]\n• Rank 03: Amethyst Jewel (Vesper 🔮) [+1, +1, -1, -1]\n• Rank 04: Ruby Jewel (Ignis 🔥) [+1, -1, -1, +1]\n• Rank 05: Golden Jewel (Aurelius ☀️) [-1, +1, +1, -1]\n(Tip: You can click "✦ Auto-Slot All Jewels" to place them immediately!). Click "✦ Ignite Conduit Beams".',
          badge: 'Conduit Beams Ignited',
        },
        {
          num: '2',
          name: 'Glass Observatory Telescope',
          detail: 'Click the domed glass skylight overhead. Look through the circular brass telescope crosshairs and click on all 5 distant regional beacon stars in the sky to lock their carrier frequencies:\n1. Mount Sylas Beacon (Blue)\n2. Rowan Forest Spire (Green)\n3. Vesper Shadow Peak (Purple)\n4. Ignis Volcano Spire (Red)\n5. Aurelius Citadel (Gold)\nClick "✦ Lock Celestial Carriers".',
          badge: '5 Star Beacons Locked',
        },
        {
          num: '3',
          name: 'The Master Crystal Matrix Synthesizer',
          detail: 'Click the towering central apparatus. All 5 transmitters are now wired. Ensure all 5 channels are active (TRANSMITTING). You can toggle data bits (+1 or -1) and click any wizard’s name to see CDMA demodulation reconstruct their exact transmitted data bit without collision. Click "✦ Harmonize All Frequencies & Complete Journey" to launch the grand interactive cinematic finale!',
          badge: 'CDMA Harmony Restored',
        },
      ],
    },
  ];

  const currentRoundData = rounds.find(r => r.round === activeRound) ?? rounds[0];

  const handleGrant = () => {
    audioSystem.playHarmonicResonance();
    onGrantAllJewels?.();
    setGrantedNotification(true);
    setTimeout(() => {
      setGrantedNotification(false);
    }, 3000);
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-3 sm:p-5 pointer-events-auto select-none">
      {/* Heavy Leather-Bound Grimoire / Rusty Lake Solution Archive */}
      <div className="max-w-3xl w-full bg-[#17130f] border-4 border-[#0a0705] p-5 sm:p-7 shadow-[0_25px_80px_rgba(0,0,0,0.98)] text-[#ded4be] flex flex-col justify-between my-auto relative max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-[#382b1d] pb-3 mb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl sm:text-3xl">📜</span>
            <div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#f5eedc] uppercase tracking-wider">
                Tower Chronicles: Answers of All Rounds
              </h2>
              <span className="text-[11px] font-mono text-[#a39480]">
                Official Walkthrough & CDMA Solutions Guide for Chambers 1, 2, 3 & 4
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

        {/* Round Navigation Tabs */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {rounds.map(r => (
            <button
              key={r.round}
              type="button"
              onClick={() => {
                audioSystem.playPageTurn();
                setActiveRound(r.round);
              }}
              className={`p-2 sm:p-2.5 border text-xs sm:text-sm font-serif transition-all cursor-pointer text-center rounded ${
                activeRound === r.round
                  ? 'bg-[#d4af37] text-[#140e08] font-bold border-[#fae7b5] shadow-md scale-102'
                  : 'bg-[#1e1711] text-[#a39480] border-[#382a1d] hover:text-[#f5eedc] hover:bg-[#281f16]'
              }`}
            >
              Chamber 0{r.round}
            </button>
          ))}
        </div>

        {/* Active Round Content */}
        <div className="bg-[#100d0a] border-2 border-[#2b2017] p-4 sm:p-5 rounded mb-4 overflow-y-auto max-h-[46vh] space-y-3.5 shadow-inner">
          <div className="border-b border-[#2e2318] pb-2 mb-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-serif font-bold text-[#f5eedc]">
                {currentRoundData.title}
              </h3>
              <span className="text-[10px] font-mono bg-[#241a12] text-[#d4af37] px-2 py-0.5 border border-[#4a3622] rounded">
                Round 0{currentRoundData.round}
              </span>
            </div>
            <span className="text-xs font-mono text-[#d4af37] block mt-0.5">
              {currentRoundData.subtitle}
            </span>
            <p className="text-xs text-[#a89984] font-serif italic mt-1.5 leading-relaxed">
              "{currentRoundData.overview}"
            </p>
          </div>

          <div className="space-y-3">
            {currentRoundData.steps.map(step => (
              <div key={step.num} className="p-3 bg-[#19130e] border border-[#38291b] rounded shadow-sm">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 bg-[#2b2016] border border-[#d4af37] rounded-full text-xs font-mono font-bold flex items-center justify-center text-[#d4af37]">
                      {step.num}
                    </span>
                    <span className="font-serif font-bold text-xs sm:text-sm text-[#f5eedc]">
                      {step.name}
                    </span>
                  </div>
                  <span className="text-[9px] font-mono text-[#86efac] bg-[#1a2e1d] px-2 py-0.5 rounded border border-[#2a4d2f]">
                    {step.badge}
                  </span>
                </div>
                <p className="text-xs font-sans text-[#cfc1ad] leading-relaxed whitespace-pre-line pl-7">
                  {step.detail}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Helper Tools & Skip Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t-2 border-[#382b1d]">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {onGrantAllJewels && (
              <button
                type="button"
                onClick={handleGrant}
                className="px-3.5 py-1.5 bg-[#1b3320] hover:bg-[#25472d] text-xs font-serif font-bold text-[#86efac] border border-[#34d399]/60 rounded cursor-pointer transition-all shadow"
                title="Immediately place all 5 Resonance Jewels in your satchel"
              >
                {grantedNotification ? '✓ All 5 Jewels Granted!' : '✦ Grant All 5 Jewels (Skip)'}
              </button>
            )}

            {onJumpToRoom && (
              <button
                type="button"
                onClick={() => {
                  audioSystem.playButtonClick();
                  onJumpToRoom(activeRound - 1);
                  onClose();
                }}
                className="px-3 py-1.5 bg-[#261f18] hover:bg-[#382d22] text-xs font-serif text-[#ded4be] border border-[#423122] rounded cursor-pointer"
              >
                Jump to Chamber {activeRound} ➔
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2 bg-[#d4af37] hover:bg-[#fae7b5] text-[#120c06] font-serif text-xs font-bold border border-[#0a0705] cursor-pointer shadow rounded"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
