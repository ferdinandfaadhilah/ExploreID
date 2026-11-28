import type { Destination } from "../data/destinations";
import { ticketInformation } from "../data/ticketInformation";
import { useLanguage } from "../hooks/useLanguage";
import {
  MODE_ICONS,
  MODE_LABELS,
  formatDistance,
  formatDuration,
  googleNavigationUrl,
  type OriginState,
  type TravelMode,
  type TripEstimate,
} from "./travel";

const COPY = {
  English: {
    close: "Close panel",
    eta: "Estimated travel time",
    ticket: "Estimated ticket / cost",
    viewDetail: "View details",
    navigate: "Navigate in Google Maps",
    noOrigin: "Set a starting point above to see the estimated travel time.",
    seaTitle: "Not reachable by land",
    seaDesc: "Your starting point and this destination are separated by sea. Choose Public for a flight estimate.",
    airNote: "Estimated by plane, including time at the airport.",
    ferryNote: "Includes ferry crossing time.",
    walkNote: "Walking this far isn't very practical.",
  },
  Indonesia: {
    close: "Tutup panel",
    eta: "Estimasi waktu sampai",
    ticket: "Estimasi tiket / biaya",
    viewDetail: "Lihat detail",
    navigate: "Navigasi Google Maps",
    noOrigin: "Atur titik berangkat di atas untuk melihat estimasi waktu sampai.",
    seaTitle: "Tidak bisa lewat darat",
    seaDesc: "Titik berangkat dan destinasi ini terpisah laut. Pilih Umum untuk estimasi via pesawat.",
    airNote: "Estimasi via pesawat, termasuk waktu di bandara.",
    ferryNote: "Sudah termasuk penyeberangan kapal feri.",
    walkNote: "Jalan kaki sejauh ini kurang praktis.",
  },
};

type DestinationInfoPanelProps = {
  destination: Destination;
  estimate: TripEstimate | null;
  mode: TravelMode;
  origin: OriginState | null;
  onClose: () => void;
  onOpen: (item: Destination) => void;
};

// Panel di sisi kanan peta saat marker (atau kartu) dipilih.
export default function DestinationInfoPanel({
  destination,
  estimate,
  mode,
  origin,
  onClose,
  onOpen,
}: DestinationInfoPanelProps) {
  const { language } = useLanguage();
  const copy = COPY[language];

  const ticket =
    ticketInformation[destination.id]?.ticketPrice?.trim() || destination.price;

  const navigationUrl = googleNavigationUrl(destination.position, origin, mode);

  return (
    <aside className="map-info-panel" aria-live="polite">
      <button
        type="button"
        className="map-info-close"
        aria-label={copy.close}
        onClick={onClose}
      >
        ×
      </button>

      <span className="map-info-tag">{destination.category}</span>
      <h3>{destination.name}</h3>
      <p className="map-info-location">⌖ {destination.location}</p>

      <div className="map-info-eta">
        {estimate?.available ? (
          <>
            <small>
              {estimate.viaAir ? "✈️" : MODE_ICONS[mode]} {copy.eta}
              {" · "}
              {MODE_LABELS[language][mode]}
            </small>

            <div className="map-info-eta-main">
              <strong>{formatDuration(estimate.minutes, language)}</strong>
              <span>• {formatDistance(estimate.distanceKm)}</span>
            </div>

            {estimate.viaAir && <em>{copy.airNote}</em>}
            {estimate.ferry && <em>{copy.ferryNote}</em>}
            {estimate.impractical && <em>{copy.walkNote}</em>}
          </>
        ) : estimate ? (
          <>
            <small>🌊 {copy.seaTitle}</small>
            <p>{copy.seaDesc}</p>
          </>
        ) : (
          <p>{copy.noOrigin}</p>
        )}
      </div>

      <div className="map-info-row">
        <span>{copy.ticket}</span>
        <strong>{ticket}</strong>
      </div>

      <div className="map-info-actions">
        <button
          type="button"
          className="primary-button"
          onClick={() => onOpen(destination)}
        >
          {copy.viewDetail} ↗
        </button>

        <a
          className="map-info-nav"
          href={navigationUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          {copy.navigate} ↗
        </a>
      </div>
    </aside>
  );
}
