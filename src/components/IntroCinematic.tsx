/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { audioSystem } from '../game/AudioSystem';
import { OwlPortrait } from './OwlPortrait';

interface IntroCinematicProps {
  onComplete: () => void;
  onSkip: () => void;
}

export const IntroCinematic: React.FC<IntroCinematicProps> = ({ onComplete, onSkip }) => {
  const [step, setStep] = useState<number>(0);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const dialogue = [
    {
      speaker: 'Mr. Owl',
      text: 'Welcome.',
      sub: 'You stand before the ancient Crystal Communication Tower.',
      speechText: 'Welcome. You stand before the ancient Crystal Communication Tower.',
    },
    {
      speaker: 'Mr. Owl',
      text: 'This tower once carried the voices of every wizard across the entire kingdom.',
      sub: 'They could speak simultaneously without drowning one another out.',
      speechText: 'This tower once carried the voices of every wizard across the entire kingdom. They could speak simultaneously without drowning one another out.',
    },
    {
      speaker: 'Mr. Owl',
      text: 'But now... the voices are lost.',
      sub: 'The seals have been scattered, and the towers have fallen silent.',
      speechText: 'But now... the voices are lost. The seals have been scattered, and the towers have fallen silent.',
    },
    {
      speaker: 'Mr. Owl',
      text: 'Step forward, young apprentice. Unravel the mystery of the forgotten signal.',
      sub: 'The destiny of the kingdom’s communications rests in your hands.',
      speechText: 'Step forward, young apprentice. Unravel the mystery of the forgotten signal. The destiny of the kingdom’s communications rests in your hands.',
    },
  ];

  // Speak the text using Web Speech API + Web Audio Formants
  const speakOwlVoice = (textToSpeak: string) => {
    // Web Audio Formant speech layer
    audioSystem.playOwlVoiceUtterance(Math.ceil(textToSpeak.split(' ').length / 2));

    if (!voiceEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    try {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utteranceRef.current = utterance;

      // Deep, measured, eerie elder owl cadence
      utterance.pitch = 0.65;
      utterance.rate = 0.82;
      utterance.volume = 1.0;

      // Attempt to pick a rich English voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice =
        voices.find(v => v.lang.startsWith('en') && (v.name.includes('Male') || v.name.includes('David') || v.name.includes('George') || v.name.includes('Natural'))) ||
        voices.find(v => v.lang.startsWith('en'));

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    } catch {
      setIsSpeaking(false);
    }
  };

  useEffect(() => {
    audioSystem.startAtmosphericMusic();
    audioSystem.playOwlHoot();
  }, []);

  // Speak whenever step changes
  useEffect(() => {
    const currentDialogue = dialogue[step];
    if (currentDialogue) {
      // Delay slightly so atmospheric audio initializes cleanly
      const timer = setTimeout(() => {
        speakOwlVoice(currentDialogue.speechText);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [step, voiceEnabled]);

  // Clean up speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleNext = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    audioSystem.playButtonClick();
    if (step < dialogue.length - 1) {
      setStep(prev => prev + 1);
    } else {
      audioSystem.playStoneDoorOpen();
      onComplete();
    }
  };

  const handleSkipPrologue = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    audioSystem.playButtonClick();
    onSkip();
  };

  const current = dialogue[step];

  return (
    <div className="absolute inset-0 z-40 flex flex-col justify-between bg-[#080605] pointer-events-auto select-none overflow-hidden">
      {/* Top Header Bar */}
      <div className="border-b border-[#211b16] px-4 sm:px-6 py-2.5 sm:py-3 flex justify-between items-center w-full z-10 bg-[#0e0b09]">
        <div className="flex items-center gap-2">
          <span className="text-[#d4af37] text-xs">✦</span>
          <span className="font-serif text-[11px] sm:text-xs tracking-widest uppercase text-[#9e8f7a]">
            Prologue · The Arrival
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Voice Toggle */}
          <button
            type="button"
            onClick={() => {
              if (voiceEnabled) {
                if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                  window.speechSynthesis.cancel();
                }
                setIsSpeaking(false);
              } else {
                speakOwlVoice(current.speechText);
              }
              setVoiceEnabled(prev => !prev);
            }}
            className="px-2.5 py-1 bg-[#1a1410] hover:bg-[#282019] border border-[#2b2016] text-[#b8ab94] text-[10px] sm:text-xs font-serif flex items-center gap-1.5 cursor-pointer rounded"
            title="Toggle Mr. Owl Spoken Voice"
          >
            <span>{voiceEnabled ? '🔊' : '🔇'}</span>
            <span className="hidden sm:inline">{voiceEnabled ? 'Owl Voice On' : 'Voice Muted'}</span>
          </button>

          <button
            type="button"
            onClick={handleSkipPrologue}
            className="px-3 py-1 bg-[#1a1512] hover:bg-[#28211b] border border-[#0d0a08] text-[#9e8f7a] hover:text-[#dcd2bb] text-[10px] sm:text-xs font-serif uppercase tracking-wider cursor-pointer rounded"
          >
            Skip Prologue →
          </button>
        </div>
      </div>

      {/* Center Silhouette Portrait */}
      <div className="flex-1 flex flex-col items-center justify-center text-center p-3 sm:p-6 my-auto">
        <div className="relative mb-3 sm:mb-4">
          <OwlPortrait size={window.innerWidth < 640 ? 76 : 104} />
          {/* Speaking Pulsing Rings */}
          {isSpeaking && (
            <div className="absolute inset-0 rounded-full border border-[#d4af37]/60 animate-ping pointer-events-none" />
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm font-serif uppercase tracking-widest text-[#d4af37] font-bold">
            Mr. Owl
          </span>
          {isSpeaking && (
            <span className="flex items-center gap-1 text-[10px] font-mono text-[#86efac] animate-pulse">
              <span>●</span>
              <span>Speaking</span>
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => speakOwlVoice(current.speechText)}
          className="mt-2 text-[10px] font-mono text-[#786958] hover:text-[#d4af37] underline cursor-pointer"
        >
          Replay Voice Line ↻
        </button>
      </div>

      {/* Bottom Subtitle Bar (Rusty Lake Letterbox Style) */}
      <div className="border-t-2 border-[#1c1611] bg-[#110e0c] p-4 sm:p-6 shadow-2xl z-10">
        <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <div className="text-center sm:text-left flex-1">
            <span className="text-[9px] sm:text-[10px] font-serif uppercase tracking-widest text-[#8a7762] block mb-0.5">
              {current.speaker}
            </span>
            <h3 className="text-sm sm:text-base md:text-lg font-serif italic text-[#e0d6c1] leading-relaxed mb-1">
              "{current.text}"
            </h3>
            <p className="text-[11px] sm:text-xs font-serif text-[#8f7e6a]">
              {current.sub}
            </p>
          </div>

          <div className="flex flex-col items-center gap-2 shrink-0 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleNext}
              className="w-full sm:w-auto px-6 py-2.5 bg-[#2b2118] hover:bg-[#3d3024] border-2 border-[#0c0907] text-[#ded4be] font-serif text-xs font-bold uppercase tracking-widest cursor-pointer shadow-md transition-all active:scale-98 rounded"
            >
              {step < dialogue.length - 1 ? 'Continue →' : 'Enter Chamber 1 →'}
            </button>
            <div className="flex gap-1.5">
              {dialogue.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === step ? 'bg-[#d4af37] w-5' : 'bg-[#33281e] w-2'
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
