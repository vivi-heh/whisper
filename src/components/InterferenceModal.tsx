/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { audioSystem } from '../game/AudioSystem';

interface InterferenceModalProps {
  onSolved: () => void;
  onClose: () => void;
}

export const InterferenceModal: React.FC<InterferenceModalProps> = ({ onSolved, onClose }) => {
  // Composite received signal arriving at tower (Simultaneous transmission of Sylas + Rowan)
  // Sylas sent bit +1: [+1, +1, +1, +1]
  // Rowan sent bit +1: [+1, -1, +1, -1]
  // Summed composite S(t) = [+2, 0, +2, 0]
  const compositeSignal = [2, 0, 2, 0];

  const codeFilters = [
    {
      id: 'mismatched',
      name: 'Mismatched Filter (Vesper Code)',
      code: [1, 1, -1, -1],
      description: 'Orthogonal to both Sylas and Rowan. Should produce 0 correlation.',
      expectedSum: 0,
      color: '#c084fc',
    },
    {
      id: 'sylas',
      name: 'Archmage Sylas Filter',
      code: [1, 1, 1, 1],
      description: 'Exact matching code for Sylas (+1, +1, +1, +1).',
      expectedSum: 4,
      color: '#38bdf8',
    },
    {
      id: 'rowan',
      name: 'Archdruid Rowan Filter',
      code: [1, -1, 1, -1],
      description: 'Exact matching code for Rowan (+1, -1, +1, -1).',
      expectedSum: 4,
      color: '#34d399',
    },
  ];

  const [selectedFilterIdx, setSelectedFilterIdx] = useState<number>(0);
  const [sliderPosition, setSliderPosition] = useState<number>(0); // 0 to 4 (correlation progress)
  const [hasTestedWrong, setHasTestedWrong] = useState<boolean>(false);
  const [hasTestedCorrect, setHasTestedCorrect] = useState<boolean>(false);

  const currentFilter = codeFilters[selectedFilterIdx];

  // Calculate correlation step-by-step up to slider position
  const activeChips = Math.round(sliderPosition);
  let partialSum = 0;
  const products: number[] = [];

  for (let i = 0; i < 4; i++) {
    const prod = compositeSignal[i] * currentFilter.code[i];
    products.push(prod);
    if (i < activeChips) {
      partialSum += prod;
    }
  }

  const isFullyCorrelated = sliderPosition >= 3.8;
  const isMatch = isFullyCorrelated && (currentFilter.id === 'sylas' || currentFilter.id === 'rowan');
  const isZeroRejection = isFullyCorrelated && currentFilter.id === 'mismatched';

  const handleSelectFilter = (idx: number) => {
    audioSystem.playButtonClick();
    setSelectedFilterIdx(idx);
    setSliderPosition(0);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setSliderPosition(val);
    audioSystem.playOscilloscopeTone(240 + val * 80);

    if (val >= 3.8) {
      if (currentFilter.id === 'mismatched') {
        audioSystem.playStaticGlitch();
        setHasTestedWrong(true);
      } else {
        audioSystem.playHarmonicResonance();
        setHasTestedCorrect(true);
      }
    }
  };

  const handleCalibrateAndUnlock = () => {
    audioSystem.playResonanceSeparation();
    onSolved();
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 pointer-events-auto">
      {/* Heavy Steampunk / Rusty Lake Brass Oscilloscope Chamber */}
      <div className="max-w-2xl w-full bg-[#17130f] border-4 border-[#0a0705] p-6 shadow-[0_20px_70px_rgba(0,0,0,0.95)] text-[#ded4be] flex flex-col justify-between my-auto select-none relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-[#382b20] pb-3 mb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚡</span>
            <div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#e8ded0] uppercase tracking-wider">
                Spectral Correlator Console
              </h2>
              <span className="text-[10px] font-mono text-[#8a7662]">
                Chamber 3 · CDMA Cross-Correlation & Signal Separation
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

        {/* Cathode-Ray Oscilloscope Display */}
        <div className="bg-[#0b130e] border-4 border-[#243328] p-4 relative rounded shadow-inner mb-4 overflow-hidden">
          {/* Scanline grid overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-25"
            style={{
              backgroundImage:
                'linear-gradient(rgba(0, 255, 120, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 120, 0.1) 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
          />

          <div className="flex justify-between items-center text-[10px] font-mono text-[#4ade80] mb-2 z-10 relative">
            <span>INPUT: S(t) = [+2, 0, +2, 0]</span>
            <span className={isMatch ? 'text-[#38bdf8] font-bold' : isZeroRejection ? 'text-[#f87171] font-bold' : ''}>
              {isMatch
                ? '✦ COHERENT PEAK ACQUIRED (+4V)'
                : isZeroRejection
                ? '✖ CROSS-CORRELATION: EXACT 0V'
                : 'CALIBRATING FILTER...'}
            </span>
          </div>

          {/* SVG Waveform Visualization */}
          <svg className="w-full h-28 z-10 relative" viewBox="0 0 400 100">
            {/* Center Zero Axis */}
            <line x1="0" y1="50" x2="400" y2="50" stroke="#1d4029" strokeWidth="1.5" strokeDasharray="4 4" />

            {/* Composite Signal Bars (Gray) */}
            {compositeSignal.map((val, i) => {
              const x = 30 + i * 90;
              const y = 50 - val * 18;
              return (
                <g key={i}>
                  <line x1={x} y1="50" x2={x} y2={y} stroke="#6b7280" strokeWidth="4" strokeLinecap="round" />
                  <circle cx={x} cy={y} r="4" fill="#9ca3af" />
                  <text x={x} y={val >= 0 ? y - 6 : y + 14} fill="#9ca3af" fontSize="10" textAnchor="middle" fontFamily="monospace">
                    S[{i}]={val >= 0 ? `+${val}` : val}
                  </text>
                </g>
              );
            })}

            {/* Active Code Multipliers (Colored lines) */}
            {currentFilter.code.map((cVal, i) => {
              const x = 55 + i * 90;
              const y = 50 - cVal * 22;
              const isActive = i < activeChips;
              return (
                <g key={`code-${i}`}>
                  <line
                    x1={x}
                    y1="50"
                    x2={x}
                    y2={y}
                    stroke={isActive ? currentFilter.color : '#374151'}
                    strokeWidth="3"
                    strokeDasharray={isActive ? 'none' : '2 2'}
                  />
                  <circle cx={x} cy={y} r="3" fill={isActive ? currentFilter.color : '#4b5563'} />
                  <text
                    x={x}
                    y={cVal >= 0 ? y - 6 : y + 14}
                    fill={isActive ? currentFilter.color : '#4b5563'}
                    fontSize="9"
                    textAnchor="middle"
                    fontFamily="monospace"
                  >
                    C[{i}]={cVal >= 0 ? `+${cVal}` : cVal}
                  </text>
                </g>
              );
            })}

            {/* Dynamic Result Curve */}
            {isFullyCorrelated && (
              <path
                d={
                  isMatch
                    ? 'M 10 50 Q 100 10, 200 15 T 390 50'
                    : 'M 10 50 Q 60 48, 120 52 T 240 49 T 390 50'
                }
                fill="none"
                stroke={isMatch ? '#38bdf8' : '#ef4444'}
                strokeWidth="2.5"
                className={isMatch ? 'animate-pulse' : ''}
              />
            )}
          </svg>

          {/* Analog Meter Display */}
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#1d4029] text-xs font-mono text-[#a7f3d0]">
            <div>
              DOT PRODUCT: <span className="font-bold text-white text-sm">{partialSum}</span> / {currentFilter.expectedSum}
            </div>
            <div className="flex gap-2">
              {products.map((p, i) => (
                <span
                  key={i}
                  className={`px-1.5 py-0.5 rounded text-[10px] ${
                    i < activeChips ? 'bg-[#1b3d26] text-[#6ee7b7]' : 'bg-[#0f1f14] text-[#374151]'
                  }`}
                >
                  ({compositeSignal[i]}×{currentFilter.code[i] > 0 ? '+1' : '-1'} = {p >= 0 ? `+${p}` : p})
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Decoder Filter Selectors */}
        <div className="space-y-2 mb-4">
          <label className="text-xs font-mono text-[#a3937f] uppercase tracking-wider block">
            1. Select Decryption Filter (Orthogonal Spreading Code):
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {codeFilters.map((filter, idx) => {
              const isSelected = idx === selectedFilterIdx;
              return (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => handleSelectFilter(idx)}
                  className={`p-2.5 text-left border-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#291f16] border-[#d4af37] text-white shadow-md'
                      : 'bg-[#1c1611] border-[#36291e] text-[#a89b88] hover:border-[#6b543b]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-serif font-bold text-xs" style={{ color: filter.color }}>
                      {filter.name}
                    </span>
                    <span className="text-[10px] font-mono">[{filter.code.join(',')}]</span>
                  </div>
                  <p className="text-[9px] font-sans text-[#8f7f6c] leading-tight">
                    {filter.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tactile Integration Slider */}
        <div className="bg-[#1f1812] border-2 border-[#36291e] p-3 mb-4 rounded">
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-mono text-[#d4af37] uppercase tracking-wider font-bold">
              2. Mechanical Correlator Slider:
            </label>
            <span className="text-xs font-mono text-[#a89b88]">
              Chip Progress: {activeChips} / 4
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="4"
            step="0.05"
            value={sliderPosition}
            onChange={handleSliderChange}
            className="w-full accent-[#d4af37] cursor-pointer"
          />
          <div className="flex justify-between text-[9px] font-mono text-[#786652] mt-1">
            <span>START (t=0)</span>
            <span>CHIP 1</span>
            <span>CHIP 2</span>
            <span>CHIP 3</span>
            <span>INTEGRATE (t=T)</span>
          </div>
        </div>

        {/* Educational Feedback Message */}
        <div className="bg-[#120e0b] border border-[#2b2016] p-3 mb-4 text-xs font-serif leading-relaxed text-[#c4b69c]">
          {isZeroRejection && (
            <div className="text-[#fca5a5]">
              <span className="font-bold text-[#ef4444]">✦ INTERFERENCE COLLAPSE: </span>
              Because Vesper’s code is orthogonal to both active senders, every chip product cancels out. The sum is <strong>0</strong>. 
              Mismatched users simply cannot eavesdrop or jam each other!
            </div>
          )}
          {isMatch && (
            <div className="text-[#93c5fd]">
              <span className="font-bold text-[#38bdf8]">✦ COHERENT DESPREADING: </span>
              The incoming composite signal multiplied by Sylas’s matching sequence produces <strong>+4</strong>! 
              The noise from Rowan cancelled out completely, leaving Sylas’s message crystal clear.
            </div>
          )}
          {!isFullyCorrelated && (
            <div className="text-[#8f7f6c] italic">
              Slide the brass mechanical correlator to calculate the inner dot-product across the 4 chips.
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => {
              setSelectedFilterIdx(1);
              setSliderPosition(4);
              setHasTestedWrong(true);
              setHasTestedCorrect(true);
              audioSystem.playHarmonicResonance();
            }}
            className="px-3 py-2 bg-[#291e16] hover:bg-[#3d2e21] border border-[#d4af37]/50 text-[#d4af37] font-serif text-xs uppercase tracking-wider cursor-pointer"
            title="Auto-configure orthogonal filter"
          >
            ✦ Auto-Calibrate
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#261e17] hover:bg-[#362b20] border border-[#3d2f22] text-[#b8a994] font-serif text-xs cursor-pointer"
          >
            Leave Console
          </button>

          <button
            type="button"
            disabled={!hasTestedCorrect}
            onClick={handleCalibrateAndUnlock}
            className={`px-5 py-2 font-serif text-xs font-bold border-2 transition-all ${
              hasTestedCorrect
                ? 'bg-[#d4af37] hover:bg-[#eedec5] text-[#140e08] border-[#0a0705] shadow-[0_0_15px_rgba(212,175,55,0.4)] cursor-pointer'
                : 'bg-[#1b1510] text-[#524334] border-[#292019] cursor-not-allowed'
            }`}
          >
            ✦ Lock Orthogonal Filter & Open Apex Door
          </button>
        </div>
      </div>
    </div>
  );
};
