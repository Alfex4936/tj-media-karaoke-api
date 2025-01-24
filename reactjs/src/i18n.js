// src/i18n.js
import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import translationDE from "./locales/de/translation.json";
import translationEN from "./locales/en/translation.json";
import translationES from "./locales/es/translation.json";
import translationFR from "./locales/fr/translation.json";
import translationJA from "./locales/ja/translation.json";
import translationKO from "./locales/ko/translation.json";
import translationRU from "./locales/ru/translation.json";
import translationZH from "./locales/zh/translation.json"; // Chinese (simplified)

const resources = {
  ko: {
    translation: translationKO,
  },
  en: {
    translation: translationEN,
  },
  ru: {
    translation: translationRU,
  },
  ja: {
    translation: translationJA,
  },
  es: {
    translation: translationES,
  },
  fr: {
    translation: translationFR,
  },
  zh: {
    translation: translationZH
  },
  de: {
    translation: translationDE
  }
};

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .use(LanguageDetector) // detect user language
  .init({
    resources,
    // lng: "ko",
    fallbackLng: "en", // fallback language
    debug: false, // set to false in production
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

export default i18n;
