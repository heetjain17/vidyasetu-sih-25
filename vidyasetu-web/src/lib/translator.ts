/**
 * Translator utility for offline multilingual support
 * Pure ID-based translations for recommendation explanations
 */

import translationBank from "../assets/translation_bank.json";

// Type for translation entry
interface TranslationEntry {
  id: string;
  master_en?: string;
  en?: string;
  hi?: string;
  ks?: string;
  doi?: string;
  goj?: string;
  [key: string]: string | undefined;
}

interface TranslationBank {
  languages: string[];
  entries: TranslationEntry[];
}

const bank = translationBank as TranslationBank;

/**
 * Translate a text ID to the specified language
 * Falls back to English if translation not found
 *
 * @param id - Translation ID (e.g., "career_top_trait", "college_locality_1")
 * @param lang - Target language code: "en" | "hi" | "ks" | "doi" | "goj"
 * @returns Translated string or empty string if not found
 */
export function translate(id: string, lang: string = "en"): string {
  if (!id) return "";

  const entry = bank.entries.find((x) => x.id === id);
  if (!entry) {
    console.warn(`[translator] Missing entry for id=${id}`);
    return "";
  }

  // Try target language first
  if (entry[lang] && entry[lang]!.trim().length > 0) {
    return entry[lang]!;
  }

  // Fallback to master English
  if (entry.master_en) return entry.master_en;

  // Final fallback to 'en' key
  if (entry.en) return entry.en;

  return "";
}

/**
 * Translate with placeholder replacement
 *
 * @param id - Translation ID
 * @param lang - Target language code
 * @param placeholders - Object with placeholder values to replace
 * @returns Translated string with placeholders replaced
 */
export function translateWithPlaceholders(
  id: string,
  lang: string = "en",
  placeholders: Record<string, string | number | undefined> = {}
): string {
  let text = translate(id, lang);

  // Replace placeholders like {TRAIT}, {HOSTEL}, etc.
  for (const [key, value] of Object.entries(placeholders)) {
    if (value !== undefined) {
      text = text.replace(`{${key}}`, String(value));
    }
  }

  return text;
}

/**
 * Get all available translation IDs
 */
export function getAllTranslationIds(): string[] {
  return bank.entries.map((e) => e.id);
}

/**
 * Get supported languages
 */
export function getSupportedLanguages(): string[] {
  return ["en", ...bank.languages];
}

/**
 * Check if a translation exists
 */
export function hasTranslation(id: string, lang: string = "en"): boolean {
  const entry = bank.entries.find((x) => x.id === id);
  if (!entry) return false;
  return Boolean(entry[lang] || entry.master_en || entry.en);
}

export default {
  translate,
  translateWithPlaceholders,
  getAllTranslationIds,
  getSupportedLanguages,
  hasTranslation,
};
