import { useTranslation } from 'react-i18next'
import { LANGUAGES, normalizeLang, type AppLang } from '../i18n/languages'

type Props = {
  /** home hero header uses chalk text */
  variant?: 'light' | 'dark' | 'antd'
}

export function LanguageSwitcher({ variant = 'dark' }: Props) {
  const { i18n, t } = useTranslation()
  const value = normalizeLang(i18n.language)

  const base =
    variant === 'light'
      ? 'border-white/25 bg-white/10 text-chalk'
      : variant === 'antd'
        ? 'border-[#d9d9d9] bg-white text-[#15202b] text-sm'
        : 'border-mist/60 bg-white/80 text-ink'

  return (
    <label className="inline-flex max-w-full min-w-0 items-center gap-1.5">
      <span className="sr-only">{t('common.language')}</span>
      <span className="shrink-0 select-none text-base leading-none" aria-hidden>
        🌐
      </span>
      <select
        aria-label={t('common.language')}
        className={`min-h-9 min-w-fit max-w-[11rem] truncate rounded-md border px-2 py-1 outline-none focus:border-teal ${base}`}
        value={value}
        onChange={(e) => {
          void i18n.changeLanguage(e.target.value as AppLang)
        }}
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.nativeLabel}
          </option>
        ))}
      </select>
    </label>
  )
}
