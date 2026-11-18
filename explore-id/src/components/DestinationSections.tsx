import "./DestinationSections.css";
import { useEffect, useState } from "react";
import type { Destination } from "../data/destinations";
import {
  destinationGuides,
  defaultDestinationGuide,
} from "../data/destinationGuides";
import { supabase } from "../lib/supabaseClient";

type Review = {
  id: string;
  user_id: string;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
};

type Props = {
  destination: Destination;
  destinations: Destination[];
};

export default function DestinationSections({
  destination,
  destinations,
}: Props) {
  const guide =
    destinationGuides[destination.id] ?? defaultDestinationGuide;

  const nearbyDestinations = destinations
    .filter(
      (item) =>
        item.id !== destination.id &&
        item.location === destination.location
    )
    .slice(0, 4);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function loadReviews() {
    const { data, error } = await supabase
      .from("destination_reviews")
      .select("*")
      .eq("destination_id", destination.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setReviews(data as Review[]);
    }
  }

  useEffect(() => {
    loadReviews();
  }, [destination.id]);

  async function submitReview() {
    setMessage("");

    if (!comment.trim()) {
      setMessage("Tulis ulasan terlebih dahulu.");
      return;
    }

    setLoading(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setMessage("Silakan login terlebih dahulu untuk memberi ulasan.");
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from("destination_reviews")
      .upsert(
        {
          destination_id: destination.id,
          user_id: user.id,
          user_name:
            user.user_metadata?.full_name ||
            user.email?.split("@")[0] ||
            "Pengguna",
          rating,
          comment: comment.trim(),
        },
        {
          onConflict: "destination_id,user_id",
        }
      );

    if (error) {
      setMessage("Ulasan gagal dikirim. Coba lagi.");
    } else {
      setComment("");
      setRating(5);
      setMessage("Ulasan berhasil dikirim!");
      await loadReviews();
    }

    setLoading(false);
  }

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((total, review) => total + review.rating, 0) /
          reviews.length
        ).toFixed(1)
      : "0.0";

  return (
    <div className="destination-sections">
      {/* TRAVEL GUIDE */}
      <section className="extra-section">
        <div className="extra-heading">
          <span className="extra-label">EXPLORE MORE</span>
          <h2>Travel Guide</h2>
          <p>
            Informasi yang bisa membantu kamu sebelum mengunjungi{" "}
            {destination.name}.
          </p>
        </div>

        <div className="guide-grid">
          <div className="guide-card">
            <span className="guide-icon">✦</span>
            <h3>Highlights</h3>
            <ul>
              {guide.highlights.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="guide-card">
            <span className="guide-icon">◈</span>
            <h3>Activities</h3>
            <ul>
              {guide.activities.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="guide-card">
            <span className="guide-icon">⌖</span>
            <h3>Access</h3>
            <p>{guide.access}</p>
          </div>

          <div className="guide-card">
            <span className="guide-icon">⌂</span>
            <h3>Facilities</h3>
            <p>{guide.facilities}</p>
          </div>
        </div>

        <div className="travel-tips">
          <h3>Before You Visit</h3>
          <ul>
            {guide.tips.map((tip, index) => (
              <li key={index}>
                <span>✓</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* NEARBY DESTINATIONS */}
      {nearbyDestinations.length > 0 && (
        <section className="extra-section">
          <div className="extra-heading">
            <span className="extra-label">KEEP EXPLORING</span>
            <h2>Nearby Destinations</h2>
            <p>
              Destinasi lain yang berada di wilayah yang sama.
            </p>
          </div>

          <div className="nearby-grid">
            {nearbyDestinations.map((item) => (
              <article className="nearby-card" key={item.id}>
                <img src={item.image} alt={item.name} />

                <div className="nearby-content">
                  <span>{item.category}</span>
                  <h3>{item.name}</h3>
                  <p>{item.location}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* PHOTO GALLERY */}
      <section className="extra-section">
        <div className="extra-heading">
          <span className="extra-label">DESTINATION VIEW</span>
          <h2>Photo Gallery</h2>
          <p>
            Gambaran visual dari destinasi yang sedang kamu jelajahi.
          </p>
        </div>

        <div className="destination-gallery">
          <img src={destination.image} alt={destination.name} />
        </div>
        <small className="gallery-note">
          Foto tambahan bisa ditambahkan melalui data destinasi.
        </small>
      </section>

      {/* REVIEWS */}
      <section className="extra-section">
        <div className="extra-heading">
          <span className="extra-label">COMMUNITY</span>
          <h2>Reviews & Ratings</h2>
          <p>
            Lihat pengalaman pengunjung dan bagikan pendapatmu.
          </p>
        </div>

        <div className="review-summary">
          <strong>{averageRating}</strong>
          <div>
            <div className="review-stars">★★★★★</div>
            <p>{reviews.length} ulasan</p>
          </div>
        </div>

        <div className="review-form">
          <h3>Write a Review</h3>

          <label htmlFor="review-rating">Your Rating</label>
          <select
            id="review-rating"
            value={rating}
            onChange={(event) => setRating(Number(event.target.value))}
          >
            <option value={5}>★★★★★ - Excellent</option>
            <option value={4}>★★★★ - Very Good</option>
            <option value={3}>★★★ - Good</option>
            <option value={2}>★★ - Fair</option>
            <option value={1}>★ - Poor</option>
          </select>

          <label htmlFor="review-comment">Your Review</label>
          <textarea
            id="review-comment"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="Ceritakan pengalaman atau pendapatmu..."
            rows={4}
          />

          {message && <p className="review-message">{message}</p>}

          <button
            type="button"
            onClick={submitReview}
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Review"}
          </button>
        </div>

        <div className="review-list">
          {reviews.length === 0 ? (
            <p className="empty-reviews">
              Belum ada ulasan. Jadilah yang pertama memberikan ulasan!
            </p>
          ) : (
            reviews.map((review) => (
              <article className="review-card" key={review.id}>
                <div className="review-card-top">
                  <strong>{review.user_name}</strong>
                  <span>{"★".repeat(review.rating)}</span>
                </div>

                <p>{review.comment}</p>

                <small>
                  {new Date(review.created_at).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </small>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
