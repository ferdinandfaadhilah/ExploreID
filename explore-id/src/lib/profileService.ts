
import type { User } from "@supabase/supabase-js";
import { supabase } from "./supabaseClient";

export type UserProfile = {
  id: string;
  display_name: string | null;
  username: string | null;
  bio: string | null;
  avatar_url: string | null;
  updated_at: string;
};

export type ProfileUpdate = {
  display_name: string;
  username: string | null;
  bio: string;
  avatar_url: string | null;
};

const BUCKET_NAME = "avatars";

// Mengambil profil pengguna
export async function getUserProfile(user: User) {
  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error) throw error;

  if (data) {
    return data as UserProfile;
  }

  // Membuat profil awal jika belum tersedia
  const defaultName =
    user.user_metadata?.full_name ||
    user.email?.split("@")[0] ||
    "ExploreID User";

  const { data: newProfile, error: insertError } = await supabase
    .from("user_profiles")
    .upsert({
      id: user.id,
      display_name: defaultName,
      username: null,
      bio: "",
      avatar_url: null,
    })
    .select()
    .single();

  if (insertError) throw insertError;

  return newProfile as UserProfile;
}

// Menyimpan perubahan informasi profil
export async function updateUserProfile(
  userId: string,
  profile: ProfileUpdate
) {
  const { data, error } = await supabase
    .from("user_profiles")
    .upsert({
      id: userId,
      ...profile,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;

  return data as UserProfile;
}

// Upload foto profil
export async function uploadAvatar(
  userId: string,
  file: File
) {
  if (!file.type.startsWith("image/")) {
    throw new Error("File harus berupa gambar.");
  }

  if (file.size > 3 * 1024 * 1024) {
    throw new Error("Ukuran foto maksimal 3 MB.");
  }

  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const filePath = `${userId}/${crypto.randomUUID()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);

  return data.publicUrl;
}

// Menyimpan URL foto profil
export async function saveAvatarUrl(
  userId: string,
  avatarUrl: string
) {
  const { data, error } = await supabase
    .from("user_profiles")
    .upsert({
      id: userId,
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;

  return data as UserProfile;
}
