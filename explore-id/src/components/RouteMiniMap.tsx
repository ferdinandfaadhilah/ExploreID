import { useEffect } from "react";
import { MapContainer, Marker, Polyline, TileLayer, Tooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { Destination } from "../data/destinations";
import type { Coordinates } from "../lib/geo";
import { activeIcon, originIcon } from "./mapIcons";

function FitRoute({ target, origin }: { target: Coordinates; origin: Coordinates | null }) {
  const map = useMap();

  const targetLat = target[0];
  const targetLng = target[1];
  const originLat = origin?.[0];
  const originLng = origin?.[1];

  useEffect(() => {
    if (originLat !== undefined && originLng !== undefined) {
      map.fitBounds(
        [
          [originLat, originLng],
          [targetLat, targetLng],
        ],
        { padding: [44, 44], maxZoom: 9 }
      );
    } else {
      map.setView([targetLat, targetLng], 9);
    }
  }, [map, targetLat, targetLng, originLat, originLng]);

  return null;
}

type RouteMiniMapProps = {
  destination: Destination;
  origin: Coordinates | null;
  originLabel: string;
};

// Peta kecil: titik berangkat, destinasi, dan garis putus-putus di antaranya.
export default function RouteMiniMap({ destination, origin, originLabel }: RouteMiniMapProps) {
  return (
    <MapContainer
      center={destination.position}
      zoom={8}
      scrollWheelZoom={false}
      className="route-mini-map"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <FitRoute target={destination.position} origin={origin} />

      {origin && (
        <Polyline
          positions={[origin, destination.position]}
          pathOptions={{ color: "#e8833a", weight: 3, dashArray: "6 9" }}
        />
      )}

      {origin && (
        <Marker position={origin} icon={originIcon}>
          <Tooltip direction="top" offset={[0, -8]}>
            {originLabel}
          </Tooltip>
        </Marker>
      )}

      <Marker position={destination.position} icon={activeIcon}>
        <Tooltip direction="top" offset={[0, -10]}>
          {destination.name}
        </Tooltip>
      </Marker>
    </MapContainer>
  );
}
