import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Languages, Check, ChevronDown } from "lucide-react";
import {
  supportedLanguages,
  languageNames,
  changeLanguage,
  type SupportedLanguage,
} from "../i18n";

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const currentLang = (i18n.language || "en") as SupportedLanguage;

  const handleLanguageChange = async (lang: SupportedLanguage) => {
    if (lang !== currentLang) {
      await changeLanguage(lang);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors border border-white/20"
      >
        <Languages className="w-5 h-5" />
        <span className="hidden sm:inline">
          {languageNames[currentLang].native}
        </span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {t("language.select")}
              </h3>
            </div>

            <div className="p-2">
              {supportedLanguages.map((lang) => (
                <button
                  key={lang}
                  onClick={() => handleLanguageChange(lang)}
                  className={`w-full flex items-center justify-between px-3 py-3 rounded-lg transition-colors ${
                    currentLang === lang
                      ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                  }`}
                >
                  <div className="flex flex-col items-start">
                    <span className="font-medium text-lg">
                      {languageNames[lang].native}
                    </span>
                    <span className="text-sm opacity-70">
                      {languageNames[lang].english}
                    </span>
                  </div>

                  {currentLang === lang && (
                    <Check className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default LanguageSwitcher;
