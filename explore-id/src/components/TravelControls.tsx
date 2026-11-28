import { useLanguage } from "../hooks/useLanguage";
import {
  MODE_ICONS,
  MODE_LABELS,
  ORIGIN_CITIES,
  TRAVEL_MODES,
  type LocateStatus,
  type OriginState,
  type TravelMode,
} from "./travel";

const COPY = {
  English: {
    myLocation: "📍 My Location",
    locating: "Finding location…",
    cityLabel: "or pick a starting city",
    cityPlaceholder: "Choose a city",
    modeLabel: "Vehicle",
    fromGps: "Starting from your current location",
    fromCity: (city: string) => `Starting from ${city}`,
    needOrigin: "Set a starting point to see estimated travel times.",
    denied: "Location permission was denied. Pick a starting city instead.",
    unsupported: "This browser can't detect your location. Pick a starting city instead.",
    error: "Couldn't get your location. Try again or pick a starting city.",
    disclaimer: "Rough estimate from straight-line distance and average speed. Real travel time may differ.",
  },
  Indonesia: {
    myLocation: "📍 Lokasi Saya",
    locating: "Mencari lokasi…",
    cityLabel: "atau pilih kota asal",
    cityPlaceholder: "Pilih kota",
    modeLabel: "Kendaraan",
    fromGps: "Berangkat dari lokasi kamu saat ini",
    fromCity: (city: string) => `Berangkat dari ${city}`,
    needOrigin: "Atur titik berangkat untuk melihat estimasi waktu tempuh.",
    denied: "Izin lokasi ditolak. Pilih kota asal secara manual.",
    unsupported: "Browser ini tidak bisa mendeteksi lokasi. Pilih kota asal secara manual.",
    error: "Lokasi belum bisa didapat. Coba lagi atau pilih kota asal.",
    disclaimer: "Estimasi kasar dari jarak garis lurus dan kecepatan rata-rata. Waktu sebenarnya bisa berbeda.",
  },
};

type TravelControlsProps = {
  mode: TravelMode;
  onModeChange: (mode: TravelMode) => void;
  origin: OriginState | null;
  status: LocateStatus;
  onLocate: () => void;
  onCityChange: (cityId: string) => void;
  // false = tombol kendaraan disembunyikan (dipilih lewat kartu lain).
  showModes?: boolean;
};

// Control bar di atas peta: titik berangkat + pilihan kendaraan.
export default function TravelControls({
  mode,
  onModeChange,
  origin,
  status,
  onLocate,
  onCityChange,
  showModes = true,
}: TravelControlsProps) {
  const { language } = useLanguage();
  const copy = COPY[language];
  const labels = MODE_LABELS[language];

  const hasError = status === "denied" || status === "unsupported" || status === "error";

  let statusText: string = copy.needOrigin;

  if (hasError) statusText = copy[status];
  else if (origin?.source === "gps") statusText = copy.fromGps;
  else if (origin) statusText = copy.fromCity(origin.label);

  return (
    <div className={`travel-bar ${showModes ? "" : "no-modes"}`}>
      <div className="travel-origin">
        <button
          type="button"
          className={`travel-locate ${origin?.source === "gps" ? "is-active" : ""}`}
          onClick={onLocate}
          disabled={status === "locating"}
        >
          {status === "locating" ? copy.locating : copy.myLocation}
        </button>

        <label className="travel-city">
          <span>{copy.cityLabel}</span>

          <select
            value={origin?.source === "city" ? origin.cityId : ""}
            onChange={(event) => onCityChange(event.target.value)}
          >
            <option value="" disabled>
              {copy.cityPlaceholder}
            </option>

            {ORIGIN_CITIES.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {showModes && (
      <div className="travel-modes" role="group" aria-label={copy.modeLabel}>
        {TRAVEL_MODES.map((item) => (
          <button
            key={item}
            type="button"
            className={`travel-mode ${mode === item ? "is-active" : ""}`}
            aria-pressed={mode === item}
            onClick={() => onModeChange(item)}
          >
            <span aria-hidden="true">{MODE_ICONS[item]}</span>
            {labels[item]}
          </button>
        ))}
      </div>
      )}

      <p className={`travel-status ${hasError ? "is-error" : origin ? "is-ok" : ""}`}>
        {statusText}
        {!hasError && origin && <small> · {copy.disclaimer}</small>}
      </p>
    </div>
  );
}
