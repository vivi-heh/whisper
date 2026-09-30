/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { audioSystem } from '../game/AudioSystem';

interface CelestialAltarModalProps {
  onSolved: () => void;
  onClose: () => void;
  onGrantAllJewels?: () => void;
}

interface TuningStone {
  id: string;
  name: string;
  wizard: string;
  color: string;
  glyph: string;
  codeStr: string;
  targetSlot: number;
}

export const CelestialAltarModal: React.FC<CelestialAltarModalProps> = ({
  onSolved,
  onClose,
  onGrantAllJewels,
}) => {
  const stones: TuningStone[] = [
    { id: 'azure', name: 'Azure Jewel', wizard: 'Archmage Sylas', color: '#38bdf8', glyph: '💎', codeStr: '[+1,+1,+1,+1]', targetSlot: 0 },
    { id: 'emerald', name: 'Emerald Jewel', wizard: 'Archdruid Rowan', color: '#34d399', glyph: '🌲', codeStr: '[+1,-1,+1,-1]', targetSlot: 1 },
    { id: 'amethyst', name: 'Amethyst Jewel', wizard: 'Mystic Vesper', color: '#c084fc', glyph: '🔮', codeStr: '[+1,+1,-1,-1]', targetSlot: 2 },
    { id: 'ruby', name: 'Ruby Jewel', wizard: 'Pyromancer Ignis', color: '#f87171', glyph: '🔥', codeStr: '[+1,-1,-1,+1]', targetSlot: 3 },
    { id: 'gold', name: 'Golden Jewel', wizard: 'Sage Aurelius', color: '#fbbf24', glyph: '☀️', codeStr: '[-1,+1,+1,-1]', targetSlot: 4 },
  ];

  // Sockets on altar (indices 0 to 4)
  const [placedSlots, setPlacedSlots] = useState<(string | null)[]>([null, null, null, null, null]);
  const [selectedStoneId, setSelectedStoneId] = useState<string | null>(null);
  const [activePickerSlot, setActivePickerSlot] = useState<number | null>(null);

  // Check if all 5 stones are in their exact target slots
  const isCorrect = stones.every(st => placedSlots[st.targetSlot] === st.id);
  const filledCount = placedSlots.filter(s => s !== null).length;

  // Handle clicking a jewel in the satchel tray
  const handleSelectStone = (id: string) => {
    audioSystem.playButtonClick();

    // If an empty slot picker is currently active, insert directly there!
    if (activePickerSlot !== null) {
      handleDirectSlotInsert(id, activePickerSlot);
      setActivePickerSlot(null);
      return;
    }

    // Toggle selection
    if (selectedStoneId === id) {
      setSelectedStoneId(null);
    } else {
      setSelectedStoneId(id);
    }
  };

  // Direct insertion of jewel into slot
  const handleDirectSlotInsert = (stoneId: string, slotIdx: number) => {
    audioSystem.playTelescopeClick();
    setPlacedSlots(prev => {
      // Remove stoneId from anywhere else it was placed
      const next = prev.map(s => (s === stoneId ? null : s));
      next[slotIdx] = stoneId;
      return next;
    });
    setSelectedStoneId(null);
    setActivePickerSlot(null);
  };

  // Handle clicking a socket on the altar
  const handleSlotClick = (slotIdx: number) => {
    // If a stone is already selected from the tray, place it here
    if (selectedStoneId) {
      handleDirectSlotInsert(selectedStoneId, slotIdx);
      return;
    }

    // If socket has a placed stone, click to remove it back to satchel
    const existing = placedSlots[slotIdx];
    if (existing) {
      audioSystem.playButtonClick();
      setPlacedSlots(prev => {
        const next = [...prev];
        next[slotIdx] = null;
        return next;
      });
      setActivePickerSlot(null);
      return;
    }

    // If empty socket clicked without selection, toggle quick-picker for this slot
    audioSystem.playButtonClick();
    setActivePickerSlot(prev => (prev === slotIdx ? null : slotIdx));
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, stoneId: string) => {
    e.dataTransfer.setData('text/plain', stoneId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropOnSlot = (e: React.DragEvent, slotIdx: number) => {
    e.preventDefault();
    const stoneId = e.dataTransfer.getData('text/plain');
    if (stoneId && stones.some(s => s.id === stoneId)) {
      handleDirectSlotInsert(stoneId, slotIdx);
    }
  };

  // Instant Auto-Place All Jewels in correct order
  const handleAutoPlaceAll = () => {
    audioSystem.playHarmonicResonance();
    setPlacedSlots(['azure', 'emerald', 'amethyst', 'ruby', 'gold']);
    setSelectedStoneId(null);
    setActivePickerSlot(null);
  };

  // Clear all placed jewels
  const handleClearAll = () => {
    audioSystem.playButtonClick();
    setPlacedSlots([null, null, null, null, null]);
    setSelectedStoneId(null);
    setActivePickerSlot(null);
  };

  const handleIgnite = () => {
    if (isCorrect) {
      audioSystem.playCelestialIgnite();
      onGrantAllJewels?.();
      onSolved();
    }
  };

  // Instant Skip & Solve
  const handleSkipAndIgnite = () => {
    audioSystem.playResonanceSeparation();
    onGrantAllJewels?.();
    onSolved();
  };

  const selectedStone = stones.find(s => s.id === selectedStoneId);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-3 sm:p-5 pointer-events-auto">
      {/* Heavy Celestial Stone Altar */}
      <div className="max-w-3xl w-full bg-[#16120e] border-4 border-[#080605] p-5 sm:p-6 shadow-[0_25px_80px_rgba(0,0,0,0.98)] text-[#ded4be] flex flex-col justify-between my-auto select-none relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-[#382b1e] pb-3 mb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl sm:text-3xl">🏛️</span>
            <div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#f5eedc] uppercase tracking-wider">
                Celestial Altar of Five Jewels
              </h2>
              <span className="text-[11px] font-mono text-[#a89582]">
                Chamber 4 · Insert All 5 Resonance Jewels in Orthogonal Walsh Rank Order
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

        {/* Guidance Ribbon */}
        <div className="bg-[#1e1711] border border-[#38291b] px-3 py-2 rounded mb-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-sm">✦</span>
            <span className="font-serif text-[#ded4be]">
              {selectedStone ? (
                <span>
                  Selected:{' '}
                  <strong style={{ color: selectedStone.color }}>{selectedStone.name}</strong> — Click any socket above to insert it!
                </span>
              ) : activePickerSlot !== null ? (
                <span>
                  Targeting <strong>Rank 0{activePickerSlot + 1}</strong> — Choose a jewel from your satchel below.
                </span>
              ) : isCorrect ? (
                <span className="text-[#86efac] font-bold">
                  ✦ All 5 Resonance Jewels locked in perfect orthogonal rank order! Conduits ready to ignite.
                </span>
              ) : (
                <span className="text-[#b09e88] italic">
                  Select a jewel from your satchel below, then click a conduit socket above to place it (or drag & drop).
                </span>
              )}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAutoPlaceAll}
              className="px-2.5 py-1 bg-[#2e2115] hover:bg-[#423120] text-[11px] font-mono font-bold text-[#d4af37] border border-[#d4af37]/60 rounded cursor-pointer shadow transition-all"
            >
              ✦ Auto-Slot All Jewels
            </button>
            <button
              type="button"
              onClick={handleClearAll}
              className="px-2 py-1 bg-[#1a1410] hover:bg-[#261d16] text-[11px] font-mono text-[#8f7e6b] border border-[#2b2016] rounded cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Altar Conduit Sockets (1 to 5) */}
        <div className="bg-[#0c0906] border-3 border-[#2c2117] p-4 rounded mb-4 shadow-inner">
          <div className="flex justify-between items-center mb-2 px-1">
            <span className="text-[10px] font-mono text-[#a39480] uppercase tracking-widest">
              CONDUIT SOCKETS · RANK 1 TO 5 ({filledCount}/5 SLOTTED)
            </span>
            <span className="text-[10px] font-mono text-[#8a7662]">
              Inner Product = 0 Across Channels
            </span>
          </div>

          <div className="grid grid-cols-5 gap-2 sm:gap-3">
            {[0, 1, 2, 3, 4].map(slotIdx => {
              const placedId = placedSlots[slotIdx];
              const placedStone = stones.find(s => s.id === placedId);
              const targetStone = stones[slotIdx];
              const isMatch = placedStone?.id === targetStone.id;
              const isSlotTargeted = activePickerSlot === slotIdx;

              return (
                <div
                  key={slotIdx}
                  onDragOver={handleDragOver}
                  onDrop={e => handleDropOnSlot(e, slotIdx)}
                  onClick={() => handleSlotClick(slotIdx)}
                  className={`h-28 sm:h-32 border-2 flex flex-col items-center justify-between p-2 rounded transition-all cursor-pointer relative select-none ${
                    isSlotTargeted
                      ? 'border-[#38bdf8] bg-[#1a232f] ring-2 ring-[#38bdf8]/50 shadow-lg'
                      : placedStone
                      ? isMatch
                        ? 'bg-[#1b1914] border-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.25)] scale-102'
                        : 'bg-[#221614] border-[#ef4444]'
                      : selectedStoneId
                      ? 'bg-[#140e0a] border-[#574431] hover:border-[#d4af37] hover:bg-[#201811]'
                      : 'bg-[#120d09] border-[#2e2318] hover:border-[#634e35]'
                  }`}
                  title={
                    placedStone
                      ? `${placedStone.name} inserted (Click to return to satchel)`
                      : `Click to insert jewel into Rank 0${slotIdx + 1}`
                  }
                >
                  {/* Rank Header */}
                  <div className="w-full flex items-center justify-between text-[9px] font-mono border-b border-[#2d2116] pb-1">
                    <span className="text-[#a89582] font-bold">R0{slotIdx + 1}</span>
                    <span className="text-[8px] text-[#736352] truncate max-w-[55px]">
                      {targetStone.wizard.split(' ')[1]}
                    </span>
                  </div>

                  {/* Socket Center Display */}
                  {placedStone ? (
                    <div className="flex flex-col items-center justify-center my-auto">
                      <span className="text-3xl sm:text-4xl filter drop-shadow-md animate-pulse">
                        {placedStone.glyph}
                      </span>
                      <span
                        className="text-[10px] font-serif font-bold truncate max-w-full mt-1"
                        style={{ color: placedStone.color }}
                      >
                        {placedStone.name.split(' ')[0]}
                      </span>
                      <span className="text-[8px] font-mono text-[#8a7662]">
                        {placedStone.codeStr}
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center my-auto opacity-50 hover:opacity-80 transition-opacity">
                      <span className="text-2xl filter grayscale opacity-40">{targetStone.glyph}</span>
                      <span className="text-[9px] font-mono text-[#8a7662] mt-1">
                        Insert {targetStone.glyph}
                      </span>
                      <span className="text-[8px] font-mono text-[#5c4d3d]">
                        {targetStone.codeStr}
                      </span>
                    </div>
                  )}

                  {/* Socket Status Footer */}
                  <div className="w-full text-center text-[8px] font-mono pt-1 border-t border-[#261c13]">
                    {placedStone ? (
                      isMatch ? (
                        <span className="text-[#86efac] font-bold">✓ RESONANT</span>
                      ) : (
                        <span className="text-[#fca5a5]">MISMATCH</span>
                      )
                    ) : (
                      <span className="text-[#786959]">Click to Place</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Available Tuning Jewels in Satchel Tray */}
        <div className="mb-4">
          <div className="text-xs font-serif text-[#a89582] mb-2 font-bold uppercase tracking-wider flex justify-between items-center">
            <span>Satchel Jewels (Click any jewel to select or slot):</span>
            <span className="text-[10px] font-mono text-[#786958]">
              {selectedStoneId ? 'Jewel Selected · Click Socket Above' : 'Select Jewel or Drag'}
            </span>
          </div>

          <div className="grid grid-cols-5 gap-2 sm:gap-3">
            {stones.map(st => {
              const isPlaced = placedSlots.includes(st.id);
              const placedSlotIndex = placedSlots.findIndex(s => s === st.id);
              const isSelected = selectedStoneId === st.id;

              return (
                <div
                  key={st.id}
                  draggable={!isPlaced}
                  onDragStart={e => handleDragStart(e, st.id)}
                  onClick={() => handleSelectStone(st.id)}
                  className={`p-2.5 border-2 text-center transition-all cursor-pointer rounded flex flex-col justify-between select-none ${
                    isSelected
                      ? 'bg-[#2e2318] border-[#f5eedc] shadow-[0_0_15px_rgba(245,238,220,0.5)] -translate-y-1'
                      : isPlaced
                      ? 'bg-[#100c09] border-[#1d1610] opacity-50 hover:opacity-80'
                      : 'bg-[#1e1711] border-[#3d2e20] hover:border-[#8f7457] hover:bg-[#281f17]'
                  }`}
                  title={
                    isPlaced
                      ? `${st.name} is in Rank 0${placedSlotIndex + 1} (Click to select/relocate)`
                      : `Click to select ${st.name}`
                  }
                >
                  <div className="text-2xl sm:text-3xl mb-1">{st.glyph}</div>
                  <div className="text-[11px] font-serif font-bold truncate" style={{ color: st.color }}>
                    {st.name}
                  </div>
                  <div className="text-[8px] font-mono text-[#a39480] my-0.5">
                    {st.wizard.split(' ')[1]}
                  </div>
                  <div className="text-[8px] font-mono text-[#786958]">
                    {isPlaced ? (
                      <span className="text-[#86efac] font-bold">SLOT 0{placedSlotIndex + 1}</span>
                    ) : (
                      st.codeStr
                    )}
                  </div>

                  {/* 1-Tap Quick Action */}
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      audioSystem.playButtonClick();
                      if (isPlaced) {
                        // Return to satchel
                        setPlacedSlots(prev => prev.map(s => (s === st.id ? null : s)));
                      } else {
                        // Place into target slot
                        handleDirectSlotInsert(st.id, st.targetSlot);
                      }
                    }}
                    className={`mt-1.5 py-0.5 px-1 rounded text-[8px] font-mono uppercase tracking-tight transition-all ${
                      isPlaced
                        ? 'bg-[#291b16] hover:bg-[#3d261e] text-[#fca5a5] border border-[#4d2c22]'
                        : 'bg-[#2b2116] hover:bg-[#3d2f20] text-[#d4af37] border border-[#d4af37]/40'
                    }`}
                  >
                    {isPlaced ? 'Return' : `Slot R0${st.targetSlot + 1}`}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-3 border-t-2 border-[#291f16]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-serif italic text-[#8a7864]">
              {isCorrect
                ? '✦ All 5 jewels locked in orthogonal Walsh rank order!'
                : 'Rank Order: 1. Azure 💎 → 2. Emerald 🌲 → 3. Amethyst 🔮 → 4. Ruby 🔥 → 5. Gold ☀️'}
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleSkipAndIgnite}
              className="px-3 py-2 bg-[#331c19] hover:bg-[#4a2420] text-[11px] font-serif text-[#fca5a5] border border-[#5c2b24] rounded cursor-pointer transition-all"
              title="Automatically grant all jewels and ignite the altar conduits"
            >
              ✦ Sorcery (Auto-Solve)
            </button>

            <button
              type="button"
              disabled={!isCorrect}
              onClick={handleIgnite}
              className={`px-5 py-2 font-serif text-xs font-bold border-2 transition-all rounded ${
                isCorrect
                  ? 'bg-[#d4af37] hover:bg-[#fae7b5] text-[#140e08] border-[#0a0705] shadow-[0_0_20px_rgba(212,175,55,0.6)] cursor-pointer scale-102 animate-pulse'
                  : 'bg-[#1b1510] text-[#524334] border-[#292019] cursor-not-allowed'
              }`}
            >
              ✦ Ignite Conduit Beams
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
