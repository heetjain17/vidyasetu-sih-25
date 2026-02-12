import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  translateText,
  translateBatch,
  translateObject,
} from "@/services/lingoDevService";

interface UseTranslateResult {
  translate: (text: string) => Promise<string>;
  translateMultiple: (texts: string[]) => Promise<string[]>;
  translateObj: <T extends Record<string, unknown>>(obj: T) => Promise<T>;
  isTranslating: boolean;
  currentLanguage: string;
}

/**
 * Hook for translating dynamic content using lingo.dev
 *
 * This hook integrates with react-i18next to get the current language
 * and provides translation functions with caching.
 *
 * @example
 * ```tsx
 * const { translate, isTranslating, currentLanguage } = useTranslate();
 *
 * useEffect(() => {
 *   if (currentLanguage !== 'en') {
 *     translate(careerExplanation).then(setTranslatedExplanation);
 *   }
 * }, [currentLanguage, careerExplanation]);
 * ```
 */
export const useTranslate = (): UseTranslateResult => {
  const { i18n } = useTranslation();
  const [isTranslating, setIsTranslating] = useState(false);

  const currentLanguage = i18n.language || "en";

  const translate = useCallback(
    async (text: string): Promise<string> => {
      if (currentLanguage === "en" || !text.trim()) return text;

      setIsTranslating(true);
      try {
        return await translateText(text, currentLanguage);
      } finally {
        setIsTranslating(false);
      }
    },
    [currentLanguage]
  );

  const translateMultiple = useCallback(
    async (texts: string[]): Promise<string[]> => {
      if (currentLanguage === "en") return texts;

      setIsTranslating(true);
      try {
        return await translateBatch(texts, currentLanguage);
      } finally {
        setIsTranslating(false);
      }
    },
    [currentLanguage]
  );

  const translateObj = useCallback(
    async <T extends Record<string, unknown>>(obj: T): Promise<T> => {
      if (currentLanguage === "en") return obj;

      setIsTranslating(true);
      try {
        return await translateObject(obj, currentLanguage);
      } finally {
        setIsTranslating(false);
      }
    },
    [currentLanguage]
  );

  return {
    translate,
    translateMultiple,
    translateObj,
    isTranslating,
    currentLanguage,
  };
};

export default useTranslate;
