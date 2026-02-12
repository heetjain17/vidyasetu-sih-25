import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "./locales/en";
import hi from "./locales/hi";
import ks from "./locales/ks";
import doi from "./locales/doi";

export const supportedLanguages = ["en", "hi", "ks", "doi"] as const;
export type SupportedLanguage = (typeof supportedLanguages)[number];

export const languageNames: Record<
  SupportedLanguage,
  { native: string; english: string }
> = {
  en: { native: "English", english: "English" },
  hi: { native: "हिंदी", english: "Hindi" },
  ks: { native: "کٲشُر", english: "Kashmiri" },
  doi: { native: "डोगरी", english: "Dogri" },
};

const resources = {
  en: { translation: en },
  hi: { translation: hi },
  ks: { translation: ks },
  doi: { translation: doi },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    supportedLngs: supportedLanguages,

    interpolation: {
      escapeValue: false, // React already escapes
    },

    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "i18nextLng",
    },

    debug: import.meta.env.DEV,
  });

export default i18n;

// Helper function to change language
export const changeLanguage = async (lang: SupportedLanguage) => {
  await i18n.changeLanguage(lang);
  localStorage.setItem("i18nextLng", lang);
};

// Get current language
export const getCurrentLanguage = (): SupportedLanguage => {
  return (i18n.language || "en") as SupportedLanguage;
};
