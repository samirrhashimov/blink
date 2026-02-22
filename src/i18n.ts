import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import translationEN from './locales/en/translation.json';
import translationTR from './locales/tr/translation.json';

const resources = {
    en: {
        translation: translationEN,
    },
    tr: {
        translation: translationTR,
    },
};

// Read explicitly saved language to override any tricky browser detection
const savedLanguage = localStorage.getItem('blink-language');

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        lng: savedLanguage || undefined, // Explicit override if a preference exists
        fallbackLng: 'en',
        supportedLngs: ['en', 'tr'], // Define allowed languages explicitly
        interpolation: {
            escapeValue: false,
        },
        detection: {
            // Prioritize localStorage and navigator
            order: ['localStorage', 'cookie', 'navigator', 'htmlTag', 'path', 'subdomain'],
            caches: ['localStorage', 'cookie'],
        },
    });

// Make absolutely sure our preference is saved on every manual change
i18n.on('languageChanged', (lng) => {
    localStorage.setItem('blink-language', lng);
});

export default i18n;
