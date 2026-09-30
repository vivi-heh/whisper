/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { audioSystem } from '../game/AudioSystem';

interface FinalCinematicRevealProps {
  onReplay: () => void;
  onCredits: () => void;
}

export const FinalCinematicReveal: React.FC<FinalCinematicRevealProps> = ({
  onReplay,
  onCredits,
}) => {
  const [activeTab, setActiveTab] = useState<'reveal' | 'simulator' | 'patent'>('reveal');
  const [morphValue, setMorphValue] = useState<number>(75);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Live CDMA Interactive Simulator State
  const [customBitMessage, setCustomBitMessage] = useState<string>('CDMA ACTIVE');
  const [selectedUserChannel, setSelectedUserChannel] = useState<number>(0);

  // Trigger grand audio fanfare upon mounting
  useEffect(() => {
    audioSystem.playCinematicBoom();
    setTimeout(() => {
      audioSystem.playFanfare();
    }, 450);
  }, []);

  // Real-time Canvas Animation: Glowing convergence particle vortex
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let time = 0;

    interface Spark {
      angle: number;
      radius: number;
      speed: number;
      color: string;
      size: number;
      symbol: string;
    }

    const colors = ['#38bdf8', '#34d399', '#c084fc', '#f87171', '#fbbf24'];
    const runes = ['✦', '✧', '1', '0', 'ψ', 'λ', 'Ω'];
    const sparks: Spark[] = [];

    for (let i = 0; i < 90; i++) {
      sparks.push({
        angle: Math.random() * Math.PI * 2,
        radius: 30 + Math.random() * 160,
        speed: 0.015 + Math.random() * 0.03,
        color: colors[i % colors.length],
        size: 2 + Math.random() * 3,
        symbol: runes[i % runes.length],
      });
    }

    const render = () => {
      time += 0.02;
      const w = (canvas.width = canvas.clientWidth);
      const h = (canvas.height = canvas.clientHeight);

      ctx.fillStyle = '#08060a';
      ctx.fillRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;

      // Central Pulsing Nexus Orb
      const pulse = Math.sin(time * 3) * 8;
      const nexusGrad = ctx.createRadialGradient(cx, cy, 5, cx, cy, 70 + pulse);
      nexusGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
      nexusGrad.addColorStop(0.3, 'rgba(212, 175, 55, 0.6)');
      nexusGrad.addColorStop(0.7, 'rgba(56, 189, 248, 0.3)');
      nexusGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = nexusGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, 70 + pulse, 0, Math.PI * 2);
      ctx.fill();

      // Radiating Orthogonal Wave Rings
      for (let r = 0; r < 4; r++) {
        const ringRad = ((time * 40 + r * 45) % 180) + 15;
        const alpha = Math.max(0, 1 - ringRad / 180);
        ctx.strokeStyle = `rgba(212, 175, 55, ${alpha * 0.5})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(cx, cy, ringRad, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Swirling Signal Particles
      sparks.forEach(sp => {
        sp.angle += sp.speed;
        const x = cx + Math.cos(sp.angle) * sp.radius;
        const y = cy + Math.sin(sp.angle) * (sp.radius * 0.55);

        ctx.fillStyle = sp.color;
        ctx.beginPath();
        ctx.arc(x, y, sp.size, 0, Math.PI * 2);
        ctx.fill();

        // Occasional floating digital/runic symbol
        if (Math.random() < 0.08) {
          ctx.font = '10px monospace';
          ctx.fillText(sp.symbol, x + 4, y - 4);
        }
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, []);

  const mappings = [
    {
      fantasy: 'The Ancient Wizards',
      fantasyIcon: '🧙‍♂️',
      telecom: 'Simultaneous Cellular Handsets (Tx)',
      telecomIcon: '📱',
      desc: 'Multiple independent users transmitting information over the air at the exact same instant.',
    },
    {
      fantasy: 'The Parchment Scrolls',
      fantasyIcon: '📜',
      telecom: 'Digital Information Data (Bits)',
      telecomIcon: '💾',
      desc: 'The binary data stream (voice, text, video) that must cross the kingdom.',
    },
    {
      fantasy: 'The Unique Resonance Seals',
      fantasyIcon: '💎',
      telecom: 'Orthogonal Spreading Codes (Walsh Sequences)',
      telecomIcon: '🔣',
      desc: 'Mutually perpendicular mathematical chip sequences that multiply data and cancel interference.',
    },
    {
      fantasy: 'The Quartz Receiving Tower',
      fantasyIcon: '🏰',
      telecom: 'Base Station Receiver (Matched Filter Correlator)',
      telecomIcon: '📡',
      desc: 'Integrates the composite airborne wave against the user’s code to extract pristine signals.',
    },
    {
      fantasy: 'The Unified Magic Orb',
      fantasyIcon: '🌀',
      telecom: 'The Shared Wireless Spectrum (Airwaves)',
      telecomIcon: '〰️',
      desc: 'All radio frequencies overlap in the shared atmosphere simultaneously without collision.',
    },
  ];

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setMorphValue(val);
    if (val % 10 === 0) {
      audioSystem.playOscilloscopeTone(200 + val * 4);
    }
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-3 sm:p-5 overflow-y-auto pointer-events-auto select-none">
      {/* Grand Declassified Patent Terminal */}
      <div className="max-w-4xl w-full bg-[#181410] border-4 border-[#0a0705] p-5 sm:p-7 shadow-[0_25px_90px_rgba(0,0,0,0.98)] text-[#ded4be] my-auto relative">
        {/* Top Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-[#382b1d] pb-3 mb-4 gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🌌</span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#d4af37] font-bold">
                The Forgotten Signal Restored · Breakthrough Revealed
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#f5eedc] uppercase tracking-wide">
              The Sorcery Was Code Division Multiple Access
            </h2>
          </div>

          <div className="flex gap-1.5 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => {
                audioSystem.playButtonClick();
                setActiveTab('reveal');
              }}
              className={`px-3 py-1 text-xs font-serif border cursor-pointer ${
                activeTab === 'reveal'
                  ? 'bg-[#d4af37] text-black font-bold border-white'
                  : 'bg-[#241c14] text-[#a89985] border-[#382b1d] hover:text-white'
              }`}
            >
              ✦ Convergence
            </button>

            <button
              type="button"
              onClick={() => {
                audioSystem.playButtonClick();
                setActiveTab('simulator');
              }}
              className={`px-3 py-1 text-xs font-serif border cursor-pointer ${
                activeTab === 'simulator'
                  ? 'bg-[#d4af37] text-black font-bold border-white'
                  : 'bg-[#241c14] text-[#a89985] border-[#382b1d] hover:text-white'
              }`}
            >
              📡 Live Simulator
            </button>

            <button
              type="button"
              onClick={() => {
                audioSystem.playButtonClick();
                setActiveTab('patent');
              }}
              className={`px-3 py-1 text-xs font-serif border cursor-pointer ${
                activeTab === 'patent'
                  ? 'bg-[#d4af37] text-black font-bold border-white'
                  : 'bg-[#241c14] text-[#a89985] border-[#382b1d] hover:text-white'
              }`}
            >
              📜 Patent Scroll
            </button>
          </div>
        </div>

        {/* TAB 1: CONVERGENCE & INTERACTIVE MORPH SLIDER */}
        {activeTab === 'reveal' && (
          <div>
            {/* Live Canvas Visual Vortex */}
            <div className="relative w-full h-44 rounded border-2 border-[#382b1d] overflow-hidden mb-4 shadow-inner">
              <canvas ref={canvasRef} className="w-full h-full block" />
              <div className="absolute bottom-2 left-3 text-[10px] font-mono text-[#d4af37] bg-black/75 px-2 py-0.5 rounded">
                ✦ 5 CHANNELS CONVERGED INTO SINGLE ORTHOGONAL WAVEFORM
              </div>
            </div>

            {/* Core CDMA Takeaway */}
            <div className="p-3.5 bg-[#211912] border border-[#423322] rounded mb-4 text-xs font-serif leading-relaxed text-[#ded4be]">
              <span className="font-bold text-[#d4af37]">THE SECRET UNVEILED: </span>
              In CDMA, all transmitters broadcast at the exact same instant over the exact same frequency band. 
              Because each sender multiplies their message by an orthogonal Walsh code, the airwaves superimpose 
              harmlessly. At the receiver, multiplying by your specific code cancels every other user to 
              <strong> mathematical zero</strong>, extracting your message in pristine crystal clarity.
            </div>

            {/* Interactive Morph Slider */}
            <div className="p-3 bg-[#1e1711] border-2 border-[#382a1d] rounded mb-4">
              <div className="flex justify-between items-center text-[10px] font-mono text-[#d4af37] mb-1 font-bold">
                <span>✦ Ancient Ritual (0%)</span>
                <span className="text-white">Transformation: {morphValue}%</span>
                <span>Modern Cellular World 📱 (100%)</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={morphValue}
                onChange={handleSliderChange}
                className="w-full accent-[#d4af37] h-2 bg-[#2d2117] rounded-none cursor-pointer"
              />
            </div>

            {/* Dynamic Comparison Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
              {mappings.map((m, idx) => (
                <div
                  key={idx}
                  className="p-2.5 bg-[#1b1510] border border-[#38291b] rounded flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{morphValue < 50 ? m.fantasyIcon : m.telecomIcon}</span>
                      <span className="text-xs font-serif font-bold text-[#f5eedc] uppercase">
                        {morphValue < 50 ? m.fantasy : m.telecom}
                      </span>
                    </div>
                    <span className="text-[9px] font-mono text-[#a89680]">
                      {morphValue < 50 ? 'Ancient Lore' : 'Modern Telecom'}
                    </span>
                  </div>
                  <p className="text-[11px] font-sans text-[#a39480] leading-tight">{m.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: LIVE CDMA INTERACTIVE SIMULATOR */}
        {activeTab === 'simulator' && (
          <div className="space-y-4">
            <div className="p-3 bg-[#1c1611] border-2 border-[#382a1d] rounded">
              <label className="text-xs font-mono text-[#d4af37] uppercase tracking-wider block mb-1 font-bold">
                1. Transmit Custom Message Across the Airwaves:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={16}
                  value={customBitMessage}
                  onChange={e => setCustomBitMessage(e.target.value.toUpperCase())}
                  className="flex-1 bg-[#0f0c09] border border-[#3d2f21] px-3 py-1.5 text-xs font-mono text-white rounded uppercase"
                  placeholder="TYPE MESSAGE..."
                />
                <button
                  type="button"
                  onClick={() => {
                    audioSystem.playHarmonicResonance();
                    setCustomBitMessage('CDMA SPECTRUM OK');
                  }}
                  className="px-3 py-1 bg-[#2b2118] hover:bg-[#3d2e20] text-xs font-serif border border-[#4a3826] cursor-pointer"
                >
                  Preset Message
                </button>
              </div>
            </div>

            {/* Receiver Channel Tuning */}
            <div className="p-3 bg-[#1c1611] border-2 border-[#382a1d] rounded">
              <div className="text-xs font-mono text-[#d4af37] uppercase tracking-wider mb-2 font-bold">
                2. Select Receiver Correlator Code:
              </div>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {['Channel 1 (Sylas)', 'Channel 2 (Rowan)', 'Channel 3 (Vesper)', 'Channel 4 (Ignis)'].map((ch, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      audioSystem.playButtonClick();
                      setSelectedUserChannel(i);
                    }}
                    className={`p-2 border text-xs font-serif cursor-pointer ${
                      selectedUserChannel === i
                        ? 'bg-[#d4af37] text-black font-bold border-white'
                        : 'bg-[#140e0a] text-[#b09e86] border-[#291f16] hover:text-white'
                    }`}
                  >
                    {ch}
                  </button>
                ))}
              </div>

              {/* Decoded Stream Verification */}
              <div className="bg-[#0b100d] border border-[#1b3d26] p-3 rounded font-mono text-xs text-[#a7f3d0] space-y-1">
                <div className="flex justify-between">
                  <span>CARRIER FREQUENCY: 1900 MHz (Synchronous CDMA)</span>
                  <span className="text-[#38bdf8] font-bold">BER: 0.000% (ZERO CROSS-TALK)</span>
                </div>
                <div className="text-white text-sm font-bold mt-1">
                  RECOVERED PACKET: <span className="text-[#34d399]">"{customBitMessage}"</span>
                </div>
                <div className="text-[10px] text-[#789c84]">
                  Proof: All 4 channels were superposed simultaneously into S(t). Receiver multiplied by Walsh sequence W({selectedUserChannel + 1}), eliminating other 3 users via orthogonality.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: OFFICIAL PATENT SCROLL & CERTIFICATE */}
        {activeTab === 'patent' && (
          <div className="bg-[#e4d8c2] text-[#1c1610] p-5 sm:p-6 border-4 border-[#332417] shadow-inner font-serif">
            <div className="text-center border-b-2 border-[#2b1f14] pb-3 mb-4">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#786148] block">
                Royal Telecommunications Bureau · Special Declassification
              </span>
              <h3 className="text-2xl font-bold uppercase tracking-wider text-[#140e08]">
                Certificate of Master Cryptographer
              </h3>
              <span className="text-xs italic text-[#54412d]">
                Granted to the Tower Apprentice for mastering Code Division Multiple Access
              </span>
            </div>

            <p className="text-xs leading-relaxed text-[#291f17] mb-4">
              "Be it known to all kingdoms and laboratories across history: The bearer of this scroll has 
              unravelled the enigma of the four chambers. They have proven that voices need not take turns in time 
              (TDMA) nor divide into separate colors of frequency (FDMA). Through the beauty of orthogonal 
              sequences, all beings may speak together, in unison, in one infinite choir."
            </p>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono border-t border-[#8f7e65] pt-3 text-[#453625]">
              <div>
                <strong>DISCOVERY:</strong> Orthogonal Spreading Codes<br />
                <strong>APPLICATION:</strong> 3G/4G, GPS, Deep Space Network
              </div>
              <div className="text-right">
                <strong>DATE:</strong> 1895-CDMA<br />
                <strong>STATUS:</strong> Restored & Declassified
              </div>
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 mt-4 border-t-2 border-[#382b1e]">
          <button
            type="button"
            onClick={() => {
              audioSystem.playButtonClick();
              onCredits();
            }}
            className="w-full sm:w-auto px-4 py-2 bg-[#261e16] hover:bg-[#382d21] text-[#ded4be] font-serif text-xs uppercase tracking-wider border border-[#3d2e20] cursor-pointer"
          >
            Roll Credits
          </button>

          <button
            type="button"
            onClick={() => {
              audioSystem.playButtonClick();
              onReplay();
            }}
            className="w-full sm:w-auto px-6 py-2.5 bg-[#d4af37] hover:bg-[#fae7b5] text-[#120c06] font-serif text-xs uppercase tracking-widest font-bold border-2 border-[#0a0705] cursor-pointer shadow-[0_0_15px_rgba(212,175,55,0.4)] transition-all active:scale-98"
          >
            ✦ Replay The Forgotten Signal ✦
          </button>
        </div>
      </div>
    </div>
  );
};
