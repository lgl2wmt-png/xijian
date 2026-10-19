import type { Locale } from 'antd/es/locale'
import arEG from 'antd/locale/ar_EG'
import deDE from 'antd/locale/de_DE'
import enUS from 'antd/locale/en_US'
import esES from 'antd/locale/es_ES'
import frFR from 'antd/locale/fr_FR'
import jaJP from 'antd/locale/ja_JP'
import koKR from 'antd/locale/ko_KR'
import ptBR from 'antd/locale/pt_BR'
import ruRU from 'antd/locale/ru_RU'
import zhCN from 'antd/locale/zh_CN'

export type AppLang =
  | 'zh'
  | 'en'
  | 'fr'
  | 'ru'
  | 'es'
  | 'ar'
  | 'ja'
  | 'ko'
  | 'de'
  | 'pt'

export type LangMeta = {
  code: AppLang
  /** Native endonym shown in the switcher */
  nativeLabel: string
  dir: 'ltr' | 'rtl'
  htmlLang: string
  antd: Locale
}

export const LANGUAGES: LangMeta[] = [
  { code: 'zh', nativeLabel: '中文', dir: 'ltr', htmlLang: 'zh-CN', antd: zhCN },
  { code: 'en', nativeLabel: 'English', dir: 'ltr', htmlLang: 'en', antd: enUS },
  { code: 'fr', nativeLabel: 'Français', dir: 'ltr', htmlLang: 'fr', antd: frFR },
  { code: 'ru', nativeLabel: 'Русский', dir: 'ltr', htmlLang: 'ru', antd: ruRU },
  { code: 'es', nativeLabel: 'Español', dir: 'ltr', htmlLang: 'es', antd: esES },
  { code: 'ar', nativeLabel: 'العربية', dir: 'rtl', htmlLang: 'ar', antd: arEG },
  { code: 'ja', nativeLabel: '日本語', dir: 'ltr', htmlLang: 'ja', antd: jaJP },
  { code: 'ko', nativeLabel: '한국어', dir: 'ltr', htmlLang: 'ko', antd: koKR },
  { code: 'de', nativeLabel: 'Deutsch', dir: 'ltr', htmlLang: 'de', antd: deDE },
  { code: 'pt', nativeLabel: 'Português', dir: 'ltr', htmlLang: 'pt', antd: ptBR },
]

export const SUPPORTED_LANGS = LANGUAGES.map((l) => l.code)

export const DEFAULT_LANG: AppLang = 'zh'

const byCode = Object.fromEntries(LANGUAGES.map((l) => [l.code, l])) as Record<
  AppLang,
  LangMeta
>

/** Map browser / legacy codes (zh-CN, en-US, …) to our short AppLang. */
export function normalizeLang(raw: string | undefined | null): AppLang {
  if (!raw) return DEFAULT_LANG
  const base = raw.toLowerCase().replace('_', '-')
  if (base === 'zh-cn' || base.startsWith('zh')) return 'zh'
  if (base === 'en-us' || base === 'en-gb' || base.startsWith('en')) return 'en'
  if (base.startsWith('fr')) return 'fr'
  if (base.startsWith('ru')) return 'ru'
  if (base.startsWith('es')) return 'es'
  if (base.startsWith('ar')) return 'ar'
  if (base.startsWith('ja')) return 'ja'
  if (base.startsWith('ko')) return 'ko'
  if (base.startsWith('de')) return 'de'
  if (base.startsWith('pt')) return 'pt'
  const short = base.split('-')[0] as AppLang
  return SUPPORTED_LANGS.includes(short) ? short : DEFAULT_LANG
}

export function getLangMeta(code: string | undefined | null): LangMeta {
  return byCode[normalizeLang(code)]
}

export function applyDocumentLang(code: string) {
  const meta = getLangMeta(code)
  document.documentElement.lang = meta.htmlLang
  document.documentElement.dir = meta.dir
}
