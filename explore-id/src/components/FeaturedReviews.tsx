import { useCallback, useEffect, useRef, useState } from "react";
import { destinations, type Destination } from "../data/destinations";
import { useLanguage } from "../hooks/useLanguage";
import { supabase } from "../lib/supabaseClient";
import Reveal from "./Reveal";

type ReviewRow = {
  id: string;
  user_name: string | null;
  rating: number;
  comment: string;
  destination_id: number;
};

const COPY = {
  English: {
    eyebrow: "WHAT EXPLORERS SAY",
    title: "Stories from fellow travelers",
    prev: "Previous reviews",
    next: "Next reviews",
    open: "View destination ↗",
    explorer: "Explorer",
  },
  Indonesia: {
    eyebrow: "KATA PARA PENJELAJAH",
    title: "Cerita dari sesama pejalan",
    prev: "Ulasan sebelumnya",
    next: "Ulasan berikutnya",
    open: "Lihat destinasi ↗",
    explorer: "Explorer",
  },
};

const AVATAR_COLORS = ["#456477", "#c0793a", "#2f8f6a", "#7a5c8a", "#3a7bd5", "#c9593f"];

function avatarColor(name: string) {
  let hash = 0;

  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) % 997;

  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

type FeaturedReviewsProps = {
  onOpen: (item: Destination) => void;
};

// Carousel ulasan pilihan (rating tinggi) dengan tombol panah.
export default function FeaturedReviews({ onOpen }: FeaturedReviewsProps) {
  const { language } = useLanguage();
  const copy = COPY[language];

  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [edge, setEdge] = useState({ start: true, end: true });
  const trackRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let active = true;

    async function loadReviews() {
      const { data, error } = await supabase
        .from("destination_reviews")
        .select("id,user_name,rating,comment,destination_id")
        .gte("rating", 4)
        .order("created_at", { ascending: false })
        .limit(12);

      if (!active || error || !data) return;

      setReviews(
        (data as ReviewRow[]).filter(
          (review) =>
            review.comment?.trim().length >= 12 &&
            destinations.some((item) => item.id === review.destination_id)
        )
      );
    }

    loadReviews();

    return () => {
      active = false;
    };
  }, []);

  const updateEdges = useCallback(() => {
    const track = trackRef.current;

    if (!track) return;

    setEdge({
      start: track.scrollLeft <= 4,
      end: track.scrollLeft + track.clientWidth >= track.scrollWidth - 4,
    });
  }, []);

  useEffect(() => {
    updateEdges();
    window.addEventListener("resize", updateEdges);

    return () => window.removeEventListener("resize", updateEdges);
  }, [reviews, updateEdges]);

  function scrollByPage(direction: 1 | -1) {
    const track = trackRef.current;

    if (!track) return;

    track.scrollBy({
      left: direction * track.clientWidth * 0.9,
      behavior: "smooth",
    });
  }

  // Tidak ada ulasan layak tampil: section disembunyikan.
  if (reviews.length === 0) return null;

  return (
    <Reveal
      as="section"
      className="explore-section featured-reviews"
      id="featured-reviews"
    >
      <div className="featured-inner">
        <div className="section-top">
          <div>
            <span className="eyebrow">{copy.eyebrow}</span>
            <h2>{copy.title}</h2>
          </div>

          <div className="carousel-arrows">
            <button
              type="button"
              aria-label={copy.prev}
              disabled={edge.start}
              onClick={() => scrollByPage(-1)}
            >
              ←
            </button>

            <button
              type="button"
              aria-label={copy.next}
              disabled={edge.end}
              onClick={() => scrollByPage(1)}
            >
              →
            </button>
          </div>
        </div>

        <div className="featured-track" ref={trackRef} onScroll={updateEdges}>
          {reviews.map((review) => {
            const destination = destinations.find(
              (item) => item.id === review.destination_id
            );
            const name = review.user_name?.trim() || copy.explorer;

            if (!destination) return null;

            return (
              <article className="featured-review" key={review.id}>
                <span className="featured-quote" aria-hidden="true">
                  “
                </span>

                <p>{review.comment}</p>

                <div className="featured-review-foot">
                  <span
                    className="featured-avatar"
                    style={{ background: avatarColor(name) }}
                  >
                    {name[0]?.toUpperCase()}
                  </span>

                  <div>
                    <strong>{name}</strong>
                    <small>{destination.name}</small>
                  </div>

                  <span
                    className="featured-stars"
                    aria-label={`${review.rating}/5`}
                  >
                    {"★".repeat(review.rating)}
                    {"☆".repeat(5 - review.rating)}
                  </span>
                </div>

                <button
                  type="button"
                  className="featured-open"
                  onClick={() => onOpen(destination)}
                >
                  {copy.open}
                </button>
              </article>
            );
          })}
        </div>
      </div>
    </Reveal>
  );
}
