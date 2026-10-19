import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import ar from './locales/ar.json'
import de from './locales/de.json'
import en from './locales/en.json'
import es from './locales/es.json'
import fr from './locales/fr.json'
import ja from './locales/ja.json'
import ko from './locales/ko.json'
import pt from './locales/pt.json'
import ru from './locales/ru.json'
import zh from './locales/zh.json'
import {
  applyDocumentLang,
  DEFAULT_LANG,
  normalizeLang,
  SUPPORTED_LANGS,
} from './i18n/languages'

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      zh: { translation: zh },
      en: { translation: en },
      fr: { translation: fr },
      ru: { translation: ru },
      es: { translation: es },
      ar: { translation: ar },
      ja: { translation: ja },
      ko: { translation: ko },
      de: { translation: de },
      pt: { translation: pt },
    },
    fallbackLng: DEFAULT_LANG,
    supportedLngs: [...SUPPORTED_LANGS],
    // Do NOT set nonExplicitSupportedLngs — breaks nested keys in i18next v26
    ignoreJSONStructure: false,
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: 'xijian_lang',
      caches: ['localStorage'],
      convertDetectedLanguage: (lng) => normalizeLang(lng),
    },
  })

const syncDocument = (lng?: string) => {
  applyDocumentLang(normalizeLang(lng ?? i18n.language))
}

i18n.on('initialized', () => syncDocument())
i18n.on('languageChanged', (lng) => syncDocument(lng))
if (i18n.isInitialized) syncDocument()

export default i18n
