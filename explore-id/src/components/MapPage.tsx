import { useEffect, useMemo, useRef, useState } from "react";
import {
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  Tooltip,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { destinations, type Destination } from "../data/destinations";
import { useLanguage } from "../hooks/useLanguage";
import type { Coordinates } from "../lib/geo";
import DestinationCard from "./DestinationCard";
import DestinationInfoPanel from "./DestinationInfoPanel";
import { activeIcon, destinationIcon, originIcon } from "./mapIcons";
import PageHeader from "./PageHeader";
import Reveal from "./Reveal";
import TravelControls from "./TravelControls";
import {
  MODE_ICONS,
  estimateTrip,
  formatDuration,
  useTravelMode,
  useTravelOrigin,
  type TripEstimate,
} from "./travel";

const PAGE_SIZE = 8;

const COPY = {
  English: {
    hint: "Click a marker to see travel time",
    origin: "Starting point",
    sea: "Over sea",
  },
  Indonesia: {
    hint: "Klik marker untuk melihat estimasi waktu tempuh",
    origin: "Titik berangkat",
    sea: "Lewat laut",
  },
};

// Menggeser/zoom peta ke destinasi terpilih (dan titik berangkat, jika ada).
function MapFocus({ target, origin }: { target: Destination | null; origin: Coordinates | null }) {
  const map = useMap();

  const targetLat = target?.position[0];
  const targetLng = target?.position[1];
  const originLat = origin?.[0];
  const originLng = origin?.[1];

  useEffect(() => {
    if (targetLat === undefined || targetLng === undefined) return;

    // Sisakan ruang untuk panel info di sisi kanan (desktop). Di HP panel ada di bawah peta.
    const wide = window.innerWidth > 860;
    const options = {
      paddingTopLeft: [50, 50] as [number, number],
      paddingBottomRight: (wide ? [370, 50] : [50, 50]) as [number, number],
      maxZoom: 9,
      duration: 0.9,
    };

    if (originLat !== undefined && originLng !== undefined) {
      map.flyToBounds(
        [
          [originLat, originLng],
          [targetLat, targetLng],
        ],
        options
      );
    } else {
      map.flyToBounds(
        [
          [targetLat - 1.2, targetLng - 1.2],
          [targetLat + 1.2, targetLng + 1.2],
        ],
        options
      );
    }
  }, [map, targetLat, targetLng, originLat, originLng]);

  return null;
}

type MapPageProps = {
  onOpen: (item: Destination) => void;
  favorites: number[];
  onToggleFavorite: (id: number) => void;
};

export default function MapPage({ onOpen, favorites, onToggleFavorite }: MapPageProps) {
  const { language, t } = useLanguage();
  const copy = COPY[language];

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [mode, changeMode] = useTravelMode();
  const { origin, status, locate, chooseCity } = useTravelOrigin();
  const stageRef = useRef<HTMLDivElement | null>(null);

  // Estimasi semua destinasi dihitung ulang otomatis saat kendaraan / titik berangkat berubah.
  const estimates = useMemo(() => {
    const result = new Map<number, TripEstimate>();

    if (!origin) return result;

    for (const item of destinations) {
      result.set(item.id, estimateTrip(origin.coords, item.position, mode));
    }

    return result;
  }, [origin, mode]);

  const selected = destinations.find((item) => item.id === selectedId) ?? null;

  function select(item: Destination, scrollToMap = false) {
    setSelectedId(item.id);

    if (scrollToMap) {
      stageRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  function renderBadge(item: Destination) {
    const estimate = estimates.get(item.id);

    if (!estimate) return null;

    if (!estimate.available) return `🌊 ${copy.sea}`;

    return `${estimate.viaAir ? "✈️" : MODE_ICONS[mode]} ${formatDuration(
      estimate.minutes,
      language
    )}`;
  }

  const visibleDestinations = destinations.slice(0, visibleCount);
  const hasMore = visibleCount < destinations.length;

  return (
    <section className="inner-page map-page">
      <PageHeader
        eyebrow={t.map.eyebrow}
        title={t.map.title}
        subtitle={t.map.subtitle}
      />

      {/* Control bar: titik berangkat + kendaraan */}
      <Reveal delay={200}>
        <TravelControls
          mode={mode}
          onModeChange={changeMode}
          origin={origin}
          status={status}
          onLocate={locate}
          onCityChange={chooseCity}
        />
      </Reveal>

      {/* Peta hanya fade (tanpa geser) agar Leaflet tidak terganggu */}
      <Reveal direction="none" delay={260}>
        <div className="map-stage" ref={stageRef}>
          <MapContainer
            center={[-2.5, 118]}
            zoom={5}
            scrollWheelZoom={true}
            className="map-container"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapFocus target={selected} origin={origin ? origin.coords : null} />

            {origin && selected && (
              <Polyline
                positions={[origin.coords, selected.position]}
                pathOptions={{ color: "#e8833a", weight: 3, dashArray: "6 9" }}
              />
            )}

            {origin && (
              <Marker position={origin.coords} icon={originIcon}>
                <Tooltip direction="top" offset={[0, -8]}>
                  {copy.origin}
                </Tooltip>
              </Marker>
            )}

            {destinations.map((item) => (
              <Marker
                key={item.id}
                position={item.position}
                icon={item.id === selectedId ? activeIcon : destinationIcon}
                eventHandlers={{ click: () => select(item) }}
              >
                <Tooltip direction="top" offset={[0, -10]}>
                  {item.name}
                </Tooltip>
              </Marker>
            ))}
          </MapContainer>

          {!selected && <div className="map-hint">{copy.hint}</div>}

          {selected && (
            <DestinationInfoPanel
              key={selected.id}
              destination={selected}
              estimate={estimates.get(selected.id) ?? null}
              mode={mode}
              origin={origin}
              onClose={() => setSelectedId(null)}
              onOpen={onOpen}
            />
          )}
        </div>
      </Reveal>

      {/* Kartu dimuat bertahap supaya halaman tetap ringan */}
      <Reveal className="destination-grid map-list" threshold={0.05}>
        {visibleDestinations.map((item) => (
          <DestinationCard
            key={item.id}
            item={item}
            saved={favorites.includes(item.id)}
            selected={item.id === selectedId}
            badge={renderBadge(item)}
            onOpen={(chosen) => select(chosen, true)}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </Reveal>

      {hasMore && (
        <div className="map-load-more">
          <button
            type="button"
            className="primary-button"
            onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
          >
            {t.map.showMore}
          </button>

          <small>{t.map.shown(visibleCount, destinations.length)}</small>
        </div>
      )}
    </section>
  );
}
