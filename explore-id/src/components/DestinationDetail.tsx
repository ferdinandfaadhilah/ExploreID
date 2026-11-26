import { useMemo } from "react";
import { destinations, type Destination } from "../data/destinations";
import {
  destinationGuides,
  defaultDestinationGuide,
} from "../data/destinationGuides";
import { destinationGallery } from "../data/destinationGallery";
import { ticketInformation } from "../data/ticketInformation";
import { useLanguage } from "../hooks/useLanguage";
import { calculateDistance } from "../lib/geo";
import type { AppUser } from "../types";
import DestinationGallery from "./DestinationGallery";
import Reveal from "./Reveal";
import ReviewsSection from "./ReviewsSection";
import TravelGuide from "./TravelGuide";
import WeatherSection from "./WeatherSection";

// Jumlah maksimal destinasi terdekat yang ditampilkan.
const NEARBY_LIMIT = 6;

type DestinationDetailProps = {
  destination: Destination;
  phase: "exit" | "enter" | null;
  isFavorite: boolean;
  user: AppUser | null | undefined;
  onBack: () => void;
  onToggleFavorite: (id: number) => void;
  onOpenNearby: (item: Destination) => void;
  onRequireLogin: () => void;
};

export default function DestinationDetail({
  destination,
  phase,
  isFavorite,
  user,
  onBack,
  onToggleFavorite,
  onOpenNearby,
  onRequireLogin,
}: DestinationDetailProps) {
  const { t } = useLanguage();

  const guide =
    destinationGuides[destination.id] || defaultDestinationGuide;

  const ticketInfo = ticketInformation[destination.id];

  const hasTicketInfo = Boolean(
    ticketInfo &&
      [ticketInfo.ticketPrice, ticketInfo.ticketNote, ticketInfo.ticketUrl].some(
        (value) => typeof value === "string" && value.trim() !== ""
      )
  );

  const nearbyDestinations = useMemo(
    () =>
      destinations
        .filter((item) => item.id !== destination.id)
        .map((item) => ({
          item,
          distance: calculateDistance(destination.position, item.position),
        }))
        .sort((a, b) => a.distance - b.distance)
        .slice(0, NEARBY_LIMIT),
    [destination]
  );

  const galleryImages = destinationGallery[destination.id]?.length
    ? destinationGallery[destination.id]
    : [destination.image];

  const phaseClass =
    phase === "exit" ? "detail-exit" : phase === "enter" ? "detail-enter" : "";

  return (
    <section className={`inner-page destination-detail-page ${phaseClass}`}>
      <button className="back-button" onClick={onBack}>
        {t.detail.back}
      </button>

      <div className="detail-layout">
        <img
          className="detail-photo"
          src={destination.image}
          alt={destination.name}
        />

        <div className="detail-copy">
          <span className="eyebrow">{destination.category}</span>
          <h1>{destination.name}</h1>
          <p className="location">⌖ {destination.location}</p>
          <p>{destination.description}</p>

          <div className="price-panel">
            <span>{t.detail.estimatedPrice}</span>
            <strong>{destination.price}</strong>
            <small>{t.detail.priceDisclaimer}</small>
          </div>

          <div className="detail-actions">
            <button
              className="primary-button"
              onClick={() => onToggleFavorite(destination.id)}
            >
              {isFavorite ? t.detail.removeFavorite : t.detail.addFavorite}
            </button>

            <a
              className="detail-map-link"
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                `${destination.name}, ${destination.location}, Indonesia`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t.detail.openMaps}
            </a>
          </div>
        </div>
      </div>

      {/* DESTINATION OVERVIEW */}
      <Reveal as="section" className="destination-info-section">
        <div className="section-top">
          <div>
            <span className="eyebrow">{t.detail.overviewEyebrow}</span>
            <h2>{t.detail.overviewTitle}</h2>
            <p>{t.detail.overviewDesc(destination.name)}</p>
          </div>
        </div>

        <div className="destination-info-grid">
          <article className="destination-info-card">
            <span className="info-card-icon">⌖</span>
            <div>
              <small>{t.detail.locationLabel}</small>
              <h3>{destination.location}</h3>
              <p>{t.detail.locationDesc}</p>
            </div>
          </article>

          <article className="destination-info-card">
            <span className="info-card-icon">✦</span>
            <div>
              <small>{t.detail.categoryLabel}</small>
              <h3>{destination.category}</h3>
              <p>{t.detail.categoryDesc}</p>
            </div>
          </article>

          <article className="destination-info-card">
            <span className="info-card-icon">◷</span>
            <div>
              <small>{t.detail.budgetLabel}</small>
              <h3>{destination.price}</h3>
              <p>{t.detail.budgetDesc}</p>
            </div>
          </article>
        </div>

        <div className="destination-coordinate">
          <div>
            <span className="eyebrow">{t.detail.coordinatesEyebrow}</span>
            <h3>{t.detail.coordinatesTitle}</h3>
            <p>
              {t.detail.latitude}: {destination.position[0]}°
              <br />
              {t.detail.longitude}: {destination.position[1]}°
            </p>
          </div>

          <a
            href={`https://www.google.com/maps/search/?api=1&query=${destination.position[0]},${destination.position[1]}`}
            target="_blank"
            rel="noopener noreferrer"
            className="detail-map-link"
          >
            {t.detail.viewOnMaps}
          </a>
        </div>
      </Reveal>

      {/* TICKET INFORMATION */}
      {hasTicketInfo && ticketInfo && (
        <Reveal as="section" className="ticket-information-section">
          <div className="section-top">
            <div>
              <span className="eyebrow">{t.ticket.eyebrow}</span>
              <h2>{t.ticket.title}</h2>
              <p>{t.ticket.desc(destination.name)}</p>
            </div>
          </div>

          <div className="ticket-information-card">
            <div className="ticket-information-icon">🎟️</div>

            <div className="ticket-information-content">
              <span>{t.ticket.cardLabel}</span>

              {ticketInfo.ticketPrice?.trim() && (
                <h3>{ticketInfo.ticketPrice}</h3>
              )}

              {ticketInfo.ticketNote?.trim() && <p>{ticketInfo.ticketNote}</p>}

              {ticketInfo.ticketUrl?.trim() && (
                <a
                  href={ticketInfo.ticketUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="primary-button"
                >
                  {t.ticket.checkTickets}
                </a>
              )}

              <p className="ticket-unavailable">{t.ticket.disclaimer}</p>
            </div>
          </div>
        </Reveal>
      )}

      {/* TRAVEL GUIDE */}
      <TravelGuide destinationName={destination.name} guide={guide} />

      <div className="gallery-spacing">
        <DestinationGallery
          destinationName={destination.name}
          images={galleryImages}
        />
      </div>

      {/* NEARBY DESTINATIONS */}
      <Reveal as="section" className="nearby-section">
        <div className="section-top">
          <div>
            <span className="eyebrow">{t.nearby.eyebrow}</span>
            <h2>{t.nearby.title}</h2>
            <p>{t.nearby.desc(destination.name)}</p>
          </div>
        </div>

        <div className="destination-grid">
          {nearbyDestinations.map(({ item, distance }) => (
            <article className="destination-card nearby-card" key={item.id}>
              <button
                type="button"
                className="nearby-card-button"
                onClick={() => onOpenNearby(item)}
                aria-label={t.nearby.explore(item.name)}
              >
                <div className="card-image">
                  <img src={item.image} alt={item.name} loading="lazy" />

                  <div className="card-image-overlay">
                    <div className="card-content">
                      <span className="tag">{item.category}</span>
                      <h3>{item.name}</h3>
                      <p className="location">⌖ {item.location}</p>

                      <p className="nearby-distance">
                        {t.nearby.distance(distance.toFixed(1))}
                      </p>

                      <span className="detail-link">{t.nearby.link}</span>
                    </div>
                  </div>
                </div>
              </button>
            </article>
          ))}
        </div>
      </Reveal>

      <WeatherSection destination={destination} />

      <ReviewsSection
        destinationId={destination.id}
        user={user}
        onRequireLogin={onRequireLogin}
      />
    </section>
  );
}
