/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PlayerState, InteractiveObject } from '../types/game';
import { RoomData } from './RoomDefinitions';

export const ROOM_WIDTH = 1280;
export const ROOM_HEIGHT = 720;

interface Mote {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
}

interface SmokeWisp {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  life: number;
}

interface ClickParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
}

// Perch locations for the magical fantasy owl
interface OwlPerch {
  x: number;
  y: number;
  facing: 'left' | 'right';
}

const OWL_PERCHES: OwlPerch[] = [
  { x: 260, y: 36, facing: 'right' },   // Ceiling timber beam (left)
  { x: 990, y: 235, facing: 'left' },   // Top of the grimoire shelf
  { x: 360, y: 345, facing: 'right' },  // Shoulder of Rowan statue
  { x: 740, y: 36, facing: 'left' },    // Ceiling timber beam (right)
];

export class CanvasRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private time: number = 0;
  private motes: Mote[] = [];
  private smokeWisps: SmokeWisp[] = [];
  private clickParticles: ClickParticle[] = [];
  private footstepDust: Array<{ x: number; y: number; vx: number; vy: number; size: number; alpha: number }> = [];

  // Smooth parallax camera lerping (eradicates jitter completely)
  private currentParallax: number = 0;

  // Hotspot reveal sense pulse timer
  private hotspotTimer: number = 0;

  // Mechanical lever current angle interpolation (-0.62 up, +0.62 down)
  private leverCurrentAngle: number = -0.62;

  // Fantasy Owl state machine
  private owlState: 'perched' | 'flying' = 'perched';
  private currentPerchIndex: number = 0;
  private owlX: number = OWL_PERCHES[0].x;
  private owlY: number = OWL_PERCHES[0].y;
  private owlFlightProgress: number = 0;
  private owlStartPos: { x: number; y: number } = { x: OWL_PERCHES[0].x, y: OWL_PERCHES[0].y };
  private owlTargetPos: { x: number; y: number } = { x: OWL_PERCHES[0].x, y: OWL_PERCHES[0].y };
  private owlNextFlightTime: number = 18; // flight timer in seconds
  private owlHeadAngle: number = 0;

  // Animated door opening progress per room [0.0 = closed, 1.0 = fully open]
  private currentRoomId: string = '';
  private doorOpenProgress: number = 0;
  private doorSparkles: Array<{ x: number; y: number; vx: number; vy: number; alpha: number; size: number; color: string }> = [];

  // Mobile Touch Ripple visual effects
  private touchRipples: Array<{ x: number; y: number; radius: number; maxRadius: number; alpha: number }> = [];

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Cannot get 2d context');
    this.ctx = context;
    this.initMotes();
  }

  private initMotes() {
    this.motes = [];
    for (let i = 0; i < 45; i++) {
      this.motes.push({
        x: Math.random() * ROOM_WIDTH,
        y: Math.random() * ROOM_HEIGHT,
        vx: (Math.random() - 0.5) * 0.35,
        vy: -0.15 - Math.random() * 0.3,
        size: 1.2 + Math.random() * 2.2,
        alpha: 0.15 + Math.random() * 0.45,
      });
    }
  }

  public triggerHotspotPulse() {
    this.hotspotTimer = 2.4; // 2.4 seconds duration
  }

  public spawnFootstepDust(x: number, y: number) {
    for (let i = 0; i < 3; i++) {
      this.footstepDust.push({
        x: x + (Math.random() - 0.5) * 14,
        y: y + Math.random() * 2,
        vx: (Math.random() - 0.5) * 0.6,
        vy: -0.2 - Math.random() * 0.4,
        size: 1.5 + Math.random() * 2,
        alpha: 0.35,
      });
    }
  }

  public spawnClickBurst(x: number, y: number) {
    const colors = ['#d4af37', '#eedec5', '#6ba3be', '#c28752', '#ffffff'];
    for (let i = 0; i < 18; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.8 + Math.random() * 4.2;
      this.clickParticles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.2,
        size: 2.2 + Math.random() * 3.5,
        color: colors[i % colors.length],
        alpha: 1.0,
        life: 0,
      });
    }
  }

  public spawnTouchRipple(x: number, y: number) {
    this.touchRipples.push({
      x,
      y,
      radius: 4,
      maxRadius: 40,
      alpha: 0.95,
    });
    this.spawnClickBurst(x, y);
  }

  public getSpatialTransform() {
    const scale = Math.min(this.canvas.width / ROOM_WIDTH, this.canvas.height / ROOM_HEIGHT);
    const offsetX = (this.canvas.width - ROOM_WIDTH * scale) / 2;
    const offsetY = (this.canvas.height - ROOM_HEIGHT * scale) / 2;
    return { scale, offsetX, offsetY };
  }

  public screenToWorld(clientX: number, clientY: number): { x: number; y: number } {
    const rect = this.canvas.getBoundingClientRect();
    const { scale, offsetX, offsetY } = this.getSpatialTransform();
    const x = (clientX - rect.left - offsetX) / scale;
    const y = (clientY - rect.top - offsetY) / scale;
    return { x, y };
  }

  public render(
    room: RoomData,
    player: PlayerState,
    hoveredObjectId: string | null,
    camera: { x: number; y: number },
    roomFlags: Record<string, boolean>,
    deltaSeconds?: number
  ) {
    const dt = deltaSeconds ? Math.min(deltaSeconds, 0.05) : 0.016;
    this.time += dt;

    if (this.currentRoomId !== room.id) {
      this.currentRoomId = room.id;
      this.doorOpenProgress = roomFlags['door_unlocked'] ? 1.0 : 0.0;
      this.doorSparkles = [];
    }

    if (this.hotspotTimer > 0) {
      this.hotspotTimer -= dt;
    }

    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;

    // Pitch black theater border
    ctx.fillStyle = '#070504';
    ctx.fillRect(0, 0, width, height);

    const { scale, offsetX, offsetY } = this.getSpatialTransform();

    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);

    // Smoothly interpolated 2.5D camera parallax based on player horizontal motion
    const targetParallax = (player.x - ROOM_WIDTH / 2) * 0.022;
    this.currentParallax += (targetParallax - this.currentParallax) * Math.min(1.0, dt * 8.0);

    ctx.save();
    ctx.translate(-this.currentParallax, 0);

    // 1. Hand-Illustrated Room Architecture (Stone masonry with cracks, ceiling beams, arched windows with moonbeams, perspective floorboards with rug)
    this.renderPerspectiveRoom(ctx, room, this.currentParallax);

    // 2. Lived-in Furniture & Decor (Barrels, crates, sconces, chandeliers, hanging banners)
    this.renderRoomDecor(ctx, roomFlags);

    // 3. Grounded Interactive Objects (Wizard statues with distinct carved poses, lever, table, mounted bookshelves)
    this.renderObjects(ctx, room, hoveredObjectId, roomFlags, player, dt);

    // 3b. Hotspot Sense Tooltip & Rune Overlay (when player presses Space or calls Owl inspect)
    if (this.hotspotTimer > 0) {
      this.renderHotspotsOverlay(ctx, room);
    }

    // 4. Illustrated Fantasy Apprentice Explorer
    this.renderApprentice(ctx, player);

    // 5. Intelligent Fantasy Owl (Perched with feathers or smoothly gliding between perches)
    this.updateAndRenderOwl(ctx, player);

    // 6. Lighting Pass: Soft Moonbeams & Warm Candle Halos
    this.renderLightingPass(ctx, player, roomFlags);

    // 7. Dynamic Dust Motes, Candle Smoke Wisps, Footstep Dust & Click Burst Particles
    this.renderParticles(ctx, dt);

    // 8. Heavy Rusty Lake Vignette & Inked Theater Frame
    this.renderRustyLakeFrame(ctx);

    ctx.restore();
    ctx.restore();
  }

  // --- 1. HAND-ILLUSTRATED ROOM ARCHITECTURE WITH CRACKS & GRAIN ---
  private renderPerspectiveRoom(ctx: CanvasRenderingContext2D, room: RoomData, parallax: number) {
    const w = ROOM_WIDTH;
    const h = ROOM_HEIGHT;
    const floorY = 510;

    // Back Wall: Multi-tone weathered masonry plaster with subtle grunge
    const wallGrad = ctx.createLinearGradient(0, 0, 0, floorY);
    wallGrad.addColorStop(0, '#1c1713');
    wallGrad.addColorStop(0.4, '#26201b');
    wallGrad.addColorStop(0.85, '#1e1914');
    wallGrad.addColorStop(1, '#17130f');
    ctx.fillStyle = wallGrad;
    ctx.fillRect(0, 0, w, floorY);

    // Hand-sketched stone block courses with visible cracks and imperfections
    ctx.strokeStyle = '#120e0b';
    ctx.lineWidth = 1.8;
    for (let y = 45; y < floorY; y += 45) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();

      const shift = ((y / 45) % 2) * 60;
      for (let x = shift; x < w; x += 120) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + 45);
        ctx.stroke();

        // Occasional stone mortar hairline crack
        if ((x + y) % 5 === 0) {
          ctx.beginPath();
          ctx.moveTo(x + 10, y + 10);
          ctx.lineTo(x + 25, y + 18);
          ctx.lineTo(x + 35, y + 15);
          ctx.stroke();
        }
      }
    }

    // Moss / damp stains in corners
    ctx.fillStyle = 'rgba(28, 42, 26, 0.25)';
    ctx.beginPath();
    ctx.moveTo(80, floorY);
    ctx.quadraticCurveTo(120, floorY - 60, 80, floorY - 90);
    ctx.lineTo(80, floorY);
    ctx.fill();

    // Left and Right receding side-wall planes (True 3-walled enclosure)
    ctx.fillStyle = '#14100c';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(80, 36);
    ctx.lineTo(80, floorY);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#090705';
    ctx.lineWidth = 3.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(w, 0);
    ctx.lineTo(w - 80, 36);
    ctx.lineTo(w - 80, floorY);
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Overhead heavy wooden timber support beams with wood grain lines and iron plates
    ctx.fillStyle = '#241a12';
    ctx.fillRect(0, 0, w, 36);
    ctx.strokeStyle = '#0a0806';
    ctx.lineWidth = 3;
    ctx.strokeRect(0, 0, w, 36);

    // Wood grain lines on timber
    ctx.strokeStyle = '#18120c';
    ctx.lineWidth = 1.2;
    for (let gy = 8; gy < 36; gy += 8) {
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.quadraticCurveTo(w / 2, gy + (gy % 2 === 0 ? 3 : -3), w, gy);
      ctx.stroke();
    }

    // Heavy iron cross-straps on beams
    for (let bx = 160; bx < w; bx += 240) {
      ctx.fillStyle = '#17110d';
      ctx.fillRect(bx - 14, 36, 28, 28);
      ctx.strokeStyle = '#0a0806';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(bx - 14, 36, 28, 28);

      // Iron rivet bolts
      ctx.fillStyle = '#4a3d31';
      ctx.beginPath();
      ctx.arc(bx, 48, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#0a0806';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Three Gothic Arched Windows with Drifting Night Clouds and Moon
    for (let i = 0; i < 3; i++) {
      const winX = 220 + i * 380;
      const winY = 80;
      const winW = 86;
      const winH = 170;

      ctx.save();
      // Gothic arch shape
      ctx.beginPath();
      ctx.moveTo(winX, winY + winH);
      ctx.lineTo(winX, winY + 45);
      ctx.quadraticCurveTo(winX + winW / 2, winY - 20, winX + winW, winY + 45);
      ctx.lineTo(winX + winW, winY + winH);
      ctx.closePath();

      // Exterior sky
      const skyGrad = ctx.createLinearGradient(winX, winY, winX, winY + winH);
      skyGrad.addColorStop(0, '#0a1017');
      skyGrad.addColorStop(0.6, '#131b26');
      skyGrad.addColorStop(1, '#1b2230');
      ctx.fillStyle = skyGrad;
      ctx.fill();

      // Glowing crescent moon in center window
      if (i === 1) {
        ctx.fillStyle = '#eedec5';
        ctx.beginPath();
        ctx.arc(winX + 45, winY + 35, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#0a1017';
        ctx.beginPath();
        ctx.arc(winX + 49, winY + 33, 10, 0, Math.PI * 2);
        ctx.fill();
      }

      // Soft clouds drifting past
      const cloudShift = (this.time * 4 + i * 80) % (winW + 60);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.beginPath();
      ctx.arc(winX - 30 + cloudShift, winY + 55, 18, 0, Math.PI * 2);
      ctx.arc(winX - 15 + cloudShift, winY + 48, 22, 0, Math.PI * 2);
      ctx.arc(winX + 5 + cloudShift, winY + 55, 16, 0, Math.PI * 2);
      ctx.fill();

      // Hand-inked stone window frame & mullions
      ctx.strokeStyle = '#0d0a08';
      ctx.lineWidth = 3.5;
      ctx.stroke();

      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(winX + winW / 2, winY + 5);
      ctx.lineTo(winX + winW / 2, winY + winH);
      ctx.moveTo(winX, winY + 80);
      ctx.lineTo(winX + winW, winY + 80);
      ctx.stroke();

      // Billowing velvet curtain on window sides
      const drapeWobble = Math.sin(this.time * 2 + i) * 3;
      ctx.fillStyle = '#361818';
      // Left curtain
      ctx.beginPath();
      ctx.moveTo(winX - 10, winY + 10);
      ctx.quadraticCurveTo(winX - 2 + drapeWobble, winY + winH / 2, winX - 6, winY + winH);
      ctx.lineTo(winX - 18, winY + winH);
      ctx.lineTo(winX - 18, winY + 10);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Right curtain
      ctx.beginPath();
      ctx.moveTo(winX + winW + 10, winY + 10);
      ctx.quadraticCurveTo(winX + winW + 2 - drapeWobble, winY + winH / 2, winX + winW + 6, winY + winH);
      ctx.lineTo(winX + winW + 18, winY + winH);
      ctx.lineTo(winX + winW + 18, winY + 10);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.restore();
    }

    // Floor Baseboard & Ambient Occlusion Drop Shadow Crease
    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.fillRect(0, floorY - 6, w, 18);

    ctx.fillStyle = '#171310';
    ctx.fillRect(0, floorY - 14, w, 14);
    ctx.strokeStyle = '#0b0806';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, floorY);
    ctx.lineTo(w, floorY);
    ctx.moveTo(0, floorY - 14);
    ctx.lineTo(w, floorY - 14);
    ctx.stroke();

    // Perspective Wooden Floorboards
    ctx.fillStyle = '#231d17';
    ctx.fillRect(0, floorY, w, h - floorY);

    // Vanishing perspective plank seams
    ctx.strokeStyle = '#120e0b';
    ctx.lineWidth = 2.5;
    for (let x = -80; x < w + 80; x += 90) {
      ctx.beginPath();
      ctx.moveTo(x + (x - w / 2) * 0.25, floorY);
      ctx.lineTo(x + (x - w / 2) * 0.75, h);
      ctx.stroke();
    }

    // Horizontal plank lines
    ctx.strokeStyle = '#16110c';
    ctx.lineWidth = 2;
    for (let y = floorY + 45; y < h; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Central Ornate Persian Rug laid flat on floor
    ctx.save();
    const rugX = 460;
    const rugY = 535;
    const rugW = 360;
    const rugH = 145;

    // Contact drop shadow of rug
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(rugX - 4, rugY - 2, rugW + 8, rugH + 6);

    // Rug base (antique burgundy with faded patina)
    ctx.fillStyle = '#421d1d';
    ctx.fillRect(rugX, rugY, rugW, rugH);
    ctx.strokeStyle = '#0a0806';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(rugX, rugY, rugW, rugH);

    // Rug borders & medallion
    ctx.strokeStyle = '#8a6d3b';
    ctx.lineWidth = 2;
    ctx.strokeRect(rugX + 12, rugY + 10, rugW - 24, rugH - 20);

    ctx.fillStyle = '#261b17';
    ctx.beginPath();
    ctx.moveTo(rugX + rugW / 2, rugY + 25);
    ctx.lineTo(rugX + rugW / 2 + 50, rugY + rugH / 2);
    ctx.lineTo(rugX + rugW / 2, rugY + rugH - 25);
    ctx.lineTo(rugX + rugW / 2 - 50, rugY + rugH / 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Fringe on rug ends
    ctx.strokeStyle = '#c4b69b';
    ctx.lineWidth = 1.5;
    for (let fx = rugX + 6; fx < rugX + rugW - 6; fx += 7) {
      ctx.beginPath();
      ctx.moveTo(fx, rugY);
      ctx.lineTo(fx, rugY - 4);
      ctx.moveTo(fx, rugY + rugH);
      ctx.lineTo(fx, rugY + rugH + 4);
      ctx.stroke();
    }
    ctx.restore();
  }

  // --- 2. LIVED-IN DECOR: BARRELS, SCONCES, HANGING LANTERNS ---
  private renderRoomDecor(ctx: CanvasRenderingContext2D, roomFlags: Record<string, boolean>) {
    // Left Corner: Wooden Barrels and Stamped Supply Crates
    this.renderCratesAndBarrels(ctx, 95, 520);

    // Right Corner: Stacks of Archival Books & Flasks
    this.renderRightCornerClutter(ctx, 1175, 525);

    // Wall Sconces with burning candles on side walls
    this.renderWallSconce(ctx, 140, 240);
    this.renderWallSconce(ctx, 1140, 240);

    // Overhead Hanging Lanterns swaying on chain from ceiling beams
    this.renderHangingLantern(ctx, 500, 36);
    this.renderHangingLantern(ctx, 780, 36);

    // Occult Banners hanging between windows
    this.renderHangingBanner(ctx, 400, 60, '#2b382d', '✦');
    this.renderHangingBanner(ctx, 880, 60, '#382b36', '✧');
  }

  private renderCratesAndBarrels(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.save();
    ctx.translate(x, y);

    // Floor contact shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.beginPath();
    ctx.ellipse(0, 6, 45, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    // Wooden Barrel with staves and rusted iron hoops
    ctx.fillStyle = '#36281e';
    ctx.beginPath();
    ctx.ellipse(-15, -25, 20, 30, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#0b0806';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.strokeStyle = '#18130f';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-33, -38);
    ctx.lineTo(3, -38);
    ctx.moveTo(-33, -12);
    ctx.lineTo(3, -12);
    ctx.stroke();

    // Stamped wooden crate
    ctx.fillStyle = '#453526';
    ctx.fillRect(5, -42, 38, 42);
    ctx.strokeStyle = '#0b0806';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(5, -42, 38, 42);

    ctx.beginPath();
    ctx.moveTo(5, -42);
    ctx.lineTo(43, 0);
    ctx.stroke();

    ctx.fillStyle = '#1c150e';
    ctx.font = 'bold 9px "Courier New", monospace';
    ctx.fillText('N° 04', 12, -20);

    ctx.restore();
  }

  private renderRightCornerClutter(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.save();
    ctx.translate(x, y);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.beginPath();
    ctx.ellipse(0, 5, 35, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#542626';
    ctx.fillRect(-20, -12, 40, 12);
    ctx.strokeStyle = '#0b0806';
    ctx.lineWidth = 2;
    ctx.strokeRect(-20, -12, 40, 12);

    ctx.fillStyle = '#263b54';
    ctx.fillRect(-16, -22, 34, 10);
    ctx.strokeRect(-16, -22, 34, 10);

    ctx.fillStyle = '#3a4a28';
    ctx.fillRect(-18, -30, 36, 8);
    ctx.strokeRect(-18, -30, 36, 8);

    ctx.fillStyle = '#2a4a35';
    ctx.beginPath();
    ctx.arc(14, -14, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#0b0806';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#8f6832';
    ctx.fillRect(12, -26, 4, 6);

    ctx.restore();
  }

  private renderWallSconce(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.save();
    ctx.translate(x, y);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(-6, 2, 12, 35);

    ctx.fillStyle = '#1a1410';
    ctx.fillRect(-4, 0, 8, 30);
    ctx.strokeStyle = '#0a0806';
    ctx.lineWidth = 2;
    ctx.strokeRect(-4, 0, 8, 30);

    ctx.fillStyle = '#6b5428';
    ctx.fillRect(-8, -4, 16, 6);
    ctx.strokeRect(-8, -4, 16, 6);

    ctx.fillStyle = '#dcd5c0';
    ctx.fillRect(-4, -22, 8, 18);
    ctx.strokeStyle = '#0a0806';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-4, -22, 8, 18);

    const fY = -28 + Math.sin(this.time * 14 + x) * 1.5;
    ctx.fillStyle = '#e8a838';
    ctx.beginPath();
    ctx.ellipse(0, fY, 3.5, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#0a0806';
    ctx.lineWidth = 1;
    ctx.stroke();

    if (Math.random() < 0.08) {
      this.smokeWisps.push({
        x,
        y: y + fY - 5,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -0.8 - Math.random() * 0.6,
        size: 2,
        alpha: 0.35,
        life: 0,
      });
    }

    ctx.restore();
  }

  private renderHangingLantern(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.save();
    const sway = Math.sin(this.time * 2 + x) * 0.06;
    ctx.translate(x, y);
    ctx.rotate(sway);

    ctx.strokeStyle = '#0a0806';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 85);
    ctx.stroke();

    ctx.save();
    ctx.translate(0, 85);

    ctx.fillStyle = '#594424';
    ctx.beginPath();
    ctx.moveTo(-14, 0);
    ctx.lineTo(14, 0);
    ctx.lineTo(0, -10);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#0a0806';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#d4af37';
    ctx.fillRect(-12, 0, 24, 28);
    ctx.strokeStyle = '#0a0806';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(-12, 0, 24, 28);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-2, 10, 4, 8);

    ctx.restore();
    ctx.restore();
  }

  private renderHangingBanner(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, symbol: string) {
    ctx.save();
    ctx.translate(x, y);

    ctx.fillStyle = '#6e542b';
    ctx.fillRect(-24, 0, 48, 5);
    ctx.strokeStyle = '#0a0806';
    ctx.lineWidth = 2;
    ctx.strokeRect(-24, 0, 48, 5);

    const sway = Math.sin(this.time * 2.5 + x) * 2;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(-20, 5);
    ctx.lineTo(20, 5);
    ctx.lineTo(20 + sway * 0.4, 95);
    ctx.lineTo(0 + sway * 0.5, 80);
    ctx.lineTo(-20 + sway * 0.4, 95);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#0a0806';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.fillStyle = '#dcd5c0';
    ctx.font = 'bold 16px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(symbol, 0, 50);

    ctx.restore();
  }

  // --- 3. GROUNDED INTERACTIVE OBJECTS WITH DETAILED STATUES & TABLE ---
  private renderObjects(
    ctx: CanvasRenderingContext2D,
    room: RoomData,
    hoveredId: string | null,
    roomFlags: Record<string, boolean>,
    player: PlayerState,
    dt: number = 0.016
  ) {
    room.objects.forEach(obj => {
      const isHovered = hoveredId === obj.id;

      ctx.save();

      // If hovered: scale up slightly and draw warm golden aura
      if (isHovered) {
        ctx.translate(obj.x, obj.y);
        ctx.scale(1.025, 1.025);
        ctx.translate(-obj.x, -obj.y);

        ctx.fillStyle = 'rgba(212, 175, 55, 0.12)';
        ctx.fillRect(obj.x - obj.width / 2 - 8, obj.y - obj.height - 8, obj.width + 16, obj.height + 16);

        if (Math.random() < 0.25) {
          ctx.fillStyle = '#f5eedc';
          const sx = obj.x - obj.width / 2 + Math.random() * obj.width;
          const sy = obj.y - obj.height + Math.random() * obj.height;
          ctx.fillRect(sx, sy, 2, 2);
        }
      }

      if (obj.id.startsWith('statue_')) {
        this.renderDetailedWizardStatue(ctx, obj, roomFlags, player);
      } else if (obj.id === 'activation_lever') {
        this.renderMechanicalLever(ctx, obj, roomFlags['lever_pulled'] ?? false);
      } else if (obj.id === 'central_tower') {
        this.renderGroundedTowerTable(ctx, obj, roomFlags);
      } else if (obj.id === 'apex_receiver') {
        this.renderApexMatrix(ctx, obj, roomFlags);
      } else if (obj.id === 'painting_scholars') {
        this.renderMountedPainting(ctx, obj, roomFlags['painting_opened'] ?? false, player);
      } else if (obj.id === 'bookshelf_ancient') {
        this.renderMountedBookshelf(ctx, obj);
      } else if (obj.id.startsWith('pedestal_')) {
        this.renderGroundedPedestal(ctx, obj, roomFlags);
      } else if (obj.id === 'ancient_clock') {
        this.renderGroundedClock(ctx, obj, roomFlags['clock_solved'] ?? false);
      } else if (obj.id === 'crystal_cabinet') {
        this.renderGroundedCabinet(ctx, obj, roomFlags['cabinet_unlocked'] ?? false);
      } else if (obj.id === 'wall_tapestry') {
        this.renderMountedTapestry(ctx, obj);
      } else if (obj.id === 'magical_bridge') {
        this.renderRustyBridge(ctx, obj, roomFlags['bridge_active'] ?? false);
      } else if (obj.id.endsWith('_door') || obj.id === 'chamber_3_door' || obj.id === 'hall_door') {
        this.renderGroundedDoor(ctx, obj, roomFlags['door_unlocked'] ?? false, dt);
      } else if (obj.id === 'chamber_candles') {
        this.renderTableWithCandles(ctx, obj);
      } else if (obj.id === 'receiver_console') {
        this.renderReceiverConsole(ctx, obj, roomFlags);
      } else if (obj.id === 'prism_refractor') {
        this.renderPrismRefractor(ctx, obj, roomFlags);
      } else if (obj.id === 'scrambled_screen') {
        this.renderScrambledScreen(ctx, obj, roomFlags);
      } else if (obj.id === 'celestial_altar') {
        this.renderCelestialAltar(ctx, obj);
      } else if (obj.id === 'starry_skylight') {
        this.renderStarrySkylight(ctx, obj);
      } else {
        ctx.fillStyle = '#221e1a';
        ctx.strokeStyle = '#0d0a08';
        ctx.lineWidth = 2.5;
        ctx.fillRect(obj.x - obj.width / 2, obj.y - obj.height, obj.width, obj.height);
        ctx.strokeRect(obj.x - obj.width / 2, obj.y - obj.height, obj.width, obj.height);
      }

      ctx.restore();
    });
  }

  // --- 4 UNIQUE HAND-CARVED STONE WIZARD STATUES ---
  private renderDetailedWizardStatue(
    ctx: CanvasRenderingContext2D,
    obj: InteractiveObject,
    roomFlags: Record<string, boolean>,
    player: PlayerState
  ) {
    const isTransmitting = roomFlags['lever_pulled'] ?? false;
    ctx.save();
    ctx.translate(obj.x, obj.y);

    // Floor Contact Shadow (Heavy dark ellipse anchored to floorboards)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.beginPath();
    ctx.ellipse(0, 4, 46, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    // Stepped Granite Pedestal Plinth with etched masonry
    ctx.fillStyle = '#1c1714';
    ctx.fillRect(-42, -10, 84, 10);
    ctx.strokeStyle = '#0a0806';
    ctx.lineWidth = 3;
    ctx.strokeRect(-42, -10, 84, 10);

    ctx.fillStyle = '#2b241e';
    ctx.fillRect(-34, -28, 68, 18);
    ctx.strokeRect(-34, -28, 68, 18);

    // Specific wizard attributes based on statue ID
    if (obj.id === 'statue_blue') {
      // 1. Archmage Sylas (Azure Sage): Long braided beard, celestial circlet, sapphire astral rod
      this.renderSylasStatue(ctx, isTransmitting, player, obj);
    } else if (obj.id === 'statue_green') {
      // 2. Archdruid Rowan: Antlered forest hood, living ivy elderwood staff, emerald crest
      this.renderRowanStatue(ctx, isTransmitting, player, obj);
    } else if (obj.id === 'statue_purple') {
      // 3. Mystic Vesper: Shadow cowl, purple void eyes, floating amethyst prism sceptre
      this.renderVesperStatue(ctx, isTransmitting, player, obj);
    } else if (obj.id === 'statue_red') {
      // 4. Pyromancer Ignis: Flame-crowned mantle, spiked brazier staff with glowing ruby ember
      this.renderIgnisStatue(ctx, isTransmitting, player, obj);
    }

    ctx.restore();
  }

  // Archmage Sylas (Azure - Walsh [1, 1, 1, 1])
  private renderSylasStatue(ctx: CanvasRenderingContext2D, isTransmitting: boolean, player: PlayerState, obj: InteractiveObject) {
    const runeColor = '#4a85a8';

    // Inscribed Name
    ctx.fillStyle = '#14100c';
    ctx.font = 'bold 8px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('SYLAS [✦✦✦✦]', 0, -16);

    // Cloak with flowing robe folds
    ctx.fillStyle = '#3a342f';
    ctx.beginPath();
    ctx.moveTo(-25, -125);
    ctx.lineTo(25, -125);
    ctx.lineTo(30, -28);
    ctx.lineTo(-30, -28);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#0a0806';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Long Carved Wizard Beard
    ctx.fillStyle = '#bfae99';
    ctx.beginPath();
    ctx.moveTo(-12, -135);
    ctx.quadraticCurveTo(-14, -85, 0, -70);
    ctx.quadraticCurveTo(14, -85, 12, -135);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Head with Celestial Circlet
    ctx.fillStyle = '#48413b';
    ctx.beginPath();
    ctx.arc(0, -140, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Circlet
    ctx.fillStyle = isTransmitting ? '#6bb2db' : '#6b5428';
    ctx.fillRect(-14, -148, 28, 4);
    ctx.strokeRect(-14, -148, 28, 4);

    // Eerie Blinking Eyes
    this.renderStatueEyes(ctx, player.x - obj.x, runeColor, isTransmitting, -141);

    // Astral Rod with Sapphire Gemstone
    ctx.strokeStyle = '#18120c';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(22, -25);
    ctx.lineTo(26, -165);
    ctx.stroke();

    // Sapphire Gemstone
    ctx.fillStyle = isTransmitting ? '#5db0e2' : '#304a5e';
    ctx.beginPath();
    ctx.moveTo(26, -180);
    ctx.lineTo(33, -165);
    ctx.lineTo(26, -150);
    ctx.lineTo(19, -165);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#0a0806';
    ctx.lineWidth = 2;
    ctx.stroke();

    if (isTransmitting) {
      this.renderTransmissionBeam(ctx, obj.x, obj.y, runeColor);
    }
  }

  // Archdruid Rowan (Emerald - Walsh [1, -1, 1, -1])
  private renderRowanStatue(ctx: CanvasRenderingContext2D, isTransmitting: boolean, player: PlayerState, obj: InteractiveObject) {
    const runeColor = '#4e8c5c';

    ctx.fillStyle = '#14100c';
    ctx.font = 'bold 8px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('ROWAN [✦✧✦✧]', 0, -16);

    ctx.fillStyle = '#333830';
    ctx.beginPath();
    ctx.moveTo(-25, -125);
    ctx.lineTo(25, -125);
    ctx.lineTo(30, -28);
    ctx.lineTo(-30, -28);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#0a0806';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Horned / Antlered Druid Cowl
    ctx.fillStyle = '#3a4435';
    ctx.beginPath();
    ctx.arc(0, -140, 17, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Antlers
    ctx.strokeStyle = '#2b2118';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-10, -152);
    ctx.lineTo(-20, -172);
    ctx.lineTo(-26, -168);
    ctx.moveTo(-16, -165);
    ctx.lineTo(-12, -174);
    ctx.moveTo(10, -152);
    ctx.lineTo(20, -172);
    ctx.lineTo(26, -168);
    ctx.moveTo(16, -165);
    ctx.lineTo(12, -174);
    ctx.stroke();

    this.renderStatueEyes(ctx, player.x - obj.x, runeColor, isTransmitting, -141);

    // Elderwood Twisted Staff with Emerald Gem
    ctx.strokeStyle = '#3d2f21';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(22, -25);
    ctx.quadraticCurveTo(28, -90, 24, -165);
    ctx.stroke();

    // Emerald Gem in crook
    ctx.fillStyle = isTransmitting ? '#58d67a' : '#265434';
    ctx.beginPath();
    ctx.arc(24, -165, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#0a0806';
    ctx.lineWidth = 2;
    ctx.stroke();

    if (isTransmitting) {
      this.renderTransmissionBeam(ctx, obj.x, obj.y, runeColor);
    }
  }

  // Mystic Vesper (Amethyst - Walsh [1, 1, -1, -1])
  private renderVesperStatue(ctx: CanvasRenderingContext2D, isTransmitting: boolean, player: PlayerState, obj: InteractiveObject) {
    const runeColor = '#8c5ca8';

    ctx.fillStyle = '#14100c';
    ctx.font = 'bold 8px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('VESPER [✦✦✧✧]', 0, -16);

    ctx.fillStyle = '#352d3a';
    ctx.beginPath();
    ctx.moveTo(-25, -125);
    ctx.lineTo(25, -125);
    ctx.lineTo(30, -28);
    ctx.lineTo(-30, -28);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#0a0806';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Deep Shadow Hood (Face in shadow with glowing eyes)
    ctx.fillStyle = '#221926';
    ctx.beginPath();
    ctx.arc(0, -140, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#0a0806';
    ctx.lineWidth = 3;
    ctx.stroke();

    this.renderStatueEyes(ctx, player.x - obj.x, runeColor, isTransmitting, -141);

    // Amethyst Sceptre with floating crystal cluster
    ctx.strokeStyle = '#18120c';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(-22, -25);
    ctx.lineTo(-24, -165);
    ctx.stroke();

    ctx.fillStyle = isTransmitting ? '#c07ee8' : '#4d2b63';
    ctx.beginPath();
    ctx.moveTo(-24, -182);
    ctx.lineTo(-17, -168);
    ctx.lineTo(-24, -154);
    ctx.lineTo(-31, -168);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#0a0806';
    ctx.lineWidth = 2;
    ctx.stroke();

    if (isTransmitting) {
      this.renderTransmissionBeam(ctx, obj.x, obj.y, runeColor);
    }
  }

  // Pyromancer Ignis (Ruby - Walsh [1, -1, -1, 1])
  private renderIgnisStatue(ctx: CanvasRenderingContext2D, isTransmitting: boolean, player: PlayerState, obj: InteractiveObject) {
    const runeColor = '#a84a4a';

    ctx.fillStyle = '#14100c';
    ctx.font = 'bold 8px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('IGNIS [✦✧✧✦]', 0, -16);

    ctx.fillStyle = '#3d2d2d';
    ctx.beginPath();
    ctx.moveTo(-25, -125);
    ctx.lineTo(25, -125);
    ctx.lineTo(30, -28);
    ctx.lineTo(-30, -28);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#0a0806';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Pointed Flame-Crowned Mantle
    ctx.fillStyle = '#4a2626';
    ctx.beginPath();
    ctx.moveTo(-18, -135);
    ctx.lineTo(0, -165);
    ctx.lineTo(18, -135);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#0a0806';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.fillStyle = '#483a3a';
    ctx.beginPath();
    ctx.arc(0, -140, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    this.renderStatueEyes(ctx, player.x - obj.x, runeColor, isTransmitting, -141);

    // Spiked Brazier Staff with Glowing Ruby Ember
    ctx.strokeStyle = '#18120c';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(22, -25);
    ctx.lineTo(25, -165);
    ctx.stroke();

    // Brazier cage
    ctx.fillStyle = '#5c4524';
    ctx.fillRect(17, -172, 16, 10);
    ctx.strokeRect(17, -172, 16, 10);

    // Ruby Ember
    ctx.fillStyle = isTransmitting ? '#e85858' : '#6b2020';
    ctx.beginPath();
    ctx.arc(25, -172, 6, 0, Math.PI * 2);
    ctx.fill();

    if (isTransmitting) {
      this.renderTransmissionBeam(ctx, obj.x, obj.y, runeColor);
    }
  }

  private renderStatueEyes(ctx: CanvasRenderingContext2D, lookDiff: number, runeColor: string, isTransmitting: boolean, yPos: number) {
    const isBlinking = Math.sin(this.time * 0.7) > 0.95;
    if (!isBlinking) {
      ctx.fillStyle = '#f0ead6';
      ctx.fillRect(-7, yPos, 5, 4);
      ctx.fillRect(2, yPos, 5, 4);
      ctx.strokeStyle = '#0d0b09';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-7, yPos, 5, 4);
      ctx.strokeRect(2, yPos, 5, 4);

      const lookX = Math.max(-1.5, Math.min(1.5, lookDiff * 0.005));
      ctx.fillStyle = isTransmitting ? runeColor : '#090807';
      ctx.beginPath();
      ctx.arc(-4.5 + lookX, yPos + 2, 1.2, 0, Math.PI * 2);
      ctx.arc(4.5 + lookX, yPos + 2, 1.2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.strokeStyle = '#0d0b09';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-7, yPos + 2);
      ctx.lineTo(-2, yPos + 2);
      ctx.moveTo(2, yPos + 2);
      ctx.lineTo(7, yPos + 2);
      ctx.stroke();
    }
  }

  private renderTransmissionBeam(ctx: CanvasRenderingContext2D, objX: number, objY: number, color: string) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(0, -65);
    ctx.quadraticCurveTo(640 - objX, -140, 640 - objX, 370 - objY);
    ctx.stroke();
  }

  // --- MECHANICAL TWO-STATE BRASS LEVER (UP / DOWN) ---
  private renderMechanicalLever(ctx: CanvasRenderingContext2D, obj: InteractiveObject, isDown: boolean) {
    ctx.save();
    ctx.translate(obj.x, obj.y);

    const targetAngle = isDown ? 0.62 : -0.62;
    this.leverCurrentAngle += (targetAngle - this.leverCurrentAngle) * 0.22;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.beginPath();
    ctx.ellipse(0, 3, 26, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#211a14';
    ctx.fillRect(-22, -14, 44, 14);
    ctx.strokeStyle = '#0a0806';
    ctx.lineWidth = 3;
    ctx.strokeRect(-22, -14, 44, 14);

    ctx.fillStyle = '#33271d';
    ctx.beginPath();
    ctx.arc(0, -22, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.save();
    ctx.translate(0, -22);
    if (isDown) {
      ctx.rotate(this.time * 6);
    }
    ctx.strokeStyle = '#6e542b';
    ctx.lineWidth = 2;
    for (let c = 0; c < 6; c++) {
      ctx.rotate(Math.PI / 3);
      ctx.strokeRect(-2, -16, 4, 6);
    }
    ctx.restore();

    ctx.save();
    ctx.translate(0, -22);
    ctx.rotate(this.leverCurrentAngle);

    ctx.fillStyle = '#8f6832';
    ctx.fillRect(-3.5, -45, 7, 45);
    ctx.strokeStyle = '#0a0806';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(-3.5, -45, 7, 45);

    ctx.fillStyle = isDown ? '#b83b3b' : '#6b2020';
    ctx.beginPath();
    ctx.arc(0, -48, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.restore();

    ctx.fillStyle = '#6b5428';
    ctx.fillRect(-16, -3, 32, 8);
    ctx.strokeStyle = '#0a0806';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-16, -3, 32, 8);
    ctx.fillStyle = isDown ? '#3b784b' : '#783b3b';
    ctx.fillRect(isDown ? 0 : -14, -2, 14, 6);

    ctx.restore();
  }

  // --- GROUNDED TOWER RESTING ON RESEARCH CONSOLE TABLE ---
  private renderGroundedTowerTable(ctx: CanvasRenderingContext2D, obj: InteractiveObject, roomFlags: Record<string, boolean>) {
    const isTransmitting = roomFlags['lever_pulled'] ?? false;
    const isSeparated = roomFlags['seal_inserted'] ?? false;

    ctx.save();
    ctx.translate(obj.x, obj.y);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.beginPath();
    ctx.ellipse(0, 6, 85, 20, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#1c1510';
    ctx.fillRect(-70, -75, 12, 75);
    ctx.fillRect(58, -75, 12, 75);
    ctx.strokeStyle = '#0a0806';
    ctx.lineWidth = 3;
    ctx.strokeRect(-70, -75, 12, 75);
    ctx.strokeRect(58, -75, 12, 75);

    ctx.fillStyle = '#2b2118';
    ctx.fillRect(-78, -85, 156, 18);
    ctx.strokeRect(-78, -85, 156, 18);
    ctx.fillStyle = '#6e542b';
    ctx.fillRect(-35, -78, 12, 4);
    ctx.fillRect(23, -78, 12, 4);

    ctx.fillStyle = '#382a1f';
    ctx.fillRect(-85, -95, 170, 10);
    ctx.strokeRect(-85, -95, 170, 10);

    ctx.fillStyle = '#ded5be';
    ctx.fillRect(-65, -99, 24, 5);
    ctx.fillStyle = '#14110e';
    ctx.fillRect(-30, -102, 7, 7);

    ctx.save();
    ctx.translate(0, -95);

    ctx.fillStyle = '#5c4524';
    ctx.fillRect(-45, -20, 90, 20);
    ctx.strokeStyle = '#0a0806';
    ctx.lineWidth = 3;
    ctx.strokeRect(-45, -20, 90, 20);

    ctx.beginPath();
    ctx.arc(0, -75, 44, 0, Math.PI * 2);
    ctx.fillStyle = isTransmitting ? 'rgba(28, 24, 20, 0.92)' : 'rgba(20, 17, 14, 0.88)';
    ctx.fill();
    ctx.strokeStyle = '#0a0806';
    ctx.lineWidth = 3.5;
    ctx.stroke();

    if (isTransmitting) {
      const orbRadius = 28 + Math.sin(this.time * 5) * 3;
      ctx.fillStyle = isSeparated ? '#588da8' : '#8a715a';
      ctx.beginPath();
      ctx.arc(0, -75, orbRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#0a0806';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      if (isSeparated) {
        ctx.strokeStyle = '#588da8';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(0, -75);
        ctx.lineTo(0, -320);
        ctx.stroke();
      }
    }

    ctx.fillStyle = isSeparated ? '#588da8' : '#261f18';
    ctx.beginPath();
    ctx.arc(0, -30, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#0a0806';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.restore();
    ctx.restore();
  }

  // --- MOUNTED PAINTING HANGING BY CORDS FROM WALL ---
  private renderMountedPainting(
    ctx: CanvasRenderingContext2D,
    obj: InteractiveObject,
    isOpened: boolean,
    player: PlayerState
  ) {
    ctx.save();
    ctx.translate(obj.x, obj.y);

    ctx.strokeStyle = '#0a0806';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -obj.height - 25);
    ctx.lineTo(-obj.width / 3, -obj.height);
    ctx.moveTo(0, -obj.height - 25);
    ctx.lineTo(obj.width / 3, -obj.height);
    ctx.stroke();

    ctx.fillStyle = '#7a6032';
    ctx.beginPath();
    ctx.arc(0, -obj.height - 25, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fillRect(-obj.width / 2 + 5, -obj.height + 5, obj.width, obj.height);

    ctx.fillStyle = '#4a3b22';
    ctx.fillRect(-obj.width / 2, -obj.height, obj.width, obj.height);
    ctx.strokeStyle = '#0a0806';
    ctx.lineWidth = 3.5;
    ctx.strokeRect(-obj.width / 2, -obj.height, obj.width, obj.height);

    ctx.fillStyle = '#26201b';
    ctx.fillRect(-obj.width / 2 + 5, -obj.height + 5, obj.width - 10, obj.height - 10);

    ctx.fillStyle = '#e5dec9';
    [-22, 0, 22].forEach(fx => {
      ctx.beginPath();
      ctx.arc(fx, -obj.height + 40, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#0a0806';
      ctx.lineWidth = 2;
      ctx.stroke();

      const lookX = Math.max(-1.5, Math.min(1.5, (player.x - obj.x) * 0.006));
      ctx.fillStyle = '#0a0806';
      ctx.fillRect(fx - 3 + lookX, -obj.height + 38, 2, 2);
      ctx.fillRect(fx + 1 + lookX, -obj.height + 38, 2, 2);
    });

    if (isOpened) {
      ctx.fillStyle = '#3a5f78';
      ctx.beginPath();
      ctx.arc(0, -obj.height / 2 + 10, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#0a0806';
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }

    ctx.restore();
  }

  // --- MOUNTED BOOKSHELF WITH WOODEN WALL BRACKETS ---
  private renderMountedBookshelf(ctx: CanvasRenderingContext2D, obj: InteractiveObject) {
    ctx.save();
    ctx.translate(obj.x, obj.y);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fillRect(-obj.width / 2 + 6, -obj.height + 6, obj.width, obj.height);

    // Carved Wooden Wall Brackets underneath supporting shelf
    ctx.fillStyle = '#211812';
    // Left bracket
    ctx.beginPath();
    ctx.moveTo(-obj.width / 2 + 10, 0);
    ctx.lineTo(-obj.width / 2 + 25, 0);
    ctx.lineTo(-obj.width / 2 + 10, 30);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#0a0806';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Right bracket
    ctx.beginPath();
    ctx.moveTo(obj.width / 2 - 25, 0);
    ctx.lineTo(obj.width / 2 - 10, 0);
    ctx.lineTo(obj.width / 2 - 10, 30);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Dark walnut case
    ctx.fillStyle = '#2b211a';
    ctx.fillRect(-obj.width / 2, -obj.height, obj.width, obj.height);
    ctx.strokeStyle = '#0a0806';
    ctx.lineWidth = 3.5;
    ctx.strokeRect(-obj.width / 2, -obj.height, obj.width, obj.height);

    // Shelves
    ctx.fillStyle = '#1c1510';
    ctx.fillRect(-obj.width / 2, -obj.height + 48, obj.width, 6);
    ctx.fillRect(-obj.width / 2, -obj.height + 102, obj.width, 6);

    // Books on shelves
    const bookColors = ['#6e2626', '#264a6e', '#2e5a36', '#6e5a26', '#4a266e'];
    for (let b = 0; b < 8; b++) {
      ctx.fillStyle = bookColors[b % bookColors.length];
      ctx.fillRect(-obj.width / 2 + 8 + b * 13, -obj.height + 16, 10, 32);
      ctx.strokeStyle = '#0a0806';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-obj.width / 2 + 8 + b * 13, -obj.height + 16, 10, 32);
    }

    for (let b = 0; b < 5; b++) {
      ctx.fillStyle = bookColors[(b + 2) % bookColors.length];
      ctx.fillRect(-obj.width / 2 + 10 + b * 14, -obj.height + 68, 11, 34);
      ctx.strokeStyle = '#0a0806';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-obj.width / 2 + 10 + b * 14, -obj.height + 68, 11, 34);
    }

    // Human skull bookend
    ctx.fillStyle = '#ded5be';
    ctx.beginPath();
    ctx.arc(obj.width / 2 - 22, -obj.height + 84, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#0a0806';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#0a0806';
    ctx.fillRect(obj.width / 2 - 25, -obj.height + 82, 3, 4);
    ctx.fillRect(obj.width / 2 - 19, -obj.height + 82, 3, 4);

    ctx.restore();
  }

  // --- GROUNDED PEDESTAL ---
  private renderGroundedPedestal(ctx: CanvasRenderingContext2D, obj: InteractiveObject, roomFlags: Record<string, boolean>) {
    const isInserted = roomFlags[`inserted_${obj.id}`] ?? false;

    ctx.save();
    ctx.translate(obj.x, obj.y);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.beginPath();
    ctx.ellipse(0, 4, 38, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#1c1714';
    ctx.fillRect(-36, -10, 72, 10);
    ctx.strokeStyle = '#0a0806';
    ctx.lineWidth = 3;
    ctx.strokeRect(-36, -10, 72, 10);

    ctx.fillStyle = '#26211d';
    ctx.fillRect(-obj.width / 2, -obj.height, obj.width, obj.height - 10);
    ctx.strokeRect(-obj.width / 2, -obj.height, obj.width, obj.height - 10);

    ctx.fillStyle = isInserted ? '#4f3a2a' : '#1a1714';
    ctx.beginPath();
    ctx.arc(0, -obj.height, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#0a0806';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    if (isInserted) {
      let col = '#4a7c9b';
      if (obj.id.includes('2')) col = '#4e7e5a';
      if (obj.id.includes('3')) col = '#7a5a8a';
      if (obj.id.includes('4')) col = '#944a4a';

      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.arc(0, -obj.height, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#0a0806';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    ctx.restore();
  }

  // --- GROUNDED GRANDFATHER CLOCK ---
  private renderGroundedClock(ctx: CanvasRenderingContext2D, obj: InteractiveObject, isSolved: boolean) {
    ctx.save();
    ctx.translate(obj.x, obj.y);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.beginPath();
    ctx.ellipse(0, 4, 44, 13, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#1f1610';
    ctx.fillRect(-44, -12, 88, 12);
    ctx.strokeStyle = '#0a0806';
    ctx.lineWidth = 3;
    ctx.strokeRect(-44, -12, 88, 12);

    ctx.fillStyle = '#2e2219';
    ctx.fillRect(-obj.width / 2, -obj.height, obj.width, obj.height - 12);
    ctx.strokeRect(-obj.width / 2, -obj.height, obj.width, obj.height - 12);

    ctx.fillStyle = '#ece3cf';
    ctx.beginPath();
    ctx.arc(0, -obj.height + 36, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#0a0806';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.strokeStyle = '#0a0806';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, -obj.height + 36);
    ctx.lineTo(0, -obj.height + 20);
    ctx.moveTo(0, -obj.height + 36);
    ctx.lineTo(isSolved ? 0 : 12, isSolved ? -obj.height + 50 : -obj.height + 36);
    ctx.stroke();

    ctx.fillStyle = '#14100c';
    ctx.fillRect(-16, -obj.height + 72, 32, 54);
    ctx.strokeStyle = '#0a0806';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(-16, -obj.height + 72, 32, 54);

    const pSwing = Math.sin(this.time * 3) * 9;
    ctx.strokeStyle = '#856832';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -obj.height + 72);
    ctx.lineTo(pSwing, -obj.height + 112);
    ctx.stroke();
    ctx.fillStyle = '#d4af37';
    ctx.beginPath();
    ctx.arc(pSwing, -obj.height + 112, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    if (isSolved) {
      ctx.fillStyle = '#3a694a';
      ctx.beginPath();
      ctx.arc(0, -obj.height + 95, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#0a0806';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    ctx.restore();
  }

  // --- GROUNDED VELVET CABINET ---
  private renderGroundedCabinet(ctx: CanvasRenderingContext2D, obj: InteractiveObject, isUnlocked: boolean) {
    ctx.save();
    ctx.translate(obj.x, obj.y);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.beginPath();
    ctx.ellipse(0, 4, 48, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#1f1313';
    ctx.fillRect(-obj.width / 2 + 4, -10, 16, 10);
    ctx.fillRect(obj.width / 2 - 20, -10, 16, 10);
    ctx.strokeStyle = '#0a0806';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(-obj.width / 2 + 4, -10, 16, 10);
    ctx.strokeRect(obj.width / 2 - 20, -10, 16, 10);

    ctx.fillStyle = '#301f1f';
    ctx.fillRect(-obj.width / 2, -obj.height, obj.width, obj.height - 10);
    ctx.strokeStyle = '#0a0806';
    ctx.lineWidth = 3.5;
    ctx.strokeRect(-obj.width / 2, -obj.height, obj.width, obj.height - 10);

    ctx.fillStyle = '#8f6832';
    [-18, 0, 18].forEach(tx => {
      ctx.fillRect(tx - 6, -obj.height / 2 - 8, 12, 16);
      ctx.strokeStyle = '#0a0806';
      ctx.lineWidth = 1.8;
      ctx.strokeRect(tx - 6, -obj.height / 2 - 8, 12, 16);
    });

    if (isUnlocked) {
      ctx.fillStyle = '#583a6b';
      ctx.fillRect(-obj.width / 2 + 8, -obj.height / 2 + 15, obj.width - 16, 20);
      ctx.strokeStyle = '#0a0806';
      ctx.lineWidth = 2;
      ctx.strokeRect(-obj.width / 2 + 8, -obj.height / 2 + 15, obj.width - 16, 20);
    }

    ctx.restore();
  }

  // --- MOUNTED TAPESTRY ---
  private renderMountedTapestry(ctx: CanvasRenderingContext2D, obj: InteractiveObject) {
    ctx.save();
    ctx.translate(obj.x, obj.y);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(-obj.width / 2 + 5, -obj.height + 5, obj.width, obj.height);

    ctx.fillStyle = '#5c4524';
    ctx.fillRect(-obj.width / 2 - 6, -obj.height - 4, obj.width + 12, 6);
    ctx.strokeStyle = '#0a0806';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(-obj.width / 2 - 6, -obj.height - 4, obj.width + 12, 6);

    ctx.fillStyle = '#bfae93';
    ctx.fillRect(-obj.width / 2, -obj.height + 2, obj.width, obj.height - 2);
    ctx.strokeRect(-obj.width / 2, -obj.height + 2, obj.width, obj.height - 2);

    ctx.fillStyle = '#1c1610';
    ctx.font = 'bold 10px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('WALSH SEQUENCES', 0, -obj.height + 24);
    ctx.fillText('I. [✦ ✦ ✦ ✦]', 0, -obj.height + 44);
    ctx.fillText('II. [✦ ✧ ✦ ✧]', 0, -obj.height + 62);
    ctx.fillText('III. [✦ ✦ ✧ ✧]', 0, -obj.height + 80);
    ctx.fillText('IV. [✦ ✧ ✧ ✦]', 0, -obj.height + 98);

    ctx.restore();
  }

  // --- TABLE WITH THREE CANDLES ---
  private renderTableWithCandles(ctx: CanvasRenderingContext2D, obj: InteractiveObject) {
    ctx.save();
    ctx.translate(obj.x, obj.y);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(0, 4, 25, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#261b14';
    ctx.fillRect(-22, -25, 44, 25);
    ctx.strokeStyle = '#0a0806';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(-22, -25, 44, 25);

    ctx.save();
    ctx.translate(0, -25);

    [-12, 0, 12].forEach((cx, i) => {
      ctx.fillStyle = '#d6cca9';
      ctx.fillRect(cx - 3, -25, 6, 25);
      ctx.strokeStyle = '#0a0806';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(cx - 3, -25, 6, 25);

      const fY = -30 + Math.sin(this.time * 16 + i) * 1.5;
      ctx.fillStyle = '#e8a838';
      ctx.beginPath();
      ctx.ellipse(cx, fY, 3.5, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#0a0806';
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    ctx.restore();
    ctx.restore();
  }

  // --- GROUNDED DOOR WITH ANIMATED OPENING, LIGHT RAYS, SWINGING PANELS & SPARKLES ---
  private renderGroundedDoor(
    ctx: CanvasRenderingContext2D,
    obj: InteractiveObject,
    isUnlocked: boolean,
    dt: number = 0.016
  ) {
    // 1. Update animated door open progress [0.0 = locked, 1.0 = fully open]
    if (isUnlocked) {
      if (this.doorOpenProgress < 1.0) {
        this.doorOpenProgress = Math.min(1.0, this.doorOpenProgress + dt * 0.75); // ~1.3s smooth opening
        // Spawn burst of sparkling particles while opening
        if (Math.random() < 0.45) {
          this.doorSparkles.push({
            x: obj.x + (Math.random() - 0.5) * (obj.width * 0.6),
            y: obj.y - Math.random() * (obj.height * 0.8),
            vx: -0.7 - Math.random() * 1.5,
            vy: (Math.random() - 0.5) * 0.8,
            alpha: 1.0,
            size: 1.8 + Math.random() * 2.8,
            color: Math.random() < 0.6 ? '#d4af37' : '#fae7b5',
          });
        }
      }
    } else {
      this.doorOpenProgress = Math.max(0.0, this.doorOpenProgress - dt * 2.0);
    }

    // Cubic ease-out curve for natural stone door movement
    const p = this.doorOpenProgress;
    const openEase = 1 - Math.pow(1 - p, 3);

    ctx.save();
    ctx.translate(obj.x, obj.y);

    const w = obj.width;
    const h = obj.height;
    const archH = 28;

    // 2. Floor Contact Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.beginPath();
    ctx.ellipse(0, 4, w / 2 + 14, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // 3. Golden Floor Light Shaft (Beams out onto the floor when opening)
    if (openEase > 0.02) {
      const beamReach = 180 * openEase;
      const floorLightGrad = ctx.createLinearGradient(0, 0, -beamReach, 35 * openEase);
      floorLightGrad.addColorStop(0, `rgba(212, 175, 55, ${0.45 * openEase})`);
      floorLightGrad.addColorStop(0.5, `rgba(212, 175, 55, ${0.22 * openEase})`);
      floorLightGrad.addColorStop(1, 'rgba(212, 175, 55, 0)');

      ctx.fillStyle = floorLightGrad;
      ctx.beginPath();
      ctx.moveTo(-w / 2 * openEase, 0);
      ctx.lineTo(-w / 2 - beamReach, 45 * openEase);
      ctx.lineTo(w / 2 - beamReach * 0.4, 45 * openEase);
      ctx.lineTo(w / 2 * openEase, 0);
      ctx.closePath();
      ctx.fill();
    }

    // 4. Heavy Masonry Outer Arch Frame
    ctx.fillStyle = '#1c1611';
    ctx.beginPath();
    ctx.moveTo(-w / 2 - 14, 0);
    ctx.lineTo(-w / 2 - 14, -h + archH);
    ctx.quadraticCurveTo(0, -h - 18, w / 2 + 14, -h + archH);
    ctx.lineTo(w / 2 + 14, 0);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#090705';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Carved stone voussoirs / arch blocks
    ctx.strokeStyle = '#120d09';
    ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
      const angle = (Math.PI / 4) * i;
      const bx = Math.cos(angle) * (w / 2 + 4);
      const by = -h + archH + Math.sin(angle) * 12;
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(bx * 1.25, by - 6);
      ctx.stroke();
    }

    // Arch Keystone at Apex
    ctx.fillStyle = '#261e16';
    ctx.beginPath();
    ctx.moveTo(-8, -h - 6);
    ctx.lineTo(8, -h - 6);
    ctx.lineTo(6, -h + 12);
    ctx.lineTo(-6, -h + 12);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 5. Interior Portal Void & Ascending Stairs (Visible when door opens)
    ctx.save();
    // Clip inside the door opening aperture
    ctx.beginPath();
    ctx.moveTo(-w / 2, 0);
    ctx.lineTo(-w / 2, -h + archH);
    ctx.quadraticCurveTo(0, -h - 4, w / 2, -h + archH);
    ctx.lineTo(w / 2, 0);
    ctx.closePath();
    ctx.clip();

    // Pitch black corridor background
    ctx.fillStyle = '#060504';
    ctx.fillRect(-w / 2, -h - 10, w, h + 15);

    // If door is opening: render radiant corridor glow & ascending stairs
    if (openEase > 0.01) {
      // Warm glowing light from the next chamber
      const glowGrad = ctx.createRadialGradient(0, -h / 2, 8, 0, -h / 2, w);
      glowGrad.addColorStop(0, `rgba(250, 231, 181, ${0.95 * openEase})`);
      glowGrad.addColorStop(0.35, `rgba(212, 175, 55, ${0.75 * openEase})`);
      glowGrad.addColorStop(0.7, `rgba(38, 72, 88, ${0.5 * openEase})`);
      glowGrad.addColorStop(1, 'rgba(6, 5, 4, 0.95)');

      ctx.fillStyle = glowGrad;
      ctx.fillRect(-w / 2, -h - 10, w, h + 15);

      // Ascending stone stairs receding into the light
      ctx.strokeStyle = `rgba(18, 14, 10, ${0.85 * openEase})`;
      ctx.lineWidth = 3;
      const stepHeights = [-20, -45, -70, -95, -120, -145];
      stepHeights.forEach((sy, sIdx) => {
        const sw = (w * 0.9) * (1 - sIdx * 0.1);
        ctx.fillStyle = `rgba(32, 25, 18, ${0.75 * openEase})`;
        ctx.fillRect(-sw / 2, sy, sw, 12);
        ctx.strokeRect(-sw / 2, sy, sw, 12);

        // Highlight edge of stair tread
        ctx.strokeStyle = `rgba(250, 231, 181, ${0.45 * openEase})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(-sw / 2, sy);
        ctx.lineTo(sw / 2, sy);
        ctx.stroke();
      });

      // Luminous piercing light rays
      ctx.strokeStyle = `rgba(250, 238, 200, ${0.28 * openEase})`;
      ctx.lineWidth = 2;
      for (let r = 0; r < 4; r++) {
        const rayAngle = -0.5 + r * 0.35 + Math.sin(this.time * 2 + r) * 0.05;
        ctx.beginPath();
        ctx.moveTo(0, -h / 2);
        ctx.lineTo(Math.sin(rayAngle) * w * 1.2, 0);
        ctx.stroke();
      }
    }

    // 6. Left and Right Swinging Door Leaves (Oak Planks with Iron Bands)
    const doorLeafW = w / 2;
    const leafScaleX = 1 - openEase * 0.88; // 3D perspective foreshortening as it swings open

    // --- Left Door Leaf ---
    ctx.save();
    ctx.translate(-w / 2, 0);
    ctx.scale(leafScaleX, 1);

    ctx.fillStyle = '#221912';
    ctx.fillRect(0, -h + archH - 6, doorLeafW, h - archH + 6);
    ctx.strokeStyle = '#090705';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(0, -h + archH - 6, doorLeafW, h - archH + 6);

    // Vertical plank grooves
    ctx.strokeStyle = '#140f0a';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(doorLeafW / 2, -h + archH);
    ctx.lineTo(doorLeafW / 2, 0);
    ctx.stroke();

    // Heavy iron horizontal strapping
    ctx.fillStyle = '#100c09';
    ctx.fillRect(0, -h * 0.75, doorLeafW, 8);
    ctx.fillRect(0, -h * 0.35, doorLeafW, 8);

    // Iron ring handle
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(doorLeafW - 6, -h * 0.5, 4.5, 0, Math.PI * 2);
    ctx.stroke();

    // Inward swing bevel shadow
    if (openEase > 0) {
      ctx.fillStyle = `rgba(0, 0, 0, ${0.6 * openEase})`;
      ctx.fillRect(doorLeafW - 6, -h + archH - 6, 6, h);
    }
    ctx.restore();

    // --- Right Door Leaf ---
    ctx.save();
    ctx.translate(w / 2, 0);
    ctx.scale(leafScaleX, 1);

    ctx.fillStyle = '#221912';
    ctx.fillRect(-doorLeafW, -h + archH - 6, doorLeafW, h - archH + 6);
    ctx.strokeStyle = '#090705';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(-doorLeafW, -h + archH - 6, doorLeafW, h - archH + 6);

    // Vertical plank grooves
    ctx.strokeStyle = '#140f0a';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-doorLeafW / 2, -h + archH);
    ctx.lineTo(-doorLeafW / 2, 0);
    ctx.stroke();

    // Heavy iron horizontal strapping
    ctx.fillStyle = '#100c09';
    ctx.fillRect(-doorLeafW, -h * 0.75, doorLeafW, 8);
    ctx.fillRect(-doorLeafW, -h * 0.35, doorLeafW, 8);

    // Iron ring handle
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(-doorLeafW + 6, -h * 0.5, 4.5, 0, Math.PI * 2);
    ctx.stroke();

    // Inward swing bevel shadow
    if (openEase > 0) {
      ctx.fillStyle = `rgba(0, 0, 0, ${0.6 * openEase})`;
      ctx.fillRect(-doorLeafW, -h + archH - 6, 6, h);
    }
    ctx.restore();

    ctx.restore(); // Restore clip

    // 7. Runic Padlock & Shattering Unlock Animation (Center of Door)
    if (p < 0.45) {
      const lockAlpha = Math.max(0, 1 - p * 2.2);
      ctx.save();
      ctx.globalAlpha = lockAlpha;

      if (!isUnlocked) {
        // Locked: Glowing Crimson Runic Seal
        ctx.fillStyle = '#3a1614';
        ctx.beginPath();
        ctx.arc(0, -h * 0.5, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#e11d48';
        ctx.lineWidth = 2.2;
        ctx.stroke();

        ctx.fillStyle = '#f43f5e';
        ctx.font = 'bold 11px serif';
        ctx.textAlign = 'center';
        ctx.fillText('🔒', 0, -h * 0.5 + 4);
      } else {
        // Shattering Lock: Fractured golden rune bursting with sparks
        ctx.fillStyle = '#fae7b5';
        ctx.beginPath();
        ctx.arc(0, -h * 0.5, 14 * (1 + p), 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#d4af37';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-16, -h * 0.5 - 10);
        ctx.lineTo(16, -h * 0.5 + 10);
        ctx.moveTo(16, -h * 0.5 - 10);
        ctx.lineTo(-16, -h * 0.5 + 10);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 8. Open Door Beacon: Floating Golden [ ➔ ASCEND ] Rune (Inviting player forward)
    if (openEase > 0.75) {
      const bob = Math.sin(this.time * 5) * 3.5;
      ctx.save();
      ctx.translate(0, -h * 0.52 + bob);

      // Golden chevron aura
      ctx.fillStyle = 'rgba(212, 175, 55, 0.2)';
      ctx.beginPath();
      ctx.arc(0, 0, 16, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fae7b5';
      ctx.font = 'bold 12px serif';
      ctx.textAlign = 'center';
      ctx.fillText('➔', 0, 4);

      ctx.fillStyle = '#d4af37';
      ctx.font = 'bold 9px "JetBrains Mono", monospace';
      ctx.fillText('ENTER', 0, 16);
      ctx.restore();
    }

    ctx.restore();

    // 9. Update & Render Drifting Door Sparkles
    for (let i = this.doorSparkles.length - 1; i >= 0; i--) {
      const sp = this.doorSparkles[i];
      sp.x += sp.vx;
      sp.y += sp.vy;
      sp.alpha -= dt * 0.55;

      if (sp.alpha <= 0) {
        this.doorSparkles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.fillStyle = sp.color;
      ctx.globalAlpha = sp.alpha;
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // --- RUSTY LAKE BRIDGE ---
  private renderRustyBridge(ctx: CanvasRenderingContext2D, obj: InteractiveObject, isActive: boolean) {
    ctx.save();
    ctx.translate(obj.x, obj.y);

    if (isActive) {
      ctx.fillStyle = '#3a6978';
      ctx.fillRect(-obj.width / 2, -18, obj.width, 18);
      ctx.strokeStyle = '#0a0806';
      ctx.lineWidth = 3;
      ctx.strokeRect(-obj.width / 2, -18, obj.width, 18);
    } else {
      ctx.strokeStyle = '#3a3229';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      ctx.strokeRect(-obj.width / 2, -18, obj.width, 18);
    }

    ctx.restore();
  }

  // --- ROOM 3: INTERFERENCE CORRELATOR CONSOLE ---
  private renderReceiverConsole(ctx: CanvasRenderingContext2D, obj: InteractiveObject, roomFlags: Record<string, boolean>) {
    ctx.save();
    ctx.translate(obj.x, obj.y);

    const isCalibrated = roomFlags['correlator_calibrated'] ?? false;
    const isScrambled = roomFlags['tested_wrong_seal'] ?? false;

    // Contact drop shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.beginPath();
    ctx.ellipse(0, 4, 65, 16, 0, 0, Math.PI * 2);
    ctx.fill();

    // Heavy wooden mahogany console desk
    ctx.fillStyle = '#2b1e16';
    ctx.fillRect(-obj.width / 2, -obj.height, obj.width, obj.height);
    ctx.strokeStyle = '#0a0806';
    ctx.lineWidth = 3;
    ctx.strokeRect(-obj.width / 2, -obj.height, obj.width, obj.height);

    // Brass panel faceplate
    ctx.fillStyle = '#6e5630';
    ctx.fillRect(-obj.width / 2 + 8, -obj.height + 8, obj.width - 16, obj.height - 18);
    ctx.strokeStyle = '#0a0806';
    ctx.lineWidth = 2;
    ctx.strokeRect(-obj.width / 2 + 8, -obj.height + 8, obj.width - 16, obj.height - 18);

    // Vacuum Tubes with glowing filament
    [-35, 0, 35].forEach((vx, idx) => {
      ctx.fillStyle = '#17130f';
      ctx.fillRect(vx - 8, -obj.height - 14, 16, 14);
      ctx.strokeStyle = '#0a0806';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(vx - 8, -obj.height - 14, 16, 14);

      // Glass bulb
      ctx.fillStyle = isCalibrated
        ? 'rgba(74, 222, 128, 0.35)'
        : isScrambled
        ? 'rgba(239, 68, 68, 0.35)'
        : 'rgba(212, 175, 55, 0.25)';
      ctx.beginPath();
      ctx.ellipse(vx, -obj.height - 24, 7, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#0a0806';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Orange filament line
      ctx.strokeStyle = isCalibrated ? '#4ade80' : isScrambled ? '#f87171' : '#e8a838';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(vx, -obj.height - 14);
      ctx.lineTo(vx + (idx % 2 === 0 ? 2 : -2), -obj.height - 26);
      ctx.stroke();
    });

    // Analog dial meters
    [-30, 30].forEach(dx => {
      ctx.fillStyle = '#ded5c0';
      ctx.beginPath();
      ctx.arc(dx, -obj.height + 40, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#0a0806';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Needle
      const needleAngle = isCalibrated ? 0.7 : isScrambled ? -0.7 + Math.sin(this.time * 20) * 0.3 : Math.sin(this.time * 2) * 0.4;
      ctx.strokeStyle = '#852828';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(dx, -obj.height + 40);
      ctx.lineTo(dx + Math.cos(needleAngle) * 12, -obj.height + 40 - Math.sin(needleAngle) * 12);
      ctx.stroke();
    });

    // Center Filter Seal Socket
    ctx.fillStyle = '#14100c';
    ctx.fillRect(-18, -obj.height + 65, 36, 26);
    ctx.strokeStyle = '#0a0806';
    ctx.lineWidth = 2;
    ctx.strokeRect(-18, -obj.height + 65, 36, 26);

    ctx.fillStyle = isCalibrated ? '#38bdf8' : '#d4af37';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(isCalibrated ? '✦ LOCKED' : '⚡ SOCKET', 0, -obj.height + 82);

    ctx.restore();
  }

  // --- ROOM 3: OPTICAL HARMONIC PRISM REFRACTOR ---
  private renderPrismRefractor(ctx: CanvasRenderingContext2D, obj: InteractiveObject, roomFlags: Record<string, boolean>) {
    ctx.save();
    ctx.translate(obj.x, obj.y);

    const isCalibrated = roomFlags['correlator_calibrated'] ?? false;

    // Contact drop shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.beginPath();
    ctx.ellipse(0, 4, 38, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Heavy iron tripod legs
    ctx.strokeStyle = '#1a140f';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(0, -obj.height + 45);
    ctx.lineTo(-obj.width / 2 + 5, 0);
    ctx.moveTo(0, -obj.height + 45);
    ctx.lineTo(obj.width / 2 - 5, 0);
    ctx.moveTo(0, -obj.height + 45);
    ctx.lineTo(0, 0);
    ctx.stroke();

    // Brass collar mount
    ctx.fillStyle = '#6e5630';
    ctx.fillRect(-12, -obj.height + 40, 24, 10);
    ctx.strokeStyle = '#0a0806';
    ctx.lineWidth = 2;
    ctx.strokeRect(-12, -obj.height + 40, 24, 10);

    // Large floating optical triangular glass prism
    ctx.save();
    const prismBob = Math.sin(this.time * 2.5) * 3;
    ctx.translate(0, -obj.height + 15 + prismBob);

    ctx.fillStyle = 'rgba(215, 235, 255, 0.45)';
    ctx.beginPath();
    ctx.moveTo(0, -22);
    ctx.lineTo(20, 16);
    ctx.lineTo(-20, 16);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#0a0806';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Internal spectral prism refraction line
    ctx.strokeStyle = isCalibrated ? '#34d399' : '#e8a838';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-10, 8);
    ctx.lineTo(0, -10);
    ctx.lineTo(12, 10);
    ctx.stroke();

    const isPrismAligned = roomFlags['prism_aligned'] ?? false;

    // Focused optical carrier beam toward the oscilloscope mirror (x: 640, y: 240)
    if (isPrismAligned) {
      const laserGrad = ctx.createLinearGradient(15, 0, 260, -160);
      laserGrad.addColorStop(0, 'rgba(56, 189, 248, 0.95)');
      laserGrad.addColorStop(0.5, 'rgba(212, 175, 55, 0.85)');
      laserGrad.addColorStop(1, 'rgba(74, 222, 128, 0.95)');

      ctx.strokeStyle = laserGrad;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(15, 0);
      ctx.lineTo(260, -160);
      ctx.stroke();

      // Outer glow
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
      ctx.lineWidth = 8;
      ctx.stroke();
    } else {
      // Dispersed faint uncollimated fan of light
      const beamGrad = ctx.createLinearGradient(15, 5, 120, 20);
      beamGrad.addColorStop(0, 'rgba(212, 175, 55, 0.25)');
      beamGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = beamGrad;
      ctx.beginPath();
      ctx.moveTo(15, 5);
      ctx.lineTo(120, -15);
      ctx.lineTo(120, 35);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
    ctx.restore();
  }

  // --- ROOM 3: SPECTRAL OSCILLOSCOPE OBSIDIAN MIRROR ---
  private renderScrambledScreen(ctx: CanvasRenderingContext2D, obj: InteractiveObject, roomFlags: Record<string, boolean>) {
    ctx.save();
    ctx.translate(obj.x, obj.y);

    const isCalibrated = roomFlags['correlator_calibrated'] ?? false;
    const isScrambled = roomFlags['tested_wrong_seal'] ?? false;

    // Drop shadow on wall
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(-obj.width / 2 + 5, -obj.height + 5, obj.width, obj.height);

    // Carved dark walnut frame
    ctx.fillStyle = '#261b14';
    ctx.fillRect(-obj.width / 2, -obj.height, obj.width, obj.height);
    ctx.strokeStyle = '#0a0806';
    ctx.lineWidth = 3.5;
    ctx.strokeRect(-obj.width / 2, -obj.height, obj.width, obj.height);

    // Dark obsidian mirror screen interior
    ctx.fillStyle = '#08110c';
    ctx.fillRect(-obj.width / 2 + 8, -obj.height + 8, obj.width - 16, obj.height - 16);
    ctx.strokeStyle = '#1b3824';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-obj.width / 2 + 8, -obj.height + 8, obj.width - 16, obj.height - 16);

    // Oscilloscope Waveform Display
    ctx.save();
    ctx.beginPath();
    ctx.rect(-obj.width / 2 + 8, -obj.height + 8, obj.width - 16, obj.height - 16);
    ctx.clip();

    ctx.strokeStyle = isCalibrated ? '#4ade80' : isScrambled ? '#ef4444' : '#60a5fa';
    ctx.lineWidth = 2;
    ctx.beginPath();

    const midY = -obj.height / 2;
    const startX = -obj.width / 2 + 10;
    const endX = obj.width / 2 - 10;

    for (let x = startX; x <= endX; x += 4) {
      const relX = (x - startX) / (endX - startX);
      let waveY = midY;

      if (isCalibrated) {
        // Pure harmonic sine wave
        waveY = midY + Math.sin(relX * Math.PI * 4 + this.time * 6) * 18;
      } else if (isScrambled) {
        // Shattered erratic static noise
        waveY = midY + (Math.sin(relX * 30 + this.time * 25) + Math.cos(relX * 45)) * 14;
      } else {
        // Undulating resting composite wave
        waveY = midY + Math.sin(relX * Math.PI * 2 + this.time * 3) * 10;
      }

      if (x === startX) ctx.moveTo(x, waveY);
      else ctx.lineTo(x, waveY);
    }
    ctx.stroke();

    // Runic telemetry label
    ctx.fillStyle = isCalibrated ? '#86efac' : isScrambled ? '#fca5a5' : '#93c5fd';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(
      isCalibrated ? '✦ SPECTRAL SEPARATION LOCK (+4)' : isScrambled ? '✖ NOISE RESIDUAL: 0' : 'S(t) COMPOSITE STREAM',
      0,
      -obj.height + 22
    );

    ctx.restore();
    ctx.restore();
  }

  // --- ROOM 4: THE MASTER CRYSTAL MATRIX ---
  private renderApexMatrix(ctx: CanvasRenderingContext2D, obj: InteractiveObject, roomFlags: Record<string, boolean>) {
    ctx.save();
    ctx.translate(obj.x, obj.y);

    // Floor contact shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.beginPath();
    ctx.ellipse(0, 4, 75, 18, 0, 0, Math.PI * 2);
    ctx.fill();

    // Heavy stepped marble & bronze pedestal
    ctx.fillStyle = '#1c1712';
    ctx.fillRect(-70, -20, 140, 20);
    ctx.strokeStyle = '#0a0806';
    ctx.lineWidth = 3;
    ctx.strokeRect(-70, -20, 140, 20);

    ctx.fillStyle = '#2d2218';
    ctx.fillRect(-55, -45, 110, 25);
    ctx.strokeRect(-55, -45, 110, 25);

    // 5 Archmage Runic Inscriptions on Pedestal
    const wizardColors = ['#38bdf8', '#34d399', '#c084fc', '#f87171', '#fbbf24'];
    wizardColors.forEach((color, i) => {
      const gx = -44 + i * 22;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(gx, -32, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#0a0806';
      ctx.lineWidth = 1.2;
      ctx.stroke();
    });

    // Brass Armillary Rings orbiting central crystal
    const ringAngle = this.time * 0.8;
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 2.5;

    ctx.save();
    ctx.translate(0, -obj.height / 2 - 20);
    ctx.rotate(Math.sin(ringAngle) * 0.2);

    // Outer orbital ring
    ctx.beginPath();
    ctx.ellipse(0, 0, 58, 22, 0.4, 0, Math.PI * 2);
    ctx.stroke();

    // Inner orbital ring
    ctx.beginPath();
    ctx.ellipse(0, 0, 44, 16, -0.4, 0, Math.PI * 2);
    ctx.stroke();

    // Central Floating Master Quartz Crystal
    const cBob = Math.sin(this.time * 3) * 5;
    ctx.fillStyle = 'rgba(235, 245, 255, 0.75)';
    ctx.beginPath();
    ctx.moveTo(0, -50 + cBob);
    ctx.lineTo(24, 0 + cBob);
    ctx.lineTo(0, 50 + cBob);
    ctx.lineTo(-24, 0 + cBob);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#0a0806';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Crystal facet lines
    ctx.strokeStyle = '#85b9d9';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, -50 + cBob);
    ctx.lineTo(0, 50 + cBob);
    ctx.moveTo(-24, 0 + cBob);
    ctx.lineTo(24, 0 + cBob);
    ctx.stroke();

    // Orbiting Resonance Spheres (5 Wizards)
    wizardColors.forEach((wColor, idx) => {
      const orbAngle = this.time * 1.5 + (idx * Math.PI * 2) / 5;
      const ox = Math.cos(orbAngle) * 52;
      const oy = Math.sin(orbAngle) * 20;

      ctx.fillStyle = wColor;
      ctx.beginPath();
      ctx.arc(ox, oy + cBob, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#0a0806';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });

    ctx.restore();
    ctx.restore();
  }

  // --- ROOM 4: CELESTIAL ALTAR OF FIVE FREQUENCIES ---
  private renderCelestialAltar(ctx: CanvasRenderingContext2D, obj: InteractiveObject) {
    ctx.save();
    ctx.translate(obj.x, obj.y);

    // Drop shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.beginPath();
    ctx.ellipse(0, 4, 45, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Stone Table
    ctx.fillStyle = '#241c16';
    ctx.fillRect(-obj.width / 2, -obj.height, obj.width, obj.height);
    ctx.strokeStyle = '#0a0806';
    ctx.lineWidth = 3;
    ctx.strokeRect(-obj.width / 2, -obj.height, obj.width, obj.height);

    // Inscribed astrological circle on tabletop
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.ellipse(0, -obj.height + 15, 32, 10, 0, 0, Math.PI * 2);
    ctx.stroke();

    // 5 elemental prisms on altar
    const colors = ['#38bdf8', '#34d399', '#c084fc', '#f87171', '#fbbf24'];
    colors.forEach((col, idx) => {
      const px = -30 + idx * 15;
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.moveTo(px, -obj.height + 15);
      ctx.lineTo(px + 4, -obj.height + 2);
      ctx.lineTo(px - 4, -obj.height + 2);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#0a0806';
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    ctx.restore();
  }

  // --- ROOM 4: STARRY GLASS OBSERVATORY SKYLIGHT ---
  private renderStarrySkylight(ctx: CanvasRenderingContext2D, obj: InteractiveObject) {
    ctx.save();
    ctx.translate(obj.x, obj.y);

    // Stained-glass domed frame
    ctx.fillStyle = '#060a12';
    ctx.beginPath();
    ctx.ellipse(0, 0, obj.width / 2, obj.height / 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Shimmering stars in the skylight
    for (let i = 0; i < 15; i++) {
      const sx = ((i * 37) % obj.width) - obj.width / 2;
      const sy = ((i * 23) % obj.height) - obj.height / 2;
      const dist = Math.hypot(sx, sy);
      if (dist < obj.width / 2 - 10) {
        const starAlpha = 0.4 + Math.sin(this.time * 3 + i) * 0.4;
        ctx.fillStyle = `rgba(255, 255, 255, ${starAlpha})`;
        ctx.fillRect(sx, sy, 2, 2);
      }
    }

    // Heavy iron astronomical ribs
    ctx.strokeStyle = '#18120c';
    ctx.lineWidth = 3.5;
    ctx.stroke();

    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-obj.width / 2, 0);
    ctx.lineTo(obj.width / 2, 0);
    ctx.moveTo(0, -obj.height / 2);
    ctx.lineTo(0, obj.height / 2);
    ctx.stroke();

    ctx.restore();
  }
  private renderApprentice(ctx: CanvasRenderingContext2D, player: PlayerState) {
    ctx.save();
    ctx.translate(player.x, player.y);

    if (player.facing === 'left') {
      ctx.scale(-1, 1);
    }

    const isWalking = player.action === 'walk';
    const legWalk = isWalking ? Math.sin(player.animTimer * 10) * 16 : 0;
    const coatSway = isWalking ? Math.sin(player.animTimer * 10) * 4 : 0;
    const breath = Math.sin(this.time * 2.8) * 1.5;

    // Contact drop shadow on floorboards
    ctx.fillStyle = 'rgba(10, 8, 7, 0.6)';
    ctx.beginPath();
    ctx.ellipse(0, 3, 20, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Leather Boots with creases and soles
    ctx.fillStyle = '#18120c';
    // Back boot
    ctx.fillRect(4 - legWalk, -8, 6, 8);
    ctx.fillRect(4 - legWalk, -2, 9, 4);
    // Front boot
    ctx.fillRect(-8 + legWalk, -8, 6, 8);
    ctx.fillRect(-8 + legWalk, -2, 9, 4);
    ctx.strokeStyle = '#0a0806';
    ctx.lineWidth = 2;
    ctx.strokeRect(-8 + legWalk, -2, 9, 4);

    // Woolen Trousers
    ctx.strokeStyle = '#231d17';
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.moveTo(-5, -18);
    ctx.lineTo(-6 + legWalk, -6);
    ctx.moveTo(5, -18);
    ctx.lineTo(6 - legWalk, -6);
    ctx.stroke();

    // Dark Woolen Explorer Coat with layered fabric folds
    ctx.fillStyle = '#332920';
    ctx.beginPath();
    ctx.moveTo(-12, -40 + breath);
    ctx.lineTo(12, -40 + breath);
    ctx.lineTo(17 + coatSway, -12);
    ctx.lineTo(-17 - coatSway, -12);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#0a0806';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Coat hem lapels & brass buttons
    ctx.strokeStyle = '#18120c';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -38 + breath);
    ctx.lineTo(0, -12);
    ctx.stroke();

    ctx.fillStyle = '#c49a3c';
    ctx.fillRect(-1.5, -30 + breath, 3, 3);
    ctx.fillRect(-1.5, -22 + breath, 3, 3);

    // Leather Cross-body Satchel
    ctx.strokeStyle = '#5a3d22';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-8, -38 + breath);
    ctx.lineTo(8, -16);
    ctx.stroke();

    ctx.fillStyle = '#452b14';
    ctx.fillRect(4, -18, 12, 10);
    ctx.strokeStyle = '#0a0806';
    ctx.lineWidth = 1.8;
    ctx.strokeRect(4, -18, 12, 10);
    ctx.fillStyle = '#c49a3c';
    ctx.fillRect(8, -14, 4, 3); // buckle

    // High Cowl Collar
    ctx.fillStyle = '#211a14';
    ctx.fillRect(-11, -42 + breath, 22, 6);
    ctx.strokeStyle = '#0a0806';
    ctx.lineWidth = 2;
    ctx.strokeRect(-11, -42 + breath, 22, 6);

    // Illustrated Head: sketched face, locks of hair, explorer's hat
    ctx.fillStyle = '#ecd8be';
    ctx.beginPath();
    ctx.arc(0, -50 + breath, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#0a0806';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Brown hair lock
    ctx.fillStyle = '#3b2816';
    ctx.beginPath();
    ctx.moveTo(-5, -55 + breath);
    ctx.lineTo(-2, -47 + breath);
    ctx.lineTo(-6, -46 + breath);
    ctx.closePath();
    ctx.fill();

    // Expressive Blinking Eye with Pupil
    const playerBlink = Math.sin(this.time * 0.9) > 0.96;
    if (!playerBlink) {
      ctx.fillStyle = '#0a0806';
      ctx.fillRect(3, -51 + breath, 2.5, 2.5);
      ctx.strokeStyle = '#0a0806';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(1, -54 + breath);
      ctx.lineTo(6, -55 + breath);
      ctx.stroke();
    } else {
      ctx.strokeStyle = '#0a0806';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(2, -50 + breath);
      ctx.lineTo(6, -50 + breath);
      ctx.stroke();
    }

    // Wide-Brimmed Explorer Cap with Brass Buckle
    ctx.fillStyle = '#231d17';
    ctx.fillRect(-15, -58 + breath, 30, 4);
    ctx.fillRect(-9, -66 + breath, 18, 9);
    ctx.strokeStyle = '#0a0806';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(-15, -58 + breath, 30, 4);
    ctx.strokeRect(-9, -66 + breath, 18, 9);

    ctx.fillStyle = '#c49a3c';
    ctx.fillRect(-3, -61 + breath, 6, 3); // cap buckle

    // Hand holding Carriage Lantern on Chain with pendulum physics
    ctx.save();
    ctx.translate(14, -28 + breath);
    const lanternSway = isWalking ? Math.sin(player.animTimer * 10) * 0.18 : 0;
    ctx.rotate(lanternSway);

    ctx.strokeStyle = '#0a0806';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 10);
    ctx.stroke();

    ctx.fillStyle = '#8f6832';
    ctx.fillRect(-5, 10, 10, 14);
    ctx.strokeStyle = '#0a0806';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(-5, 10, 10, 14);

    ctx.fillStyle = '#d4af37';
    ctx.fillRect(-3, 13, 6, 8);
    ctx.restore();

    ctx.restore();
  }

  // --- 5. MYSTERIOUS FANTASY OWL WITH FLIGHT & FEATHER TEXTURING ---
  private updateAndRenderOwl(ctx: CanvasRenderingContext2D, player: PlayerState) {
    const dt = 0.016;
    this.owlNextFlightTime -= dt;

    // Trigger flight between perches periodically
    if (this.owlState === 'perched' && this.owlNextFlightTime <= 0) {
      this.owlState = 'flying';
      this.owlFlightProgress = 0;
      this.owlStartPos = { x: this.owlX, y: this.owlY };
      this.currentPerchIndex = (this.currentPerchIndex + 1) % OWL_PERCHES.length;
      this.owlTargetPos = OWL_PERCHES[this.currentPerchIndex];
      this.owlNextFlightTime = 22 + Math.random() * 10;
    }

    if (this.owlState === 'flying') {
      this.owlFlightProgress += dt * 0.65; // ~1.5s flight duration
      const t = Math.min(1.0, this.owlFlightProgress);

      // Arc flight curve with dip
      const midX = (this.owlStartPos.x + this.owlTargetPos.x) / 2;
      const midY = Math.min(this.owlStartPos.y, this.owlTargetPos.y) - 60; // fly up in arc

      // Quadratic bezier curve
      const invT = 1 - t;
      this.owlX = invT * invT * this.owlStartPos.x + 2 * invT * t * midX + t * t * this.owlTargetPos.x;
      this.owlY = invT * invT * this.owlStartPos.y + 2 * invT * t * midY + t * t * this.owlTargetPos.y;

      if (t >= 1.0) {
        this.owlState = 'perched';
        this.owlX = this.owlTargetPos.x;
        this.owlY = this.owlTargetPos.y;
      }
    }

    ctx.save();
    ctx.translate(this.owlX, this.owlY);

    const isFlying = this.owlState === 'flying';
    const wingFlap = isFlying ? Math.sin(this.time * 16) : 0;
    const breath = isFlying ? 0 : Math.sin(this.time * 2.2) * 2;

    // Contact drop shadow when perched on beam or shelf
    if (!isFlying) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.beginPath();
      ctx.ellipse(0, 2, 14, 5, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Feathery Owl Body
    ctx.fillStyle = '#2d251d';
    ctx.beginPath();
    ctx.ellipse(0, -18 + breath, 15, 21, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#0a0806';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Pale Chest Feathers with hand-inked flecks
    ctx.fillStyle = '#ded4c0';
    ctx.beginPath();
    ctx.ellipse(0, -14 + breath, 10, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#3d3024';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-4, -18 + breath);
    ctx.lineTo(0, -13 + breath);
    ctx.lineTo(4, -18 + breath);
    ctx.moveTo(-3, -10 + breath);
    ctx.lineTo(0, -6 + breath);
    ctx.lineTo(3, -10 + breath);
    ctx.stroke();

    // Wings (Folded when perched, spreading when flying!)
    if (isFlying) {
      // Extended flapping wings
      ctx.fillStyle = '#42362b';
      // Left wing
      ctx.beginPath();
      ctx.moveTo(-8, -20);
      ctx.quadraticCurveTo(-35, -35 + wingFlap * 22, -45, -15 + wingFlap * 26);
      ctx.lineTo(-12, -10);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#0a0806';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Right wing
      ctx.beginPath();
      ctx.moveTo(8, -20);
      ctx.quadraticCurveTo(35, -35 + wingFlap * 22, 45, -15 + wingFlap * 26);
      ctx.lineTo(12, -10);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else {
      // Folded wing
      ctx.fillStyle = '#42362b';
      ctx.beginPath();
      ctx.ellipse(8, -16 + breath, 6, 17, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#0a0806';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Sharp Claws gripped around perch surface
      ctx.fillStyle = '#110e0b';
      ctx.fillRect(-7, 0, 4, 6);
      ctx.fillRect(-2, 0, 4, 6);
      ctx.fillRect(4, 0, 4, 6);
    }

    // Head Assembly (Smoothly turns to face player!)
    const targetHeadAngle = Math.max(-0.4, Math.min(0.4, (player.x - this.owlX) * 0.0015));
    this.owlHeadAngle += (targetHeadAngle - this.owlHeadAngle) * 0.1;

    ctx.save();
    ctx.translate(0, -28 + breath);
    ctx.rotate(this.owlHeadAngle);

    // Ear Tufts (Horned owl style)
    ctx.fillStyle = '#2d251d';
    ctx.beginPath();
    ctx.moveTo(-11, -8);
    ctx.lineTo(-16, -20);
    ctx.lineTo(-6, -12);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#0a0806';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(11, -8);
    ctx.lineTo(16, -20);
    ctx.lineTo(6, -12);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Facial Disk (Heart-shaped mask)
    ctx.fillStyle = '#eedec5';
    ctx.beginPath();
    ctx.arc(-5, -2, 7, 0, Math.PI * 2);
    ctx.arc(5, -2, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#0a0806';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // Large Expressive Amber Eyes with slow intelligent blink
    const owlBlink = Math.sin(this.time * 0.5) > 0.96;
    if (!owlBlink) {
      ctx.fillStyle = '#d4af37';
      ctx.beginPath();
      ctx.arc(-5, -2, 4.5, 0, Math.PI * 2);
      ctx.arc(5, -2, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#0a0806';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Sharp Pupils
      ctx.fillStyle = '#0a0806';
      ctx.beginPath();
      ctx.arc(-5, -2, 2.2, 0, Math.PI * 2);
      ctx.arc(5, -2, 2.2, 0, Math.PI * 2);
      ctx.fill();

      // Eye highlights
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-6, -4, 1.2, 1.2);
      ctx.fillRect(4, -4, 1.2, 1.2);
    } else {
      ctx.strokeStyle = '#0a0806';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-9, -2);
      ctx.lineTo(-1, -2);
      ctx.moveTo(1, -2);
      ctx.lineTo(9, -2);
      ctx.stroke();
    }

    // Raptor Beak
    ctx.fillStyle = '#c49339';
    ctx.beginPath();
    ctx.moveTo(-2, 0);
    ctx.lineTo(2, 0);
    ctx.lineTo(0, 7);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#0a0806';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.restore();
    ctx.restore();
  }

  // --- 6. LIGHTING PASS: MOONLIGHT & CANDLE AMBIENT HALOS ---
  private renderLightingPass(ctx: CanvasRenderingContext2D, player: PlayerState, roomFlags: Record<string, boolean>) {
    ctx.save();

    // Volumetric Moonlight Shafts through windows
    ctx.fillStyle = 'rgba(215, 230, 255, 0.035)';
    for (let i = 0; i < 3; i++) {
      const winX = 220 + i * 380;
      ctx.beginPath();
      ctx.moveTo(winX + 10, 80);
      ctx.lineTo(winX + 75, 80);
      ctx.lineTo(winX + 220, 680);
      ctx.lineTo(winX + 60, 680);
      ctx.closePath();
      ctx.fill();
    }

    // Dynamic Player Lantern Warm Halo
    const lx = player.x + (player.facing === 'right' ? 14 : -14);
    const ly = player.y - 20;
    const lFlicker = Math.sin(this.time * 12) * 5;
    const lanternGrad = ctx.createRadialGradient(lx, ly, 10, lx, ly, 140 + lFlicker);
    lanternGrad.addColorStop(0, 'rgba(212, 175, 55, 0.24)');
    lanternGrad.addColorStop(0.6, 'rgba(212, 175, 55, 0.06)');
    lanternGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = lanternGrad;
    ctx.beginPath();
    ctx.arc(lx, ly, 140 + lFlicker, 0, Math.PI * 2);
    ctx.fill();

    // Central Tower Active Glow (if lever pulled)
    if (roomFlags['lever_pulled']) {
      const towerGlow = ctx.createRadialGradient(640, 440, 20, 640, 440, 180);
      towerGlow.addColorStop(0, 'rgba(88, 141, 168, 0.22)');
      towerGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = towerGlow;
      ctx.beginPath();
      ctx.arc(640, 440, 180, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // --- 7. PARTICLES: DUST, SMOKE, FOOTSTEP DUST & CLICK BURSTS ---
  private renderParticles(ctx: CanvasRenderingContext2D, dt: number = 0.016) {
    ctx.save();

    // Floating Dust Motes
    this.motes.forEach(m => {
      m.x += m.vx;
      m.y += m.vy;
      if (m.y < 0) {
        m.y = ROOM_HEIGHT;
        m.x = Math.random() * ROOM_WIDTH;
      }
      ctx.fillStyle = `rgba(220, 210, 180, ${m.alpha})`;
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.size, 0, Math.PI * 2);
      ctx.fill();
    });

    // Footstep Dust Puffs
    for (let i = this.footstepDust.length - 1; i >= 0; i--) {
      const d = this.footstepDust[i];
      d.x += d.vx;
      d.y += d.vy;
      d.size += dt * 3.5;
      d.alpha -= dt * 0.45;
      if (d.alpha <= 0) {
        this.footstepDust.splice(i, 1);
        continue;
      }
      ctx.fillStyle = `rgba(180, 165, 145, ${d.alpha})`;
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Smoke Wisps
    for (let i = this.smokeWisps.length - 1; i >= 0; i--) {
      const sw = this.smokeWisps[i];
      sw.x += sw.vx;
      sw.y += sw.vy;
      sw.size += 0.08;
      sw.alpha -= 0.006;
      sw.life += 1;

      if (sw.alpha <= 0) {
        this.smokeWisps.splice(i, 1);
        continue;
      }

      ctx.fillStyle = `rgba(210, 200, 185, ${sw.alpha})`;
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, sw.size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Click Burst Particles
    for (let i = this.clickParticles.length - 1; i >= 0; i--) {
      const cp = this.clickParticles[i];
      cp.x += cp.vx;
      cp.y += cp.vy;
      cp.vy += 0.12;
      cp.alpha -= 0.025;
      cp.life += 1;

      if (cp.alpha <= 0) {
        this.clickParticles.splice(i, 1);
        continue;
      }

      ctx.fillStyle = cp.color;
      ctx.globalAlpha = cp.alpha;
      ctx.beginPath();
      ctx.arc(cp.x, cp.y, cp.size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Touch Ripples on Canvas
    for (let i = this.touchRipples.length - 1; i >= 0; i--) {
      const rip = this.touchRipples[i];
      rip.radius += dt * 68;
      rip.alpha -= dt * 2.0;

      if (rip.alpha <= 0 || rip.radius >= rip.maxRadius) {
        this.touchRipples.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.strokeStyle = `rgba(212, 175, 55, ${rip.alpha * 0.9})`;
      ctx.lineWidth = 2.5 * rip.alpha;
      ctx.beginPath();
      ctx.arc(rip.x, rip.y, rip.radius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = `rgba(250, 235, 185, ${rip.alpha * 0.6})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(rip.x, rip.y, Math.max(1, rip.radius * 0.55), 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  }

  // --- 3b. HOTSPOT REVEAL SENSE OVERLAY (Spacebar / Owl Sense) ---
  private renderHotspotsOverlay(ctx: CanvasRenderingContext2D, room: RoomData) {
    ctx.save();
    const alpha = Math.min(1.0, this.hotspotTimer);
    const pulseRing = ((2.4 - this.hotspotTimer) * 45) % 30;

    room.objects.forEach(obj => {
      const cx = obj.x;
      const cy = obj.y - obj.height / 2;

      // Inked glowing occult circle
      ctx.strokeStyle = `rgba(212, 175, 55, ${0.45 * alpha})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, 18 + pulseRing, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = `rgba(238, 222, 197, ${0.85 * alpha})`;
      ctx.beginPath();
      ctx.arc(cx, cy, 4, 0, Math.PI * 2);
      ctx.fill();

      // Inked Name Tag Banner
      ctx.fillStyle = `rgba(18, 14, 11, ${0.88 * alpha})`;
      ctx.strokeStyle = `rgba(212, 175, 55, ${0.7 * alpha})`;
      ctx.lineWidth = 1.2;

      const tagW = Math.max(90, obj.name.length * 6.5);
      const tagH = 18;
      const tagX = cx - tagW / 2;
      const tagY = obj.y - obj.height - 24;

      ctx.fillRect(tagX, tagY, tagW, tagH);
      ctx.strokeRect(tagX, tagY, tagW, tagH);

      ctx.fillStyle = `rgba(238, 222, 197, ${0.95 * alpha})`;
      ctx.font = 'bold 9px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(obj.name, cx, tagY + tagH / 2);
    });

    ctx.restore();
  }

  // --- 8. RUSTY LAKE SIGNATURE VIGNETTE FRAME ---
  private renderRustyLakeFrame(ctx: CanvasRenderingContext2D) {
    ctx.save();
    const w = ROOM_WIDTH;
    const h = ROOM_HEIGHT;

    const vigGrad = ctx.createRadialGradient(w / 2, h / 2, w * 0.35, w / 2, h / 2, w * 0.72);
    vigGrad.addColorStop(0, 'transparent');
    vigGrad.addColorStop(0.7, 'rgba(8, 6, 5, 0.45)');
    vigGrad.addColorStop(1, 'rgba(8, 6, 5, 0.98)');
    ctx.fillStyle = vigGrad;
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = '#080605';
    ctx.lineWidth = 6;
    ctx.strokeRect(0, 0, w, h);

    ctx.restore();
  }
}
