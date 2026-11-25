import { useEffect, useMemo, useState, type ReactNode } from "react";
import { translations, type Language } from "../i18n/translations";
import { LanguageContext } from "./languageContext";

// Nilai disimpan dengan kunci & format yang sama seperti sebelumnya,
// jadi pilihan bahasa pengguna lama tetap terbaca.
const STORAGE_KEY = "exploreid-language";

function getInitialLanguage(): Language {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved === "English" || saved === "Indonesia") return saved;
  } catch {
    // localStorage tidak tersedia, pakai bahasa browser.
  }

  const browserLanguage =
    typeof navigator !== "undefined" ? navigator.language.toLowerCase() : "";

  return browserLanguage.startsWith("id") ? "Indonesia" : "English";
}

export default function LanguageProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [language, setLanguage] = useState<Language>(getInitialLanguage);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, language);
    } catch {
      // Abaikan jika penyimpanan gagal.
    }

    document.documentElement.lang = language === "Indonesia" ? "id" : "en";
  }, [language]);

  const value = useMemo(
    () => ({ language, setLanguage, t: translations[language] }),
    [language]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}
