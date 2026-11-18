import { supabase } from "./supabaseClient";

export type UserPreferences = {
  favorites: number[];
  recently_viewed: number[];
};

// Mengambil data preferences dari Supabase
export async function getUserPreferences(userId: string) {
  const { data, error } = await supabase
    .from("user_preferences")
    .select("favorites, recently_viewed")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return {
    favorites: data?.favorites ?? [],
    recently_viewed: data?.recently_viewed ?? [],
  } as UserPreferences;
}

// Menyimpan data preferences ke Supabase
export async function saveUserPreferences(
  userId: string,
  preferences: UserPreferences
) {
  const { error } = await supabase
    .from("user_preferences")
    .upsert(
      {
        user_id: userId,
        favorites: preferences.favorites,
        recently_viewed: preferences.recently_viewed,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id",
      }
    );

  if (error) {
    throw error;
  }
}