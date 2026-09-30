/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { InteractiveObject, LessonData, NotebookPage, OwlHint } from '../types/game';

export interface RoomData {
  id: string;
  name: string;
  roomNumber: number;
  description: string;
  width: number;
  height: number;
  playerStartX: number;
  playerStartY: number;
  objects: InteractiveObject[];
  lesson: LessonData;
  hints: OwlHint[];
}

export const NOTEBOOK_PAGES: NotebookPage[] = [
  {
    pageNumber: 1,
    title: 'The Overlapping Voices',
    cdmaPrinciple: 'Simultaneous Transmission on a Shared Channel',
    illustrationType: 'many_voices',
    description:
      'In traditional communications, users must take turns (Time Division) or split up radio frequencies (Frequency Division). In CDMA, everyone transmits across the exact same frequency at the exact same moment.',
    loreText:
      'Ancient scrolls record that the kingdom’s four archmages could cast their sending spells simultaneously without waiting for silence.',
    unlocked: false,
  },
  {
    pageNumber: 2,
    title: 'The Language of Seals',
    cdmaPrinciple: 'Unique Orthogonal Spreading Codes (Walsh Sequences)',
    illustrationType: 'unique_codes',
    description:
      'Each user is given a unique orthogonal chip code. Because the mathematical inner product between any two distinct codes is strictly zero, multiple signals pass through the same air without scrambling each other.',
    loreText:
      'The four elemental seals were carved from celestial lodestone: Sylas [✦ ✦ ✦ ✦], Rowan [✦ ✧ ✦ ✧], Vesper [✦ ✦ ✧ ✧], and Ignis [✦ ✧ ✧ ✦].',
    unlocked: false,
  },
  {
    pageNumber: 3,
    title: 'The Law of Rejection',
    cdmaPrinciple: 'Cross-Correlation Rejection of Unintended Signals',
    illustrationType: 'wrong_decoder',
    description:
      'When an observer multiplies the incoming wave by the wrong code, the sum of products cancels itself to exact zero. Only the sender’s matching code reconstructs the original signal.',
    loreText:
      'To force an Amethyst seal upon an Azure whisper shatters the crystal mirror into meaningless static. Only harmony unlocks meaning.',
    unlocked: false,
  },
  {
    pageNumber: 4,
    title: 'The Great Convergence: CDMA',
    cdmaPrinciple: 'Code Division Multiple Access',
    illustrationType: 'cdma_network',
    description:
      'This entire magical apparatus is known in modern telecommunications as CDMA. It powers cellular mobile networks, GPS satellites, and deep-space telemetry without channel collisions.',
    loreText:
      'The ancient communication tower was not sorcery, but mathematics. The forgotten signal has been recovered.',
    unlocked: false,
  },
];

export const ROOM_1: RoomData = {
  id: 'ROOM_1',
  name: 'The Chamber of Many Voices',
  roomNumber: 1,
  description: 'Four silent wizard statues surround an ancient brass and quartz receiving tower.',
  width: 1280,
  height: 720,
  playerStartX: 260,
  playerStartY: 580,
  objects: [
    {
      id: 'statue_blue',
      name: 'Statue of the Azure Sage',
      x: 180,
      y: 520,
      width: 80,
      height: 160,
      inspectDialogue: 'The statue of Archmage Sylas. His scroll glows with a faint blue rune.',
      cursorType: 'inspect',
    },
    {
      id: 'statue_green',
      name: 'Statue of the Forest Druid',
      x: 360,
      y: 515,
      width: 80,
      height: 160,
      inspectDialogue: 'Archdruid Rowan. Her stone staff is wound with living ivy.',
      cursorType: 'inspect',
    },
    {
      id: 'statue_purple',
      name: 'Statue of the Mystic',
      x: 920,
      y: 515,
      width: 80,
      height: 160,
      inspectDialogue: 'Mystic Vesper. Her eyes are hollow amethyst geodes.',
      cursorType: 'inspect',
    },
    {
      id: 'statue_red',
      name: 'Statue of the Pyromancer',
      x: 1100,
      y: 520,
      width: 80,
      height: 160,
      inspectDialogue: 'Pyromancer Ignis. The scroll in his hand is warm to the touch.',
      cursorType: 'inspect',
    },
    {
      id: 'central_tower',
      name: 'Quartz Receiving Tower',
      x: 640,
      y: 520,
      width: 170,
      height: 215,
      cursorType: 'gear',
      inspectDialogue: 'The central receiving dome resting on the research table. It has an empty socket shaped like a round seal.',
      requiredItemId: 'seal_azure',
      solved: false,
    },
    {
      id: 'activation_lever',
      name: 'Mechanical Transmission Lever',
      x: 770,
      y: 545,
      width: 60,
      height: 75,
      cursorType: 'gear',
      inspectDialogue: 'A mechanical brass lever with two stable positions (UP / DOWN). Toggle it to control statue transmission.',
      active: false,
    },
    {
      id: 'painting_scholars',
      name: 'Portrait of the Four Archmages',
      x: 290,
      y: 220,
      width: 110,
      height: 130,
      cursorType: 'inspect',
      inspectDialogue: 'An oil painting of the four founders hanging from wall cords. A latch behind the frame conceals an Azure Seal!',
      solved: false,
    },
    {
      id: 'bookshelf_ancient',
      name: 'Dusty Grimoire Shelf',
      x: 990,
      y: 320,
      width: 120,
      height: 160,
      cursorType: 'inspect',
      inspectDialogue: 'A bookshelf bolted to the stone wall: "When all voices cast at once, only the matching Seal can untangle the chord."',
    },
    {
      id: 'chamber_candles',
      name: 'Candelabra of Three Flames',
      x: 480,
      y: 515,
      width: 50,
      height: 60,
      cursorType: 'inspect',
      inspectDialogue: 'Three burning candles on an end-table, casting dancing shadows on the floorboards.',
      active: false,
    },
    {
      id: 'chamber_door',
      name: 'Arched Stone Portal',
      x: 1220,
      y: 510,
      width: 70,
      height: 210,
      cursorType: 'door',
      inspectDialogue: 'A heavy stone door sealed with a runic barrier. It unlocks when the first transmission is recovered.',
      solved: false,
    },
  ],
  lesson: {
    roomNumber: 1,
    title: 'What Happened?',
    subtitle: 'The First Principle of CDMA',
    explanation: [
      'All four wizards cast their spells into the tower at the exact same moment.',
      'Their signals merged together into a single composite energy wave in the shared air.',
      'Yet, by inserting the Azure Seal, the receiver isolated ONLY Sylas’s voice with pristine clarity.',
    ],
    cdmaTakeaway: 'In CDMA, multiple users share the exact same frequency channel at the same time.',
  },
  hints: [
    {
      level: 1,
      text: 'Have you tried pulling the brass transmission lever to see what happens?',
      highlightObjectId: 'activation_lever',
    },
    {
      level: 2,
      text: 'Inspect the portrait of the four archmages on the left wall.',
      highlightObjectId: 'painting_scholars',
    },
    {
      level: 3,
      text: 'Take the Azure Seal from behind the painting and place it into the Quartz Tower.',
      highlightObjectId: 'central_tower',
      targetLocation: { x: 640, y: 520 },
    },
    {
      level: 4,
      text: 'Solve automatically: Insert Azure Seal and unlock the chamber.',
    },
  ],
};

export const ROOM_2: RoomData = {
  id: 'ROOM_2',
  name: 'The Hall of Unique Seals',
  roomNumber: 2,
  description: 'A grand bridge chamber where four pedestals require setting their Walsh polarity discs and inserting authentic wizard seals.',
  width: 1280,
  height: 720,
  playerStartX: 160,
  playerStartY: 580,
  objects: [
    {
      id: 'pedestal_1',
      name: 'Azure Pedestal',
      x: 320,
      y: 520,
      width: 70,
      height: 90,
      cursorType: 'gear',
      inspectDialogue: 'Archmage Sylas’s pedestal. Requires configuring the 4 polarity discs to [+1, +1, +1, +1] and placing the Azure Seal.',
      requiredItemId: 'seal_azure',
      solved: false,
      customState: { targetCode: [1, 1, 1, 1], wizard: 'Sylas', sealName: 'Azure Seal', color: '#38bdf8' },
    },
    {
      id: 'pedestal_2',
      name: 'Emerald Pedestal',
      x: 520,
      y: 520,
      width: 70,
      height: 90,
      cursorType: 'gear',
      inspectDialogue: 'Archdruid Rowan’s pedestal. Requires configuring the 4 polarity discs to [+1, -1, +1, -1] and placing the Emerald Seal.',
      requiredItemId: 'seal_emerald',
      solved: false,
      customState: { targetCode: [1, -1, 1, -1], wizard: 'Rowan', sealName: 'Emerald Seal', color: '#34d399' },
    },
    {
      id: 'pedestal_3',
      name: 'Amethyst Pedestal',
      x: 760,
      y: 520,
      width: 70,
      height: 90,
      cursorType: 'gear',
      inspectDialogue: 'Mystic Vesper’s pedestal. Requires configuring the 4 polarity discs to [+1, +1, -1, -1] and placing the Amethyst Seal.',
      requiredItemId: 'seal_amethyst',
      solved: false,
      customState: { targetCode: [1, 1, -1, -1], wizard: 'Vesper', sealName: 'Amethyst Seal', color: '#c084fc' },
    },
    {
      id: 'pedestal_4',
      name: 'Ruby Pedestal',
      x: 960,
      y: 520,
      width: 70,
      height: 90,
      cursorType: 'gear',
      inspectDialogue: 'Pyromancer Ignis’s pedestal. Requires configuring the 4 polarity discs to [+1, -1, -1, +1] and placing the Ruby Seal.',
      requiredItemId: 'seal_ruby',
      solved: false,
      customState: { targetCode: [1, -1, -1, 1], wizard: 'Ignis', sealName: 'Ruby Seal', color: '#f87171' },
    },
    {
      id: 'ancient_clock',
      name: 'Clockwork Astrolabe',
      x: 180,
      y: 520,
      width: 88,
      height: 170,
      cursorType: 'gear',
      inspectDialogue: 'A grandfather astrolabe standing on the floorboards. Solve the eclipse alignment (Sun XII, Moon VI) to release the Emerald Seal!',
      solved: false,
    },
    {
      id: 'crystal_cabinet',
      name: 'Velvet Display Cabinet',
      x: 1100,
      y: 520,
      width: 90,
      height: 150,
      cursorType: 'gear',
      inspectDialogue: 'A mahogany cabinet secured by a 3-glyph tumbler lock. Align the cipher symbols to retrieve the Amethyst and Ruby seals.',
      solved: false,
    },
    {
      id: 'wall_tapestry',
      name: 'Astrological Walsh Tapestry',
      x: 640,
      y: 210,
      width: 140,
      height: 130,
      cursorType: 'inspect',
      inspectDialogue: 'An ancient tapestry depicting the four archmages and their orthogonal polarities:\nSylas: [✦ ✦ ✦ ✦] (+1,+1,+1,+1)\nRowan: [✦ ✧ ✦ ✧] (+1,-1,+1,-1)\nVesper: [✦ ✦ ✧ ✧] (+1,+1,-1,-1)\nIgnis: [✦ ✧ ✧ ✦] (+1,-1,-1,+1)',
    },
    {
      id: 'magical_bridge',
      name: 'Luminous Bridge of Crystals',
      x: 640,
      y: 510,
      width: 140,
      height: 60,
      cursorType: 'inspect',
      inspectDialogue: 'A dormant crystalline bridge across the chasm. It will solidify once all four unique pedestals are configured and sealed.',
      solved: false,
    },
    {
      id: 'hall_door',
      name: 'Ascending Staircase Door',
      x: 1220,
      y: 510,
      width: 70,
      height: 210,
      cursorType: 'door',
      inspectDialogue: 'The door to the upper observatory tower.',
      solved: false,
    },
  ],
  lesson: {
    roomNumber: 2,
    title: 'Unique Signatures',
    subtitle: 'Orthogonal Spreading Codes',
    explanation: [
      'Every wizard in the kingdom was assigned their own distinct seal sequence.',
      'In mathematics, these sequences are called orthogonal Walsh-Hadamard codes.',
      'Because each code is perpendicular to every other code, multiple transmissions never collide.',
    ],
    cdmaTakeaway: 'In CDMA, each user is given a unique orthogonal spreading code.',
  },
  hints: [
    {
      level: 1,
      text: 'Inspect the wall tapestry in the center to learn each Archmage’s 4-disc polarity code.',
      highlightObjectId: 'wall_tapestry',
    },
    {
      level: 2,
      text: 'Solve the Grandfather Astrolabe (hands to XII Sun and VI Moon) and the Velvet Cabinet tumblers.',
      highlightObjectId: 'ancient_clock',
    },
    {
      level: 3,
      text: 'Click each pedestal, rotate its 4 discs to match the wizard’s code, then insert the seal.',
      highlightObjectId: 'pedestal_1',
    },
    {
      level: 4,
      text: 'Solve automatically: Align all 4 pedestals and bridge the chasm.',
    },
  ],
};

export const ROOM_3: RoomData = {
  id: 'ROOM_3',
  name: 'The Interference Chamber',
  roomNumber: 3,
  description: 'An experimental laboratory demonstrating what occurs when a receiver tries the wrong code.',
  width: 1280,
  height: 720,
  playerStartX: 180,
  playerStartY: 580,
  objects: [
    {
      id: 'receiver_console',
      name: 'Interference Correlator Console',
      x: 640,
      y: 450,
      width: 140,
      height: 120,
      cursorType: 'gear',
      inspectDialogue: 'The master correlator. Try inserting the WRONG seal to observe signal scrambling, then restore the correct orthogonal filter.',
      solved: false,
      active: false,
    },
    {
      id: 'prism_refractor',
      name: 'Harmonic Prism Refractor',
      x: 380,
      y: 400,
      width: 90,
      height: 130,
      cursorType: 'gear',
      inspectDialogue: 'An optical prism showing wave cross-correlation. Align the polarity mirrors to 0 interference.',
      solved: false,
    },
    {
      id: 'scrambled_screen',
      name: 'Spectral Oscilloscope Mirror',
      x: 640,
      y: 240,
      width: 180,
      height: 110,
      cursorType: 'inspect',
      inspectDialogue: 'A polished obsidian mirror showing the decoded waveform. When scrambled, runes shatter into static.',
    },
    {
      id: 'chamber_3_door',
      name: 'Apex Tower Door',
      x: 1220,
      y: 480,
      width: 60,
      height: 200,
      cursorType: 'door',
      inspectDialogue: 'The massive portal to the final Apex Observatory.',
      solved: false,
    },
  ],
  lesson: {
    roomNumber: 3,
    title: 'The Wrong Code',
    subtitle: 'Cross-Correlation Rejection',
    explanation: [
      'When you applied a mismatched seal, the message fractured into unintelligible static.',
      'Mathematically, multiplying the composite signal by an unselected user’s code equals EXACT ZERO.',
      'Only the matching decoder can unlock the transmitted data.',
    ],
    cdmaTakeaway: 'The receiver can ONLY decode a message if it possesses the sender’s exact code.',
  },
  hints: [
    {
      level: 1,
      text: 'Align the 3 chromatic rings on the Harmonic Prism Refractor on the left to 0° deflection.',
      highlightObjectId: 'prism_refractor',
    },
    {
      level: 2,
      text: 'Inspect the Spectral Oscilloscope Mirror to observe the focused optical carrier wave.',
      highlightObjectId: 'scrambled_screen',
    },
    {
      level: 3,
      text: 'Open the Correlator Console: test the mismatched code, then lock the matching orthogonal code.',
      highlightObjectId: 'receiver_console',
    },
    {
      level: 4,
      text: 'Solve automatically: Calibrate correlator and open the Apex Portal.',
    },
  ],
};

export const ROOM_4: RoomData = {
  id: 'ROOM_4',
  name: 'The Apex Observatory',
  roomNumber: 4,
  description: 'The highest chamber under the stars. Five masters cast simultaneously across the realm.',
  width: 1280,
  height: 720,
  playerStartX: 200,
  playerStartY: 580,
  objects: [
    {
      id: 'apex_receiver',
      name: 'The Master Crystal Matrix',
      x: 640,
      y: 360,
      width: 160,
      height: 240,
      cursorType: 'gear',
      inspectDialogue: 'The master receiver. Decode all 5 wizards in sequence: Blue → Green → Purple → Gold → Red.',
      solved: false,
      active: true,
    },
    {
      id: 'celestial_altar',
      name: 'Celestial Dial of Five Frequencies',
      x: 360,
      y: 530,
      width: 100,
      height: 90,
      cursorType: 'gear',
      inspectDialogue: 'An altar holding the 5 harmonic tuning prisms.',
    },
    {
      id: 'starry_skylight',
      name: 'Glass Observatory Dome',
      x: 640,
      y: 130,
      width: 240,
      height: 120,
      cursorType: 'inspect',
      inspectDialogue: 'Through the glass dome, shooting stars trace the path of communication spells across the kingdom.',
    },
  ],
  lesson: {
    roomNumber: 4,
    title: 'The Forgotten Signal Restored',
    subtitle: 'Code Division Multiple Access',
    explanation: [
      'Five simultaneous wizards, one shared airwave, and zero interference.',
      'You have successfully decoupled every transmitted message using unique orthogonal codes.',
      'This breakthrough transformed human civilization as CDMA.',
    ],
    cdmaTakeaway: 'CDMA enables cellular networks, GPS satellites, and modern wireless communications.',
  },
  hints: [
    {
      level: 1,
      text: 'Place the 5 tuning stones on the Celestial Altar in rank order (Azure, Emerald, Amethyst, Ruby, Gold).',
      highlightObjectId: 'celestial_altar',
    },
    {
      level: 2,
      text: 'Look through the Observatory Telescope and lock all 5 regional beacon stars.',
      highlightObjectId: 'starry_skylight',
    },
    {
      level: 3,
      text: 'Operate the Master Crystal Matrix and harmonize all 5 channels simultaneously.',
      highlightObjectId: 'apex_receiver',
    },
    {
      level: 4,
      text: 'Solve automatically: Complete the 5-wizard alignment.',
    },
  ],
};

export const ALL_ROOMS = [ROOM_1, ROOM_2, ROOM_3, ROOM_4];
