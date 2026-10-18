import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import { useIsMobile } from '../hooks/useMediaQuery'
import { useFetch } from '../hooks/useFetch'
import { tickForce, type SimNode } from '../lib/forceLayout'
import type { GalaxyEdge, GalaxyNode, GalaxyPhase } from '../types'

const PHASE_ORDER: GalaxyPhase[] = ['design', 'hard', 'soft', 'movein']

function radiusOf(n: GalaxyNode) {
  if (n.kind === 'core') return 46
  if (n.kind === 'room') return 28 + Math.min(18, n.budget / 8000)
  return 16 + Math.min(14, n.budget / 4000)
}

export function Galaxy() {
  const { data: raw, loading, error } = useFetch(() => api.galaxy(), [])
  const [nodes, setNodes] = useState<GalaxyNode[]>([])
  const [edges, setEdges] = useState<GalaxyEdge[]>([])
  const [phaseIdx, setPhaseIdx] = useState(0)
  const [selectedId, setSelectedId] = useState<string | null>('core')
  const [highlight, setHighlight] = useState<string[]>([])
  const [ask, setAsk] = useState('')
  const [reply, setReply] = useState<string | null>(null)
  const [asking, setAsking] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const isMobile = useIsMobile()
  const [showTimeline, setShowTimeline] = useState(false)
  const [showCopilot, setShowCopilot] = useState(false)

  useEffect(() => {
    setShowTimeline(!isMobile)
    setShowCopilot(!isMobile)
  }, [isMobile])

  const svgRef = useRef<SVGSVGElement>(null)
  const simRef = useRef<SimNode[]>([])
  const [positions, setPositions] = useState<Record<string, { x: number; y: number; r: number }>>({})
  const dragId = useRef<string | null>(null)
  const size = useRef({ w: 900, h: 560 })

  useEffect(() => {
    if (!raw) return
    setNodes(raw.nodes.map((n) => ({ ...n })))
    setEdges(raw.edges.map((e) => ({ ...e })))
  }, [raw])

  const visiblePhase = PHASE_ORDER[phaseIdx]
  const activeNodes = useMemo(
    () => nodes.filter((n) => !n.hidden && PHASE_ORDER.indexOf(n.phase) <= phaseIdx),
    [nodes, phaseIdx],
  )
  const activeIds = useMemo(() => new Set(activeNodes.map((n) => n.id)), [activeNodes])
  const activeEdges = useMemo(
    () => edges.filter((e) => activeIds.has(e.source) && activeIds.has(e.target)),
    [edges, activeIds],
  )

  const spent = useMemo(
    () => activeNodes.filter((n) => n.kind === 'item' && !n.hidden).reduce((s, n) => s + n.budget, 0),
    [activeNodes],
  )

  const selected = nodes.find((n) => n.id === selectedId) || null
  const sub = raw?.substitutes.find((s) => s.fromId === selectedId)

  // init / refresh simulation when node set changes
  useEffect(() => {
    const w = size.current.w
    const h = size.current.h
    const existing = new Map(simRef.current.map((n) => [n.id, n]))
    simRef.current = activeNodes.map((n, i) => {
      const prev = existing.get(n.id)
      const angle = (i / Math.max(1, activeNodes.length)) * Math.PI * 2
      const orbit = n.kind === 'core' ? 0 : n.kind === 'room' ? 140 : 220
      return {
        id: n.id,
        x: prev?.x ?? w / 2 + Math.cos(angle) * orbit,
        y: prev?.y ?? h / 2 + Math.sin(angle) * orbit,
        vx: prev?.vx ?? 0,
        vy: prev?.vy ?? 0,
        r: radiusOf(n),
        fx: n.kind === 'core' ? w / 2 : undefined,
        fy: n.kind === 'core' ? h / 2 : undefined,
      }
    })
  }, [activeNodes])

  useEffect(() => {
    let raf = 0
    let frames = 0
    const loop = () => {
      frames++
      const alpha = Math.max(0.05, 0.55 - frames * 0.002)
      tickForce(
        simRef.current,
        activeEdges.map((e) => ({ source: e.source, target: e.target })),
        size.current.w,
        size.current.h,
        alpha,
      )
      const next: Record<string, { x: number; y: number; r: number }> = {}
      for (const n of simRef.current) next[n.id] = { x: n.x, y: n.y, r: n.r }
      setPositions(next)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [activeEdges])

  useEffect(() => {
    const onResize = () => {
      const el = svgRef.current?.parentElement
      if (!el) return
      size.current = { w: el.clientWidth, h: Math.max(420, el.clientHeight) }
      const core = simRef.current.find((n) => n.id === 'core')
      if (core) {
        core.fx = size.current.w / 2
        core.fy = size.current.h / 2
      }
    }
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const onPointerDown = (id: string, e: ReactPointerEvent) => {
    ;(e.currentTarget as Element).setPointerCapture(e.pointerId)
    dragId.current = id
    setSelectedId(id)
  }

  const onPointerMove = (e: ReactPointerEvent<SVGSVGElement>) => {
    if (!dragId.current || !svgRef.current) return
    const rect = svgRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * size.current.w
    const y = ((e.clientY - rect.top) / rect.height) * size.current.h
    const n = simRef.current.find((s) => s.id === dragId.current)
    if (n && n.id !== 'core') {
      n.fx = x
      n.fy = y
      n.x = x
      n.y = y
    }
  }

  const onPointerUp = () => {
    const n = simRef.current.find((s) => s.id === dragId.current)
    if (n && n.id !== 'core') {
      n.fx = undefined
      n.fy = undefined
    }
    dragId.current = null
  }

  const applySubstitute = useCallback(() => {
    if (!sub) return
    setNodes((prev) =>
      prev.map((n) => {
        if (n.id === sub.fromId) return { ...n, hidden: true }
        if (n.id === sub.toId) return { ...n, hidden: false, budget: Math.max(0, n.budget) }
        return n
      }),
    )
    setSelectedId(sub.toId)
    setHighlight([sub.toId, 'living', 'core'])
    setToast(`已平替：${sub.toLabel}（预算 ${sub.budgetDelta}）`)
    setTimeout(() => setToast(null), 3200)
  }, [sub])

  const onAsk = async (e: FormEvent) => {
    e.preventDefault()
    if (!ask.trim()) return
    setAsking(true)
    try {
      const res = await api.galaxyAsk(ask.trim())
      setReply(res.reply)
      setHighlight(res.highlightIds)
      if (res.highlightIds[0]) setSelectedId(res.highlightIds[0])
      if (res.styleHint) {
        setToast(`风格线索：${res.styleHint}`)
        setTimeout(() => setToast(null), 2800)
      }
    } catch (err) {
      setReply(err instanceof Error ? err.message : '提问失败')
    } finally {
      setAsking(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#070b12] font-mono text-sm text-violet-300/70">
        初始化引力场…
      </div>
    )
  }
  if (error || !raw) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#070b12] text-warn">
        <p>{error || '星系数据不可用'}</p>
        <Link to="/" className="text-sm text-teal-bright">
          回首页
        </Link>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#070b12] text-chalk">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-xs text-chalk/40 hover:text-chalk">
            ← 栖见
          </Link>
          <div>
            <p className="font-mono text-[10px] tracking-widest text-violet-300/80">SPATIAL GRAPH · 决策星图</p>
            <h1 className="font-display text-lg sm:text-xl">{raw.title}</h1>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs sm:gap-3">
          <span className="text-chalk/45">
            ≈ ¥{spent.toLocaleString()}
            <span className="hidden text-chalk/30 sm:inline"> / 池 {raw.totalBudget.toLocaleString()}</span>
          </span>
          <button
            type="button"
            className="min-h-10 rounded border border-white/15 px-2.5 lg:hidden"
            onClick={() => setShowTimeline((v) => !v)}
          >
            {showTimeline ? '收起时间轴' : '时间轴'}
          </button>
          <button
            type="button"
            className="min-h-10 rounded border border-violet-400/40 px-2.5 text-violet-200 lg:hidden"
            onClick={() => setShowCopilot((v) => !v)}
          >
            {showCopilot ? '收起分析' : 'AI 分析'}
          </button>
          <Link to="/cases" className="hidden rounded border border-white/15 px-3 py-1.5 hover:bg-white/5 sm:inline">
            去案例
          </Link>
          <Link to="/sandbox" className="rounded border border-lime-500/30 px-3 py-1.5 text-lime-300 hover:bg-lime-500/10">
            沙盘
          </Link>
        </div>
      </header>

      {/* Mobile compact phase slider */}
      <div className="border-b border-white/10 px-4 py-2 lg:hidden">
        <input
          type="range"
          min={0}
          max={3}
          value={phaseIdx}
          onChange={(e) => setPhaseIdx(Number(e.target.value))}
          className="w-full accent-violet-400"
          aria-label="演进时间轴"
        />
        <p className="mt-1 font-mono text-[10px] text-chalk/40">阶段 · {visiblePhase}</p>
      </div>

      <div className="mx-auto grid w-full max-w-[1400px] flex-1 grid-cols-1 lg:grid-cols-[200px_1fr_300px]">
        {/* Timeline */}
        <aside
          className={`border-b border-white/10 p-4 lg:block lg:border-r lg:border-b-0 ${
            showTimeline ? 'block' : 'hidden'
          }`}
        >
          <p className="font-mono text-[10px] tracking-widest text-chalk/40">TIMELINE</p>
          <div className="relative mt-6 ml-3 border-l border-violet-500/40 pl-4">
            {raw.phases.map((p, i) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPhaseIdx(i)}
                className={`mb-6 block text-left transition ${
                  i === phaseIdx ? 'text-violet-200' : i < phaseIdx ? 'text-chalk/70' : 'text-chalk/35'
                }`}
              >
                <span
                  className={`absolute -left-[5px] mt-1.5 h-2.5 w-2.5 rounded-full ${
                    i <= phaseIdx ? 'bg-violet-400 shadow-[0_0_10px_#a78bfa]' : 'bg-chalk/20'
                  }`}
                />
                <span className="font-mono text-[10px]">{p.id.toUpperCase()}</span>
                <span className="mt-0.5 block text-sm">{p.label}</span>
              </button>
            ))}
          </div>
          <input
            type="range"
            min={0}
            max={3}
            value={phaseIdx}
            onChange={(e) => setPhaseIdx(Number(e.target.value))}
            className="mt-2 hidden w-full accent-violet-400 lg:block"
            aria-label="演进时间轴"
          />
          <p className="mt-2 hidden font-mono text-[10px] text-chalk/40 lg:block">
            拖动查看阶段亮起 · 当前 {visiblePhase}
          </p>
        </aside>

        {/* Canvas */}
        <section className="relative min-h-[360px] overflow-hidden sm:min-h-[480px]">
          <div
            className="absolute inset-0 opacity-40"
            style={{
              background:
                'radial-gradient(ellipse at center, rgba(139,92,246,0.18) 0%, transparent 55%), radial-gradient(ellipse at 20% 80%, rgba(14,165,233,0.12) 0%, transparent 40%)',
            }}
          />
          <svg
            ref={svgRef}
            viewBox={`0 0 ${size.current.w} ${size.current.h}`}
            className="absolute inset-0 h-full w-full touch-none"
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
          >
            {activeEdges.map((e) => {
              const a = positions[e.source]
              const b = positions[e.target]
              if (!a || !b) return null
              const conflict = e.kind === 'conflict'
              const constraint = e.kind === 'constraint'
              const hi =
                highlight.includes(e.source) && highlight.includes(e.target)
              return (
                <line
                  key={e.id}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke={conflict ? '#f43f5e' : constraint ? '#38bdf8' : hi ? '#c4b5fd' : '#334155'}
                  strokeWidth={conflict || constraint ? 2 : 1}
                  strokeOpacity={conflict ? 0.9 : 0.55}
                  strokeDasharray={constraint ? '6 4' : undefined}
                />
              )
            })}
            {activeNodes.map((n) => {
              const p = positions[n.id]
              if (!p) return null
              const hi = highlight.includes(n.id) || selectedId === n.id
              const fill =
                n.kind === 'core'
                  ? '#7c3aed'
                  : n.kind === 'room'
                    ? '#0f766e'
                    : n.concern
                      ? '#b45309'
                      : '#1e293b'
              return (
                <g
                  key={n.id}
                  transform={`translate(${p.x},${p.y})`}
                  className="cursor-grab active:cursor-grabbing"
                  onPointerDown={(e) => onPointerDown(n.id, e)}
                >
                  {hi && (
                    <circle r={p.r + 8} fill="none" stroke="#c4b5fd" strokeOpacity="0.5">
                      <animate attributeName="r" values={`${p.r + 6};${p.r + 12};${p.r + 6}`} dur="2s" repeatCount="indefinite" />
                    </circle>
                  )}
                  <circle
                    r={p.r}
                    fill={fill}
                    stroke={hi ? '#e9d5ff' : '#94a3b8'}
                    strokeWidth={hi ? 2 : 1}
                    opacity={0.95}
                  />
                  <text
                    textAnchor="middle"
                    y={4}
                    fill="#f8fafc"
                    fontSize={n.kind === 'core' ? 12 : 10}
                    fontFamily="Noto Sans SC, sans-serif"
                    style={{ pointerEvents: 'none' }}
                  >
                    {n.label.length > 6 ? `${n.label.slice(0, 5)}…` : n.label}
                  </text>
                </g>
              )
            })}
          </svg>
          {toast && (
            <div className="absolute top-4 left-1/2 z-10 -translate-x-1/2 rounded-lg border border-violet-400/40 bg-violet-950/90 px-4 py-2 text-sm text-violet-100">
              {toast}
            </div>
          )}
        </section>

        {/* AI panel */}
        <aside
          className={`border-t border-white/10 bg-[#0c1220]/95 p-4 backdrop-blur lg:block lg:border-t-0 lg:border-l ${
            showCopilot ? 'block' : 'hidden'
          }`}
        >
          <p className="font-mono text-[10px] tracking-widest text-chalk/40">AI COPILOT</p>
          {selected ? (
            <div className="mt-3 space-y-3">
              <h2 className="font-display text-xl text-chalk">{selected.label}</h2>
              <p className="font-mono text-sm text-violet-200">
                ¥{selected.budget.toLocaleString()}
              </p>
              {selected.eco && (
                <p className="text-xs text-chalk/60">环保：{selected.eco}</p>
              )}
              {selected.priceNote && (
                <p className="text-xs text-chalk/60">市场：{selected.priceNote}</p>
              )}
              {selected.styleTags?.length > 0 && (
                <p className="text-xs text-chalk/50">标签：{selected.styleTags.join(' · ')}</p>
              )}
              {selected.concern && (
                <div className="rounded-lg border border-rose-400/40 bg-rose-500/10 p-3 text-sm text-rose-100">
                  <p className="font-mono text-[10px] text-rose-300">RI ANALYSIS</p>
                  <p className="mt-1">{selected.concern}</p>
                </div>
              )}
              {activeEdges
                .filter(
                  (e) =>
                    (e.source === selected.id || e.target === selected.id) &&
                    e.kind !== 'contains',
                )
                .map((e) => (
                  <p key={e.id} className="text-xs text-sky-300/90">
                    联动：{e.note || e.kind}
                  </p>
                ))}
              {sub && selectedId === sub.fromId && (
                <button
                  type="button"
                  onClick={applySubstitute}
                  className="min-h-11 w-full rounded-lg bg-violet-600 text-sm font-semibold text-white hover:bg-violet-500"
                >
                  一键平替 · {sub.toLabel}（{sub.budgetDelta}）
                </button>
              )}
              {sub && selectedId === sub.fromId && (
                <p className="text-[11px] text-chalk/45">{sub.reason}</p>
              )}
            </div>
          ) : (
            <p className="mt-4 text-sm text-chalk/50">点击节点查看分析</p>
          )}

          {reply && (
            <div className="mt-6 rounded-lg border border-white/10 bg-white/5 p-3 text-sm leading-relaxed text-chalk/80">
              {reply}
            </div>
          )}

          <div className="mt-6">
            <p className="mb-2 font-mono text-[10px] text-chalk/40">试试这些</p>
            <div className="flex flex-col gap-1.5">
              {raw.prompts.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setAsk(p)}
                  className="rounded border border-white/10 px-2 py-1.5 text-left text-[11px] text-chalk/60 hover:border-violet-400/40 hover:text-chalk"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* NL bar */}
      <form
        onSubmit={onAsk}
        className="border-t border-white/10 bg-[#0a0f18] px-4 py-3 sm:px-6"
      >
        <div className="mx-auto flex max-w-[1400px] gap-2">
          <label className="sr-only" htmlFor="galaxy-ask">
            Ask a question
          </label>
          <input
            id="galaxy-ask"
            value={ask}
            onChange={(e) => setAsk(e.target.value)}
            placeholder="Ask a question：帮我搭配一套原木风的客餐厅，预算 3 万"
            className="min-h-12 flex-1 rounded-lg border border-white/15 bg-white/5 px-4 text-sm text-chalk outline-none placeholder:text-chalk/35 focus:border-violet-400"
          />
          <button
            type="submit"
            disabled={asking}
            className="min-h-12 rounded-lg bg-violet-600 px-5 text-sm font-semibold text-white hover:bg-violet-500 disabled:opacity-50"
          >
            {asking ? '…' : '发送'}
          </button>
        </div>
      </form>
    </div>
  )
}
