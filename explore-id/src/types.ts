// Bentuk minimal data user yang dipakai komponen UI.
// Supabase `User` kompatibel dengan tipe ini.
export type AppUser = {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown>;
};

export function getUserDisplayName(user: AppUser | null | undefined) {
  const fullName = user?.user_metadata?.full_name;

  if (typeof fullName === "string" && fullName.trim()) return fullName;

  return user?.email?.split("@")[0] || "";
}