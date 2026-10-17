import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import * as echarts from 'echarts'
import { api, siteWsUrl } from '../api/client'
import { useFetch } from '../hooks/useFetch'
import type { HudZone, StageStatus } from '../types'

const zoneColor: Record<StageStatus, string> = {
  done: 'rgba(21, 128, 61, 0.45)',
  active: 'rgba(217, 119, 6, 0.5)',
  pending: 'rgba(148, 163, 184, 0.28)',
}

export function Hud() {
  const { data, loading, error, setData } = useFetch(() => api.hud('p1'), [])
  const [selected, setSelected] = useState<HudZone | null>(null)
  const [panelOpen, setPanelOpen] = useState(true)
  const [live, setLive] = useState(true)

  const expenseOption = useMemo<echarts.EChartsOption>(
    () => ({
      backgroundColor: 'transparent',
      grid: { top: 8, left: 40, right: 8, bottom: 24 },
      xAxis: {
        type: 'category',
        data: (data?.expenses || []).map((e) => e.category),
        axisLabel: { color: '#94a3b8', fontSize: 10 },
        axisLine: { lineStyle: { color: '#334155' } },
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: '#94a3b8', fontSize: 10 },
        splitLine: { lineStyle: { color: '#1e293b' } },
      },
      series: [
        {
          type: 'bar',
          data: (data?.expenses || []).map((e) => e.amount),
          itemStyle: { color: '#0f8a84', borderRadius: [4, 4, 0, 0] },
        },
      ],
    }),
    [data?.expenses],
  )

  const qualityOption = useMemo<echarts.EChartsOption>(
    () => ({
      backgroundColor: 'transparent',
      radar: {
        indicator: (data?.quality || []).map((q) => ({ name: q.dimension, max: 100 })),
        axisName: { color: '#94a3b8', fontSize: 10 },
        splitLine: { lineStyle: { color: '#1e293b' } },
        splitArea: { show: false },
        axisLine: { lineStyle: { color: '#334155' } },
      },
      series: [
        {
          type: 'radar',
          data: [
            {
              value: (data?.quality || []).map((q) => q.score),
              areaStyle: { color: 'rgba(15,138,132,0.25)' },
              lineStyle: { color: '#0f8a84' },
              itemStyle: { color: '#0f8a84' },
            },
          ],
        },
      ],
    }),
    [data?.quality],
  )

  const healthOption = useMemo<echarts.EChartsOption>(
    () => ({
      backgroundColor: 'transparent',
      grid: { top: 24, left: 36, right: 12, bottom: 24 },
      legend: {
        data: ['计划', '实际'],
        textStyle: { color: '#94a3b8', fontSize: 10 },
        top: 0,
      },
      xAxis: {
        type: 'category',
        data: (data?.healthTrend || []).map((h) => h.day),
        axisLabel: { color: '#94a3b8', fontSize: 10 },
      },
      yAxis: {
        type: 'value',
        max: 100,
        axisLabel: { color: '#94a3b8', fontSize: 10 },
        splitLine: { lineStyle: { color: '#1e293b' } },
      },
      series: [
        {
          name: '计划',
          type: 'line',
          data: (data?.healthTrend || []).map((h) => h.planned),
          smooth: true,
          lineStyle: { color: '#64748b' },
          itemStyle: { color: '#64748b' },
        },
        {
          name: '实际',
          type: 'line',
          data: (data?.healthTrend || []).map((h) => h.actual),
          smooth: true,
          lineStyle: { color: '#d97706' },
          itemStyle: { color: '#d97706' },
          areaStyle: { color: 'rgba(217,119,6,0.12)' },
        },
      ],
    }),
    [data?.healthTrend],
  )

  const completion = data?.project.completion ?? 0
  const ringOption = useMemo<echarts.EChartsOption>(
    () => ({
      backgroundColor: 'transparent',
      series: [
        {
          type: 'pie',
          radius: ['58%', '78%'],
          label: {
            show: true,
            position: 'center',
            formatter: `${completion}%`,
            color: '#e8ecef',
            fontSize: 22,
            fontFamily: 'Outfit',
          },
          data: [
            { value: completion, itemStyle: { color: '#0f8a84' } },
            {
              value: 100 - completion,
              itemStyle: { color: '#1e293b' },
              label: { show: false },
            },
          ],
        },
      ],
    }),
    [completion],
  )

  useEffect(() => {
    if (!data) return
    const ws = new WebSocket(siteWsUrl(data.project.id))
    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data) as { type: string; ts?: string; message?: string }
        if (msg.type === 'log' && msg.ts && msg.message) {
          setData((prev) =>
            prev
              ? {
                  ...prev,
                  logs: [{ ts: msg.ts!, message: msg.message! }, ...prev.logs].slice(0, 40),
                }
              : prev,
          )
          setLive(true)
        }
      } catch {
        /* ignore */
      }
    }
    ws.onclose = () => setLive(false)
    return () => ws.close()
  }, [data?.project.id, setData])

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-[#0b1016] text-chalk/60">
        连接工地数据…
      </div>
    )
  }
  if (error || !data) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3 bg-[#0b1016] text-warn">
        <p>{error || 'HUD 数据不可用'}</p>
        <Link to="/progress" className="text-sm text-teal-bright">
          返回进度页
        </Link>
      </div>
    )
  }

  const { project } = data
  const statusLabel =
    project.status === 'normal' ? '正常' : project.status === 'warn' ? '警告' : '停工'

  return (
    <div className="min-h-screen bg-[#0b1016] text-chalk">
      <header className="border-b border-white/10 bg-[#0f1620]/95 px-4 py-3 backdrop-blur sm:px-6">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <Link to="/progress" className="text-xs text-chalk/45 hover:text-chalk">
                ← 时间轴
              </Link>
              <Link to="/sandbox" className="text-xs text-lime-400/80 hover:text-lime-300">
                像素沙盘
              </Link>
            </div>
            <div>
              <p className="font-mono text-[10px] tracking-widest text-teal-bright/80">
                PROJECT_ID · {project.id.toUpperCase()}
              </p>
              <h1 className="font-display text-lg text-chalk sm:text-xl">{project.name}</h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs sm:gap-5 sm:text-sm">
            <Metric label="Budget_Usage" value={`${project.budgetPct}%`} />
            <Metric label="Days_Elapsed" value={`${project.daysElapsed}/${project.daysTotal}`} />
            <Metric label="Completion" value={`${project.completion}%`} />
            <span
              className={`rounded-md px-2.5 py-1 font-mono text-xs ring-1 ${
                project.status === 'normal'
                  ? 'bg-ok/20 text-ok ring-ok/40'
                  : 'bg-warn/20 text-warn ring-warn/40'
              }`}
            >
              System_Status · {statusLabel}
            </span>
            <span className="hidden text-chalk/45 md:inline">{project.weather}</span>
            <span
              className={`inline-flex items-center gap-1.5 font-mono text-[10px] ${
                live ? 'text-ok' : 'text-idle'
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${live ? 'bg-ok animate-soft-pulse' : 'bg-idle'}`}
              />
              LIVE WS
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1400px] gap-4 px-4 py-4 sm:px-6 lg:grid-cols-[1fr_280px]">
        <section className="relative min-h-[360px] overflow-hidden rounded-xl border border-white/10 bg-[radial-gradient(ellipse_at_center,#15202b_0%,#0b1016_70%)] sm:min-h-[480px]">
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                'linear-gradient(rgba(15,138,132,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(15,138,132,0.12) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
          <p className="absolute top-3 left-4 z-10 font-mono text-[10px] tracking-widest text-teal-bright/70">
            CENTRAL CANVAS · 户型施工区
          </p>
          <div className="relative mx-auto aspect-[4/3] max-w-3xl p-8 sm:p-12">
            <div className="relative h-full w-full rounded-lg border border-teal/30 bg-ink/40 shadow-[0_0_60px_rgba(11,110,106,0.15)]">
              {data.zones.map((z) => (
                <button
                  key={z.id}
                  type="button"
                  onClick={() => setSelected(z)}
                  className="absolute rounded-md border border-white/20 text-left transition hover:border-teal-bright hover:shadow-[0_0_20px_rgba(15,138,132,0.4)]"
                  style={{
                    left: `${z.x}%`,
                    top: `${z.y}%`,
                    width: `${z.w}%`,
                    height: `${z.h}%`,
                    background: zoneColor[z.status],
                  }}
                >
                  <span className="absolute top-2 left-2 font-display text-sm text-white drop-shadow">
                    {z.name}
                  </span>
                  <span className="absolute bottom-2 left-2 font-mono text-[10px] text-white/70">
                    {z.stageName} · {z.status}
                  </span>
                  {z.status === 'active' && (
                    <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-warn animate-soft-pulse" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {selected && (
            <div className="absolute right-4 bottom-4 left-4 z-20 max-w-sm rounded-xl border border-white/15 bg-[#0f1620]/95 p-4 shadow-xl backdrop-blur sm:left-auto">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-display text-lg">{selected.name}</p>
                  <p className="mt-1 font-mono text-xs text-chalk/50">
                    {selected.stageName} · {selected.status}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="text-xs text-chalk/40 hover:text-chalk"
                >
                  关闭
                </button>
              </div>
              {selected.photo && (
                <img
                  src={selected.photo}
                  alt={selected.name}
                  className="mt-3 aspect-video w-full rounded-lg object-cover"
                />
              )}
              <p className="mt-3 text-xs text-chalk/60">
                点击区域查看实拍。状态色：绿=完成 · 橙=施工中 · 灰=待开始。
              </p>
            </div>
          )}
        </section>

        <aside className="flex flex-col gap-3 rounded-xl border border-white/10 bg-[#0f1620] p-4">
          <p className="font-mono text-[10px] tracking-widest text-chalk/45">LEDGER · 验收/整改</p>
          <ul className="max-h-[420px] space-y-2 overflow-y-auto text-sm">
            {data.acceptances.map((a, i) => (
              <li key={`${a.title}-${i}`} className="rounded-lg bg-white/5 px-3 py-2">
                <p className="text-chalk/90">{a.title}</p>
                <p className="mt-1 font-mono text-[10px] text-chalk/45">
                  {a.createdAt} ·{' '}
                  <span
                    className={
                      a.status.includes('通过')
                        ? 'text-ok'
                        : a.status.includes('整改')
                          ? 'text-warn'
                          : 'text-teal-bright'
                    }
                  >
                    {a.status}
                  </span>
                </p>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => setPanelOpen((v) => !v)}
            className="mt-auto min-h-10 rounded-lg border border-white/10 text-xs text-chalk/60 hover:bg-white/5"
          >
            {panelOpen ? '收起底部仪表盘' : '展开底部仪表盘'}
          </button>
        </aside>
      </div>

      {panelOpen && (
        <div className="mx-auto grid max-w-[1400px] gap-3 px-4 pb-8 sm:px-6 md:grid-cols-2 xl:grid-cols-3">
          <Widget title="Node Log · 现场施工日志">
            <ul className="max-h-44 space-y-1.5 overflow-y-auto font-mono text-[11px] leading-relaxed">
              {data.logs.map((l, i) => (
                <li key={`${l.ts}-${l.message}-${i}`} className="text-chalk/75">
                  <span className="text-teal-bright">[{l.ts}]</span> {l.message}
                </li>
              ))}
            </ul>
          </Widget>

          <Widget title="Position Book · 资金流水">
            <ChartBox option={expenseOption} />
          </Widget>

          <Widget title="Spider Chart · 施工质量">
            <ChartBox option={qualityOption} />
          </Widget>

          <Widget title="Fill Heat · 材料进场">
            <div className="grid grid-cols-3 gap-2">
              {data.materials.map((m) => {
                const ratio = m.stock ? m.consumed / m.stock : 0
                const hot = Boolean(m.alert) || ratio > 0.85
                return (
                  <div
                    key={m.name}
                    className={`rounded-lg p-2 text-center ${
                      hot ? 'bg-red-500/25 ring-1 ring-red-400/40' : 'bg-teal/15 ring-1 ring-teal/25'
                    }`}
                  >
                    <p className="text-[11px] text-chalk/80">{m.name}</p>
                    <p className="mt-1 font-mono text-xs">
                      {m.consumed}/{m.stock}
                    </p>
                  </div>
                )
              })}
            </div>
          </Widget>

          <Widget title="Equity PPN · 项目健康度">
            <ChartBox option={healthOption} />
          </Widget>

          <Widget title="完工环形 · Completion">
            <ChartBox option={ringOption} />
          </Widget>
        </div>
      )}
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-mono text-[9px] tracking-wider text-chalk/40">{label}</p>
      <p className="font-mono text-sm text-chalk">{value}</p>
    </div>
  )
}

function Widget({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#0f1620] p-3">
      <p className="mb-2 font-mono text-[10px] tracking-widest text-chalk/45">{title}</p>
      {children}
    </div>
  )
}

function ChartBox({ option }: { option: echarts.EChartsOption }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return
    const chart = echarts.init(ref.current, undefined, { renderer: 'canvas' })
    chart.setOption(option)
    const onResize = () => chart.resize()
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      chart.dispose()
    }
  }, [option])

  return <div ref={ref} className="h-44 w-full" />
}
