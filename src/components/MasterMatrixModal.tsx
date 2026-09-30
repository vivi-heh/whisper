/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { audioSystem } from '../game/AudioSystem';

interface MasterMatrixModalProps {
  onHarmonized: () => void;
  onClose: () => void;
}

interface ChannelState {
  id: string;
  name: string;
  color: string;
  code: number[];
  bit: number; // +1 or -1
  enabled: boolean;
}

export const MasterMatrixModal: React.FC<MasterMatrixModalProps> = ({ onHarmonized, onClose }) => {
  const [channels, setChannels] = useState<ChannelState[]>([
    { id: 'sylas', name: 'Sylas', color: '#38bdf8', code: [1, 1, 1, 1], bit: 1, enabled: true },
    { id: 'rowan', name: 'Rowan', color: '#34d399', code: [1, -1, 1, -1], bit: 1, enabled: true },
    { id: 'vesper', name: 'Vesper', color: '#c084fc', code: [1, 1, -1, -1], bit: -1, enabled: true },
    { id: 'ignis', name: 'Ignis', color: '#f87171', code: [1, -1, -1, 1], bit: 1, enabled: true },
  ]);

  const [selectedChannelId, setSelectedChannelId] = useState<string>('sylas');
  const [decodedOutput, setDecodedOutput] = useState<{
    channelName: string;
    recoveredBit: number;
    rawSum: number;
    color: string;
  } | null>(null);

  // Compute composite signal across all 4 chips
  const compositeWave: number[] = [0, 0, 0, 0];
  channels.forEach(ch => {
    if (ch.enabled) {
      for (let i = 0; i < 4; i++) {
        compositeWave[i] += ch.bit * ch.code[i];
      }
    }
  });

  const toggleChannel = (id: string) => {
    audioSystem.playButtonClick();
    setChannels(prev =>
      prev.map(ch => (ch.id === id ? { ...ch, enabled: !ch.enabled } : ch))
    );
    setDecodedOutput(null);
  };

  const toggleBit = (id: string) => {
    audioSystem.playButtonClick();
    setChannels(prev =>
      prev.map(ch => (ch.id === id ? { ...ch, bit: ch.bit === 1 ? -1 : 1 } : ch))
    );
    setDecodedOutput(null);
  };

  const handleDemodulate = (channelId: string) => {
    const targetCh = channels.find(c => c.id === channelId);
    if (!targetCh) return;

    audioSystem.playHarmonicResonance();

    // Inner product of composite signal with target code
    let dotProduct = 0;
    for (let i = 0; i < 4; i++) {
      dotProduct += compositeWave[i] * targetCh.code[i];
    }

    const recoveredBit = dotProduct > 0 ? 1 : dotProduct < 0 ? -1 : 0;

    setDecodedOutput({
      channelName: targetCh.name,
      recoveredBit,
      rawSum: dotProduct,
      color: targetCh.color,
    });
  };

  const allActive = channels.every(c => c.enabled);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 pointer-events-auto">
      {/* Grand Celestial Matrix Terminal */}
      <div className="max-w-3xl w-full bg-[#16120e] border-4 border-[#080605] p-6 shadow-[0_25px_80px_rgba(0,0,0,0.98)] text-[#ded4be] flex flex-col justify-between my-auto select-none relative">
        {/* Terminal Header */}
        <div className="flex items-center justify-between border-b-2 border-[#382a1d] pb-3 mb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🌌</span>
            <div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#f5eedc] uppercase tracking-wider">
                The Master Crystal Matrix
              </h2>
              <span className="text-[10px] font-mono text-[#8a7662]">
                Final Apex Trial · Simultaneous Multi-User Spectrum Synchronization
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

        {/* Live Composite Spectrum Oscilloscope */}
        <div className="bg-[#0c0e14] border-3 border-[#283245] p-3 rounded mb-4 shadow-inner">
          <div className="flex justify-between items-center text-[10px] font-mono text-[#60a5fa] mb-1">
            <span>SHARED TOWER SPECTRUM: S(t) = [{compositeWave.map(v => (v >= 0 ? `+${v}` : v)).join(', ')}]</span>
            <span className="text-[#d4af37]">4 Concurrent Transmitters · Single Frequency Band</span>
          </div>

          <svg className="w-full h-24" viewBox="0 0 400 90">
            {/* Center zero line */}
            <line x1="0" y1="45" x2="400" y2="45" stroke="#1e293b" strokeWidth="1.5" strokeDasharray="3 3" />

            {/* Stepped superposition composite waveform */}
            {compositeWave.map((val, i) => {
              const x1 = 30 + i * 85;
              const x2 = x1 + 80;
              const y = 45 - val * 9;
              return (
                <g key={i}>
                  <rect
                    x={x1}
                    y={Math.min(y, 45)}
                    width={75}
                    height={Math.max(2, Math.abs(val * 9))}
                    fill="rgba(56, 189, 248, 0.25)"
                    stroke="#38bdf8"
                    strokeWidth="1.5"
                  />
                  <text
                    x={x1 + 37}
                    y={val >= 0 ? y - 4 : y + 14}
                    fill="#93c5fd"
                    fontSize="11"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    Chip {i}: {val >= 0 ? `+${val}` : val}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* 4 Wizard Channel Transmitters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          {channels.map(ch => (
            <div
              key={ch.id}
              className={`p-2.5 border-2 transition-all ${
                ch.enabled ? 'bg-[#1e1711] border-[#3d2e20]' : 'bg-[#110e0b] border-[#1f1712] opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-serif font-bold text-xs" style={{ color: ch.color }}>
                  {ch.name}
                </span>
                <button
                  type="button"
                  onClick={() => toggleChannel(ch.id)}
                  className={`text-[9px] px-1.5 py-0.5 font-mono cursor-pointer border ${
                    ch.enabled
                      ? 'bg-[#153422] border-[#22c55e] text-[#86efac]'
                      : 'bg-[#291717] border-[#ef4444] text-[#fca5a5]'
                  }`}
                >
                  {ch.enabled ? 'TRANSMITTING' : 'MUTED'}
                </button>
              </div>

              <div className="text-[10px] font-mono text-[#8a7967] mb-1">
                Code: [{ch.code.join(',')}]
              </div>

              <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-[#2e2318]">
                <span className="text-[10px] font-mono text-[#9e8f7c]">Bit:</span>
                <button
                  type="button"
                  onClick={() => toggleBit(ch.id)}
                  className="px-2 py-0.5 bg-[#2b2016] hover:bg-[#3d2e20] text-xs font-mono font-bold text-white border border-[#4d3a28] cursor-pointer"
                >
                  {ch.bit === 1 ? 'Data +1 (✦)' : 'Data -1 (✧)'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Receiver Demodulator Console */}
        <div className="bg-[#1a140f] border-2 border-[#382a1d] p-3 rounded mb-4">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider text-[#d4af37] font-bold">
              Correlator Receiver Filter:
            </span>
            <div className="flex gap-1.5">
              {channels.map(ch => (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => {
                    audioSystem.playButtonClick();
                    setSelectedChannelId(ch.id);
                    setDecodedOutput(null);
                  }}
                  className={`px-2.5 py-1 text-xs font-serif border cursor-pointer ${
                    selectedChannelId === ch.id
                      ? 'bg-[#d4af37] text-black font-bold border-[#fff]'
                      : 'bg-[#241c14] text-[#a39480] border-[#382a1d] hover:text-white'
                  }`}
                >
                  {ch.name}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => handleDemodulate(selectedChannelId)}
              className="px-3 py-1 bg-[#224430] hover:bg-[#2e5d42] text-xs font-serif font-bold text-[#86efac] border border-[#34d399] cursor-pointer"
            >
              ✦ Extract Clean Bit
            </button>
          </div>

          {/* Demodulation Live Result */}
          {decodedOutput ? (
            <div className="bg-[#0e1611] border border-[#1b3d26] p-2 text-xs font-mono flex items-center justify-between">
              <div>
                <span className="text-[#a7f3d0]">DECODED CHANNEL: </span>
                <span className="font-bold" style={{ color: decodedOutput.color }}>
                  {decodedOutput.channelName}
                </span>
                <span className="text-[#789c84] ml-2">
                  (Inner Product: {decodedOutput.rawSum} / 4)
                </span>
              </div>
              <div className="text-sm font-bold text-white px-2 py-0.5 bg-[#163a24] rounded border border-[#22c55e]">
                RECOVERED DATA: {decodedOutput.recoveredBit === 1 ? '+1 (POSITIVE BIT)' : '-1 (NEGATIVE BIT)'}
              </div>
            </div>
          ) : (
            <div className="text-[11px] font-sans italic text-[#786958]">
              Select a target Archmage above and click "Extract Clean Bit" to observe CDMA despreading in action.
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex justify-between items-center">
          <span className="text-[11px] font-mono text-[#8a7967]">
            {allActive
              ? '✦ All 4 orthogonal channels are active simultaneously.'
              : 'Turn on all transmitters to achieve full network synchronization.'}
          </span>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setChannels(prev => prev.map(c => ({ ...c, enabled: true })));
                audioSystem.playHarmonicResonance();
              }}
              className="px-3 py-1.5 bg-[#261f18] hover:bg-[#382d23] text-xs font-serif text-[#d4af37] border border-[#523d2b] cursor-pointer"
              title="Enable all 5 transmitter channels"
            >
              ✦ Auto-Enable All
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 bg-[#261f18] hover:bg-[#382d23] text-xs font-serif text-[#b8a994] border border-[#3b2e22] cursor-pointer"
            >
              Exit Console
            </button>
            <button
              type="button"
              disabled={!allActive}
              onClick={() => {
                audioSystem.playHarmonicResonance();
                onHarmonized();
              }}
              className={`px-5 py-2 text-xs font-serif font-bold border-2 transition-all ${
                allActive
                  ? 'bg-[#d4af37] hover:bg-[#fae7b5] text-[#120c06] border-[#0a0705] shadow-[0_0_20px_rgba(212,175,55,0.5)] cursor-pointer'
                  : 'bg-[#1c1611] text-[#4a3c2e] border-[#291f16] cursor-not-allowed'
              }`}
            >
              ✦ Harmonize All Frequencies & Complete Journey
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
