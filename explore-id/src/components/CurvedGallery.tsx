import { useEffect, useRef, useState } from "react";
import type { Destination } from "../data/destinations";
import { useLanguage } from "../hooks/useLanguage";
import Reveal, { prefersReducedMotion } from "./Reveal";

const COPY = {
  English: {
    home: { eyebrow: "AT A GLANCE", title: "A glimpse of the archipelago", hint: "Drag to explore" },
    more: { eyebrow: "STILL CURIOUS?", title: "More places for you", hint: "Drag to explore" },
  },
  Indonesia: {
    home: { eyebrow: "SEKILAS DESTINASI", title: "Sekilas dari Nusantara", hint: "Geser untuk menjelajah" },
    more: { eyebrow: "MASIH PENASARAN?", title: "Destinasi lain untukmu", hint: "Geser untuk menjelajah" },
  },
};

const SPEED = 42; // px per detik
const GAP = 22;
const COPIES = 3;

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const pad = (value: number) => String(value).padStart(2, "0");

type CurvedGalleryProps = {
  items: Destination[];
  variant?: "home" | "more";
  onOpen: (item: Destination) => void;
};

// Galeri foto yang bergerak sendiri; kartu di tepi miring seperti layar melengkung.
export default function CurvedGallery({ items, variant = "home", onOpen }: CurvedGalleryProps) {
  const { language } = useLanguage();
  const copy = COPY[language][variant];

  const viewportRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const stateRef = useRef({ offset: 0, dragging: false, hover: false, lastX: 0, moved: 0 });
  const renderRef = useRef<() => void>(() => undefined);
  const [active, setActive] = useState(0);

  const count = items.length;
  const list = Array.from({ length: COPIES }, () => items).flat();

  useEffect(() => {
    const viewport = viewportRef.current;

    if (!viewport || count === 0) return undefined;

    const state = stateRef.current;
    const reduced = prefersReducedMotion();
    let frame = 0;
    let last = performance.now();
    let visible = false;
    let current = -1;

    const render = (dt: number) => {
      const first = cardRefs.current[0];

      if (!first) return;

      const viewportWidth = viewport.clientWidth;
      const cardWidth = first.offsetWidth;
      const step = cardWidth + GAP;
      const setWidth = step * count;

      if (!state.dragging && !state.hover && !reduced) state.offset += SPEED * dt;

      state.offset = ((state.offset % setWidth) + setWidth) % setWidth;

      const shift = viewportWidth / 2 - cardWidth / 2;
      let nearest = 0;
      let nearestDistance = Infinity;

      cardRefs.current.forEach((card, index) => {
        if (!card) return;

        const x = (index - count) * step - state.offset + shift;
        const norm = (x + cardWidth / 2 - viewportWidth / 2) / (viewportWidth / 2);
        const distance = Math.min(Math.abs(norm), 1.6);

        card.style.transform = `translate3d(${x}px,0,0) rotateY(${clamp(-norm, -1.3, 1.3) * 30}deg) scale(${
          1 - Math.min(distance, 1) * 0.14
        })`;
        card.style.zIndex = String(Math.round(100 - distance * 50));
        card.style.opacity = String(clamp(1.3 - Math.max(0, distance - 0.9) * 1.1, 0.3, 1));

        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearest = index % count;
        }
      });

      if (nearest !== current) {
        current = nearest;
        setActive(nearest);
      }
    };

    renderRef.current = () => render(0);

    const tick = (now: number) => {
      frame = 0;

      if (!visible) return;

      const dt = Math.min((now - last) / 1000, 0.05);

      last = now;
      render(dt);
      frame = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;

      if (visible && !frame && !reduced) {
        last = performance.now();
        frame = requestAnimationFrame(tick);
      }
    });

    render(0);
    observer.observe(viewport);
    window.addEventListener("resize", renderRef.current);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", renderRef.current);
    };
  }, [count]);

  if (count < 3) return null;

  const focused = items[active] ?? items[0];

  return (
    <Reveal as="section" className="explore-section curved-gallery-section">
      <div className="curved-inner">
        <div className="curved-head">
          <div>
            <span className="eyebrow">{copy.eyebrow}</span>
            <h2>{copy.title}</h2>
          </div>

          <span className="curved-hint">← {copy.hint} →</span>
        </div>

        <div
          ref={viewportRef}
          className="curved-viewport"
          onPointerDown={(event) => {
            const state = stateRef.current;

            state.dragging = true;
            state.lastX = event.clientX;
            state.moved = 0;
            event.currentTarget.setPointerCapture(event.pointerId);
          }}
          onPointerMove={(event) => {
            const state = stateRef.current;

            if (!state.dragging) return;

            const dx = event.clientX - state.lastX;

            state.lastX = event.clientX;
            state.moved += Math.abs(dx);
            state.offset -= dx;
            renderRef.current();
          }}
          onPointerUp={() => {
            stateRef.current.dragging = false;
          }}
          onPointerCancel={() => {
            stateRef.current.dragging = false;
          }}
          onMouseEnter={() => {
            stateRef.current.hover = true;
          }}
          onMouseLeave={() => {
            stateRef.current.hover = false;
          }}
        >
          {list.map((item, index) => {
            const isMiddleCopy = index >= count && index < count * 2;

            return (
              <button
                key={`${index}-${item.id}`}
                type="button"
                ref={(element) => {
                  cardRefs.current[index] = element;
                }}
                className="curved-card"
                tabIndex={isMiddleCopy ? 0 : -1}
                aria-hidden={isMiddleCopy ? undefined : true}
                onClick={() => {
                  if (stateRef.current.moved < 6) onOpen(item);
                }}
              >
                <img src={item.image} alt={isMiddleCopy ? item.name : ""} loading="lazy" draggable={false} />
                <span className="curved-card-shade" />
                <span className="curved-card-meta">
                  <small>{item.category}</small>
                  <strong>{item.name}</strong>
                </span>
              </button>
            );
          })}
        </div>

        <div className="curved-caption" aria-live="polite">
          <strong>{focused.name}</strong>
          <span>{focused.location}</span>
          <small>
            {pad(active + 1)} / {pad(count)}
          </small>
        </div>
      </div>
    </Reveal>
  );
}
