/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  GameScene,
  PlayerState,
  InventoryItem,
  InteractiveObject,
  NotebookPage,
} from './types/game';
import {
  ALL_ROOMS,
  NOTEBOOK_PAGES,
  ROOM_1,
  ROOM_2,
  ROOM_3,
  ROOM_4,
  RoomData,
} from './game/RoomDefinitions';
import { CanvasRenderer, ROOM_WIDTH, ROOM_HEIGHT } from './game/CanvasRenderer';
import { audioSystem } from './game/AudioSystem';
import { MainMenu } from './components/MainMenu';
import { IntroCinematic } from './components/IntroCinematic';
import { InventoryBar } from './components/InventoryBar';
import { DialogueBox } from './components/DialogueBox';
import { LessonPopup } from './components/LessonPopup';
import { NotebookModal } from './components/NotebookModal';
import { OwlCompanion } from './components/OwlCompanion';
import { FinalCinematicReveal } from './components/FinalCinematicReveal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { PauseModal } from './components/PauseModal';
import { SettingsModal } from './components/SettingsModal';
import { CreditsModal } from './components/CreditsModal';
import { ClockPuzzleModal } from './components/ClockPuzzleModal';
import { PedestalPuzzleModal } from './components/PedestalPuzzleModal';
import { CabinetLockModal } from './components/CabinetLockModal';
import { InterferenceModal } from './components/InterferenceModal';
import { MasterMatrixModal } from './components/MasterMatrixModal';
import { InspectorLoupeModal } from './components/InspectorLoupeModal';
import { PrismRefractorModal } from './components/PrismRefractorModal';
import { CelestialAltarModal } from './components/CelestialAltarModal';
import { StarrySkylightModal } from './components/StarrySkylightModal';
import { SolutionsModal } from './components/SolutionsModal';
import { RotateOrientationPrompt } from './components/RotateOrientationPrompt';
import { OpeningSequence } from './components/OpeningSequence';
import { TouchControls } from './components/TouchControls';

export const ALL_FIVE_JEWELS: InventoryItem[] = [
  {
    id: 'seal_azure',
    name: 'Azure Jewel (Sylas)',
    description: 'Archmage Sylas’s harmonic Walsh seal [1, 1, 1, 1].',
    icon: '💎',
    color: '#38bdf8',
    walshCode: [1, 1, 1, 1],
  },
  {
    id: 'seal_emerald',
    name: 'Emerald Jewel (Rowan)',
    description: 'Archdruid Rowan’s harmonic Walsh seal [1, -1, 1, -1].',
    icon: '🌲',
    color: '#34d399',
    walshCode: [1, -1, 1, -1],
  },
  {
    id: 'seal_amethyst',
    name: 'Amethyst Jewel (Vesper)',
    description: 'Mystic Vesper’s harmonic Walsh seal [1, 1, -1, -1].',
    icon: '🔮',
    color: '#c084fc',
    walshCode: [1, 1, -1, -1],
  },
  {
    id: 'seal_ruby',
    name: 'Ruby Jewel (Ignis)',
    description: 'Pyromancer Ignis’s harmonic Walsh seal [1, -1, -1, 1].',
    icon: '🔥',
    color: '#f87171',
    walshCode: [1, -1, -1, 1],
  },
  {
    id: 'seal_gold',
    name: 'Golden Jewel (Aurelius)',
    description: 'Solar Sage Aurelius’s harmonic Walsh seal [-1, 1, 1, -1].',
    icon: '☀️',
    color: '#fbbf24',
    walshCode: [-1, 1, 1, -1],
  },
];

export default function App() {
  const [scene, setScene] = useState<GameScene>('TITLE_MENU');
  const [currentRoomIndex, setCurrentRoomIndex] = useState<number>(0);
  const currentRoom: RoomData = ALL_ROOMS[currentRoomIndex] ?? ROOM_1;

  // Persistence State
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [notebookPages, setNotebookPages] = useState<NotebookPage[]>(NOTEBOOK_PAGES);
  const [hasUnreadNotebook, setHasUnreadNotebook] = useState<boolean>(false);
  const [highestRoomReached, setHighestRoomReached] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Active Modals & Overlays
  const [showHowToPlay, setShowHowToPlay] = useState<boolean>(false);
  const [showNotebook, setShowNotebook] = useState<boolean>(false);
  const [showSolutions, setShowSolutions] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showCredits, setShowCredits] = useState<boolean>(false);
  const [showPause, setShowPause] = useState<boolean>(false);
  const [activeLesson, setActiveLesson] = useState<RoomData['lesson'] | null>(null);
  const [activeDialogue, setActiveDialogue] = useState<{ speaker: string; text: string } | null>(null);

  // Helper: Automatically grant all 5 jewels to satchel
  const grantAllJewels = () => {
    audioSystem.playHarmonicResonance();
    setInventory(prev => {
      const existingIds = new Set(prev.map(i => i.id));
      const toAdd = ALL_FIVE_JEWELS.filter(j => !existingIds.has(j.id));
      return [...prev, ...toAdd];
    });
  };

  // Interactive Puzzle Modals
  const [showClockPuzzle, setShowClockPuzzle] = useState<boolean>(false);
  const [showCabinetPuzzle, setShowCabinetPuzzle] = useState<boolean>(false);
  const [showPrismPuzzle, setShowPrismPuzzle] = useState<boolean>(false);
  const [showInterferencePuzzle, setShowInterferencePuzzle] = useState<boolean>(false);
  const [showCelestialAltarPuzzle, setShowCelestialAltarPuzzle] = useState<boolean>(false);
  const [showStarrySkylightPuzzle, setShowStarrySkylightPuzzle] = useState<boolean>(false);
  const [showMasterMatrixPuzzle, setShowMasterMatrixPuzzle] = useState<boolean>(false);
  const [showLoupeModal, setShowLoupeModal] = useState<boolean>(false);

  const [activePedestalData, setActivePedestalData] = useState<{
    id: string;
    name: string;
    wizard: string;
    targetCode: number[];
    sealId: string;
    sealName: string;
    color: string;
  } | null>(null);

  // Owl Companion & Hints
  const [showOwl, setShowOwl] = useState<boolean>(false);
  const [owlHintIndex, setOwlHintIndex] = useState<number>(0);
  const lastInteractionTime = useRef<number>(Date.now());

  // Room Puzzle Progress Flags
  const [roomFlags, setRoomFlags] = useState<Record<string, boolean>>({});

  // Canvas & Mutable Character State (Held in ref to eliminate 60 FPS React re-renders)
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<CanvasRenderer | null>(null);

  const playerRef = useRef<PlayerState>({
    x: 260,
    y: 580,
    vx: 0,
    vy: 0,
    facing: 'right',
    action: 'idle',
    animTimer: 0,
    footstepTimer: 0,
  });

  const [hoveredObjectId, setHoveredObjectId] = useState<string | null>(null);
  const hoveredObjectIdRef = useRef<string | null>(null);
  hoveredObjectIdRef.current = hoveredObjectId;

  const currentRoomRef = useRef<RoomData>(currentRoom);
  currentRoomRef.current = currentRoom;

  const roomFlagsRef = useRef<Record<string, boolean>>(roomFlags);
  roomFlagsRef.current = roomFlags;

  const sceneRef = useRef<GameScene>(scene);
  sceneRef.current = scene;

  const mouseTarget = useRef<{ x: number; y: number } | null>(null);
  const keysDown = useRef<Record<string, boolean>>({});
  const touchMoveVector = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [nearbyObject, setNearbyObject] = useState<InteractiveObject | null>(null);
  const nearbyObjectIdRef = useRef<string | null>(null);

  // Initialize Canvas & Renderer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    rendererRef.current = new CanvasRenderer(canvas);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // 45s Inactivity Auto-Owl Hint
  useEffect(() => {
    const interval = setInterval(() => {
      if (
        scene.startsWith('ROOM_') &&
        !showOwl &&
        !activeLesson &&
        !showPause &&
        !showNotebook &&
        !showClockPuzzle &&
        !showCabinetPuzzle &&
        !showInterferencePuzzle &&
        !showMasterMatrixPuzzle &&
        !showLoupeModal &&
        !activePedestalData
      ) {
        if (Date.now() - lastInteractionTime.current > 45000) {
          setShowOwl(true);
          audioSystem.playOwlHoot();
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [
    scene,
    showOwl,
    activeLesson,
    showPause,
    showNotebook,
    showClockPuzzle,
    showCabinetPuzzle,
    showInterferencePuzzle,
    showMasterMatrixPuzzle,
    showLoupeModal,
    activePedestalData,
  ]);

  // Buttery-Smooth Continuous Game Loop (No React re-rendering thrash, variable refresh rate friendly)
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const gameLoop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      const p = playerRef.current;
      let moveX = 0;
      let moveY = 0;

      if (keysDown.current['KeyA'] || keysDown.current['ArrowLeft']) moveX -= 1;
      if (keysDown.current['KeyD'] || keysDown.current['ArrowRight']) moveX += 1;
      if (keysDown.current['KeyW'] || keysDown.current['ArrowUp']) moveY -= 1;
      if (keysDown.current['KeyS'] || keysDown.current['ArrowDown']) moveY += 1;

      // Analog Touch Joystick input
      if (touchMoveVector.current.x !== 0 || touchMoveVector.current.y !== 0) {
        moveX += touchMoveVector.current.x;
        moveY += touchMoveVector.current.y;
        mouseTarget.current = null;
      }

      if (mouseTarget.current) {
        const dx = mouseTarget.current.x - p.x;
        const dy = mouseTarget.current.y - p.y;
        const dist = Math.hypot(dx, dy);
        const step = 195 * dt;

        if (dist <= Math.max(step, 6)) {
          p.x = mouseTarget.current.x;
          p.y = mouseTarget.current.y;
          mouseTarget.current = null;
        } else {
          moveX = dx / dist;
          moveY = dy / dist;
        }
      }

      const isWalking = moveX !== 0 || moveY !== 0;
      const speed = 195;

      if (isWalking) {
        lastInteractionTime.current = Date.now();
        const len = Math.hypot(moveX, moveY);
        p.x += (moveX / len) * speed * dt;
        p.y += (moveY / len) * speed * dt;

        if (moveX > 0) p.facing = 'right';
        else if (moveX < 0) p.facing = 'left';

        p.action = 'walk';
        p.animTimer += dt;

        // Footstep sounds & dust particles
        if (p.footstepTimer > 0.3) {
          audioSystem.playFootstep();
          rendererRef.current?.spawnFootstepDust(p.x, p.y);
          p.footstepTimer = 0;
        } else {
          p.footstepTimer += dt;
        }
      } else {
        p.action = 'idle';
        p.animTimer += dt;
      }

      // Strictly bounded within room floorboards
      p.x = Math.max(80, Math.min(ROOM_WIDTH - 80, p.x));
      p.y = Math.max(500, Math.min(ROOM_HEIGHT - 65, p.y));

      // Dynamically detect closest object within interaction distance for Mobile Touch HUD
      let closest: InteractiveObject | null = null;
      let minD = 135;
      for (const obj of currentRoomRef.current.objects) {
        const cx = obj.x;
        const cy = obj.y - obj.height / 2;
        const dist = Math.hypot(p.x - cx, p.y - cy);
        if (dist < minD) {
          minD = dist;
          closest = obj;
        }
      }
      const newNearId = closest ? closest.id : null;
      if (newNearId !== nearbyObjectIdRef.current) {
        nearbyObjectIdRef.current = newNearId;
        setNearbyObject(closest);
      }

      // Render Canvas Scene
      if (rendererRef.current && sceneRef.current.startsWith('ROOM_')) {
        rendererRef.current.render(
          currentRoomRef.current,
          p,
          hoveredObjectIdRef.current,
          { x: 0, y: 0 },
          roomFlagsRef.current,
          dt
        );
      }

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, []);

  const handleTriggerSense = () => {
    audioSystem.playHotspotPulse();
    rendererRef.current?.triggerHotspotPulse();
  };

  // Handle Keyboard Inputs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysDown.current[e.code] = true;
      lastInteractionTime.current = Date.now();

      if (e.code === 'Escape') {
        if (scene.startsWith('ROOM_')) {
          setShowPause(prev => !prev);
        }
      }

      if (e.code === 'Space') {
        e.preventDefault();
        handleTriggerSense();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysDown.current[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [scene]);

  // Mouse move over canvas with accurate spatial ratio transform
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!rendererRef.current) return;
    const { x: mouseX, y: mouseY } = rendererRef.current.screenToWorld(e.clientX, e.clientY);

    const hit = currentRoom.objects.find(obj => {
      const left = obj.x - obj.width / 2;
      const right = obj.x + obj.width / 2;
      const top = obj.y - obj.height;
      const bottom = obj.y;
      return mouseX >= left && mouseX <= right && mouseY >= top && mouseY <= bottom;
    });

    const newHoveredId = hit ? hit.id : null;
    if (newHoveredId !== hoveredObjectIdRef.current) {
      if (newHoveredId) {
        audioSystem.playHoverTick();
      }
      setHoveredObjectId(newHoveredId);
    }
  };

  // Canvas Click with pixel-perfect spatial ratio transform
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    lastInteractionTime.current = Date.now();
    if (!rendererRef.current) return;

    const { x: clickX, y: clickY } = rendererRef.current.screenToWorld(e.clientX, e.clientY);
    rendererRef.current.spawnClickBurst(clickX, clickY);

    const clickedObject = currentRoom.objects.find(obj => {
      const left = obj.x - obj.width / 2;
      const right = obj.x + obj.width / 2;
      const top = obj.y - obj.height;
      const bottom = obj.y;
      return clickX >= left && clickX <= right && clickY >= top && clickY <= bottom;
    });

    if (clickedObject) {
      handleInteractObject(clickedObject);
    } else {
      mouseTarget.current = { x: clickX, y: clickY };
    }
  };

  // Enhanced Canvas Touch handlers for Mobile Phones & Tablets
  const handleCanvasTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!rendererRef.current || e.touches.length === 0) return;
    audioSystem.init();
    audioSystem.resume();
    const touch = e.touches[0];
    lastInteractionTime.current = Date.now();

    const { x: touchX, y: touchY } = rendererRef.current.screenToWorld(touch.clientX, touch.clientY);
    rendererRef.current.spawnTouchRipple(touchX, touchY);

    // Generous touch target padding (34px buffer for fingers on mobile screens)
    const TOUCH_PADDING = 34;
    let closestObj: InteractiveObject | null = null;
    let closestDist = Infinity;

    for (const obj of currentRoom.objects) {
      const left = obj.x - obj.width / 2 - TOUCH_PADDING;
      const right = obj.x + obj.width / 2 + TOUCH_PADDING;
      const top = obj.y - obj.height - TOUCH_PADDING;
      const bottom = obj.y + TOUCH_PADDING;

      if (touchX >= left && touchX <= right && touchY >= top && touchY <= bottom) {
        const cx = obj.x;
        const cy = obj.y - obj.height / 2;
        const dist = Math.hypot(touchX - cx, touchY - cy);
        if (dist < closestDist) {
          closestDist = dist;
          closestObj = obj;
        }
      }
    }

    if (closestObj) {
      mouseTarget.current = null;
      handleInteractObject(closestObj);
    } else {
      mouseTarget.current = { x: touchX, y: touchY };
    }
  };

  const handleCanvasTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!rendererRef.current || e.touches.length === 0) return;
    const touch = e.touches[0];
    const { x: touchX, y: touchY } = rendererRef.current.screenToWorld(touch.clientX, touch.clientY);
    // Continuous drag to walk across room floor
    mouseTarget.current = { x: touchX, y: touchY };
  };

  const handleCanvasTouchEnd = () => {
    // Touch interaction completed
  };

  // Interact with Object & Execute Room Puzzles
  const handleInteractObject = (obj: InteractiveObject) => {
    audioSystem.playButtonClick();

    // --- ROOM 1 PUZZLES ---
    if (currentRoom.id === 'ROOM_1') {
      if (obj.id === 'activation_lever') {
        const isDown = !roomFlags['lever_pulled'];
        audioSystem.playLeverClick(isDown);
        setRoomFlags(prev => ({ ...prev, lever_pulled: isDown }));
        setActiveDialogue({
          speaker: obj.name,
          text: isDown
            ? 'The mechanical lever locks DOWN! Clockwork gears spin, and all four wizard statues ignite their simultaneous transmissions into the quartz dome!'
            : 'The mechanical lever snaps UP. The clockwork disengages and the transmissions fade.',
        });
        return;
      }

      if (obj.id === 'painting_scholars') {
        audioSystem.playItemPickup();
        setRoomFlags(prev => ({ ...prev, painting_opened: true }));
        if (!inventory.some(i => i.id === 'seal_azure')) {
          setInventory(prev => [
            ...prev,
            {
              id: 'seal_azure',
              name: 'Azure Seal',
              description: 'Archmage Sylas’s orthogonal seal [1, 1, 1, 1].',
              icon: '💎',
              color: '#38bdf8',
              walshCode: [1, 1, 1, 1],
            },
          ]);
          setSelectedItemId('seal_azure');
        }
        setActiveDialogue({
          speaker: 'Secret Compartment',
          text: 'You press the hidden catch behind the frame! An ornate Azure Resonance Seal drops into your satchel.',
        });
        return;
      }

      if (obj.id === 'central_tower') {
        if (!roomFlags['lever_pulled']) {
          setActiveDialogue({
            speaker: obj.name,
            text: 'The quartz receiving dome is dormant. You must pull the brass transmission lever first.',
          });
          return;
        }

        if (selectedItemId === 'seal_azure' || inventory.some(i => i.id === 'seal_azure')) {
          audioSystem.playResonanceSeparation();
          setRoomFlags(prev => ({ ...prev, seal_inserted: true, door_unlocked: true }));
          unlockNotebookPage(1);

          setTimeout(() => {
            setActiveLesson(ROOM_1.lesson);
          }, 1200);

          setActiveDialogue({
            speaker: 'The Quartz Tower',
            text: 'The Azure Seal locks into the socket! The overlapping storm unravels, and Archmage Sylas’s voice resonates alone with crystalline clarity!',
          });
          return;
        } else {
          setActiveDialogue({
            speaker: obj.name,
            text: 'The dome is flooded with overlapping whispers. You need a matching Resonance Seal to extract a clean message.',
          });
          return;
        }
      }

      if (obj.id === 'chamber_door') {
        if (roomFlags['door_unlocked']) {
          audioSystem.playStoneDoorOpen();
          enterRoom(1); // Proceed to Room 2
        } else {
          setActiveDialogue({
            speaker: obj.name,
            text: 'The heavy stone door remains sealed by runic locks. Restore the clear signal to Chamber 1 first.',
          });
        }
        return;
      }
    }

    // --- ROOM 2 PUZZLES ---
    if (currentRoom.id === 'ROOM_2') {
      // 1. Clockwork Astrolabe Lock Puzzle
      if (obj.id === 'ancient_clock') {
        if (!roomFlags['clock_solved']) {
          setShowClockPuzzle(true);
        } else {
          setActiveDialogue({
            speaker: obj.name,
            text: 'The grandfather clock hums steadily. The secret mechanical compartment remains open.',
          });
        }
        return;
      }

      // 2. Velvet Cabinet Lock Puzzle
      if (obj.id === 'crystal_cabinet') {
        if (!roomFlags['cabinet_unlocked']) {
          setShowCabinetPuzzle(true);
        } else {
          setActiveDialogue({
            speaker: obj.name,
            text: 'The velvet drawers stand open. You have already recovered the Amethyst and Ruby seals.',
          });
        }
        return;
      }

      // 3. Wall Tapestry Clue
      if (obj.id === 'wall_tapestry') {
        setActiveDialogue({
          speaker: obj.name,
          text: obj.inspectDialogue,
        });
        return;
      }

      // 4. Pedestal Walsh Polarity Alignment Modals
      if (obj.id.startsWith('pedestal_')) {
        if (roomFlags[`inserted_${obj.id}`]) {
          setActiveDialogue({
            speaker: obj.name,
            text: 'This pedestal is already energized and locked with its orthogonal signature.',
          });
          return;
        }

        let targetCode = [1, 1, 1, 1];
        let wizard = 'Archmage Sylas';
        let sealId = 'seal_azure';
        let sealName = 'Azure Seal';
        let color = '#38bdf8';

        if (obj.id === 'pedestal_2') {
          targetCode = [1, -1, 1, -1];
          wizard = 'Archdruid Rowan';
          sealId = 'seal_emerald';
          sealName = 'Emerald Seal';
          color = '#34d399';
        } else if (obj.id === 'pedestal_3') {
          targetCode = [1, 1, -1, -1];
          wizard = 'Mystic Vesper';
          sealId = 'seal_amethyst';
          sealName = 'Amethyst Seal';
          color = '#c084fc';
        } else if (obj.id === 'pedestal_4') {
          targetCode = [1, -1, -1, 1];
          wizard = 'Pyromancer Ignis';
          sealId = 'seal_ruby';
          sealName = 'Ruby Seal';
          color = '#f87171';
        }

        setActivePedestalData({
          id: obj.id,
          name: obj.name,
          wizard,
          targetCode,
          sealId,
          sealName,
          color,
        });
        return;
      }

      if (obj.id === 'hall_door') {
        if (roomFlags['door_unlocked']) {
          audioSystem.playStoneDoorOpen();
          enterRoom(2); // Proceed to Room 3
        } else {
          setActiveDialogue({
            speaker: obj.name,
            text: 'Activate all four pedestals with their unique orthogonal seals to solidify the crystal bridge and unlock this door.',
          });
        }
        return;
      }
    }

    // --- ROOM 3 PUZZLES ---
    if (currentRoom.id === 'ROOM_3') {
      if (obj.id === 'prism_refractor') {
        setShowPrismPuzzle(true);
        return;
      }

      if (obj.id === 'scrambled_screen') {
        if (!roomFlags['prism_aligned']) {
          setActiveDialogue({
            speaker: obj.name,
            text: 'The spectral mirror is dark. You must align the 3 chromatic rings on the Harmonic Prism Refractor first.',
          });
        } else if (roomFlags['correlator_calibrated']) {
          setActiveDialogue({
            speaker: obj.name,
            text: 'The oscilloscope displays a pure harmonic sine wave (+4V). Archmage Sylas’s transmission has been decoupled with zero distortion!',
          });
        } else {
          setActiveDialogue({
            speaker: obj.name,
            text: 'The coherent carrier beam reflects the superimposed wave: S(t) = [+2, 0, +2, 0]. Inscribed on the rim: "APPLY SYLAS OR ROWAN CORRELATOR CODE AT CONSOLE TO SEPARATE VOICES."',
          });
        }
        return;
      }

      if (obj.id === 'receiver_console') {
        if (!roomFlags['prism_aligned']) {
          setActiveDialogue({
            speaker: obj.name,
            text: 'The correlator console requires an optical carrier wave. Calibrate the Prism Refractor on the left first.',
          });
          return;
        }
        setShowInterferencePuzzle(true);
        return;
      }

      if (obj.id === 'chamber_3_door') {
        if (roomFlags['door_unlocked']) {
          audioSystem.playStoneDoorOpen();
          enterRoom(3); // Proceed to Room 4
        } else {
          setActiveDialogue({
            speaker: obj.name,
            text: 'The Apex Observatory door will unlock once you calibrate the correlator console.',
          });
        }
        return;
      }
    }

    // --- ROOM 4 PUZZLES (FINAL TRIAL) ---
    if (currentRoom.id === 'ROOM_4') {
      if (obj.id === 'celestial_altar') {
        setShowCelestialAltarPuzzle(true);
        return;
      }

      if (obj.id === 'starry_skylight') {
        setShowStarrySkylightPuzzle(true);
        return;
      }

      if (obj.id === 'apex_receiver') {
        if (!roomFlags['altar_aligned'] || !roomFlags['skylight_aligned']) {
          setActiveDialogue({
            speaker: obj.name,
            text: 'The Master Crystal Matrix remains dormant. You must configure the 5 tuning stones at the Celestial Altar and align all 5 beacon stars through the Observatory Telescope first.',
          });
          return;
        }
        setShowMasterMatrixPuzzle(true);
        return;
      }
    }

    // Default inspect
    setActiveDialogue({
      speaker: obj.name,
      text: obj.inspectDialogue,
    });
  };

  const enterRoom = (roomIdx: number) => {
    const nextRoom = ALL_ROOMS[roomIdx];
    if (!nextRoom) return;

    if (roomIdx === 3) {
      // Chamber 4: Ensure all 5 resonance jewels are in satchel for the celestial altar
      grantAllJewels();
    }

    setCurrentRoomIndex(roomIdx);
    setScene(`ROOM_${roomIdx + 1}` as GameScene);
    setHighestRoomReached(prev => Math.max(prev, roomIdx + 1));
    setRoomFlags({});
    setOwlHintIndex(0);
    setShowOwl(false);
    setActiveDialogue(null);
    setShowClockPuzzle(false);
    setShowCabinetPuzzle(false);
    setShowPrismPuzzle(false);
    setShowInterferencePuzzle(false);
    setShowCelestialAltarPuzzle(false);
    setShowStarrySkylightPuzzle(false);
    setShowMasterMatrixPuzzle(false);
    setActivePedestalData(null);

    playerRef.current = {
      x: nextRoom.playerStartX,
      y: nextRoom.playerStartY,
      vx: 0,
      vy: 0,
      facing: 'right',
      action: 'idle',
      animTimer: 0,
      footstepTimer: 0,
    };
    mouseTarget.current = null;
  };

  const unlockNotebookPage = (pageNum: number) => {
    setNotebookPages(prev =>
      prev.map(p => (p.pageNumber === pageNum ? { ...p, unlocked: true } : p))
    );
    setHasUnreadNotebook(true);
  };

  const handleStartGame = () => {
    audioSystem.init();
    audioSystem.resume();
    audioSystem.startAtmosphericMusic();
    setScene('INTRO_CINEMATIC');
  };

  const handleToggleMute = () => {
    audioSystem.init();
    audioSystem.resume();
    const muted = audioSystem.toggleMute();
    setIsMuted(muted);
  };

  const currentObjectiveText = useMemo(() => {
    if (currentRoom.id === 'ROOM_1') {
      if (!roomFlags['lever_pulled']) return 'Pull the transmission lever';
      if (!inventory.some(i => i.id === 'seal_azure')) return 'Inspect painting for hidden seal';
      if (!roomFlags['seal_inserted']) return 'Insert Azure Seal into Tower';
      return 'Proceed through arched stone portal';
    } else if (currentRoom.id === 'ROOM_2') {
      if (!roomFlags['clock_solved']) return 'Solve the Clockwork Astrolabe';
      if (!roomFlags['cabinet_unlocked']) return 'Unlock the Velvet Cabinet';
      if (!roomFlags['bridge_active']) return 'Align polarity discs & insert seals on 4 pedestals';
      return 'Cross crystal bridge into upper tower';
    } else if (currentRoom.id === 'ROOM_3') {
      if (!roomFlags['prism_aligned']) return 'Align 3 chromatic rings on Prism Refractor';
      if (!roomFlags['correlator_calibrated']) return 'Calibrate Correlator Console';
      return 'Enter the Apex Observatory';
    } else if (currentRoom.id === 'ROOM_4') {
      if (!roomFlags['altar_aligned']) return 'Place 5 tuning stones on Celestial Altar';
      if (!roomFlags['skylight_aligned']) return 'Target 5 star beacons through Telescope';
      return 'Synchronize the 5-frequency master matrix';
    }
    return 'Restore the Forgotten Signal';
  }, [currentRoom, roomFlags, inventory]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#070504] text-slate-100 select-none flex items-center justify-center">
      {/* Mobile Mandate: Rotate to Landscape Overlay */}
      <RotateOrientationPrompt />

      {/* 60 FPS HTML5 Canvas Scene */}
      <canvas
        ref={canvasRef}
        onMouseMove={handleCanvasMouseMove}
        onClick={handleCanvasClick}
        onTouchStart={handleCanvasTouchStart}
        onTouchMove={handleCanvasTouchMove}
        onTouchEnd={handleCanvasTouchEnd}
        className="absolute inset-0 w-full h-full block z-0 cursor-pointer touch-none select-none"
      />

      {/* Screen: Title Menu */}
      {scene === 'TITLE_MENU' && (
        <MainMenu
          onPlay={handleStartGame}
          onHowToPlay={() => setShowHowToPlay(true)}
          onNotebook={() => setShowNotebook(true)}
          onSolutions={() => setShowSolutions(true)}
          onSettings={() => setShowSettings(true)}
          onCredits={() => setShowCredits(true)}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          highestRoomReached={highestRoomReached}
        />
      )}

      {/* Screen: Intro Cinematic */}
      {scene === 'INTRO_CINEMATIC' && (
        <IntroCinematic
          onComplete={() => setScene('OPENING_SEQUENCE')}
          onSkip={() => setScene('OPENING_SEQUENCE')}
        />
      )}

      {/* Screen: Opening Sequence (After Prologue) */}
      {scene === 'OPENING_SEQUENCE' && (
        <OpeningSequence
          onComplete={() => enterRoom(0)}
          onSkip={() => enterRoom(0)}
        />
      )}

      {/* Gameplay HUD during Active Chamber Exploration */}
      {scene.startsWith('ROOM_') && (
        <>
          {/* Top Chamber Header Indicator */}
          <div className="fixed top-4 left-6 z-20 pointer-events-none">
            <div className="bg-[#14100c]/90 backdrop-blur-md border border-[#33261a] px-4 py-2 shadow-lg">
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#d4af37] block font-bold">
                Chamber {currentRoom.roomNumber} of 4
              </span>
              <h2 className="text-sm font-bold font-serif text-[#ded4be]">
                {currentRoom.name}
              </h2>
            </div>
          </div>

          {/* Bottom Inventory & Action Bar */}
          <InventoryBar
            items={inventory}
            selectedItemId={selectedItemId}
            onSelectItem={setSelectedItemId}
            onOpenNotebook={() => {
              setHasUnreadNotebook(false);
              setShowNotebook(true);
            }}
            onOpenOwl={() => setShowOwl(true)}
            onOpenLoupe={() => setShowLoupeModal(true)}
            onTriggerSense={handleTriggerSense}
            onOpenSolutions={() => setShowSolutions(true)}
            onPause={() => setShowPause(true)}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
            hasUnreadNotebook={hasUnreadNotebook}
            currentObjective={currentObjectiveText}
          />

          {/* On-Screen Mobile Touch Controls (Thumbstick & Contextual Action Buttons) */}
          <TouchControls
            active={
              !showClockPuzzle &&
              !showCabinetPuzzle &&
              !showPrismPuzzle &&
              !showInterferencePuzzle &&
              !showCelestialAltarPuzzle &&
              !showStarrySkylightPuzzle &&
              !showMasterMatrixPuzzle &&
              !showLoupeModal &&
              !activePedestalData &&
              !showNotebook &&
              !showPause &&
              !showHowToPlay &&
              !showSolutions &&
              !showSettings &&
              !showCredits &&
              !activeLesson
            }
            onMoveVector={(vx, vy) => {
              touchMoveVector.current = { x: vx, y: vy };
            }}
            onHotspotSense={() => {
              rendererRef.current?.triggerHotspotPulse();
              audioSystem.playHarmonicResonance();
            }}
            onInteract={() => {
              if (nearbyObject) {
                handleInteractObject(nearbyObject);
              }
            }}
            onOpenNotebook={() => {
              setShowNotebook(true);
              setHasUnreadNotebook(false);
            }}
            nearbyObject={nearbyObject}
          />
        </>
      )}

      {/* Active Dialogue Subtitle Bar */}
      {activeDialogue && (
        <DialogueBox
          speaker={activeDialogue.speaker}
          text={activeDialogue.text}
          onDismiss={() => setActiveDialogue(null)}
        />
      )}

      {/* Illustrated Lesson Popup after Room Completion */}
      {activeLesson && (
        <LessonPopup
          lesson={activeLesson}
          onContinue={() => setActiveLesson(null)}
        />
      )}

      {/* Room 2 Interactive Modal: Grandfather Astrolabe Clock */}
      {showClockPuzzle && (
        <ClockPuzzleModal
          onSolved={() => {
            setShowClockPuzzle(false);
            setRoomFlags(prev => ({ ...prev, clock_solved: true }));
            if (!inventory.some(i => i.id === 'seal_emerald')) {
              setInventory(prev => [
                ...prev,
                {
                  id: 'seal_emerald',
                  name: 'Emerald Seal',
                  description: 'Archdruid Rowan’s orthogonal seal [1, -1, 1, -1].',
                  icon: '🌲',
                  color: '#34d399',
                  walshCode: [1, -1, 1, -1],
                },
              ]);
            }
            setActiveDialogue({
              speaker: 'Grandfather Astrolabe',
              text: 'The eclipse alignment clicks! A mechanical hand reaches out from the clock mechanism, surrendering the Emerald Seal into your hands!',
            });
          }}
          onClose={() => setShowClockPuzzle(false)}
        />
      )}

      {/* Room 2 Interactive Modal: Velvet Cabinet Tumbler */}
      {showCabinetPuzzle && (
        <CabinetLockModal
          onSolved={() => {
            setShowCabinetPuzzle(false);
            setRoomFlags(prev => ({ ...prev, cabinet_unlocked: true }));
            if (!inventory.some(i => i.id === 'seal_amethyst')) {
              setInventory(prev => [
                ...prev,
                {
                  id: 'seal_amethyst',
                  name: 'Amethyst Seal',
                  description: 'Mystic Vesper’s orthogonal seal [1, 1, -1, -1].',
                  icon: '🔮',
                  color: '#c084fc',
                  walshCode: [1, 1, -1, -1],
                },
                {
                  id: 'seal_ruby',
                  name: 'Ruby Seal',
                  description: 'Pyromancer Ignis’s orthogonal seal [1, -1, -1, 1].',
                  icon: '🔥',
                  color: '#f87171',
                  walshCode: [1, -1, -1, 1],
                },
              ]);
            }
            setActiveDialogue({
              speaker: 'Velvet Display Cabinet',
              text: 'The three tumblers click open in unison! The velvet drawer glides forward to reveal the Amethyst Seal and Ruby Seal!',
            });
          }}
          onClose={() => setShowCabinetPuzzle(false)}
        />
      )}

      {/* Room 2 Interactive Modal: Pedestal Polarity Alignment */}
      {activePedestalData && (
        <PedestalPuzzleModal
          pedestalId={activePedestalData.id}
          pedestalName={activePedestalData.name}
          wizardName={activePedestalData.wizard}
          targetWalshCode={activePedestalData.targetCode}
          hasSealInInventory={inventory.some(i => i.id === activePedestalData.sealId)}
          sealColor={activePedestalData.color}
          sealName={activePedestalData.sealName}
          onSolved={() => {
            const pedestalId = activePedestalData.id;
            setActivePedestalData(null);
            setRoomFlags(prev => {
              const next = { ...prev, [`inserted_${pedestalId}`]: true };
              if (
                next['inserted_pedestal_1'] &&
                next['inserted_pedestal_2'] &&
                next['inserted_pedestal_3'] &&
                next['inserted_pedestal_4']
              ) {
                next['bridge_active'] = true;
                next['door_unlocked'] = true;
                audioSystem.playResonanceSeparation();
                unlockNotebookPage(2);
                setTimeout(() => {
                  setActiveLesson(ROOM_2.lesson);
                }, 1000);
              }
              return next;
            });
          }}
          onClose={() => setActivePedestalData(null)}
        />
      )}

      {/* Room 3 Interactive Modal: Optical Prism Refractor */}
      {showPrismPuzzle && (
        <PrismRefractorModal
          onSolved={() => {
            setShowPrismPuzzle(false);
            setRoomFlags(prev => ({ ...prev, prism_aligned: true }));
            setActiveDialogue({
              speaker: 'Harmonic Prism Refractor',
              text: 'The three chromatic rings lock at 0°! A focused, coherent optical carrier beam now strikes the Spectral Oscilloscope Mirror.',
            });
          }}
          onClose={() => setShowPrismPuzzle(false)}
        />
      )}

      {/* Room 3 Interactive Modal: Interference Correlator & Spectral Oscilloscope */}
      {showInterferencePuzzle && (
        <InterferenceModal
          onSolved={() => {
            setShowInterferencePuzzle(false);
            setRoomFlags(prev => ({
              ...prev,
              correlator_calibrated: true,
              door_unlocked: true,
            }));
            unlockNotebookPage(3);
            setTimeout(() => {
              setActiveLesson(ROOM_3.lesson);
            }, 800);
            setActiveDialogue({
              speaker: 'Correlator Console',
              text: 'The orthogonal filter is locked! Cross-correlation with mismatched codes collapses to exact ZERO, and the Apex Observatory portal unlocks!',
            });
          }}
          onClose={() => setShowInterferencePuzzle(false)}
        />
      )}

      {/* Room 4 Interactive Modal: Celestial Altar Tuning Stones */}
      {showCelestialAltarPuzzle && (
        <CelestialAltarModal
          onSolved={() => {
            setShowCelestialAltarPuzzle(false);
            grantAllJewels();
            setRoomFlags(prev => ({ ...prev, altar_aligned: true }));
            setActiveDialogue({
              speaker: 'Celestial Altar',
              text: 'The five elemental tuning stones ignite! Luminous harmonic conduit lines shoot across the floor toward the Master Crystal Matrix!',
            });
          }}
          onClose={() => setShowCelestialAltarPuzzle(false)}
          onGrantAllJewels={grantAllJewels}
        />
      )}

      {/* Room 4 Interactive Modal: Starry Skylight Telescope */}
      {showStarrySkylightPuzzle && (
        <StarrySkylightModal
          onSolved={() => {
            setShowStarrySkylightPuzzle(false);
            setRoomFlags(prev => ({ ...prev, skylight_aligned: true }));
            setActiveDialogue({
              speaker: 'Observatory Telescope',
              text: 'All five regional beacon stars locked! Their carrier frequencies stream directly into the Master Crystal Matrix!',
            });
          }}
          onClose={() => setShowStarrySkylightPuzzle(false)}
        />
      )}

      {/* Room 4 Interactive Modal: Apex Master Matrix Synthesizer */}
      {showMasterMatrixPuzzle && (
        <MasterMatrixModal
          onHarmonized={() => {
            setShowMasterMatrixPuzzle(false);
            unlockNotebookPage(4);
            setTimeout(() => {
              setScene('ENDING_CINEMATIC');
            }, 800);
          }}
          onClose={() => setShowMasterMatrixPuzzle(false)}
        />
      )}

      {/* Explorer's Magnifying Loupe Modal */}
      {showLoupeModal && (
        <InspectorLoupeModal onClose={() => setShowLoupeModal(false)} />
      )}

      {/* Magical Owl Companion Progressive Hint System */}
      {showOwl && (
        <OwlCompanion
          hints={currentRoom.hints}
          currentHintIndex={owlHintIndex}
          onAdvanceHint={() => setOwlHintIndex(prev => Math.min(prev + 1, currentRoom.hints.length - 1))}
          onSolvePuzzle={() => {
            setShowOwl(false);
            grantAllJewels();
            if (currentRoom.id === 'ROOM_1') {
              setRoomFlags({ lever_pulled: true, painting_opened: true, seal_inserted: true, door_unlocked: true });
              unlockNotebookPage(1);
              setActiveLesson(ROOM_1.lesson);
            } else if (currentRoom.id === 'ROOM_2') {
              setRoomFlags({
                clock_solved: true,
                cabinet_unlocked: true,
                inserted_pedestal_1: true,
                inserted_pedestal_2: true,
                inserted_pedestal_3: true,
                inserted_pedestal_4: true,
                bridge_active: true,
                door_unlocked: true,
              });
              unlockNotebookPage(2);
              setActiveLesson(ROOM_2.lesson);
            } else if (currentRoom.id === 'ROOM_3') {
              setRoomFlags({ prism_aligned: true, tested_wrong_seal: true, correlator_calibrated: true, door_unlocked: true });
              unlockNotebookPage(3);
              setActiveLesson(ROOM_3.lesson);
            } else if (currentRoom.id === 'ROOM_4') {
              setRoomFlags({ altar_aligned: true, skylight_aligned: true });
              setScene('ENDING_CINEMATIC');
            }
          }}
          onClose={() => setShowOwl(false)}
        />
      )}

      {/* Screen: Ending Cinematic Reveal (CDMA Transformation) */}
      {scene === 'ENDING_CINEMATIC' && (
        <FinalCinematicReveal
          onReplay={() => enterRoom(0)}
          onCredits={() => setShowCredits(true)}
        />
      )}

      {/* Global Modals */}
      {showNotebook && (
        <NotebookModal
          pages={notebookPages}
          onClose={() => setShowNotebook(false)}
          onOpenSolutions={() => {
            setShowNotebook(false);
            setShowSolutions(true);
          }}
        />
      )}

      {/* Tower Answers & Walkthrough Modal */}
      {showSolutions && (
        <SolutionsModal
          onClose={() => setShowSolutions(false)}
          onGrantAllJewels={grantAllJewels}
          onJumpToRoom={roomIdx => {
            setShowSolutions(false);
            enterRoom(roomIdx);
          }}
        />
      )}

      {showHowToPlay && <HowToPlayModal onClose={() => setShowHowToPlay(false)} />}
      {showPause && (
        <PauseModal
          onResume={() => setShowPause(false)}
          onOpenNotebook={() => {
            setShowPause(false);
            setShowNotebook(true);
          }}
          onSolutions={() => {
            setShowPause(false);
            setShowSolutions(true);
          }}
          onSettings={() => {
            setShowPause(false);
            setShowSettings(true);
          }}
          onMainMenu={() => {
            setShowPause(false);
            setScene('TITLE_MENU');
          }}
        />
      )}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      {showCredits && <CreditsModal onClose={() => setShowCredits(false)} />}
    </div>
  );
}
