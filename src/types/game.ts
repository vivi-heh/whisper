/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type GameScene =
  | 'TITLE_MENU'
  | 'INTRO_CINEMATIC'
  | 'OPENING_SEQUENCE'
  | 'ROOM_1' // Many Voices
  | 'ROOM_2' // Unique Codes
  | 'ROOM_3' // Wrong Decoder
  | 'ROOM_4' // Final Trial
  | 'ENDING_CINEMATIC';

export type CharacterAction =
  | 'idle'
  | 'walk'
  | 'look_around'
  | 'pickup'
  | 'pull_lever'
  | 'read_book'
  | 'victory'
  | 'confused';

export interface PlayerState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  facing: 'left' | 'right';
  action: CharacterAction;
  animTimer: number;
  footstepTimer: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  walshCode?: number[];
}

export interface InteractiveObject {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  cursorType?: 'inspect' | 'pickup' | 'gear' | 'door';
  inspectDialogue: string;
  highlighted?: boolean;
  requiredItemId?: string;
  solved?: boolean;
  active?: boolean;
  customState?: Record<string, unknown>;
}

export interface NotebookPage {
  pageNumber: number;
  title: string;
  cdmaPrinciple: string;
  illustrationType: 'many_voices' | 'unique_codes' | 'wrong_decoder' | 'cdma_network';
  description: string;
  loreText: string;
  unlocked: boolean;
}

export interface OwlHint {
  level: 1 | 2 | 3 | 4;
  text: string;
  highlightObjectId?: string;
  targetLocation?: { x: number; y: number };
}

export interface LessonData {
  roomNumber: number;
  title: string;
  subtitle: string;
  explanation: string[];
  cdmaTakeaway: string;
}
