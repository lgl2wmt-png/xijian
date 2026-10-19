import { useTranslation } from 'react-i18next'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { api } from '../api/client'
import { useFetch } from '../hooks/useFetch'
import { labelOf } from '../i18n/labels'

export function Cases() {
  const { t } = useTranslation()
  const [params] = useSearchParams()
  const style = params.get('style') || undefined
  const location = useLocation()
  const query = (location.state as { query?: string } | null)?.query
  const { data: filtered, loading, error } = useFetch(() => api.cases(style), [style])

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <header className="max-w-2xl">
        <h1 className="font-display text-3xl text-ink sm:text-4xl">{t('cases.title')}</h1>
        <p className="mt-3 text-ink-soft/75">{t('cases.sub')}</p>
        {(style || query) && (
          <p className="mt-4 text-sm text-teal">
            {style ? t('cases.styleFilter', { style: labelOf(t, style) }) : null}
            {query ? t('cases.intent', { query }) : null}
          </p>
        )}
      </header>

      {loading && <p className="mt-10 text-ink-soft/60">{t('cases.loading')}</p>}
      {error && (
        <p className="mt-10 text-warn">{t('cases.loadError', { error })}</p>
      )}

      <div className="mt-10 columns-1 gap-6 sm:columns-2">
        {(filtered || []).map((c) => (
          <Link
            key={c.id}
            to={`/cases/${c.id}`}
            className="mb-6 block break-inside-avoid overflow-hidden rounded-2xl bg-paper/70 ring-1 ring-mist/60 transition hover:ring-teal/40"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-chalk-deep">
              <img src={c.cover} alt={c.title} className="h-full w-full object-cover" loading="lazy" />
            </div>
            <div className="p-5">
              <p className="text-xs tracking-wide text-teal">{labelOf(t, c.style)}</p>
              <h2 className="mt-1 font-display text-xl leading-snug text-ink">{c.title}</h2>
              <p className="mt-3 text-sm text-ink-soft/70">
                {c.area}㎡ · {labelOf(t, c.layout)} · {c.city}
              </p>
              <p className="mt-1 text-sm font-medium text-ink">
                {t('cases.meta', { budget: c.budget, days: c.duration })}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {!loading && filtered?.length === 0 && (
        <p className="mt-12 text-ink-soft/60">{t('cases.empty')}</p>
      )}
    </div>
  )
}
