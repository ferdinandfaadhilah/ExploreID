import {
  memo,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
} from "react";
import { destinations, type Destination } from "../data/destinations";
import { useLanguage } from "../hooks/useLanguage";
import Reveal, { prefersReducedMotion, useInView } from "./Reveal";

// Batas peta (derajat) dan ukuran sel grid titik.
const LON_MIN = 94.4;
const LON_MAX = 141.6;
const LAT_MIN = -11.6;
const LAT_MAX = 7.6;
const CELL = 0.4;
const UNIT = 20; // 1 derajat = 20 satuan viewBox
const VIEW_W = (LON_MAX - LON_MIN) * UNIT;
const VIEW_H = (LAT_MAX - LAT_MIN) * UNIT;
const MAX_PINS = 20;
// Jarak minimal antar pin (derajat). Dilonggarkan bertahap sampai pin cukup banyak.
const SPACING_STEPS = [2.4, 1.9, 1.5, 1.2];

// Siluet kepulauan Indonesia: "#" = daratan, "." = laut. Satu baris = satu
// lintang (utara ke selatan), satu karakter = satu sel CELL derajat.
const LAND = [
  "......................................................................................................................",
  "......................................................................................................................",
  "......................................................###.............................................................",
  ".....................................................#####............................................................",
  "....................................................########..........................................................",
  "...##...............................................#########.........................................................",
  "...#####...........................................##########.........................................................",
  "....#####.........................................##########..........................................................",
  ".....#####.......................................##########...........................................................",
  "......#####.....................................###########...........................................................",
  ".......#####...................................############...........................................................",
  "........######...............................##############...........................................................",
  ".........######...........................#################...........................................................",
  "..........#######........................##################...........................................................",
  "..........#########..................##.####################..........................................................",
  "...........##########................########################...............#......###................................",
  "............##########...............########################...############........#.................................",
  "............###########..............######################....############........##.................................",
  ".............###########.............#####################....#....................##.................................",
  "..............##########.............#####################....##...................##.................................",
  "..............##########..............####################....####..................#........####.....................",
  "...............#########..............####################....##########....................#######.....#.............",
  "................########...............##################.....###.######....................#######...................",
  "................########...###.........#################......###.............................######........##........",
  "................#########..####........################......####..............................#####......######......",
  ".................#########..###........################......####................................###.....###########..",
  "..................########...............##############.......###.###...............#######.....#####..#############..",
  "...................#########...................########.......###.####..........##...######......###################..",
  "....................#########....................###..........###..####.........##.................#################..",
  ".....................########.................................###...###...............................##############..",
  "......................#######.................................###...###.................................############..",
  ".......................######..................................##....##...................................##########..",
  "........................#####..................................##............................................#######..",
  ".........................####................................................................................#######..",
  "............................####.............................................................................#######..",
  "...........................#################.................................................................#######..",
  "............................##################................................................................######..",
  "..............................##################...............................................................#####..",
  "....................................##############.............................................................#####..",
  "........................................#############............................................................###..",
  "...................................................##.#######...#######........##..................................#..",
  ".............................................................................###......................................",
  "...........................................................................###........................................",
  "..............................................................####........###.........................................",
  "..............................................................####.......##...........................................",
  "......................................................................................................................",
  "......................................................................................................................",
  "......................................................................................................................",
];

const COPY = {
  English: {
    eyebrow: "ACROSS THE ARCHIPELAGO",
    title: "From Sabang to Merauke",
    subtitle:
      "Tap a pin to see where each destination sits on the map of Indonesia.",
    open: "View destination ↗",
  },
  Indonesia: {
    eyebrow: "DI SELURUH NUSANTARA",
    title: "Dari Sabang sampai Merauke",
    subtitle:
      "Klik pin untuk melihat letak tiap destinasi di peta Indonesia.",
    open: "Lihat destinasi ↗",
  },
};

// Titik daratan dihitung sekali saja.
const DOTS = LAND.flatMap((row, r) =>
  Array.from(row).flatMap((cell, c) =>
    cell === "#"
      ? [{ x: (c + 0.5) * CELL * UNIT, y: (r + 0.5) * CELL * UNIT, c }]
      : []
  )
);

const DotGrid = memo(function DotGrid() {
  return (
    <svg
      className="pin-map-dots"
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      aria-hidden="true"
      focusable="false"
    >
      {DOTS.map((dot) => (
        <circle
          key={`${dot.x}-${dot.y}`}
          cx={dot.x}
          cy={dot.y}
          r={2.6}
          style={{ transitionDelay: `${dot.c * 9}ms` }}
        />
      ))}
    </svg>
  );
});

// Pilih destinasi yang tersebar rata. Mulai dari jarak antar-pin yang lega,
// lalu dirapatkan bertahap supaya lebih banyak destinasi ikut tampil.
function pickPins(): Destination[] {
  const inBounds = destinations.filter(
    (item) =>
      item.position[1] > LON_MIN + 0.8 &&
      item.position[1] < LON_MAX - 0.6 &&
      item.position[0] < LAT_MAX - 0.6 &&
      item.position[0] > LAT_MIN + 0.4
  );

  const goal = Math.min(MAX_PINS, inBounds.length);
  let picked: Destination[] = [];

  for (const spacing of SPACING_STEPS) {
    picked = [];

    for (const item of inBounds) {
      if (picked.length === MAX_PINS) break;

      const farEnough = picked.every(
        (other) =>
          Math.hypot(
            other.position[0] - item.position[0],
            other.position[1] - item.position[1]
          ) > spacing
      );

      if (farEnough) picked.push(item);
    }

    if (picked.length >= goal) break;
  }

  // Urut dari barat ke timur supaya sorotan berpindah dengan rapi.
  return [...picked].sort((a, b) => a.position[1] - b.position[1]);
}

type IndonesiaPinMapProps = {
  onOpen: (item: Destination) => void;
};

// Peta titik Indonesia dengan pin foto yang melayang.
export default function IndonesiaPinMap({ onOpen }: IndonesiaPinMapProps) {
  const { language } = useLanguage();
  const copy = COPY[language];
  const pins = useMemo(pickPins, []);
  const { ref, inView } = useInView<HTMLDivElement>(0.25);

  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  // Sorotan pindah otomatis tiap beberapa detik, berhenti saat disentuh.
  useEffect(() => {
    if (paused || pins.length < 2 || !inView || prefersReducedMotion()) {
      return undefined;
    }

    const timer = window.setInterval(
      () => setActive((current) => (current + 1) % pins.length),
      2600
    );

    return () => window.clearInterval(timer);
  }, [paused, inView, pins.length]);

  if (pins.length === 0) return null;

  return (
    <Reveal
      as="section"
      className="explore-section pin-map-section"
      id="indonesia-pin-map"
    >
      <div className="section-top pin-map-head">
        <div>
          <span className="eyebrow">{copy.eyebrow}</span>
          <h2>{copy.title}</h2>
          <p>{copy.subtitle}</p>
        </div>
      </div>

      <div
        ref={ref}
        className={`pin-map ${inView ? "is-visible" : ""}`}
        onMouseLeave={() => setPaused(false)}
      >
        <DotGrid />

        {pins.map((item, index) => {
          const left =
            ((item.position[1] - LON_MIN) / (LON_MAX - LON_MIN)) * 100;
          const top =
            ((LAT_MAX - item.position[0]) / (LAT_MAX - LAT_MIN)) * 100;

          const align = left < 14 ? "align-left" : left > 86 ? "align-right" : "";

          return (
            <button
              key={item.id}
              type="button"
              className={`map-pin ${align} ${
                index === active ? "is-active" : ""
              }`}
              style={
                { left: `${left}%`, top: `${top}%`, "--i": index } as CSSProperties
              }
              onMouseEnter={() => {
                setActive(index);
                setPaused(true);
              }}
              onFocus={() => setActive(index)}
              onClick={() => onOpen(item)}
              aria-label={`${item.name}, ${item.location}`}
            >
              <span className="map-pin-float">
                <span className="map-pin-photo">
                  <img src={item.image} alt="" loading="lazy" />
                </span>
              </span>

              <span className="map-pin-dot" />

              <span className="map-pin-label">
                <strong>{item.name}</strong>
                <small>{item.location}</small>
                <em>{copy.open}</em>
              </span>
            </button>
          );
        })}
      </div>
    </Reveal>
  );
}
