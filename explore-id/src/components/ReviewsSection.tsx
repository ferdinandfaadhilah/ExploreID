import { useLanguage } from "../hooks/useLanguage";
import { useReviews } from "../hooks/useReviews";
import type { AppUser } from "../types";

type ReviewsSectionProps = {
  destinationId: number;
  user: AppUser | null | undefined;
  onRequireLogin: () => void;
};

export default function ReviewsSection({
  destinationId,
  user,
  onRequireLogin,
}: ReviewsSectionProps) {
  const { t } = useLanguage();
  const r = t.reviews;

  const {
    reviews,
    averageRating,
    rating,
    setRating,
    comment,
    setComment,
    loading,
    error,
    success,
    submit,
    remove,
  } = useReviews(destinationId, user);

  const roundedAverage = Math.round(averageRating);

  return (
    <section className="reviews-section">
      <div className="section-top">
        <div>
          <span className="eyebrow">{r.eyebrow}</span>
          <h2>{r.title}</h2>
          <p>{r.desc}</p>
        </div>
      </div>

      <div className="review-summary">
        <strong>{reviews.length > 0 ? averageRating.toFixed(1) : "—"}</strong>

        <span className="review-stars">
          {"★".repeat(roundedAverage)}
          {"☆".repeat(5 - roundedAverage)}
        </span>

        <small>
          {reviews.length} {reviews.length === 1 ? r.countOne : r.countMany}
        </small>
      </div>

      <div className="review-form">
        <h3>{r.shareTitle}</h3>

        {user ? (
          <>
            <label htmlFor="review-rating">{r.yourRating}</label>

            <div className="rating-picker" id="review-rating">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  className={value <= rating ? "rating-active" : ""}
                  onClick={() => setRating(value)}
                  aria-label={r.starsAria(value)}
                >
                  ★
                </button>
              ))}
            </div>

            <textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder={r.placeholder}
              rows={4}
              maxLength={1000}
            />

            <button
              className="primary-button"
              onClick={submit}
              disabled={loading}
            >
              {loading ? r.submitting : r.submit}
            </button>

            <small className="review-hint">{r.hint}</small>
          </>
        ) : (
          <p>
            {r.loginPrefix}{" "}
            <button className="inline-link" onClick={onRequireLogin}>
              {r.loginLink}
            </button>{" "}
            {r.loginSuffix}
          </p>
        )}

        {error && <p className="review-error">{r.errors[error]}</p>}

        {success && <p className="review-success">{r.success[success]}</p>}
      </div>

      <div className="review-list">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <article className="review-card" key={review.id}>
              <div className="review-card-top">
                <div>
                  <strong>
                    {review.user_id === user?.id
                      ? r.you
                      : review.user_name || r.explorer}
                  </strong>

                  <span className="review-stars">
                    {"★".repeat(review.rating)}
                    {"☆".repeat(5 - review.rating)}
                  </span>
                </div>

                <small>
                  {new Date(review.created_at).toLocaleDateString(t.locale, {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </small>
              </div>

              <p>{review.comment}</p>

              {user?.id === review.user_id && (
                <button
                  className="review-delete"
                  onClick={() => remove(review.id)}
                >
                  {r.delete}
                </button>
              )}
            </article>
          ))
        ) : (
          <div className="empty-review">{r.empty}</div>
        )}
      </div>
    </section>
  );
}
