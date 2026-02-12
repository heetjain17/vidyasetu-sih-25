import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Localization from "expo-localization";
import { resources, supportedLanguages } from "./resources";
import "./types";

const LANGUAGE_KEY = "@app:language";

// Language detector for React Native
const languageDetector = {
  type: "languageDetector" as const,
  async: true,
  detect: async (callback: (lang: string) => void) => {
    try {
      // 1. Try to get saved language preference
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
      if (savedLanguage) {
        console.log("Using saved language:", savedLanguage);
        callback(savedLanguage);
        return;
      }

      // 2. Try to use device language if supported
      const deviceLanguage = Localization.getLocales()[0]?.languageCode;
      console.log("Device language:", deviceLanguage);

      if (
        deviceLanguage &&
        supportedLanguages.includes(deviceLanguage as any)
      ) {
        callback(deviceLanguage);
      } else {
        // 3. Fallback to English
        callback("en");
      }
    } catch (error) {
      console.error("Language detection error:", error);
      callback("en");
    }
  },
  init: () => {},
  cacheUserLanguage: async (language: string) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_KEY, language);
      console.log("Language cached:", language);
    } catch (error) {
      console.error("Language cache error:", error);
    }
  },
};

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    // Resources
    resources,

    // Language settings
    fallbackLng: "en",
    supportedLngs: supportedLanguages,

    // Namespace settings
    defaultNS: "common",
    ns: ["common", "navigation", "auth", "career", "errors"],

    // Interpolation settings
    interpolation: {
      escapeValue: false, // React already escapes
    },

    // React options
    react: {
      useSuspense: false, // Important for React Native
    },

    // Debug (disable in production)
    debug: __DEV__,

    // Cache
    load: "languageOnly", // Load 'en' instead of 'en-US'
  });

export default i18n;
