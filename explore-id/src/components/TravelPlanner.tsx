import { useMemo } from "react";
import type { Destination } from "../data/destinations";
import { useLanguage } from "../hooks/useLanguage";
import Reveal from "./Reveal";
import RouteMiniMap from "./RouteMiniMap";
import TravelControls from "./TravelControls";
import {
  MODE_ICONS,
  MODE_LABELS,
  TRAVEL_MODES,
  estimateTrip,
  formatDistance,
  formatDuration,
  googleNavigationUrl,
  useTravelMode,
  useTravelOrigin,
  type TravelMode,
  type TripEstimate,
} from "./travel";

const COPY = {
  English: {
    eyebrow: "TRAVEL ESTIMATE",
    title: (name: string) => `How long to get to ${name}?`,
    desc: "Set your starting point and compare travel times for every vehicle.",
    noOrigin: "Set a starting point to see travel times",
    sea: "Over sea",
    byAir: "by plane",
    ferry: "incl. ferry",
    impractical: "Walking this far isn't very practical.",
    airNote: "Public transport between islands is estimated by plane, including time at the airport.",
    seaNote: "Your starting point and this destination are separated by sea, so only Public (by plane) can be estimated.",
    open: "Open route in Google Maps",
    originLabel: "Starting point",
  },
  Indonesia: {
    eyebrow: "ESTIMASI PERJALANAN",
    title: (name: string) => `Berapa lama ke ${name}?`,
    desc: "Atur titik berangkat dan bandingkan waktu tempuh untuk setiap kendaraan.",
    noOrigin: "Atur titik berangkat untuk melihat waktu tempuh",
    sea: "Lewat laut",
    byAir: "via pesawat",
    ferry: "termasuk feri",
    impractical: "Jalan kaki sejauh ini kurang praktis.",
    airNote: "Moda Umum antar-pulau diperkirakan via pesawat, termasuk waktu di bandara.",
    seaNote: "Titik berangkat dan destinasi ini terpisah laut, jadi hanya Umum (via pesawat) yang bisa diestimasi.",
    open: "Buka rute di Google Maps",
    originLabel: "Titik berangkat",
  },
};

// Bagian di halaman Destinasi: bandingkan waktu tempuh semua kendaraan + peta rute mini.
export default function TravelPlanner({ destination }: { destination: Destination }) {
  const { language } = useLanguage();
  const copy = COPY[language];

  const [mode, setMode] = useTravelMode();
  const { origin, status, locate, chooseCity } = useTravelOrigin();

  const estimates = useMemo(() => {
    if (!origin) return null;

    const result = {} as Record<TravelMode, TripEstimate>;

    for (const item of TRAVEL_MODES) {
      result[item] = estimateTrip(origin.coords, destination.position, item);
    }

    return result;
  }, [origin, destination]);

  const current = estimates?.[mode] ?? null;
  const allBlocked = estimates
    ? TRAVEL_MODES.every((item) => item === "transit" || !estimates[item].available)
    : false;

  return (
    <Reveal
      as="section"
      direction="none"
      className="travel-planner-section"
    >
      <div className="section-top">
        <div>
          <span className="eyebrow">{copy.eyebrow}</span>
          <h2>{copy.title(destination.name)}</h2>
          <p>{copy.desc}</p>
        </div>
      </div>

      <TravelControls
        showModes={false}
        mode={mode}
        onModeChange={setMode}
        origin={origin}
        status={status}
        onLocate={locate}
        onCityChange={chooseCity}
      />

      <div className="planner-grid">
        <div className="planner-modes">
          {TRAVEL_MODES.map((item) => {
            const estimate = estimates?.[item] ?? null;

            return (
              <button
                key={item}
                type="button"
                className={`planner-mode ${mode === item ? "is-active" : ""} ${
                  estimate && !estimate.available ? "is-blocked" : ""
                }`}
                aria-pressed={mode === item}
                onClick={() => setMode(item)}
              >
                <span className="planner-mode-icon" aria-hidden="true">
                  {estimate?.viaAir ? "✈️" : MODE_ICONS[item]}
                </span>

                <span className="planner-mode-body">
                  <small>{MODE_LABELS[language][item]}</small>

                  {!estimate ? (
                    <strong>—</strong>
                  ) : estimate.available ? (
                    <>
                      <strong>{formatDuration(estimate.minutes, language)}</strong>
                      <em>
                        {formatDistance(estimate.distanceKm)}
                        {estimate.viaAir && ` · ${copy.byAir}`}
                        {estimate.ferry && ` · ${copy.ferry}`}
                      </em>
                    </>
                  ) : (
                    <strong>🌊 {copy.sea}</strong>
                  )}
                </span>
              </button>
            );
          })}

          {!origin && <p className="planner-hint">{copy.noOrigin}</p>}
        </div>

        <div className="planner-map">
          <RouteMiniMap
            destination={destination}
            origin={origin ? origin.coords : null}
            originLabel={copy.originLabel}
          />
        </div>
      </div>

      {current?.viaAir && <p className="planner-note">{copy.airNote}</p>}
      {current?.impractical && <p className="planner-note">{copy.impractical}</p>}
      {allBlocked && mode !== "transit" && <p className="planner-note">{copy.seaNote}</p>}

      <a
        className="primary-button"
        href={googleNavigationUrl(destination.position, origin, mode)}
        target="_blank"
        rel="noopener noreferrer"
      >
        {copy.open} ↗
      </a>
    </Reveal>
  );
}
