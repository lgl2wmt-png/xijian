import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import { useFetch } from '../hooks/useFetch'
import type { StageStatus } from '../types'

export function Progress() {
  const { t } = useTranslation()
  const { data: p, loading, error, setData } = useFetch(() => api.myProject(), [])
  const [busy, setBusy] = useState<string | null>(null)

  const statusStyle: Record<StageStatus, { label: string; className: string }> = {
    done: { label: t('progress.statusDone'), className: 'bg-ok/15 text-ok ring-ok/30' },
    active: { label: t('progress.statusActive'), className: 'bg-warn/15 text-warn ring-warn/30' },
    pending: {
      label: t('progress.statusPending'),
      className: 'bg-idle/15 text-idle ring-idle/30',
    },
  }

  if (loading) {
    return <p className="mx-auto max-w-6xl px-4 py-20 text-ink-soft/60">{t('progress.loading')}</p>
  }
  if (error || !p) {
    return (
      <p className="mx-auto max-w-6xl px-4 py-20 text-warn">{error || t('progress.empty')}</p>
    )
  }

  const pct = Math.round((p.budgetUsed / p.budgetTotal) * 100)
  const doneCount = p.stages.filter((s) => s.status === 'done').length

  const accept = async (stageId: string) => {
    setBusy(stageId)
    try {
      await api.acceptStage(p.id, stageId)
      setData({
        ...p,
        stages: p.stages.map((s) => (s.id === stageId ? { ...s, accepted: true } : s)),
      })
    } finally {
      setBusy(null)
    }
  }

  const rectify = async (stageId: string) => {
    setBusy(stageId)
    try {
      await api.rectifyStage(p.id, stageId, t('progress.rectifyNote', { id: stageId }))
      const refreshed = await api.myProject()
      setData(refreshed)
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm text-teal">{t('progress.eyebrow')}</p>
          <h1 className="mt-1 font-display text-3xl text-ink sm:text-4xl">{p.name}</h1>
          <p className="mt-2 text-ink-soft/70">
            {t('progress.schedule', {
              address: p.address,
              start: p.startDate,
              end: p.endPlan,
            })}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/sandbox"
            className="inline-flex min-h-11 min-w-fit items-center justify-center truncate rounded-lg border border-ink/20 bg-paper px-5 text-sm font-semibold text-ink hover:bg-chalk"
          >
            {t('progress.sandbox')}
          </Link>
          <Link
            to="/hud"
            className="inline-flex min-h-11 min-w-fit items-center justify-center truncate rounded-lg bg-ink px-5 text-sm font-semibold text-chalk hover:bg-ink-soft"
          >
            {t('progress.hud')}
          </Link>
        </div>
      </header>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Stat
          label={t('progress.budgetUsed')}
          value={`${pct}%`}
          sub={t('progress.budgetSub', { n: p.budgetUsed.toLocaleString() })}
        />
        <Stat
          label={t('progress.stageProgress')}
          value={`${doneCount}/${p.stages.length}`}
          sub={t('progress.stageSub')}
        />
        <Stat
          label={t('progress.siteStatus')}
          value={t('progress.statusOk')}
          sub={p.weather || t('progress.noWeather')}
          accent
        />
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-mist/60">
        <div className="animate-progress h-full rounded-full bg-teal" style={{ width: `${pct}%` }} />
      </div>

      <h2 className="mt-14 font-display text-2xl text-ink">{t('progress.timeline')}</h2>
      <p className="mt-2 text-sm text-ink-soft/65">{t('progress.timelineSub')}</p>

      <ol className="relative ms-3 mt-10 space-y-0 border-s-2 border-mist/70 sm:ms-4">
        {p.stages.map((s) => {
          const st = statusStyle[s.status]
          return (
            <li key={s.id} className="relative ps-8 pb-10 last:pb-0">
              <span
                className={`absolute top-1 -start-[9px] h-4 w-4 rounded-full ring-4 ring-paper ${
                  s.status === 'done' ? 'bg-ok' : s.status === 'active' ? 'bg-warn' : 'bg-idle'
                }`}
              />
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-display text-xl text-ink">{s.name}</h3>
                <span className={`rounded-md px-2 py-0.5 text-xs ring-1 ${st.className}`}>
                  {st.label}
                </span>
              </div>
              <p className="mt-2 text-sm text-ink-soft/70">
                {t('progress.plan', { date: s.planDate })}
                {s.actualDate ? t('progress.actual', { date: s.actualDate }) : ''} · {s.owner}
              </p>
              {s.note && <p className="mt-2 text-sm text-ink-soft">{s.note}</p>}
              {s.photo && (
                <img
                  src={s.photo}
                  alt={t('progress.photoAlt', { name: s.name })}
                  className="mt-4 aspect-[16/9] max-w-md rounded-xl object-cover"
                  loading="lazy"
                />
              )}
              {s.status === 'done' && (
                <div className="mt-4">
                  {s.accepted ? (
                    <p className="text-sm text-ok">{t('progress.accepted')}</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={busy === s.id}
                        onClick={() => accept(s.id)}
                        className="min-h-11 min-w-fit truncate rounded-lg bg-teal px-4 text-sm font-medium text-white hover:bg-teal-bright disabled:opacity-50"
                      >
                        {t('progress.accept')}
                      </button>
                      <button
                        type="button"
                        disabled={busy === s.id}
                        onClick={() => rectify(s.id)}
                        className="min-h-11 min-w-fit truncate rounded-lg border border-ink/15 px-4 text-sm text-ink hover:bg-chalk disabled:opacity-50"
                      >
                        {t('progress.rectify')}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}

function Stat({
  label,
  value,
  sub,
  accent,
}: {
  label: string
  value: string
  sub: string
  accent?: boolean
}) {
  return (
    <div className="min-w-0 rounded-2xl bg-paper/80 p-5 ring-1 ring-mist/50">
      <p className="truncate text-xs text-ink-soft/50">{label}</p>
      <p className={`mt-1 font-display text-2xl ${accent ? 'text-ok' : 'text-ink'}`}>{value}</p>
      <p className="mt-1 truncate text-xs text-ink-soft/55" title={sub}>
        {sub}
      </p>
    </div>
  )
}
