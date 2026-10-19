import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useOrderStore } from '../store/orderStore'

export function WorkerHall() {
  const { t } = useTranslation()
  const orders = useOrderStore((s) => s.orders)
  const claimOrder = useOrderStore((s) => s.claimOrder)
  const workerId = useOrderStore((s) => s.workerId)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const openOrders = orders.filter((o) => o.status === 'open')

  const onClaim = (id: string) => {
    setBusyId(id)
    setToast(null)
    const updated = claimOrder(id, workerId)
    setBusyId(null)
    if (!updated) {
      setToast(t('workerHall.claimFail'))
      return
    }
    setToast(t('workerHall.claimed'))
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <header className="max-w-2xl min-w-0">
        <h1 className="font-display text-3xl text-ink sm:text-4xl">{t('workerHall.title')}</h1>
        <p className="mt-3 text-ink-soft/75">{t('workerHall.sub')}</p>
      </header>

      {toast && (
        <p className="mt-6 rounded-lg bg-teal/10 px-4 py-3 text-sm text-teal" role="status">
          {toast}
        </p>
      )}

      {openOrders.length === 0 ? (
        <p className="mt-12 text-ink-soft/60">{t('workerHall.empty')}</p>
      ) : (
        <ul className="mt-10 grid min-w-0 gap-4 sm:grid-cols-2">
          {openOrders.map((o) => (
            <li
              key={o.id}
              className="flex min-w-0 flex-col rounded-2xl bg-paper/80 p-5 ring-1 ring-mist/60"
            >
              <div className="flex min-w-0 flex-wrap items-start justify-between gap-2">
                <h2 className="min-w-0 flex-1 font-display text-xl leading-snug text-ink">
                  <Link to={`/orders/${o.id}`} className="hover:text-teal">
                    {o.title}
                  </Link>
                </h2>
                <span className="shrink-0 rounded-md bg-ink/5 px-2 py-0.5 text-xs text-ink-soft">
                  {t(`trade.${o.trade}`)}
                </span>
              </div>
              <p className="mt-3 line-clamp-3 text-sm text-ink-soft/80">{o.description}</p>
              <p className="mt-4 text-sm font-medium text-ink">
                {t('workerHall.budget', { n: o.budget })}
              </p>
              <button
                type="button"
                disabled={busyId === o.id}
                onClick={() => onClaim(o.id)}
                className="mt-5 min-h-11 w-full min-w-fit truncate rounded-lg bg-teal px-4 text-sm font-semibold text-white hover:bg-teal-bright disabled:opacity-50 sm:w-auto"
              >
                {t('workerHall.claim')}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
