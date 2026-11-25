import { useContext } from "react";
import { LanguageContext } from "../context/languageContext";

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage harus dipakai di dalam <LanguageProvider>.");
  }

  return context;
}