import { useEffect, useMemo, useRef, useState } from "react";
import { prefersReducedMotion } from "./Reveal";

// Jalur berkelok dari atas ke bawah area induk (huruf S berulang).
function buildPath(width: number, height: number) {
  if (width < 40 || height < 120) return "";

  const segments = Math.max(2, Math.round(height / 880));
  const step = height / segments;
  const left = width * 0.07;
  const right = width * 0.93;

  let path = `M ${left} 0`;
  let fromX = left;

  for (let i = 0; i < segments; i++) {
    const toX = i % 2 === 0 ? right : left;
    const y0 = i * step;
    const y1 = (i + 1) * step;

    path += ` C ${fromX} ${y0 + step * 0.55}, ${toX} ${y1 - step * 0.55}, ${toX} ${y1}`;
    fromX = toX;
  }

  return path;
}

// Garis tebal yang "digambar" mengikuti scroll, melintasi seluruh area induknya
// (induk harus position: relative).
export default function ScrollRibbon({ className = "" }: { className?: string }) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const pathRef = useRef<SVGPathElement | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const parent = wrapRef.current?.parentElement;

    if (!parent) return undefined;

    const measure = () => setSize({ width: parent.clientWidth, height: parent.clientHeight });
    const observer = new ResizeObserver(measure);

    measure();
    observer.observe(parent);

    return () => observer.disconnect();
  }, []);

  const d = useMemo(() => buildPath(size.width, size.height), [size]);

  useEffect(() => {
    const parent = wrapRef.current?.parentElement;
    const path = pathRef.current;

    if (!parent || !path || !d) return undefined;

    const length = path.getTotalLength();
    const reduced = prefersReducedMotion();
    let frame = 0;

    path.style.strokeDasharray = `${length}`;

    const update = () => {
      frame = 0;

      const rect = parent.getBoundingClientRect();
      // Garis mencapai ujung saat bagian bawah area mendekati tengah layar.
      const progress = reduced
        ? 1
        : Math.min(1, Math.max(0, (window.innerHeight * 0.8 - rect.top) / (rect.height + window.innerHeight * 0.3)));

      path.style.strokeDashoffset = `${length * (1 - progress)}`;
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [d]);

  return (
    <div className={`scroll-ribbon ${className}`} ref={wrapRef} aria-hidden="true">
      {d && (
        <svg width={size.width} height={size.height} viewBox={`0 0 ${size.width} ${size.height}`} focusable="false">
          <path ref={pathRef} d={d} />
        </svg>
      )}
    </div>
  );
}
