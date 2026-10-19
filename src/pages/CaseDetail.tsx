import { useTranslation } from 'react-i18next'
import { Link, Navigate, useParams } from 'react-router-dom'
import { api } from '../api/client'
import { BeforeAfter } from '../components/BeforeAfter'
import { StickyCta } from '../components/StickyCta'
import { useFetch } from '../hooks/useFetch'
import { labelOf } from '../i18n/labels'

export function CaseDetail() {
  const { t } = useTranslation()
  const { id } = useParams()
  const { data: item, loading, error } = useFetch(() => api.case(id!), [id])
  const { data: designer } = useFetch(
    () =>
      item
        ? api.designer(item.designerId)
        : Promise.resolve(null as Awaited<ReturnType<typeof api.designer>> | null),
    [item?.designerId],
  )

  if (!id) return <Navigate to="/cases" replace />
  if (loading) {
    return <p className="mx-auto max-w-6xl px-4 py-20 text-ink-soft/60">{t('caseDetail.loading')}</p>
  }
  if (error || !item) {
    return (
      <p className="mx-auto max-w-6xl px-4 py-20 text-warn">{error || t('caseDetail.notFound')}</p>
    )
  }

  const specs: [string, string][] = [
    [t('caseDetail.area'), `${item.area}㎡`],
    [t('caseDetail.layout'), labelOf(t, item.layout)],
    [t('caseDetail.style'), labelOf(t, item.style)],
    [t('caseDetail.budget'), t('caseDetail.budgetValue', { n: item.budget })],
    [t('caseDetail.duration'), t('caseDetail.durationValue', { n: item.duration })],
  ]

  return (
    <div className="pb-28">
      <div className="relative aspect-[16/9] max-h-[70vh] w-full overflow-hidden bg-ink">
        <img src={item.cover} alt={item.title} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-6xl px-4 pb-8 sm:px-6">
          <p className="text-sm text-chalk/70">
            {labelOf(t, item.style)} · {item.city}
          </p>
          <h1 className="mt-2 font-display text-3xl text-balance text-chalk sm:text-4xl">
            {item.title}
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          {specs.map(([k, v]) => (
            <div key={k} className="rounded-xl bg-paper/80 px-4 py-3 ring-1 ring-mist/50">
              <dt className="text-xs text-ink-soft/55">{k}</dt>
              <dd className="mt-1 truncate text-sm font-semibold text-ink" title={v}>
                {v}
              </dd>
            </div>
          ))}
        </dl>

        <p className="mt-8 max-w-2xl text-base leading-relaxed text-ink-soft">{item.summary}</p>

        {item.before && item.after && (
          <div className="mt-12">
            <h2 className="font-display text-2xl text-ink">{t('caseDetail.beforeAfter')}</h2>
            <p className="mt-2 text-sm text-ink-soft/65">{t('caseDetail.beforeAfterSub')}</p>
            <div className="mt-5">
              <BeforeAfter before={item.before} after={item.after} />
            </div>
          </div>
        )}

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {item.images.map((src) => (
            <img
              key={src}
              src={src}
              alt=""
              className="aspect-[4/3] w-full rounded-xl object-cover"
              loading="lazy"
            />
          ))}
        </div>

        {designer && (
          <Link
            to={`/designers/${designer.id}`}
            className="mt-12 flex items-center gap-4 rounded-2xl bg-paper/80 p-4 ring-1 ring-mist/50 transition hover:ring-teal/40"
          >
            <img
              src={designer.avatar}
              alt={designer.name}
              className="h-14 w-14 rounded-full object-cover"
            />
            <div className="min-w-0">
              <p className="font-medium text-ink">{designer.name}</p>
              <p className="truncate text-sm text-ink-soft/65">
                {t('caseDetail.designerMeta', {
                  city: designer.city,
                  years: designer.years,
                  rating: designer.rating,
                })}
              </p>
            </div>
          </Link>
        )}
      </div>

      <StickyCta
        primaryTo={`/designers/${item.designerId}?from=${item.id}`}
        primaryLabel={t('caseDetail.askDesigner')}
        secondaryTo={`/quote?case=${item.id}`}
        secondaryLabel={t('caseDetail.getQuote')}
      />
    </div>
  )
}
