import { divIcon } from "leaflet";

// Ikon marker peta yang dipakai di halaman Peta dan peta mini di halaman Destinasi.
export const destinationIcon = divIcon({
  className: "explore-map-marker",
  html: '<div style="background:#23966c;width:18px;height:18px;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px #0005"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

export const activeIcon = divIcon({
  className: "explore-map-marker",
  html: '<div style="background:#23966c;width:24px;height:24px;border:3px solid white;border-radius:50%;box-shadow:0 0 0 5px rgba(232,131,58,.6),0 4px 12px #0006"></div>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

export const originIcon = divIcon({
  className: "explore-map-marker",
  html: '<div class="origin-dot"></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});
