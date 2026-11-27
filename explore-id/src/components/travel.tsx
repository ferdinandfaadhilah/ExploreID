import { useCallback, useEffect, useState } from "react";
import { calculateDistance, type Coordinates } from "../lib/geo";
import type { Language } from "../i18n/translations";

/* =========================================
   Estimasi waktu tempuh (perkiraan kasar)
   jarak garis lurus x faktor jalan / kecepatan rata-rata
========================================= */

export type TravelMode = "motor" | "car" | "transit" | "walk";

export const TRAVEL_MODES: TravelMode[] = ["motor", "car", "transit", "walk"];

export const MODE_ICONS: Record<TravelMode, string> = {
  motor: "🏍️",
  car: "🚗",
  transit: "🚌",
  walk: "🚶",
};

export const MODE_LABELS: Record<Language, Record<TravelMode, string>> = {
  English: { motor: "Motorbike", car: "Car", transit: "Public", walk: "Walk" },
  Indonesia: { motor: "Motor", car: "Mobil", transit: "Umum", walk: "Jalan Kaki" },
};

// Kecepatan rata-rata (km/jam) dan faktor jalan (jalan lebih panjang dari garis lurus).
const SPEED: Record<TravelMode, number> = { motor: 42, car: 55, transit: 40, walk: 4.8 };
const DETOUR: Record<TravelMode, number> = { motor: 1.3, car: 1.3, transit: 1.25, walk: 1.2 };
const TRANSIT_WAIT_MIN = 30; // menunggu / transit moda umum
const AIR_SPEED = 720; // km/jam
const AIR_OVERHEAD_MIN = 150; // ke bandara, check-in, boarding, bagasi
const WALK_IMPRACTICAL_KM = 60;

/* ---------- Deteksi pulau (siluet kasar) ---------- */

type Island = { id: string; group: string; poly: [number, number][] }; // poly = [bujur, lintang]

const ISLANDS: Island[] = [
  { id: "sumatra", group: "west", poly: [[95.3,5.6],[97.2,5.3],[98.6,3.9],[100.0,2.9],[101.4,2.0],[103.0,1.3],[104.2,-0.3],[104.2,-1.8],[104.9,-3.0],[106.0,-3.8],[105.9,-5.8],[104.7,-5.9],[103.3,-4.9],[102.3,-3.8],[101.0,-2.3],[100.4,-0.9],[99.2,0.8],[98.6,1.8],[97.4,3.2],[95.9,4.6]] },
  { id: "java", group: "west", poly: [[105.2,-6.8],[106.0,-6.0],[108.0,-6.3],[110.0,-6.6],[111.5,-6.5],[112.8,-6.9],[114.4,-7.7],[114.4,-8.5],[113.0,-8.4],[111.0,-8.3],[109.0,-7.8],[107.5,-7.7],[106.4,-7.4]] },
  { id: "bali", group: "west", poly: [[114.4,-8.1],[115.7,-8.1],[115.7,-8.8],[114.9,-8.8]] },
  { id: "lombok", group: "lombok", poly: [[115.8,-8.4],[116.7,-8.4],[116.7,-9.0],[115.9,-9.0]] },
  { id: "sumbawa", group: "sumbawa", poly: [[116.8,-8.3],[119.0,-8.2],[119.0,-8.9],[117.0,-9.0]] },
  { id: "flores", group: "flores", poly: [[119.9,-8.4],[123.0,-8.2],[122.6,-8.9],[120.0,-8.9]] },
  { id: "sumba", group: "sumba", poly: [[119.0,-9.5],[120.8,-9.4],[120.8,-10.3],[119.2,-10.2]] },
  { id: "timor", group: "timor", poly: [[123.5,-10.3],[124.5,-9.3],[126.0,-8.5],[127.3,-8.4],[125.0,-9.9],[124.0,-10.4]] },
  { id: "borneo", group: "borneo", poly: [[109.0,2.0],[110.3,1.7],[111.5,2.7],[113.0,3.2],[114.8,4.9],[116.0,6.9],[117.0,7.0],[118.0,6.0],[119.2,5.2],[118.0,4.3],[117.8,2.7],[118.9,1.0],[117.5,0.3],[117.5,-1.2],[116.5,-2.3],[116.2,-3.5],[114.5,-4.0],[113.0,-3.3],[111.7,-3.1],[110.2,-2.9],[110.0,-1.5],[109.2,0.0]] },
  { id: "sul_west", group: "sulawesi", poly: [[119.4,0.3],[120.3,-0.6],[120.6,-2.3],[120.4,-3.5],[120.4,-5.5],[119.5,-5.6],[119.3,-4.0],[118.9,-2.6],[119.2,-1.0]] },
  { id: "sul_mid", group: "sulawesi", poly: [[119.7,-0.3],[121.5,-0.8],[123.3,-0.9],[122.8,-1.8],[121.5,-1.8],[120.5,-1.3]] },
  { id: "sul_se", group: "sulawesi", poly: [[120.9,-2.7],[121.9,-2.7],[122.9,-3.9],[122.8,-5.0],[122.0,-5.2],[121.6,-4.0],[120.9,-3.4]] },
  { id: "sul_north", group: "sulawesi", poly: [[119.8,0.9],[120.8,1.3],[122.5,1.0],[124.0,1.0],[125.0,1.6],[125.2,1.3],[124.2,0.5],[122.0,0.4],[120.5,0.5],[119.8,0.2]] },
  { id: "halmahera", group: "halmahera", poly: [[127.5,1.8],[128.7,1.5],[128.2,0.5],[128.6,-0.5],[127.9,-0.8],[127.4,0.3],[127.9,1.0]] },
  { id: "seram", group: "seram", poly: [[128.0,-3.0],[130.8,-3.0],[130.6,-3.5],[128.3,-3.5]] },
  { id: "buru", group: "buru", poly: [[126.5,-3.3],[127.4,-3.3],[127.2,-3.9],[126.6,-3.8]] },
  { id: "bangka", group: "bangka", poly: [[105.1,-1.6],[106.0,-1.5],[106.8,-2.2],[106.5,-3.1],[105.5,-2.6]] },
  { id: "papua", group: "papua", poly: [[131.0,-0.9],[132.3,-0.4],[133.6,-0.7],[134.1,-0.9],[134.4,-2.4],[135.3,-3.4],[136.8,-2.2],[138.0,-1.6],[139.5,-2.3],[141.0,-2.6],[141.0,-9.0],[140.2,-8.4],[139.0,-8.0],[138.1,-6.5],[138.1,-5.5],[136.7,-4.9],[135.0,-4.1],[133.7,-3.7],[132.9,-2.9],[133.5,-2.4],[132.3,-2.2],[131.4,-1.4]] },
  { id: "biak", group: "biak", poly: [[135.9,-0.8],[136.3,-0.8],[136.3,-1.2],[135.9,-1.2]] },
];

// Sumatra - Jawa - Bali dihubungkan kapal feri (menit per penyeberangan).
const WEST_ORDER = ["sumatra", "java", "bali"];
const WEST_FERRY_MIN = [150, 75];

// Titik lebih jauh dari ini (derajat) dari pulau mana pun dianggap di luar negeri / tak dikenal.
const MAX_ISLAND_GAP = 1.5;

function segmentDistance(px: number, py: number, ax: number, ay: number, bx: number, by: number) {
  const dx = bx - ax;
  const dy = by - ay;
  const lengthSquared = dx * dx + dy * dy;
  const t = lengthSquared === 0 ? 0 : Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lengthSquared));

  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

function isInside(x: number, y: number, poly: [number, number][]) {
  let inside = false;

  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];

    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }

  return inside;
}

const islandCache = new Map<string, Island | null>();

// Pulau terdekat dari sebuah titik (toleran terhadap garis pantai yang kasar).
function nearestIsland([lat, lon]: Coordinates): Island | null {
  const key = `${lat.toFixed(3)},${lon.toFixed(3)}`;

  if (islandCache.has(key)) return islandCache.get(key) ?? null;

  // Singapura, Johor, dan Kepulauan Riau: terpisah selat dari Sumatra (tidak bisa lewat darat).
  if (lat > 0.8 && lat < 1.8 && lon > 103.3 && lon < 105) {
    islandCache.set(key, null);

    return null;
  }

  let best: Island | null = null;
  let bestDistance = Infinity;

  for (const island of ISLANDS) {
    let distance = 0;

    if (!isInside(lon, lat, island.poly)) {
      distance = Infinity;

      for (let i = 0; i < island.poly.length; i++) {
        const [ax, ay] = island.poly[i];
        const [bx, by] = island.poly[(i + 1) % island.poly.length];

        distance = Math.min(distance, segmentDistance(lon, lat, ax, ay, bx, by));
      }
    }

    if (distance < bestDistance) {
      bestDistance = distance;
      best = island;
    }
  }

  const result = bestDistance <= MAX_ISLAND_GAP ? best : null;

  islandCache.set(key, result);

  return result;
}

function ferryMinutes(a: Island, b: Island) {
  const i = WEST_ORDER.indexOf(a.id);
  const j = WEST_ORDER.indexOf(b.id);

  if (i < 0 || j < 0 || i === j) return 0;

  let total = 0;

  for (let k = Math.min(i, j); k < Math.max(i, j); k++) total += WEST_FERRY_MIN[k];

  return total;
}

/* ---------- Estimasi ---------- */

export type TripEstimate = {
  available: boolean; // false = tidak bisa lewat darat (terpisah laut)
  minutes: number;
  distanceKm: number;
  viaAir: boolean; // Umum antar-pulau dihitung via pesawat
  ferry: boolean; // termasuk penyeberangan kapal feri
  impractical: boolean; // jalan kaki terlalu jauh
};

export function estimateTrip(origin: Coordinates, destination: Coordinates, mode: TravelMode): TripEstimate {
  const straightKm = calculateDistance(origin, destination);
  const from = nearestIsland(origin);
  const to = nearestIsland(destination);

  const sameLandmass = Boolean(from && to && from.group === to.group);

  if (!sameLandmass) {
    if (mode === "transit") {
      return {
        available: true,
        minutes: (straightKm / AIR_SPEED) * 60 + AIR_OVERHEAD_MIN,
        distanceKm: straightKm,
        viaAir: true,
        ferry: false,
        impractical: false,
      };
    }

    return { available: false, minutes: 0, distanceKm: straightKm, viaAir: false, ferry: false, impractical: false };
  }

  const roadKm = straightKm * DETOUR[mode];
  const ferry = from && to ? ferryMinutes(from, to) : 0;
  const minutes =
    (roadKm / SPEED[mode]) * 60 + (mode === "transit" ? TRANSIT_WAIT_MIN : 0) + ferry;

  return {
    available: true,
    minutes,
    distanceKm: roadKm,
    viaAir: false,
    ferry: ferry > 0,
    impractical: mode === "walk" && roadKm > WALK_IMPRACTICAL_KM,
  };
}

/* ---------- Format tampilan ---------- */

// Dibulatkan agar tidak terkesan terlalu presisi untuk sebuah perkiraan.
export function formatDuration(totalMinutes: number, language: Language) {
  const id = language === "Indonesia";
  const step = totalMinutes < 120 ? 5 : totalMinutes < 720 ? 15 : totalMinutes < 2880 ? 30 : 60;
  const minutes = Math.max(5, Math.round(totalMinutes / step) * step);

  if (minutes >= 2880) {
    const days = Math.floor(minutes / 1440);
    const hours = Math.round((minutes % 1440) / 60);

    return `± ${days} ${id ? "hari" : "d"}${hours ? ` ${hours} ${id ? "jam" : "h"}` : ""}`;
  }

  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;

    return `± ${hours} ${id ? "jam" : "h"}${rest ? ` ${rest} ${id ? "mnt" : "min"}` : ""}`;
  }

  return `± ${minutes} ${id ? "mnt" : "min"}`;
}

export function formatDistance(km: number) {
  const value = km < 10 ? Math.round(km * 10) / 10 : Math.round(km);

  return `± ${value.toLocaleString("id-ID")} km`;
}

/* =========================================
   Titik berangkat: GPS atau pilihan kota
========================================= */

export const ORIGIN_CITIES: { id: string; name: string; coords: Coordinates }[] = [
  { id: "medan", name: "Medan", coords: [3.5952, 98.6722] },
  { id: "padang", name: "Padang", coords: [-0.9471, 100.4172] },
  { id: "pekanbaru", name: "Pekanbaru", coords: [0.5071, 101.4478] },
  { id: "palembang", name: "Palembang", coords: [-2.9761, 104.7754] },
  { id: "jakarta", name: "Jakarta", coords: [-6.2088, 106.8456] },
  { id: "bandung", name: "Bandung", coords: [-6.9175, 107.6191] },
  { id: "semarang", name: "Semarang", coords: [-6.9667, 110.4167] },
  { id: "yogyakarta", name: "Yogyakarta", coords: [-7.7956, 110.3695] },
  { id: "surabaya", name: "Surabaya", coords: [-7.2575, 112.7521] },
  { id: "malang", name: "Malang", coords: [-7.9666, 112.6326] },
  { id: "denpasar", name: "Denpasar", coords: [-8.65, 115.2167] },
  { id: "mataram", name: "Mataram", coords: [-8.5833, 116.1167] },
  { id: "kupang", name: "Kupang", coords: [-10.1772, 123.607] },
  { id: "pontianak", name: "Pontianak", coords: [-0.0263, 109.3425] },
  { id: "banjarmasin", name: "Banjarmasin", coords: [-3.3194, 114.5908] },
  { id: "balikpapan", name: "Balikpapan", coords: [-1.2379, 116.8529] },
  { id: "makassar", name: "Makassar", coords: [-5.1477, 119.4327] },
  { id: "manado", name: "Manado", coords: [1.4748, 124.8421] },
  { id: "jayapura", name: "Jayapura", coords: [-2.5337, 140.7181] },
];

export type OriginState = {
  coords: Coordinates;
  source: "gps" | "city";
  cityId?: string;
  label: string;
};

export type LocateStatus = "idle" | "locating" | "denied" | "unsupported" | "error";

const ORIGIN_KEY = "exploreid-origin";

function readSavedOrigin(): string | null {
  try {
    return localStorage.getItem(ORIGIN_KEY);
  } catch {
    return null;
  }
}

function saveOrigin(value: string) {
  try {
    localStorage.setItem(ORIGIN_KEY, value);
  } catch {
    // Abaikan jika penyimpanan gagal.
  }
}

function cityOrigin(id: string | null): OriginState | null {
  const city = ORIGIN_CITIES.find((item) => item.id === id);

  return city ? { coords: city.coords, source: "city", cityId: city.id, label: city.name } : null;
}

export function useTravelOrigin() {
  const [origin, setOrigin] = useState<OriginState | null>(() => cityOrigin(readSavedOrigin()));
  const [status, setStatus] = useState<LocateStatus>("idle");

  const locate = useCallback(() => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setStatus("unsupported");
      return;
    }

    setStatus("locating");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setOrigin({
          coords: [position.coords.latitude, position.coords.longitude],
          source: "gps",
          label: "",
        });
        saveOrigin("gps");
        setStatus("idle");
      },
      (error) => {
        setStatus(error.code === error.PERMISSION_DENIED ? "denied" : "error");
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  }, []);

  // Lokasi otomatis hanya jika izin sudah pernah diberikan (tanpa memunculkan pop-up izin).
  useEffect(() => {
    if (cityOrigin(readSavedOrigin())) return undefined;
    if (typeof navigator === "undefined" || !navigator.permissions?.query) return undefined;

    let cancelled = false;

    navigator.permissions
      .query({ name: "geolocation" })
      .then((result) => {
        if (!cancelled && result.state === "granted") locate();
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [locate]);

  const chooseCity = useCallback((id: string) => {
    const next = cityOrigin(id);

    if (!next) return;

    setOrigin(next);
    saveOrigin(id);
    setStatus("idle");
  }, []);

  return { origin, status, locate, chooseCity };
}
