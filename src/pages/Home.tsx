import { lazy, Suspense, useMemo, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { HeroPicture } from '../components/HeroPicture'

const HomeBelow = lazy(() =>
  import('./HomeBelow').then((m) => ({ default: m.HomeBelow })),
)

export function Home() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [hint, setHint] = useState('')
  const trust = useMemo(
    () => [t('home.trust1'), t('home.trust2'), t('home.trust3'), t('home.trust4')],
    [t],
  )

  const onDiagnose = (e: FormEvent) => {
    e.preventDefault()
    navigate('/cases', { state: { query: hint || t('home.defaultQuery') } })
  }

  return (
    <div>
      <section className="relative min-h-[92vh] overflow-hidden grain">
        <HeroPicture alt={t('home.heroAlt')} />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/25" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_40%,transparent_0%,rgba(21,32,43,0.35)_100%)]" />

        <div className="relative mx-auto flex min-h-[92vh] max-w-6xl flex-col justify-end px-4 pb-20 pt-28 sm:px-6 sm:pb-24">
          <p className="animate-fade-up font-display text-4xl text-chalk sm:text-6xl lg:text-7xl text-balance">
            {t('common.brand')}
          </p>
          <h1 className="animate-fade-up-delay mt-4 max-w-2xl font-display text-2xl leading-snug text-chalk/95 sm:text-3xl lg:text-4xl text-balance">
            {t('home.headline')}
          </h1>
          <p className="animate-fade-up-delay-2 mt-4 max-w-lg text-base text-chalk/70 sm:text-lg">
            {t('home.sub')}
          </p>

          <form
            onSubmit={onDiagnose}
            className="animate-fade-up-delay-2 mt-8 flex w-full max-w-xl flex-col gap-3 sm:flex-row"
          >
            <label className="sr-only" htmlFor="floorplan">
              {t('home.floorplanLabel')}
            </label>
            <input
              id="floorplan"
              value={hint}
              onChange={(e) => setHint(e.target.value)}
              placeholder={t('home.placeholder')}
              className="min-h-12 flex-1 rounded-lg border border-white/20 bg-white/10 px-4 text-chalk placeholder:text-chalk/45 outline-none backdrop-blur-sm focus:border-teal-bright"
            />
            <button
              type="submit"
              className="min-h-12 min-w-fit shrink-0 whitespace-nowrap rounded-lg bg-teal px-6 text-sm font-semibold text-white transition hover:bg-teal-bright sm:max-w-[16rem] sm:truncate"
            >
              {t('home.cta')}
            </button>
          </form>
        </div>
      </section>

      <section className="border-b border-mist/50 bg-paper/80">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-8 gap-y-3 px-4 py-5 sm:px-6">
          {trust.map((item) => (
            <span
              key={item}
              className="flex max-w-full min-w-0 items-center gap-2 text-sm text-ink-soft"
              title={item}
            >
              <span className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-teal animate-soft-pulse" />
              <span className="truncate">{item}</span>
            </span>
          ))}
        </div>
      </section>

      <Suspense
        fallback={
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6" aria-busy>
            <div className="h-8 w-48 animate-pulse rounded bg-mist/40" />
            <div className="mt-10 flex gap-5">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-[420px] w-[78vw] max-w-[320px] shrink-0 animate-pulse rounded-2xl bg-mist/30 sm:w-[300px]"
                />
              ))}
            </div>
          </div>
        }
      >
        <HomeBelow />
      </Suspense>
    </div>
  )
}
