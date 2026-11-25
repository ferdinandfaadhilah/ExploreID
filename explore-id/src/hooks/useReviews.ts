import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { getUserDisplayName, type AppUser } from "../types";

export type Review = {
  id: string;
  user_id: string;
  destination_id: number;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
};

export type ReviewError = "load" | "empty" | "submit" | "delete";
export type ReviewSuccess = "saved" | "deleted";

// Memuat, mengirim, dan menghapus review untuk satu destinasi.
// Pesan dikembalikan sebagai kunci agar teksnya bisa diterjemahkan di UI.
export function useReviews(
  destinationId: number,
  user: AppUser | null | undefined
) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ReviewError | null>(null);
  const [success, setSuccess] = useState<ReviewSuccess | null>(null);

  useEffect(() => {
    let active = true;

    async function loadReviews() {
      setReviews([]);
      setError(null);
      setSuccess(null);
      setComment("");
      setRating(5);

      const { data, error: loadError } = await supabase
        .from("destination_reviews")
        .select("*")
        .eq("destination_id", destinationId)
        .order("created_at", { ascending: false });

      if (!active) return;

      if (loadError) {
        setError("load");
        console.error("Review:", loadError.message);
        return;
      }

      setReviews((data || []) as Review[]);
    }

    loadReviews();

    return () => {
      active = false;
    };
  }, [destinationId]);

  const submit = useCallback(async () => {
    if (!user) return;

    if (!comment.trim()) {
      setError("empty");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    const { data, error: submitError } = await supabase
      .from("destination_reviews")
      .upsert(
        {
          user_id: user.id,
          user_name: getUserDisplayName(user) || "Explorer",
          destination_id: destinationId,
          rating,
          comment: comment.trim(),
        },
        { onConflict: "destination_id,user_id" }
      )
      .select()
      .single();

    setLoading(false);

    if (submitError) {
      setError("submit");
      console.error("Review error:", submitError.message);
      return;
    }

    setReviews((current) => [
      data as Review,
      ...current.filter((review) => review.user_id !== user.id),
    ]);

    setComment("");
    setRating(5);
    setSuccess("saved");
  }, [user, comment, rating, destinationId]);

  const remove = useCallback(
    async (reviewId: string) => {
      if (!user) return;

      const { error: deleteError } = await supabase
        .from("destination_reviews")
        .delete()
        .eq("id", reviewId)
        .eq("user_id", user.id);

      if (deleteError) {
        setError("delete");
        console.error(deleteError.message);
        return;
      }

      setReviews((current) =>
        current.filter((review) => review.id !== reviewId)
      );
      setError(null);
      setSuccess("deleted");
    },
    [user]
  );

  const averageRating = useMemo(
    () =>
      reviews.length > 0
        ? reviews.reduce((total, review) => total + review.rating, 0) /
          reviews.length
        : 0,
    [reviews]
  );

  return {
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
  };
}