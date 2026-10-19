import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import { useFetch } from '../hooks/useFetch'

/** Below-the-fold home sections — lazy-loaded so they stay out of the critical path. */
export function HomeBelow() {
  const { t } = useTranslation()
  const { data: styles, loading } = useFetch(() => api.styles(), [])

  return (
    <>
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="max-w-xl">
          <h2 className="font-display text-3xl text-ink sm:text-4xl">{t('homeBelow.stylesTitle')}</h2>
          <p className="mt-3 text-ink-soft/75">{t('homeBelow.stylesSub')}</p>
        </div>

        <div className="mt-10 flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory">
          {loading && (
            <div className="flex gap-5" aria-busy aria-label={t('homeBelow.loadingStyles')}>
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-[420px] w-[78vw] max-w-[320px] shrink-0 animate-pulse rounded-2xl bg-mist/40 sm:w-[300px]"
                />
              ))}
            </div>
          )}
          {(styles || []).map((s) => (
            <Link
              key={s.name}
              to={`/cases?style=${encodeURIComponent(s.name)}`}
              className="group relative h-[420px] w-[78vw] max-w-[320px] shrink-0 snap-start overflow-hidden rounded-2xl bg-mist/30 sm:w-[300px]"
            >
              <img
                src={s.image}
                alt={s.name}
                className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/25 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 text-chalk">
                <p className="font-display text-2xl">{s.name}</p>
                <p className="mt-1 text-sm text-chalk/70">{s.blurb}</p>
                <p className="mt-4 text-xs tracking-wide text-chalk/55">
                  {s.area} · {s.budget} · {s.city}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-t border-mist/50 bg-ink text-chalk">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div>
            <h2 className="font-display text-3xl sm:text-4xl">{t('homeBelow.ctaTitle')}</h2>
            <p className="mt-4 max-w-md text-chalk/65">{t('homeBelow.ctaSub')}</p>
          </div>
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row lg:flex-col">
            <Link
              to="/galaxy"
              className="min-h-12 min-w-fit truncate rounded-lg bg-teal px-5 py-3 text-center text-sm font-semibold text-white hover:bg-teal-bright"
              title={t('homeBelow.openGalaxy')}
            >
              {t('homeBelow.openGalaxy')}
            </Link>
            <Link
              to="/cases/c1"
              className="min-h-12 min-w-fit truncate rounded-lg border border-chalk/25 px-5 py-3 text-center text-sm font-medium text-chalk hover:bg-white/5"
              title={t('homeBelow.sameCase')}
            >
              {t('homeBelow.sameCase')}
            </Link>
            <Link
              to="/designers"
              className="min-h-12 min-w-fit truncate rounded-lg border border-chalk/25 px-5 py-3 text-center text-sm font-medium text-chalk hover:bg-white/5"
              title={t('homeBelow.findDesigner')}
            >
              {t('homeBelow.findDesigner')}
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
