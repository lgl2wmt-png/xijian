import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { api } from '../api/client'
import { StickyCta } from '../components/StickyCta'
import { useFetch } from '../hooks/useFetch'
import { labelOf } from '../i18n/labels'

export function DesignerDetail() {
  const { t } = useTranslation()
  const { id } = useParams()
  const [params] = useSearchParams()
  const { data: designer, loading, error } = useFetch(() => api.designer(id!), [id])
  const { data: works } = useFetch(
    () =>
      designer
        ? Promise.all(designer.works.map((wid) => api.case(wid))).catch(() => [])
        : Promise.resolve([]),
    [designer?.id],
  )
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', city: t('designerDetail.defaultCity') })
  const [submitError, setSubmitError] = useState<string | null>(null)
  const fromCase = params.get('from')

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!designer) return
    setSubmitError(null)
    try {
      await api.createBooking({
        designerId: designer.id,
        name: form.name,
        phone: form.phone,
        city: form.city,
        fromCase: fromCase || undefined,
      })
      setSent(true)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : t('designerDetail.submitFail'))
    }
  }

  if (loading) {
    return (
      <p className="mx-auto max-w-6xl px-4 py-20 text-ink-soft/60">{t('designerDetail.loading')}</p>
    )
  }
  if (error || !designer) {
    return (
      <p className="mx-auto max-w-6xl px-4 py-20 text-warn">
        {error || t('designerDetail.notFound')}
      </p>
    )
  }

  const designerReviews = designer.reviews || []

  return (
    <div className="pb-28">
      <div className="border-b border-mist/50 bg-paper/70">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-12 sm:flex-row sm:items-end sm:px-6">
          <img
            src={designer.avatar}
            alt={designer.name}
            className="h-28 w-28 rounded-full object-cover ring-4 ring-chalk"
          />
          <div className="min-w-0">
            <h1 className="font-display text-3xl text-ink sm:text-4xl">{designer.name}</h1>
            <p className="mt-2 text-ink-soft/70">
              {t('designerDetail.meta', {
                city: designer.city,
                years: designer.years,
                rating: designer.rating,
                reviews: designer.reviewCount,
              })}
            </p>
            <p className="mt-4 max-w-xl text-base text-ink-soft">{designer.bio}</p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <h2 className="font-display text-2xl text-ink">{t('designerDetail.works')}</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {(works || []).map((w) => (
            <Link
              key={w.id}
              to={`/cases/${w.id}`}
              className="overflow-hidden rounded-2xl bg-paper/80 ring-1 ring-mist/60"
            >
              <img src={w.cover} alt={w.title} className="aspect-[16/10] w-full object-cover" />
              <div className="p-4">
                <p className="font-medium text-ink">{w.title}</p>
                <p className="mt-1 text-sm text-ink-soft/65">
                  {t('designerDetail.workMeta', {
                    area: w.area,
                    budget: w.budget,
                    style: labelOf(t, w.style),
                  })}
                </p>
              </div>
            </Link>
          ))}
        </div>

        <h2 className="mt-14 font-display text-2xl text-ink">{t('designerDetail.reviews')}</h2>
        <p className="mt-2 text-sm text-ink-soft/60">{t('designerDetail.reviewsSub')}</p>
        <ul className="mt-6 space-y-4">
          {designerReviews.map((r) => (
            <li key={r.id} className="rounded-2xl bg-paper/80 p-5 ring-1 ring-mist/50">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium text-ink">{r.author}</p>
                <p className="text-sm text-sand">
                  {'★'.repeat(r.score)}
                  <span className="text-idle">{'★'.repeat(5 - r.score)}</span>
                  <span className="ms-2 text-ink-soft/45">{r.date}</span>
                </p>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">{r.text}</p>
              {r.photos && <p className="mt-2 text-xs text-teal">{t('designerDetail.hasPhotos')}</p>}
            </li>
          ))}
        </ul>

        <section id="book" className="mt-14 scroll-mt-24 rounded-2xl bg-ink p-6 text-chalk sm:p-8">
          <h2 className="font-display text-2xl">{t('designerDetail.bookTitle')}</h2>
          <p className="mt-2 text-sm text-chalk/60">
            {t('designerDetail.bookSub')}
            {fromCase ? t('designerDetail.fromCase', { id: fromCase }) : ''}
          </p>

          {sent ? (
            <p className="mt-8 text-teal-bright">{t('designerDetail.booked')}</p>
          ) : (
            <form onSubmit={onSubmit} className="mt-6 grid gap-4 sm:grid-cols-3">
              <Field
                label={t('designerDetail.name')}
                value={form.name}
                onChange={(v) => setForm((f) => ({ ...f, name: v }))}
                required
              />
              <Field
                label={t('designerDetail.phone')}
                value={form.phone}
                onChange={(v) => setForm((f) => ({ ...f, phone: v }))}
                required
                type="tel"
              />
              <Field
                label={t('designerDetail.city')}
                value={form.city}
                onChange={(v) => setForm((f) => ({ ...f, city: v }))}
                required
              />
              {submitError && (
                <p className="text-sm text-warn sm:col-span-3">{submitError}</p>
              )}
              <button
                type="submit"
                className="min-h-12 min-w-fit truncate rounded-lg bg-teal px-4 text-sm font-semibold text-white hover:bg-teal-bright sm:col-span-3"
              >
                {t('designerDetail.submit')}
              </button>
            </form>
          )}
        </section>
      </div>

      <StickyCta
        primaryTo="#book"
        primaryLabel={t('designerDetail.submit')}
        secondaryTo="/quote"
        secondaryLabel={t('designerDetail.seeQuote')}
      />
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  required,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (v: string) => void
  required?: boolean
  type?: string
}) {
  return (
    <label className="block text-sm">
      <span className="text-chalk/55">{label}</span>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 min-h-12 w-full rounded-lg border border-white/15 bg-white/5 px-3 text-chalk outline-none focus:border-teal-bright"
      />
    </label>
  )
}
