import { useState, type ReactNode } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { divIcon } from "leaflet";
import "leaflet/dist/leaflet.css";
import { destinations, type Destination } from "../data/destinations";
import { useLanguage } from "../hooks/useLanguage";

const PAGE_SIZE = 8;

const destinationIcon = divIcon({
  className: "explore-map-marker",
  html: '<div style="background:#23966c;width:18px;height:18px;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px #0005"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

type MapPageProps = {
  onOpen: (item: Destination) => void;
  renderCard: (item: Destination) => ReactNode;
};

export default function MapPage({ onOpen, renderCard }: MapPageProps) {
  const { t } = useLanguage();
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const visibleDestinations = destinations.slice(0, visibleCount);
  const hasMore = visibleCount < destinations.length;

  return (
    <section className="inner-page">
      <span className="eyebrow">{t.map.eyebrow}</span>
      <h1 className="page-title">{t.map.title}</h1>
      <p className="page-subtitle">{t.map.subtitle}</p>

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

        {destinations.map((item) => (
          <Marker key={item.id} position={item.position} icon={destinationIcon}>
            <Popup>
              <div className="map-popup">
                <strong>{item.name}</strong>
                <p>{item.location}</p>
                <button onClick={() => onOpen(item)}>
                  {t.map.viewDetails}
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Kartu dimuat bertahap supaya halaman tetap ringan */}
      <div className="destination-grid map-list">
        {visibleDestinations.map((item) => renderCard(item))}
      </div>

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
