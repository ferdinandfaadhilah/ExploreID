import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "./Reveal";

export type Ball = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  color: string;
  // Bentuk agak lonjong (1 = bulat sempurna) dan arah putarnya.
  squash: number;
  angle: number;
};

// Campur warna hex dengan putih (target 255) atau hitam (target 0).
function mixHex(hex: string, target: number, amount: number) {
  const n = parseInt(hex.slice(1), 16);
  const mix = (channel: number) => Math.round(channel + (target - channel) * amount);

  return `rgb(${mix((n >> 16) & 255)},${mix((n >> 8) & 255)},${mix(n & 255)})`;
}

// Bola 3D semu: gradasi radial, kilau, dan bayangan lembut.
// Cahaya selalu dari kiri atas, hanya bentuk lonjongnya yang ikut berputar.
export function drawBall(ctx: CanvasRenderingContext2D, ball: Ball) {
  const { x, y, r, color, squash, angle } = ball;

  ctx.save();
  ctx.shadowColor = "rgba(10, 25, 40, 0.34)";
  ctx.shadowBlur = r * 0.7;
  ctx.shadowOffsetY = r * 0.3;

  const gradient = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.06, x, y, r);

  gradient.addColorStop(0, mixHex(color, 255, 0.7));
  gradient.addColorStop(0.5, color);
  gradient.addColorStop(1, mixHex(color, 0, 0.4));

  ctx.beginPath();
  ctx.ellipse(x, y, r, r * squash, angle, 0, Math.PI * 2);
  ctx.fillStyle = gradient;
  ctx.fill();
  ctx.restore();

  ctx.beginPath();
  ctx.ellipse(x - r * 0.32, y - r * 0.4, r * 0.27, r * 0.15, -0.65, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255, 255, 255, 0.58)";
  ctx.fill();
}

const GRAVITY = 1700;

// Satu langkah fisika: gravitasi, dinding/lantai, dan tabrakan antar-bola.
// Mengembalikan pergeseran terbesar (px) pada langkah ini; kecil = tumpukan sudah diam.
export function stepBalls(balls: Ball[], width: number, height: number, dt: number) {
  const start = new Float32Array(balls.length * 2);

  balls.forEach((ball, index) => {
    start[index * 2] = ball.x;
    start[index * 2 + 1] = ball.y;
  });

  for (const ball of balls) {
    ball.vy += GRAVITY * dt;
    ball.x += ball.vx * dt;
    ball.y += ball.vy * dt;
    ball.vx *= 0.9985;
  }

  // Dinding dan lantai. Benturan pelan tidak memantul agar tumpukan bisa diam.
  const confine = (ball: Ball) => {
    if (ball.x < ball.r) {
      ball.x = ball.r;
      ball.vx = Math.abs(ball.vx) * 0.5;
    } else if (ball.x > width - ball.r) {
      ball.x = width - ball.r;
      ball.vx = -Math.abs(ball.vx) * 0.5;
    }

    if (ball.y > height - ball.r) {
      ball.y = height - ball.r;

      if (ball.vy > 0) ball.vy = ball.vy > 140 ? -ball.vy * 0.32 : 0;

      ball.vx *= 0.96;
    }
  };

  for (let pass = 0; pass < 4; pass++) {
    for (const ball of balls) confine(ball);

    for (let i = 0; i < balls.length; i++) {
      for (let j = i + 1; j < balls.length; j++) {
        const a = balls[i];
        const b = balls[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const minimum = a.r + b.r;
        const squared = dx * dx + dy * dy;

        if (squared >= minimum * minimum || squared === 0) continue;

        const distance = Math.sqrt(squared);
        const nx = dx / distance;
        const ny = dy / distance;
        const overlap = minimum - distance;
        const massA = a.r * a.r;
        const massB = b.r * b.r;
        const total = massA + massB;

        a.x -= nx * overlap * (massB / total);
        a.y -= ny * overlap * (massB / total);
        b.x += nx * overlap * (massA / total);
        b.y += ny * overlap * (massA / total);

        const approach = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;

        if (approach < 0) {
          // Tumbukan pelan tidak memantul (inelastis) supaya bola tidak terus bergetar.
          const bounce = approach < -70 ? 0.25 : 0;
          const impulse = (-(1 + bounce) * approach) / (1 / massA + 1 / massB);

          a.vx -= (impulse * nx) / massA;
          a.vy -= (impulse * ny) / massA;
          b.vx += (impulse * nx) / massB;
          b.vy += (impulse * ny) / massB;
        }
      }
    }
  }

  // Pemisahan antar-bola bisa mendorong bola keluar batas; kembalikan.
  for (const ball of balls) confine(ball);

  let moved = 0;

  balls.forEach((ball, index) => {
    moved = Math.max(moved, Math.hypot(ball.x - start[index * 2], ball.y - start[index * 2 + 1]));
  });

  return moved;
}

// Hitam-putih seperti referensi, dengan sedikit abu-abu.
const PIT_COLORS = ["#f5f5f5", "#f5f5f5", "#f5f5f5", "#0e0e10", "#0e0e10", "#0e0e10", "#6b6e75"];

// Bola-bola jatuh dan menumpuk di dasar; kursor bisa mendorongnya.
export default function BallPit({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    const ctx = canvas?.getContext("2d");

    if (!canvas || !parent || !ctx) return undefined;

    const reduced = prefersReducedMotion();
    const pointer = { x: -9999, y: -9999, active: false };
    let width = 0;
    let height = 0;
    let balls: Ball[] = [];
    let frame = 0;
    let last = 0;
    let visible = false;
    let calm = 0;

    const build = () => {
      const size = Math.max(17, Math.min(36, width / 34));
      const total = Math.round(Math.max(40, Math.min(66, width / 22)));

      balls = Array.from({ length: total }, () => {
        // Ukuran bervariasi; sebagian kecil dibuat besar agar tumpukan terasa berisi.
        const scale = Math.random() < 0.14 ? 1.45 + Math.random() * 0.35 : 0.58 + Math.random() * 0.9;

        return {
          x: size + Math.random() * Math.max(1, width - size * 2),
          // Mulai di atas kanvas dengan jarak acak agar jatuh bergiliran.
          y: -size - Math.random() * height * 1.7,
          vx: (Math.random() - 0.5) * 120,
          vy: 0,
          r: size * scale,
          color: PIT_COLORS[Math.floor(Math.random() * PIT_COLORS.length)],
          squash: 0.84 + Math.random() * 0.16,
          angle: Math.random() * Math.PI,
        };
      });

      if (reduced) {
        // Tanpa animasi: langsung hitung posisi akhirnya.
        for (let i = 0; i < 260; i++) stepBalls(balls, width, height, 1 / 60);
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      for (const ball of balls) drawBall(ctx, ball);
    };

    const resize = () => {
      const rect = parent.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const firstTime = width === 0;

      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (firstTime || balls.length === 0) build();

      calm = 0;
      draw();
      start();
    };

    const tick = (now: number) => {
      frame = 0;

      if (!visible) return;

      const dt = Math.min((now - last) / 1000, 1 / 30);

      last = now;

      if (pointer.active) {
        for (const ball of balls) {
          const dx = ball.x - pointer.x;
          const dy = ball.y - pointer.y;
          const distance = Math.hypot(dx, dy);
          const reach = 110 + ball.r;

          if (distance < reach && distance > 0.001) {
            const push = (1 - distance / reach) * 46;

            ball.vx += (dx / distance) * push;
            ball.vy += (dy / distance) * push - 6;
          }
        }
      }

      const moved = stepBalls(balls, width, height, dt);

      // Bola berguling: bentuk lonjongnya ikut berputar mengikuti arah gerak.
      for (const ball of balls) ball.angle += (ball.vx * dt * 0.3) / ball.r;

      draw();

      // Geseran < 0,7 px per frame tidak terlihat: dianggap sudah diam.
      calm = moved < 0.7 && !pointer.active ? calm + 1 : 0;

      // Berhenti menggambar saat semua bola sudah diam; bangun lagi saat kursor datang.
      if (calm < 45) frame = requestAnimationFrame(tick);
    };

    function start() {
      if (reduced || frame || !visible) return;

      last = performance.now();
      frame = requestAnimationFrame(tick);
    }

    const onPointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();

      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.active =
        pointer.x >= 0 && pointer.x <= rect.width && pointer.y >= 0 && pointer.y <= rect.height;

      if (pointer.active) {
        calm = 0;
        start();
      }
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;

      if (visible) start();
    }, { threshold: 0.15 });

    const resizeObserver = new ResizeObserver(resize);

    resize();
    resizeObserver.observe(parent);
    observer.observe(canvas);
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onPointerMove);
      resizeObserver.disconnect();
      observer.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} className={`ball-pit ${className}`} aria-hidden="true" />;
}
