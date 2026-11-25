export type Coordinates = [number, number];

// Jarak antar dua koordinat (km) dengan rumus haversine.
export function calculateDistance(first: Coordinates, second: Coordinates) {
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const earthRadius = 6371;

  const latitudeDifference = toRadians(second[0] - first[0]);
  const longitudeDifference = toRadians(second[1] - first[1]);

  const a =
    Math.sin(latitudeDifference / 2) ** 2 +
    Math.cos(toRadians(first[0])) *
      Math.cos(toRadians(second[0])) *
      Math.sin(longitudeDifference / 2) ** 2;

  return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}