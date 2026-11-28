import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "./Reveal";

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

// Campur warna hex dengan putih (target 255) atau hitam (target 0).
function mixHex(hex: string, target: number, amount: number) {
  const n = parseInt(hex.slice(1), 16);
  const mix = (channel: number) => Math.round(channel + (target - channel) * amount);

  return `rgb(${mix((n >> 16) & 255)},${mix((n >> 8) & 255)},${mix(n & 255)})`;
}

// Bola 3D semu: gradasi radial + kilau + bayangan lembut.
export function drawSphere(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: string
) {
  ctx.save();
  ctx.shadowColor = "rgba(20, 40, 55, 0.28)";
  ctx.shadowBlur = radius * 0.7;
  ctx.shadowOffsetY = radius * 0.28;

  const gradient = ctx.createRadialGradient(
    x - radius * 0.35,
    y - radius * 0.4,
    radius * 0.08,
    x,
    y,
    radius
  );

  gradient.addColorStop(0, mixHex(color, 255, 0.62));
  gradient.addColorStop(0.5, color);
  gradient.addColorStop(1, mixHex(color, 0, 0.42));

  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = gradient;
  ctx.fill();
  ctx.restore();

  ctx.beginPath();
  ctx.ellipse(x - radius * 0.32, y - radius * 0.4, radius * 0.26, radius * 0.15, -0.65, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
  ctx.fill();
}

export const ORB_COLORS = ["#456477", "#7fa6bb", "#f3c98b", "#e8833a", "#1d2b36", "#5fae8a"];

type FloatingOrbsProps = {
  count?: number;
  // "right" = menumpuk di sisi kanan (di samping judul), "full" = menyebar,
  // "sides" = hanya di tepi kiri/kanan (menyisakan tengah untuk teks).
  region?: "right" | "full" | "sides";
  colors?: string[];
  className?: string;
};

type Orb = {
  hx: number;
  hy: number;
  r: number;
  color: string;
  ax: number;
  ay: number;
  fx: number;
  fy: number;
  phase: number;
  ox: number;
  oy: number;
  vx: number;
  vy: number;
};

// Bola-bola yang melayang pelan dan menghindar saat kursor mendekat.
export default function FloatingOrbs({
  count = 9,
  region = "right",
  colors = ORB_COLORS,
  className = "",
}: FloatingOrbsProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    const ctx = canvas?.getContext("2d");

    if (!canvas || !parent || !ctx) return undefined;

    const reduced = prefersReducedMotion();
    const pointer = { x: -9999, y: -9999 };
    let width = 0;
    let height = 0;
    let orbs: Orb[] = [];
    let frame = 0;
    let visible = true;

    const build = () => {
      orbs = Array.from({ length: count }, (_, index) => ({
        hx:
          region === "right"
            ? 0.5 + Math.random() * 0.47
            : region === "sides"
            ? Math.random() < 0.5
              ? 0.04 + Math.random() * 0.2
              : 0.76 + Math.random() * 0.2
            : 0.06 + Math.random() * 0.88,
        hy: 0.14 + Math.random() * 0.72,
        r: clamp(height * (0.07 + Math.random() * 0.11), 12, 50),
        color: colors[index % colors.length],
        ax: 8 + Math.random() * 18,
        ay: 8 + Math.random() * 18,
        fx: 0.35 + Math.random() * 0.5,
        fy: 0.35 + Math.random() * 0.5,
        phase: Math.random() * Math.PI * 2,
        ox: 0,
        oy: 0,
        vx: 0,
        vy: 0,
      })).sort((a, b) => a.r - b.r);
    };

    const draw = (time: number) => {
      ctx.clearRect(0, 0, width, height);

      for (const orb of orbs) {
        const x = orb.hx * width + Math.sin(time * orb.fx + orb.phase) * orb.ax + orb.ox;
        const y = orb.hy * height + Math.cos(time * orb.fy + orb.phase) * orb.ay + orb.oy;

        // Menghindar dari kursor.
        const dx = x - pointer.x;
        const dy = y - pointer.y;
        const distance = Math.hypot(dx, dy);
        const reach = 120 + orb.r;

        if (distance < reach && distance > 0.001) {
          const push = (1 - distance / reach) * 2.4;

          orb.vx += (dx / distance) * push;
          orb.vy += (dy / distance) * push;
        }

        // Pegas kembali ke posisi asal.
        orb.vx += -orb.ox * 0.035;
        orb.vy += -orb.oy * 0.035;
        orb.vx *= 0.9;
        orb.vy *= 0.9;
        orb.ox += orb.vx;
        orb.oy += orb.vy;

        drawSphere(ctx, x, y, orb.r, orb.color);
      }
    };

    const resize = () => {
      const rect = parent.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      build();
      draw(0);
    };

    const tick = (now: number) => {
      frame = 0;

      if (!visible) return;

      draw(now / 1000);
      frame = requestAnimationFrame(tick);
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();

      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;

      if (visible && !frame && !reduced) frame = requestAnimationFrame(tick);
    });

    const resizeObserver = new ResizeObserver(resize);

    resize();
    resizeObserver.observe(parent);
    observer.observe(canvas);

    if (!reduced) window.addEventListener("pointermove", onPointerMove, { passive: true });

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onPointerMove);
      resizeObserver.disconnect();
      observer.disconnect();
    };
  }, [count, region, colors]);

  return <canvas ref={canvasRef} className={`floating-orbs ${className}`} aria-hidden="true" />;
}
