import { useEffect, useState } from "react";

export type AppearanceTheme = "light" | "dark" | "system";

const STORAGE_KEY = "exploreid-appearance";

function getSavedTheme(): AppearanceTheme {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved === "light" || saved === "dark" || saved === "system") {
      return saved;
    }
  } catch {
    // Pakai default.
  }

  return "light";
}

// Menyimpan pilihan tema dan menerapkannya ke <html data-theme="...">.
export function useAppearance() {
  const [theme, setTheme] = useState<AppearanceTheme>(getSavedTheme);

  useEffect(() => {
    const root = document.documentElement;
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");

    const applyTheme = () => {
      const selectedTheme =
        theme === "system" ? (systemTheme.matches ? "dark" : "light") : theme;

      root.setAttribute("data-theme", selectedTheme);
      root.style.colorScheme = selectedTheme;
    };

    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Abaikan jika penyimpanan gagal.
    }

    applyTheme();

    if (theme === "system") {
      systemTheme.addEventListener("change", applyTheme);

      return () => systemTheme.removeEventListener("change", applyTheme);
    }

    return undefined;
  }, [theme]);

  return [theme, setTheme] as const;
}