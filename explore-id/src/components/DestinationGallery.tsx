
import { useEffect, useState } from "react";

type DestinationGalleryProps = {
  destinationName: string;
  images: string[];
};

export default function DestinationGallery({
  destinationName,
  images,
}: DestinationGalleryProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const closeLightbox = () => setActiveIndex(null);

  const showPrevious = () => {
    if (activeIndex === null) return;

    setActiveIndex(
      (activeIndex - 1 + images.length) % images.length
    );
  };

  const showNext = () => {
    if (activeIndex === null) return;

    setActiveIndex((activeIndex + 1) % images.length);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (activeIndex === null) return;

      if (event.key === "Escape") closeLightbox();
      if (event.key === "ArrowLeft") showPrevious();
      if (event.key === "ArrowRight") showNext();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeIndex, images.length]);

  return (
    <section className="photo-gallery-section">
      <div className="section-top">
        <div>
          <span className="eyebrow">PHOTO PREVIEW</span>
          <h2>Destination Gallery</h2>
          <p>
            Jelajahi berbagai foto menarik dari {destinationName}.
          </p>
        </div>
      </div>

      <div className="photo-gallery-grid">
        {images.map((image, index) => (
          <button
            key={index}
            type="button"
            className={`gallery-photo ${
              index === 0 ? "gallery-photo-main" : ""
            }`}
            onClick={() => setActiveIndex(index)}
          >
            <img
              src={image}
              alt={`${destinationName} - Foto ${index + 1}`}
              loading="lazy"
            />
            <span>{destinationName}</span>
          </button>
        ))}
      </div>

      {activeIndex !== null && (
<div
  className="gallery-lightbox"
  onClick={() => setActiveIndex(null)}
>
          <button
            className="lightbox-close"
            onClick={closeLightbox}
            aria-label="Tutup galeri"
          >
            ×
          </button>

          <button
            className="lightbox-nav lightbox-prev"
            onClick={(event) => {
              event.stopPropagation();
              showPrevious();
            }}
            aria-label="Foto sebelumnya"
          >
            ‹
          </button>

          <div
            className="lightbox-content"
            onClick={(event) => event.stopPropagation()}
          >
            <img
              src={images[activeIndex]}
              alt={`${destinationName} - Foto ${activeIndex + 1}`}
            />

            <p>
              {destinationName} · {activeIndex + 1} / {images.length}
            </p>
          </div>

          <button
            className="lightbox-nav lightbox-next"
            onClick={(event) => {
              event.stopPropagation();
              showNext();
            }}
            aria-label="Foto berikutnya"
          >
            ›
          </button>
        </div>
      )}
    </section>
  );
}
