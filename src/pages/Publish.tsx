import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import type { WorkerTrade } from '../types'
import { useOrderStore } from '../store/orderStore'

const TRADES: WorkerTrade[] = ['plumbing', 'carpentry', 'painting', 'tiling', 'install']

export function Publish() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const createOrder = useOrderStore((s) => s.createOrder)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [budget, setBudget] = useState('1')
  const [trade, setTrade] = useState<WorkerTrade>('plumbing')
  const [error, setError] = useState<string | null>(null)

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !description.trim() || !budget) {
      setError(t('publish.required'))
      return
    }
    const order = createOrder({
      title,
      description,
      budget: Number(budget),
      trade,
    })
    navigate(`/orders/${order.id}`, { state: { justPublished: true } })
  }

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-12 sm:px-6 sm:py-16">
      <header className="min-w-0">
        <h1 className="font-display text-3xl text-ink sm:text-4xl">{t('publish.title')}</h1>
        <p className="mt-3 text-ink-soft/75">{t('publish.sub')}</p>
      </header>

      <form onSubmit={onSubmit} className="mt-8 flex min-w-0 flex-col gap-5">
        <label className="block min-w-0 text-sm">
          <span className="text-ink-soft/60">{t('publish.fieldTitle')}</span>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t('publish.fieldTitlePh')}
            className="mt-1.5 min-h-12 w-full max-w-full rounded-lg border border-mist bg-paper px-3 outline-none focus:border-teal"
          />
        </label>

        <label className="block min-w-0 text-sm">
          <span className="text-ink-soft/60">{t('publish.fieldDesc')}</span>
          <textarea
            required
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('publish.fieldDescPh')}
            className="mt-1.5 w-full max-w-full resize-y rounded-lg border border-mist bg-paper px-3 py-3 outline-none focus:border-teal"
          />
        </label>

        <div className="grid min-w-0 gap-4 sm:grid-cols-2">
          <label className="block min-w-0 text-sm">
            <span className="text-ink-soft/60">{t('publish.fieldBudget')}</span>
            <input
              required
              type="number"
              min={0.1}
              step={0.1}
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="mt-1.5 min-h-12 w-full max-w-full rounded-lg border border-mist bg-paper px-3 outline-none focus:border-teal"
            />
          </label>
          <label className="block min-w-0 text-sm">
            <span className="text-ink-soft/60">{t('publish.fieldTrade')}</span>
            <select
              value={trade}
              onChange={(e) => setTrade(e.target.value as WorkerTrade)}
              className="mt-1.5 min-h-12 w-full max-w-full rounded-lg border border-mist bg-paper px-3 outline-none focus:border-teal"
            >
              {TRADES.map((tr) => (
                <option key={tr} value={tr}>
                  {t(`trade.${tr}`)}
                </option>
              ))}
            </select>
          </label>
        </div>

        {error && <p className="text-sm text-warn">{error}</p>}

        <button
          type="submit"
          className="min-h-12 w-full min-w-fit truncate rounded-lg bg-teal px-4 text-sm font-semibold text-white hover:bg-teal-bright sm:w-auto"
        >
          {t('publish.submit')}
        </button>
      </form>
    </div>
  )
}
