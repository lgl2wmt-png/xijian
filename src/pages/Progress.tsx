import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import { useFetch } from '../hooks/useFetch'
import type { StageStatus } from '../types'

const statusStyle: Record<StageStatus, { label: string; className: string }> = {
  done: { label: '已完成', className: 'bg-ok/15 text-ok ring-ok/30' },
  active: { label: '进行中', className: 'bg-warn/15 text-warn ring-warn/30' },
  pending: { label: '待开始', className: 'bg-idle/15 text-idle ring-idle/30' },
}

export function Progress() {
  const { data: p, loading, error, setData } = useFetch(() => api.myProject(), [])
  const [busy, setBusy] = useState<string | null>(null)

  if (loading) return <p className="mx-auto max-w-6xl px-4 py-20 text-ink-soft/60">加载工程…</p>
  if (error || !p) {
    return <p className="mx-auto max-w-6xl px-4 py-20 text-warn">{error || '无项目'}</p>
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
      await api.rectifyStage(p.id, stageId, `${stageId} 节点业主提出整改`)
      const refreshed = await api.myProject()
      setData(refreshed)
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-teal">过程管控 · 数据来自 SQLite</p>
          <h1 className="mt-1 font-display text-3xl text-ink sm:text-4xl">{p.name}</h1>
          <p className="mt-2 text-ink-soft/70">
            {p.address} · {p.startDate} 开工 · 计划 {p.endPlan} 完工
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/sandbox"
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-ink/20 bg-paper px-5 text-sm font-semibold text-ink hover:bg-chalk"
          >
            像素沙盘
          </Link>
          <Link
            to="/hud"
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-ink px-5 text-sm font-semibold text-chalk hover:bg-ink-soft"
          >
            智慧工地 HUD →
          </Link>
        </div>
      </header>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Stat label="预算消耗" value={`${pct}%`} sub={`已用 ¥${p.budgetUsed.toLocaleString()}`} />
        <Stat label="工序进度" value={`${doneCount}/${p.stages.length}`} sub="水电 → 安装" />
        <Stat label="工地状态" value="正常" sub={p.weather || '无停工预警'} accent />
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-mist/60">
        <div className="animate-progress h-full rounded-full bg-teal" style={{ width: `${pct}%` }} />
      </div>

      <h2 className="mt-14 font-display text-2xl text-ink">工序时间轴</h2>
      <p className="mt-2 text-sm text-ink-soft/65">
        验收/整改会写入后端，并推送到 HUD 实时日志。
      </p>

      <ol className="relative mt-10 ml-3 space-y-0 border-l-2 border-mist/70 sm:ml-4">
        {p.stages.map((s) => {
          const st = statusStyle[s.status]
          return (
            <li key={s.id} className="relative pb-10 pl-8 last:pb-0">
              <span
                className={`absolute top-1 -left-[9px] h-4 w-4 rounded-full ring-4 ring-paper ${
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
                计划 {s.planDate}
                {s.actualDate ? ` · 实际 ${s.actualDate}` : ''} · {s.owner}
              </p>
              {s.note && <p className="mt-2 text-sm text-ink-soft">{s.note}</p>}
              {s.photo && (
                <img
                  src={s.photo}
                  alt={`${s.name}现场`}
                  className="mt-4 aspect-[16/9] max-w-md rounded-xl object-cover"
                  loading="lazy"
                />
              )}
              {s.status === 'done' && (
                <div className="mt-4">
                  {s.accepted ? (
                    <p className="text-sm text-ok">你已确认验收（已入库）</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={busy === s.id}
                        onClick={() => accept(s.id)}
                        className="min-h-11 rounded-lg bg-teal px-4 text-sm font-medium text-white hover:bg-teal-bright disabled:opacity-50"
                      >
                        确认验收
                      </button>
                      <button
                        type="button"
                        disabled={busy === s.id}
                        onClick={() => rectify(s.id)}
                        className="min-h-11 rounded-lg border border-ink/15 px-4 text-sm text-ink hover:bg-chalk disabled:opacity-50"
                      >
                        提出整改
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
    <div className="rounded-2xl bg-paper/80 p-5 ring-1 ring-mist/50">
      <p className="text-xs text-ink-soft/50">{label}</p>
      <p className={`mt-1 font-display text-2xl ${accent ? 'text-ok' : 'text-ink'}`}>{value}</p>
      <p className="mt-1 text-xs text-ink-soft/55">{sub}</p>
    </div>
  )
}
