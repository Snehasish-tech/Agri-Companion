import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import { enCommon } from "@/locales/en/common";
import { hiCommon } from "@/locales/hi/common";
import { bnCommon } from "@/locales/bn/common";

const resources = {
  en: { common: enCommon },
  hi: { common: hiCommon },
  bn: { common: bnCommon },
} as const;

if (!i18n.isInitialized) {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      fallbackLng: "en",
      supportedLngs: ["en", "hi", "bn"],
      defaultNS: "common",
      ns: ["common"],
      interpolation: {
        escapeValue: false,
      },
      detection: {
        order: ["localStorage", "navigator"],
        caches: ["localStorage"],
      },
      debug: import.meta.env.DEV,
    });
}

if (typeof document !== "undefined") {
  const getBaseLanguage = (lng?: string) => lng?.split("-")[0] || "en";
  document.documentElement.lang = getBaseLanguage(i18n.resolvedLanguage);
  i18n.on("languageChanged", (lng) => {
    document.documentElement.lang = getBaseLanguage(lng);
  });
}

export default i18n;
