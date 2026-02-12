import { create } from "zustand";
import i18n from "../i18n";
import { SupportedLanguage } from "../i18n/resources";

interface LanguageState {
  currentLanguage: SupportedLanguage;
  isChanging: boolean;
  changeLanguage: (language: SupportedLanguage) => Promise<void>;
  getCurrentLanguage: () => SupportedLanguage;
}

export const useLanguageStore = create<LanguageState>((set, get) => ({
  currentLanguage: "en",
  isChanging: false,

  changeLanguage: async (language: SupportedLanguage) => {
    set({ isChanging: true });

    try {
      await i18n.changeLanguage(language);
      set({ currentLanguage: language, isChanging: false });
    } catch (error) {
      console.error("Failed to change language:", error);
      set({ isChanging: false });
    }
  },

  getCurrentLanguage: () => {
    return i18n.language as SupportedLanguage;
  },
}));

// Sync with i18n events
i18n.on("initialized", () => {
  useLanguageStore.setState({
    currentLanguage: i18n.language as SupportedLanguage,
  });
});

i18n.on("languageChanged", (lng) => {
  useLanguageStore.setState({
    currentLanguage: lng as SupportedLanguage,
  });
});
