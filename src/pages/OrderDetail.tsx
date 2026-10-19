import { useTranslation } from 'react-i18next'
import { Link, useLocation, useParams } from 'react-router-dom'
import type { OrderStatus } from '../types'
import { useOrderStore } from '../store/orderStore'

const FLOW: OrderStatus[] = ['pending_review', 'open', 'in_progress', 'completed']

export function OrderDetail() {
  const { t } = useTranslation()
  const { id } = useParams()
  const location = useLocation()
  const justPublished = Boolean((location.state as { justPublished?: boolean } | null)?.justPublished)
  const order = useOrderStore((s) => s.orders.find((o) => o.id === id))
  const workers = useOrderStore((s) => s.workers)

  if (!order) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <p className="text-warn">{t('orderDetail.notFound')}</p>
        <Link to="/publish" className="mt-6 inline-block text-sm text-teal">
          {t('orderDetail.backPublish')}
        </Link>
      </div>
    )
  }

  const worker = workers.find((w) => w.id === order.workerId)
  const activeIdx =
    order.status === 'rejected' ? -1 : Math.max(0, FLOW.indexOf(order.status))

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
      {justPublished && (
        <p className="mb-6 rounded-lg bg-teal/10 px-4 py-3 text-sm text-teal" role="status">
          {t('publish.success')}
        </p>
      )}

      <p className="text-sm text-teal">{t('orderDetail.title')}</p>
      <h1 className="mt-1 font-display text-3xl text-ink text-balance">{order.title}</h1>
      <p className="mt-2 text-sm text-ink-soft/60">
        {t(`orderStatus.${order.status}`)} · {t(`trade.${order.trade}`)}
      </p>

      <p className="mt-6 text-base leading-relaxed text-ink-soft">{order.description}</p>

      <dl className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="min-w-0 rounded-xl bg-paper/80 px-4 py-3 ring-1 ring-mist/50">
          <dt className="text-xs text-ink-soft/55">{t('publish.fieldBudget')}</dt>
          <dd className="mt-1 truncate text-sm font-semibold text-ink">
            {t('workerHall.budget', { n: order.budget })}
          </dd>
        </div>
        <div className="min-w-0 rounded-xl bg-paper/80 px-4 py-3 ring-1 ring-mist/50">
          <dt className="text-xs text-ink-soft/55">{t('orderDetail.client')}</dt>
          <dd className="mt-1 truncate text-sm font-semibold text-ink">{order.clientId}</dd>
        </div>
        <div className="min-w-0 rounded-xl bg-paper/80 px-4 py-3 ring-1 ring-mist/50">
          <dt className="text-xs text-ink-soft/55">{t('orderDetail.worker')}</dt>
          <dd className="mt-1 truncate text-sm font-semibold text-ink">
            {worker?.name ?? t('orderDetail.unassigned')}
          </dd>
        </div>
      </dl>

      <h2 className="mt-12 font-display text-xl text-ink">{t('orderDetail.timeline')}</h2>
      <ol className="relative ms-3 mt-6 space-y-0 border-s-2 border-mist/70">
        {FLOW.map((st, i) => {
          const done = activeIdx >= i
          return (
            <li key={st} className="relative ps-8 pb-8 last:pb-0">
              <span
                className={`absolute top-1 -start-[9px] h-4 w-4 rounded-full ring-4 ring-paper ${
                  done ? 'bg-teal' : 'bg-idle'
                }`}
              />
              <p className={`text-sm font-medium ${done ? 'text-ink' : 'text-ink-soft/45'}`}>
                {t(`orderStatus.${st}`)}
              </p>
            </li>
          )
        })}
        {order.status === 'rejected' && (
          <li className="relative ps-8">
            <span className="absolute top-1 -start-[9px] h-4 w-4 rounded-full bg-warn ring-4 ring-paper" />
            <p className="text-sm font-medium text-warn">{t('orderStatus.rejected')}</p>
          </li>
        )}
      </ol>

      <p className="mt-8 text-xs text-ink-soft/50">
        {t('orderDetail.created', { date: new Date(order.createdAt).toLocaleString() })}
        <br />
        {t('orderDetail.updated', { date: new Date(order.updatedAt).toLocaleString() })}
      </p>

      <div className="mt-10 flex min-w-0 flex-wrap gap-3">
        <Link
          to="/worker"
          className="inline-flex min-h-11 min-w-fit items-center truncate rounded-lg border border-ink/15 px-4 text-sm text-ink hover:bg-chalk"
        >
          {t('orderDetail.backHall')}
        </Link>
        <Link
          to="/publish"
          className="inline-flex min-h-11 min-w-fit items-center truncate rounded-lg bg-teal px-4 text-sm font-semibold text-white hover:bg-teal-bright"
        >
          {t('orderDetail.backPublish')}
        </Link>
      </div>
    </div>
  )
}
