import type { Destination } from "../data/destinations";
import { useLanguage } from "../hooks/useLanguage";

type DestinationCardProps = {
  item: Destination;
  saved: boolean;
  onOpen: (item: Destination) => void;
  onToggleFavorite: (id: number) => void;
};

export default function DestinationCard({
  item,
  saved,
  onOpen,
  onToggleFavorite,
}: DestinationCardProps) {
  const { t } = useLanguage();

  return (
    <article className="destination-card">
      <div className="card-image">
        {/* GAMBAR BISA DIKLIK */}
        <button
          type="button"
          className="card-image-open"
          onClick={() => onOpen(item)}
          aria-label={t.card.viewDetail(item.name)}
        >
          <img src={item.image} alt={item.name} loading="lazy" />
        </button>

        <div className="card-image-overlay">
          <div className="card-content">
            <span className="tag">{item.category}</span>

            <h3>{item.name}</h3>

            <p className="location">⌖ {item.location}</p>

            <p className="card-description">{item.description}</p>

            <div className="card-bottom">
              <strong>{item.price}</strong>
            </div>
          </div>
        </div>

        {/* FAVORITE */}
        <button
          className={`heart-button ${saved ? "saved" : ""}`}
          onClick={(event) => {
            event.stopPropagation();
            onToggleFavorite(item.id);
          }}
          aria-label={saved ? t.card.removeFavorite : t.card.saveFavorite}
          aria-pressed={saved}
        >
          {saved ? "♥" : "♡"}
        </button>
      </div>
    </article>
  );
}
