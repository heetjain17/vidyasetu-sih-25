// English
import enCommon from "./locales/en/common";
import enNavigation from "./locales/en/navigation";
import enAuth from "./locales/en/auth";
import enCareer from "./locales/en/career";
import enErrors from "./locales/en/errors";

// Hindi
import hiCommon from "./locales/hi/common";
import hiNavigation from "./locales/hi/navigation";
import hiAuth from "./locales/hi/auth";
import hiCareer from "./locales/hi/career";
import hiErrors from "./locales/hi/errors";

// Kashmiri
import ksCommon from "./locales/ks/common";
import ksNavigation from "./locales/ks/navigation";
import ksAuth from "./locales/ks/auth";
import ksCareer from "./locales/ks/career";
import ksErrors from "./locales/ks/errors";

// Dogri
import doiCommon from "./locales/doi/common";
import doiNavigation from "./locales/doi/navigation";
import doiAuth from "./locales/doi/auth";
import doiCareer from "./locales/doi/career";
import doiErrors from "./locales/doi/errors";

export const resources = {
  en: {
    common: enCommon,
    navigation: enNavigation,
    auth: enAuth,
    career: enCareer,
    errors: enErrors,
  },
  hi: {
    common: hiCommon,
    navigation: hiNavigation,
    auth: hiAuth,
    career: hiCareer,
    errors: hiErrors,
  },
  ks: {
    common: ksCommon,
    navigation: ksNavigation,
    auth: ksAuth,
    career: ksCareer,
    errors: ksErrors,
  },
  doi: {
    common: doiCommon,
    navigation: doiNavigation,
    auth: doiAuth,
    career: doiCareer,
    errors: doiErrors,
  },
} as const;

export const namespaces = [
  "common",
  "navigation",
  "auth",
  "career",
  "errors",
] as const;

export const supportedLanguages = ["en", "hi", "ks", "doi"] as const;

export const languageNames: Record<string, string> = {
  en: "English",
  hi: "हिंदी",
  ks: "کٲشُر",
  doi: "डोगरी",
};

export type SupportedLanguage = (typeof supportedLanguages)[number];
export type Namespace = (typeof namespaces)[number];
