import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '../api/client'
import { useFetch } from '../hooks/useFetch'

export function Quote() {
  const { t } = useTranslation()
  const [params] = useSearchParams()
  const caseId = params.get('case') || undefined
  const { data: caseItem } = useFetch(
    () => (caseId ? api.case(caseId) : Promise.resolve(null)),
    [caseId],
  )
  const [done, setDone] = useState<{ min: number; max: number } | null>(null)
  const [area, setArea] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState<string | null>(null)

  const areaValue = area || (caseItem?.area ? String(caseItem.area) : '80')

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      const res = await api.createQuote({
        caseId,
        area: Number(areaValue),
        phone,
      })
      setDone({ min: res.estimateMin, max: res.estimateMax })
    } catch (err) {
      setError(err instanceof Error ? err.message : t('quote.submitFail'))
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="font-display text-3xl text-ink">{t('quote.title')}</h1>
      <p className="mt-3 text-ink-soft/75">
        {caseItem
          ? t('quote.withCase', { title: caseItem.title })
          : t('quote.withoutCase')}
      </p>

      {done ? (
        <div className="mt-10 rounded-2xl bg-paper/80 p-6 ring-1 ring-mist/60">
          <p className="font-display text-2xl text-ink">
            {t('quote.result', { min: done.min, max: done.max })}
          </p>
          <p className="mt-3 text-sm text-ink-soft/70">{t('quote.resultSub')}</p>
          <Link to="/designers" className="mt-6 inline-block text-sm font-medium text-teal">
            {t('quote.toDesigners')}
          </Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-8 space-y-5">
          <label className="block text-sm">
            <span className="text-ink-soft/60">{t('quote.area')}</span>
            <input
              type="number"
              min={20}
              max={500}
              value={areaValue}
              onChange={(e) => setArea(e.target.value)}
              className="mt-1.5 min-h-12 w-full rounded-lg border border-mist bg-paper px-3 outline-none focus:border-teal"
              required
            />
          </label>
          <label className="block text-sm">
            <span className="text-ink-soft/60">{t('quote.phone')}</span>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={t('quote.phonePh')}
              className="mt-1.5 min-h-12 w-full rounded-lg border border-mist bg-paper px-3 outline-none focus:border-teal"
            />
          </label>
          {error && <p className="text-sm text-warn">{error}</p>}
          <button
            type="submit"
            className="min-h-12 w-full min-w-fit truncate rounded-lg bg-teal px-4 text-sm font-semibold text-white hover:bg-teal-bright"
          >
            {t('quote.submit')}
          </button>
        </form>
      )}
    </div>
  )
}
