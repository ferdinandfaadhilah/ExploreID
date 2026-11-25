import { useEffect, useState } from "react";

// State boolean yang otomatis tersimpan di localStorage.
export function usePersistedBoolean(key: string, defaultValue: boolean) {
  const [value, setValue] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(key);

      return saved === null ? defaultValue : saved === "true";
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, String(value));
    } catch {
      // Abaikan jika penyimpanan gagal.
    }
  }, [key, value]);

  return [value, setValue] as const;
}