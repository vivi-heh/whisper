/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { audioSystem } from '../game/AudioSystem';
import { OwlPortrait } from './OwlPortrait';

interface OpeningSequenceProps {
  onComplete: () => void;
  onSkip: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
}

export const OpeningSequence: React.FC<OpeningSequenceProps> = ({ onComplete, onSkip }) => {
  const [stage, setStage] = useState<number>(0);
  const [isNarrating, setIsNarrating] = useState<boolean>(false);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const stages = [
    {
      title: 'ACT I · THE THRESHOLD OF ECHOES',
      heading: 'The Silent Spire Awakens',
      lore: 'For three centuries, the grand communication tower of the Four Archmages stood dormant against the cold mountain wind.',
      speech: 'For three centuries, the grand communication tower of the Four Archmages stood dormant against the cold mountain wind.',
      beaconCount: 0,
      doorOpenPercent: 0.0,
      zoom: 1.0,
    },
    {
      title: 'ACT I · THE HARMONIC LEGACY',
      heading: 'Four Voices in One Sky',
      lore: 'Sylas of Azure, Rowan of Emerald, Vesper of Amethyst, and Ignis of Ruby. Each spoke on their own orthogonal Walsh wave. Different messages, shared frequency, perfect silence.',
      speech: 'Sylas of Azure, Rowan of Emerald, Vesper of Amethyst, and Ignis of Ruby. Each spoke on their own orthogonal Walsh wave. Different messages, shared frequency, perfect silence.',
      beaconCount: 4,
      doorOpenPercent: 0.35,
      zoom: 1.15,
    },
    {
      title: 'ACT I · THE CROSSING',
      heading: 'Enter the Heart of the Signal',
      lore: 'The ancient stone portcullis groans as the counterweights release. Step across the iron threshold and rekindle the lost transmission.',
      speech: 'The ancient stone portcullis groans as the counterweights release. Step across the iron threshold and rekindle the lost transmission.',
      beaconCount: 4,
      doorOpenPercent: 1.0,
      zoom: 1.3,
    },
  ];

  // Narration speech
  const speakNarration = (text: string) => {
    audioSystem.playOwlVoiceUtterance(Math.ceil(text.split(' ').length / 3));

    if (!voiceEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.pitch = 0.72;
      utterance.rate = 0.85;
      utterance.volume = 0.95;

      const voices = window.speechSynthesis.getVoices();
      const voice =
        voices.find(v => v.lang.startsWith('en') && (v.name.includes('Male') || v.name.includes('Natural') || v.name.includes('George'))) ||
        voices.find(v => v.lang.startsWith('en'));
      if (voice) utterance.voice = voice;

      utterance.onstart = () => setIsNarrating(true);
      utterance.onend = () => setIsNarrating(false);
      utterance.onerror = () => setIsNarrating(false);

      window.speechSynthesis.speak(utterance);
    } catch {
      setIsNarrating(false);
    }
  };

  useEffect(() => {
    audioSystem.startAtmosphericMusic();
    audioSystem.playCinematicBoom();
  }, []);

  useEffect(() => {
    const current = stages[stage];
    if (current) {
      const timer = setTimeout(() => {
        speakNarration(current.speech);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [stage, voiceEnabled]);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Canvas Cinematic Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let time = 0;
    const particles: Particle[] = [];

    // Initialize ambient embers
    for (let i = 0; i < 75; i++) {
      particles.push({
        x: Math.random() * 1280,
        y: Math.random() * 720,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -0.4 - Math.random() * 0.9,
        size: 1 + Math.random() * 2.5,
        alpha: 0.1 + Math.random() * 0.6,
        color: Math.random() < 0.5 ? '#d4af37' : '#38bdf8',
      });
    }

    const render = () => {
      time += 0.016;
      const w = (canvas.width = canvas.clientWidth);
      const h = (canvas.height = canvas.clientHeight);

      ctx.clearRect(0, 0, w, h);

      // 1. Dark Atmospheric Night Sky Gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
      skyGrad.addColorStop(0, '#040306');
      skyGrad.addColorStop(0.55, '#0b080d');
      skyGrad.addColorStop(1, '#181216');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h);

      // 2. Distant Moon
      ctx.fillStyle = '#faf0d7';
      ctx.beginPath();
      ctx.arc(w * 0.78, h * 0.22, 38, 0, Math.PI * 2);
      ctx.fill();
      // Moon inner shadow for antique crescent
      ctx.fillStyle = '#0a080e';
      ctx.beginPath();
      ctx.arc(w * 0.78 - 14, h * 0.22 - 6, 36, 0, Math.PI * 2);
      ctx.fill();

      // Moon halo glow
      const moonGlow = ctx.createRadialGradient(w * 0.78, h * 0.22, 20, w * 0.78, h * 0.22, 110);
      moonGlow.addColorStop(0, 'rgba(250, 240, 215, 0.15)');
      moonGlow.addColorStop(1, 'rgba(250, 240, 215, 0)');
      ctx.fillStyle = moonGlow;
      ctx.beginPath();
      ctx.arc(w * 0.78, h * 0.22, 110, 0, Math.PI * 2);
      ctx.fill();

      // 3. Mountain Silhouettes in background
      ctx.fillStyle = '#080608';
      ctx.beginPath();
      ctx.moveTo(0, h * 0.85);
      ctx.lineTo(w * 0.2, h * 0.6);
      ctx.lineTo(w * 0.45, h * 0.75);
      ctx.lineTo(w * 0.75, h * 0.55);
      ctx.lineTo(w, h * 0.78);
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      ctx.fill();

      const cx = w * 0.5;
      const baseGroundY = h * 0.88;
      const currentStage = stages[stage];
      const doorOpen = currentStage.doorOpenPercent;

      // 4. Grand Tower Silhouette with Gothic Buttresses
      ctx.fillStyle = '#110d10';
      ctx.strokeStyle = '#050304';
      ctx.lineWidth = 3;

      // Main central tower body
      ctx.beginPath();
      ctx.moveTo(cx - 110, baseGroundY);
      ctx.lineTo(cx - 75, h * 0.35);
      ctx.lineTo(cx - 50, h * 0.2);
      ctx.lineTo(cx + 50, h * 0.2);
      ctx.lineTo(cx + 75, h * 0.35);
      ctx.lineTo(cx + 110, baseGroundY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Tower Steeple Apex
      ctx.fillStyle = '#181216';
      ctx.beginPath();
      ctx.moveTo(cx - 50, h * 0.2);
      ctx.lineTo(cx, h * 0.08);
      ctx.lineTo(cx + 50, h * 0.2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Apex Quartz Sphere
      const apexOrbGlow = ctx.createRadialGradient(cx, h * 0.08, 2, cx, h * 0.08, 45);
      apexOrbGlow.addColorStop(0, 'rgba(250, 240, 215, 0.9)');
      apexOrbGlow.addColorStop(0.4, 'rgba(212, 175, 55, 0.5)');
      apexOrbGlow.addColorStop(1, 'rgba(212, 175, 55, 0)');
      ctx.fillStyle = apexOrbGlow;
      ctx.beginPath();
      ctx.arc(cx, h * 0.08, 45, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fae7b5';
      ctx.beginPath();
      ctx.arc(cx, h * 0.08, 9, 0, Math.PI * 2);
      ctx.fill();

      // 5. Four Harmonic Transmitter Beacons (Ignited based on stage)
      const beaconColors = ['#38bdf8', '#34d399', '#c084fc', '#f87171'];
      const beaconNames = ['Sylas', 'Rowan', 'Vesper', 'Ignis'];
      const beaconXOffsets = [-150, -85, 85, 150];

      if (currentStage.beaconCount > 0) {
        for (let b = 0; b < currentStage.beaconCount; b++) {
          const bx = cx + beaconXOffsets[b];
          const by = h * 0.38 + Math.abs(beaconXOffsets[b]) * 0.15;
          const col = beaconColors[b];

          // Pillar spire
          ctx.fillStyle = '#0f0c0e';
          ctx.fillRect(bx - 6, by, 12, baseGroundY - by);
          ctx.strokeRect(bx - 6, by, 12, baseGroundY - by);

          // Glowing Transmitter Crystal
          ctx.fillStyle = col;
          ctx.beginPath();
          ctx.arc(bx, by, 6 + Math.sin(time * 4 + b) * 1.5, 0, Math.PI * 2);
          ctx.fill();

          // Beaming coherent ray converging toward apex quartz sphere
          ctx.strokeStyle = col;
          ctx.lineWidth = 2.5 + Math.sin(time * 5 + b);
          ctx.beginPath();
          ctx.moveTo(bx, by);
          ctx.lineTo(cx, h * 0.08);
          ctx.stroke();

          // Transmitter Label
          ctx.fillStyle = col;
          ctx.font = 'bold 9px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(beaconNames[b], bx, by - 12);
        }

        // Composite Signal Vortex Rings around Apex
        for (let ring = 0; ring < 3; ring++) {
          const rRadius = 24 + ring * 18 + Math.sin(time * 3 + ring) * 5;
          ctx.strokeStyle = `rgba(212, 175, 55, ${0.4 - ring * 0.1})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.ellipse(cx, h * 0.08, rRadius, rRadius * 0.35, time * 0.5 + ring, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // 6. Massive Ground Portal Arch & Animated Opening Portcullis
      const doorW = 90;
      const doorH = 140;
      const doorX = cx - doorW / 2;
      const doorY = baseGroundY - doorH;

      // Stone portal frame
      ctx.fillStyle = '#1c1619';
      ctx.beginPath();
      ctx.moveTo(doorX - 16, baseGroundY);
      ctx.lineTo(doorX - 16, doorY + 20);
      ctx.quadraticCurveTo(cx, doorY - 25, doorX + doorW + 16, doorY + 20);
      ctx.lineTo(doorX + doorW + 16, baseGroundY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Interior void behind door
      ctx.fillStyle = '#030203';
      ctx.beginPath();
      ctx.moveTo(doorX, baseGroundY);
      ctx.lineTo(doorX, doorY + 20);
      ctx.quadraticCurveTo(cx, doorY - 10, doorX + doorW, doorY + 20);
      ctx.lineTo(doorX + doorW, baseGroundY);
      ctx.closePath();
      ctx.fill();

      // Golden Light Bursting from Open Threshold
      if (doorOpen > 0.01) {
        const lightGrad = ctx.createRadialGradient(cx, doorY + doorH * 0.6, 10, cx, doorY + doorH * 0.6, 220 * doorOpen);
        lightGrad.addColorStop(0, `rgba(250, 235, 185, ${0.95 * doorOpen})`);
        lightGrad.addColorStop(0.35, `rgba(212, 175, 55, ${0.7 * doorOpen})`);
        lightGrad.addColorStop(0.7, `rgba(56, 189, 248, ${0.3 * doorOpen})`);
        lightGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = lightGrad;
        ctx.beginPath();
        ctx.moveTo(cx - 30 * doorOpen, doorY + 10);
        ctx.lineTo(cx - 240 * doorOpen, baseGroundY + 45);
        ctx.lineTo(cx + 240 * doorOpen, baseGroundY + 45);
        ctx.lineTo(cx + 30 * doorOpen, doorY + 10);
        ctx.closePath();
        ctx.fill();
      }

      // Moving Door Leaves
      const leafW = doorW / 2;
      const leafScale = 1 - doorOpen * 0.85;

      // Left Leaf
      ctx.save();
      ctx.translate(doorX, 0);
      ctx.scale(leafScale, 1);
      ctx.fillStyle = '#261e20';
      ctx.fillRect(0, doorY, leafW, doorH);
      ctx.strokeStyle = '#0a0809';
      ctx.lineWidth = 2;
      ctx.strokeRect(0, doorY, leafW, doorH);
      // Iron bands
      ctx.fillStyle = '#110d0e';
      ctx.fillRect(0, doorY + 25, leafW, 8);
      ctx.fillRect(0, doorY + 80, leafW, 8);
      ctx.restore();

      // Right Leaf
      ctx.save();
      ctx.translate(doorX + doorW, 0);
      ctx.scale(leafScale, 1);
      ctx.fillStyle = '#261e20';
      ctx.fillRect(-leafW, doorY, leafW, doorH);
      ctx.strokeStyle = '#0a0809';
      ctx.lineWidth = 2;
      ctx.strokeRect(-leafW, doorY, leafW, doorH);
      // Iron bands
      ctx.fillStyle = '#110d0e';
      ctx.fillRect(-leafW, doorY + 25, leafW, 8);
      ctx.fillRect(-leafW, doorY + 80, leafW, 8);
      ctx.restore();

      // 7. Ground Cobblestones
      ctx.fillStyle = '#120d10';
      ctx.fillRect(0, baseGroundY, w, h - baseGroundY);
      ctx.strokeStyle = '#070506';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, baseGroundY);
      ctx.lineTo(w, baseGroundY);
      ctx.stroke();

      // 8. Apprentice Silhouette Standing Before Portal
      const appX = cx - 55;
      const appY = baseGroundY + 15;
      ctx.fillStyle = '#060405';

      // Robe body
      ctx.beginPath();
      ctx.moveTo(appX - 10, appY);
      ctx.lineTo(appX + 10, appY);
      ctx.lineTo(appX + 6, appY - 45);
      ctx.lineTo(appX - 6, appY - 45);
      ctx.closePath();
      ctx.fill();

      // Head with wizard hood
      ctx.beginPath();
      ctx.arc(appX, appY - 52, 9, 0, Math.PI * 2);
      ctx.fill();

      // Tall wooden staff
      ctx.strokeStyle = '#2b2019';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(appX + 14, appY + 2);
      ctx.lineTo(appX + 14, appY - 65);
      ctx.stroke();

      // Staff crystal head
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(appX + 14, appY - 65, 4.5, 0, Math.PI * 2);
      ctx.fill();

      // 9. Render & Update Drifting Embers
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < 0) {
          p.y = h;
          p.x = Math.random() * w;
        }
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1.0;

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [stage]);

  const handleNextStage = () => {
    audioSystem.playButtonClick();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    if (stage < stages.length - 1) {
      if (stage === 0) {
        audioSystem.playHarmonicResonance();
      } else if (stage === 1) {
        audioSystem.playStoneDoorOpen();
      }
      setStage(prev => prev + 1);
    } else {
      audioSystem.playStoneDoorOpen();
      onComplete();
    }
  };

  const handleSkip = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    audioSystem.playButtonClick();
    onSkip();
  };

  const current = stages[stage];

  return (
    <div className="absolute inset-0 z-40 flex flex-col justify-between bg-[#070508] pointer-events-auto select-none overflow-hidden">
      {/* 60 FPS Atmospheric Tower Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block z-0" />

      {/* Top Header Bar */}
      <div className="relative z-10 border-b border-[#241c22] px-4 sm:px-6 py-2.5 sm:py-3 flex justify-between items-center w-full bg-[#0a0709]/85 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="text-[#d4af37] text-xs">✦</span>
          <span className="font-serif text-[11px] sm:text-xs tracking-widest uppercase text-[#c2b4a5]">
            {current.title}
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Spoken Voice Toggle */}
          <button
            type="button"
            onClick={() => {
              if (voiceEnabled) {
                if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                  window.speechSynthesis.cancel();
                }
                setIsNarrating(false);
              } else {
                speakNarration(current.speech);
              }
              setVoiceEnabled(prev => !prev);
            }}
            className="px-2.5 py-1 bg-[#1a141a] hover:bg-[#282028] border border-[#2b2029] text-[#b8ab94] text-[10px] sm:text-xs font-serif flex items-center gap-1.5 cursor-pointer rounded"
            title="Toggle Voiceover Narration"
          >
            <span>{voiceEnabled ? '🔊' : '🔇'}</span>
            <span className="hidden sm:inline">{voiceEnabled ? 'Voice On' : 'Voice Muted'}</span>
          </button>

          <button
            type="button"
            onClick={handleSkip}
            className="px-3 py-1 bg-[#1a151b] hover:bg-[#2a202a] border border-[#0d0a0e] text-[#9e8f7a] hover:text-[#dcd2bb] text-[10px] sm:text-xs font-serif uppercase tracking-wider cursor-pointer rounded"
          >
            Skip Opening →
          </button>
        </div>
      </div>

      {/* Center Speaking Indicator (Subtle Owl Sigil) */}
      <div className="relative z-10 my-auto flex flex-col items-center pointer-events-none">
        <div className="opacity-75 transition-transform hover:scale-105">
          <OwlPortrait size={48} />
        </div>
        {isNarrating && (
          <span className="mt-1.5 text-[9px] font-mono tracking-widest text-[#d4af37] uppercase flex items-center gap-1 animate-pulse">
            <span>●</span>
            <span>The Spire Whispers</span>
          </span>
        )}
      </div>

      {/* Bottom Cinematic Narrative Bar */}
      <div className="relative z-10 border-t-2 border-[#261c24] bg-[#0d0a0e]/95 backdrop-blur-md p-4 sm:p-6 shadow-2xl">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-5">
          <div className="text-center sm:text-left flex-1">
            <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-widest text-[#d4af37] block mb-0.5 font-bold">
              {current.heading}
            </span>
            <p className="text-xs sm:text-sm md:text-base font-serif italic text-[#f0e6d6] leading-relaxed mb-1">
              "{current.lore}"
            </p>
          </div>

          <div className="flex flex-col items-center gap-2 shrink-0 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleNextStage}
              className="w-full sm:w-auto px-6 py-2.5 bg-[#d4af37] hover:bg-[#fae7b5] text-[#120c06] font-serif text-xs font-bold uppercase tracking-widest cursor-pointer shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all active:scale-98 rounded-none border border-[#0c0906]"
            >
              {stage < stages.length - 1 ? 'Next Sequence ➔' : 'Cross Threshold into Chamber 1 ➔'}
            </button>

            {/* Stage Step Progress Indicator */}
            <div className="flex gap-2">
              {stages.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === stage ? 'bg-[#d4af37] w-6' : 'bg-[#3b2b36] w-2.5'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
