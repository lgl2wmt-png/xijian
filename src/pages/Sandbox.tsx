import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import { useFetch } from '../hooks/useFetch'
import type { ProgressStage } from '../types'

const STAGE_LOOK: Record<
  string,
  { wall: string; floor: string; accent: string; label: string; detail: string }
> = {
  水电: {
    wall: '#1a2332',
    floor: '#243044',
    accent: '#22d3ee',
    label: '管线裸露发光',
    detail: '墙面：预埋电线管 · 给排水走向可见',
  },
  泥瓦: {
    wall: '#2a3340',
    floor: '#8b7355',
    accent: '#fbbf24',
    label: '瓷砖铺就',
    detail: '地面：像素瓷砖网格 · 防水已闭水',
  },
  木工: {
    wall: '#3d2f24',
    floor: '#5c4033',
    accent: '#f59e0b',
    label: '柜体成形',
    detail: '主卧：书柜侧板安装中 · 层板待调',
  },
  油漆: {
    wall: '#e8e0d4',
    floor: '#c4b5a0',
    accent: '#a3e635',
    label: '墙面成色',
    detail: '腻子 · 底漆 · 面漆工序配方可查',
  },
  安装: {
    wall: '#f5f0e8',
    floor: '#d6cfc4',
    accent: '#34d399',
    label: '软装点亮',
    detail: '灯具 · 洁具 · 五金收尾',
  },
}

function stageLook(name: string) {
  return STAGE_LOOK[name] || STAGE_LOOK['木工']
}

export function Sandbox() {
  const { data, loading, error } = useFetch(() => api.hud('p1'), [])
  const [picked, setPicked] = useState<string | null>('主卧')
  const [showRecipe, setShowRecipe] = useState(false)

  const activeStage = useMemo(() => {
    if (!data) return null
    return data.stages.find((s) => s.status === 'active') || data.stages.find((s) => s.status === 'pending')
  }, [data])

  const look = stageLook(activeStage?.name || '木工')
  const doneStages = data?.stages.filter((s) => s.status === 'done') || []
  const riskPct = data
    ? Math.max(0, Math.min(99, Math.round((data.project.daysElapsed / data.project.daysTotal) * 100 - data.project.completion)))
    : 0

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-[#0a0c10] font-mono text-sm text-lime-400/70">
        LOADING PIXEL SANDBOX…
      </div>
    )
  }
  if (error || !data) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3 bg-[#0a0c10] text-warn">
        <p>{error || '沙盘数据不可用'}</p>
        <Link to="/progress" className="text-sm text-teal-bright">
          返回进度页
        </Link>
      </div>
    )
  }

  const { project, zones, materials, quality, logs } = data
  const paintAlert = materials.find((m) => m.alert)
  const qualityAvg = Math.round(
    quality.reduce((s, q) => s + q.score, 0) / Math.max(1, quality.length),
  )

  const bubbles = [
    { room: '客厅', x: 28, y: 42, text: zones.find((z) => z.name === '客厅')?.status === 'done' ? '瓷砖已铺完' : '客厅待施工' },
    { room: '主卧', x: 68, y: 32, text: activeStage?.name === '木工' ? '正在装书柜' : '主卧进度同步中' },
    { room: '厨卫', x: 22, y: 68, text: '防水闭水通过' },
    { room: '次卧', x: 72, y: 70, text: '待油漆进场' },
  ]

  return (
    <div className="min-h-screen bg-[#0a0c10] text-chalk pixel-root">
      {/* Global header */}
      <header className="border-b border-lime-500/20 bg-[#0e1118] px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link to="/progress" className="font-mono text-[10px] text-chalk/40 hover:text-lime-400">
              ← QUEST
            </Link>
            <div>
              <p className="font-mono text-[10px] tracking-widest text-lime-400/80">PIXEL TWIN · 数字孪生沙盘</p>
              <h1 className="font-display text-lg sm:text-xl">{project.name}</h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <Link
              to="/hud"
              className="rounded border border-cyan-500/40 px-3 py-1.5 font-mono text-[10px] text-cyan-300 hover:bg-cyan-500/10"
            >
              切换 HUD
            </Link>
            <div className="min-w-[140px]">
              <p className="font-mono text-[9px] text-chalk/40">工期进度</p>
              <div className="mt-1 h-2 overflow-hidden rounded-sm bg-white/10">
                <div
                  className="h-full bg-gradient-to-r from-lime-600 to-lime-400"
                  style={{ width: `${project.completion}%` }}
                />
              </div>
              <p className="mt-0.5 font-mono text-[10px] text-lime-400">{project.completion}%</p>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6">
        {/* KPI strip */}
        <div className="flex flex-wrap gap-3 font-mono text-xs">
          <Kpi label="阶段" value={activeStage?.name || '—'} color="text-amber-300" />
          <Kpi
            label="今日消耗"
            value={`¥${Math.round(project.budgetUsed / Math.max(1, project.daysElapsed)).toLocaleString()}`}
          />
          <Kpi label="距完工" value={`${Math.max(0, project.daysTotal - project.daysElapsed)} 天`} color="text-lime-400" />
          <Kpi label="天气" value={project.weather.split('·')[0].trim()} />
        </div>

        {/* Metrics matrix */}
        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <MetricCard code="WEATHER" title="天气预警" body="明后日多云，宜贴砖/刷漆" tone="ok" />
          <MetricCard
            code="LOGISTICS"
            title="材料物流"
            body={paintAlert ? `${paintAlert.name}库存告急` : '瓷砖已送达 · 无延误'}
            tone={paintAlert ? 'warn' : 'ok'}
          />
          <MetricCard code="QUALITY" title="质检评分" body={`综合 ${qualityAvg} 分`} tone="ok" />
          <MetricCard code="WORKER" title="工长考勤" body={activeStage?.owner || '待排班'} tone="ok" />
          <MetricCard code="RISK" title="延期风险" body={`${riskPct}% · 实际略慢于计划`} tone={riskPct > 15 ? 'warn' : 'ok'} />
          <MetricCard code="SOCIAL" title="同小区" body="同户型邻居泥瓦已完工" tone="idle" />
          <MetricCard code="BUDGET" title="预算剩余" body={`${100 - project.budgetPct}% · ¥${(project.budgetTotal - project.budgetUsed).toLocaleString()}`} tone={project.budgetPct > 75 ? 'warn' : 'ok'} />
          <MetricCard code="CRAWLER" title="全网比价" body="主材均价持平 · 无异常涨幅" tone="ok" />
        </div>

        {/* Digital twin sandbox */}
        <section className="relative mt-6 overflow-hidden rounded-xl border border-lime-500/25 bg-[#12161f]">
          <div
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                'linear-gradient(#1f2937 1px, transparent 1px), linear-gradient(90deg, #1f2937 1px, transparent 1px)',
              backgroundSize: '16px 16px',
            }}
          />
          <div className="relative flex flex-col gap-4 p-4 sm:flex-row sm:items-stretch sm:p-6">
            <div className="relative min-h-[280px] flex-1 sm:min-h-[360px]">
              <HouseCutaway look={look} stageName={activeStage?.name || '木工'} />
              {bubbles.map((b) => (
                <button
                  key={b.room}
                  type="button"
                  onClick={() => setPicked(b.room)}
                  className={`absolute z-10 max-w-[9rem] -translate-x-1/2 -translate-y-full rounded border px-2 py-1 text-left font-mono text-[10px] shadow-lg transition ${
                    picked === b.room
                      ? 'border-fuchsia-400 bg-fuchsia-500/30 text-fuchsia-100'
                      : 'border-lime-400/50 bg-black/70 text-lime-100 hover:border-lime-300'
                  }`}
                  style={{ left: `${b.x}%`, top: `${b.y}%` }}
                >
                  <span className="block text-[9px] text-chalk/50">{b.room}</span>
                  {b.text}
                </button>
              ))}
              {/* Pixel worker */}
              <div
                className="absolute bottom-[18%] left-[48%] z-10 animate-soft-pulse"
                title="工长小人"
              >
                <PixelWorker />
              </div>
            </div>

            <aside className="w-full shrink-0 space-y-3 sm:w-64">
              <div className="rounded-lg border border-white/10 bg-black/40 p-3">
                <p className="font-mono text-[10px] tracking-widest text-lime-400/70">SCENE LOOK</p>
                <p className="mt-2 font-display text-lg">{look.label}</p>
                <p className="mt-1 text-xs text-chalk/60">{look.detail}</p>
                {picked && (
                  <p className="mt-3 border-t border-white/10 pt-3 font-mono text-[11px] text-fuchsia-300">
                    选中：{picked}
                    <br />
                    <span className="text-chalk/50">
                      {zones.find((z) => z.name === picked)?.stageName || '点击气泡查看分区'}
                    </span>
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setShowRecipe((v) => !v)}
                className="w-full min-h-10 rounded-lg border border-lime-500/40 bg-lime-500/10 font-mono text-xs text-lime-300 hover:bg-lime-500/20"
              >
                {showRecipe ? '收起隐蔽工程配方' : '展开 · 标准即硬性指标'}
              </button>
              {showRecipe && (
                <pre className="overflow-x-auto rounded-lg border border-lime-500/30 bg-black p-3 font-mono text-[10px] leading-relaxed text-lime-400">
{`# wall_finish.recipe
steps = 9
putty_thickness_mm = 1.5
mesh = "耐碱网格布 160g"
primer = "封闭底漆 ×1"
topcoat = "乳胶漆 ×2"
qc.check("空鼓率 < 5%")
qc.check("色差 ΔE < 1.5")
# 代码即法律`}
                </pre>
              )}
            </aside>
          </div>
        </section>

        {/* Achievements + trend */}
        <section className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          <div className="rounded-xl border border-white/10 bg-[#12161f] p-4">
            <p className="font-mono text-[10px] tracking-widest text-chalk/45">ACHIEVEMENTS · 通关勋章</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {data.stages.map((s) => (
                <Badge key={s.id} stage={s} />
              ))}
            </div>
            <p className="mt-4 text-xs text-chalk/50">
              已通关 {doneStages.length}/{data.stages.length}。完成验收后勋章点亮，像养成游戏一样看着新家落成。
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-[#12161f] p-4">
            <p className="font-mono text-[10px] tracking-widest text-chalk/45">LIVE FEED · 今日动态</p>
            <ul className="mt-3 max-h-40 space-y-1.5 overflow-y-auto font-mono text-[11px]">
              {logs.slice(0, 8).map((l, i) => (
                <li key={`${l.ts}-${i}`} className="text-chalk/70">
                  <span className="text-lime-400">[{l.ts}]</span> {l.message}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Budget dual-axis simplified bars */}
        <section className="mt-6 rounded-xl border border-white/10 bg-[#12161f] p-4">
          <p className="font-mono text-[10px] tracking-widest text-chalk/45">
            BUDGET × PROGRESS · 双轴对照
          </p>
          <div className="mt-4 space-y-3">
            {data.healthTrend.map((h) => (
              <div key={h.day} className="grid grid-cols-[2.5rem_1fr_1fr] items-center gap-2 text-[10px] font-mono">
                <span className="text-chalk/45">{h.day}</span>
                <Bar label="计划" pct={h.planned} color="bg-slate-500" />
                <Bar label="实际" pct={h.actual} color="bg-amber-500" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

function Kpi({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="rounded border border-white/10 bg-white/5 px-3 py-2">
      <p className="text-[9px] text-chalk/40">{label}</p>
      <p className={`mt-0.5 ${color || 'text-chalk'}`}>{value}</p>
    </div>
  )
}

function MetricCard({
  code,
  title,
  body,
  tone,
}: {
  code: string
  title: string
  body: string
  tone: 'ok' | 'warn' | 'idle'
}) {
  const ring =
    tone === 'warn'
      ? 'border-amber-400/40 bg-amber-500/10'
      : tone === 'ok'
        ? 'border-lime-500/25 bg-lime-500/5'
        : 'border-white/10 bg-white/5'
  return (
    <div className={`rounded-lg border p-3 ${ring}`}>
      <p className="font-mono text-[9px] tracking-widest text-chalk/40">{code}</p>
      <p className="mt-1 text-xs font-medium text-chalk">{title}</p>
      <p className="mt-1 text-[11px] leading-snug text-chalk/60">{body}</p>
    </div>
  )
}

function Badge({ stage }: { stage: ProgressStage }) {
  const lit = stage.status === 'done'
  return (
    <div
      className={`flex w-[4.5rem] flex-col items-center gap-1 rounded-lg border p-2 ${
        lit
          ? 'border-lime-400/50 bg-lime-500/15 text-lime-300'
          : stage.status === 'active'
            ? 'border-amber-400/40 bg-amber-500/10 text-amber-200'
            : 'border-white/10 bg-white/5 text-chalk/35'
      }`}
    >
      <span className="text-lg">{lit ? '◆' : stage.status === 'active' ? '◇' : '·'}</span>
      <span className="font-mono text-[10px]">{stage.name}</span>
      {stage.accepted && <span className="text-[8px] text-lime-400">已验收</span>}
    </div>
  )
}

function Bar({ label, pct, color }: { label: string; pct: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-6 text-chalk/35">{label[0]}</span>
      <div className="h-2 flex-1 overflow-hidden rounded-sm bg-white/10">
        <div className={`h-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-8 text-right text-chalk/50">{pct}%</span>
    </div>
  )
}

function HouseCutaway({
  look,
  stageName,
}: {
  look: { wall: string; floor: string; accent: string }
  stageName: string
}) {
  const pipes = stageName === '水电'
  const tiles = stageName === '泥瓦' || stageName === '木工' || stageName === '油漆' || stageName === '安装'
  const wood = stageName === '木工' || stageName === '油漆' || stageName === '安装'
  const paint = stageName === '油漆' || stageName === '安装'

  return (
    <svg
      viewBox="0 0 400 300"
      className="h-full w-full drop-shadow-[0_0_24px_rgba(163,230,53,0.12)]"
      style={{ imageRendering: 'pixelated' }}
      aria-label="房屋剖面沙盘"
    >
      {/* ground */}
      <rect x="20" y="250" width="360" height="30" fill="#1a1f2a" />
      <rect x="20" y="250" width="360" height="4" fill="#2d3748" />

      {/* house body isometric-ish */}
      <polygon points="60,240 200,160 340,240 340,250 60,250" fill={look.floor} />
      <polygon points="60,100 60,240 200,160 200,40" fill={look.wall} stroke="#0a0c10" strokeWidth="2" />
      <polygon
        points="200,40 200,160 340,240 340,100"
        fill={paint ? '#f0ebe3' : look.wall}
        opacity={0.92}
        stroke="#0a0c10"
        strokeWidth="2"
      />
      {/* roof */}
      <polygon points="50,110 200,20 350,110 200,40" fill="#0f172a" stroke={look.accent} strokeWidth="2" />

      {/* window */}
      <rect x="90" y="130" width="40" height="36" fill="#0ea5e9" opacity="0.35" stroke={look.accent} strokeWidth="2" />
      <rect x="250" y="120" width="48" height="40" fill="#0ea5e9" opacity="0.3" stroke={look.accent} strokeWidth="2" />

      {/* floor tiles */}
      {tiles &&
        Array.from({ length: 8 }).map((_, i) => (
          <line
            key={i}
            x1={80 + i * 28}
            y1={240 - i * 8}
            x2={120 + i * 28}
            y2={220 - i * 8}
            stroke="#000"
            strokeOpacity="0.25"
            strokeWidth="2"
          />
        ))}

      {/* glowing pipes */}
      {pipes && (
        <>
          <path d="M80 220 Q140 180 160 140" fill="none" stroke={look.accent} strokeWidth="3" strokeDasharray="4 4">
            <animate attributeName="stroke-dashoffset" from="0" to="16" dur="1s" repeatCount="indefinite" />
          </path>
          <path d="M280 200 Q300 160 310 130" fill="none" stroke={look.accent} strokeWidth="3" strokeDasharray="4 4">
            <animate attributeName="stroke-dashoffset" from="0" to="16" dur="1.2s" repeatCount="indefinite" />
          </path>
        </>
      )}

      {/* cabinet wood */}
      {wood && (
        <g>
          <rect x="230" y="150" width="36" height="55" fill="#92400e" stroke="#451a03" strokeWidth="2" />
          <line x1="230" y1="168" x2="266" y2="168" stroke="#451a03" strokeWidth="2" />
          <line x1="230" y1="186" x2="266" y2="186" stroke="#451a03" strokeWidth="2" />
        </g>
      )}

      {/* plant soft furnishing */}
      {stageName === '安装' && (
        <g transform="translate(100,200)">
          <rect x="6" y="16" width="12" height="10" fill="#65a30d" />
          <circle cx="12" cy="12" r="10" fill="#84cc16" />
        </g>
      )}

      <text x="200" y="288" textAnchor="middle" fill="#64748b" fontSize="10" fontFamily="monospace">
        2.5D CUTAWAY · {stageName} PHASE
      </text>
    </svg>
  )
}

function PixelWorker() {
  return (
    <svg width="32" height="40" viewBox="0 0 16 20" style={{ imageRendering: 'pixelated' }} aria-hidden>
      <rect x="5" y="0" width="6" height="4" fill="#fbbf24" />
      <rect x="4" y="4" width="8" height="5" fill="#fcd34d" />
      <rect x="3" y="9" width="10" height="6" fill="#22d3ee" />
      <rect x="4" y="15" width="3" height="5" fill="#1e293b" />
      <rect x="9" y="15" width="3" height="5" fill="#1e293b" />
      <rect x="6" y="2" width="2" height="1" fill="#0f172a" />
      <rect x="9" y="2" width="2" height="1" fill="#0f172a" />
    </svg>
  )
}
