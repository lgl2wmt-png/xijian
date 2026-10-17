import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import { useFetch } from '../hooks/useFetch'

const layoutOpts = ['全部户型', '小户型', '老房改造', '大平层', '别墅'] as const
const styleOpts = ['全部风格', '现代简约', '日式原木', '轻奢法式', '奶油风'] as const
const budgetOpts = [
  { label: '全部预算', min: 0, max: 999 },
  { label: '15万以内', min: 0, max: 15 },
  { label: '15–35万', min: 15, max: 35 },
  { label: '35万以上', min: 35, max: 999 },
] as const

export function Designers() {
  const [layout, setLayout] = useState<(typeof layoutOpts)[number]>('全部户型')
  const [style, setStyle] = useState<(typeof styleOpts)[number]>('全部风格')
  const [budget, setBudget] = useState(0)
  const b = budgetOpts[budget]

  const { data: list, loading, error } = useFetch(
    () =>
      api.designers({
        layout,
        style,
        budgetMin: b.min,
        budgetMax: b.max,
      }),
    [layout, style, budget],
  )

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <header className="max-w-2xl">
        <h1 className="font-display text-3xl text-ink sm:text-4xl">找服务</h1>
        <p className="mt-3 text-ink-soft/75">
          筛选对齐真实决策语言：擅长户型、预算区间、风格——而不只是头像和评分。
        </p>
      </header>

      <div className="mt-8 flex flex-col gap-4">
        <FilterRow label="擅长户型">
          {layoutOpts.map((o) => (
            <Chip key={o} active={layout === o} onClick={() => setLayout(o)}>
              {o}
            </Chip>
          ))}
        </FilterRow>
        <FilterRow label="风格">
          {styleOpts.map((o) => (
            <Chip key={o} active={style === o} onClick={() => setStyle(o)}>
              {o}
            </Chip>
          ))}
        </FilterRow>
        <FilterRow label="预算区间">
          {budgetOpts.map((o, i) => (
            <Chip key={o.label} active={budget === i} onClick={() => setBudget(i)}>
              {o.label}
            </Chip>
          ))}
        </FilterRow>
      </div>

      {loading && <p className="mt-10 text-ink-soft/60">加载设计师…</p>}
      {error && <p className="mt-10 text-warn">{error}</p>}

      <ul className="mt-10 space-y-4">
        {(list || []).map((d) => (
          <li key={d.id}>
            <Link
              to={`/designers/${d.id}`}
              className="flex flex-col gap-4 rounded-2xl bg-paper/80 p-5 ring-1 ring-mist/60 transition hover:ring-teal/40 sm:flex-row sm:items-center"
            >
              <img src={d.avatar} alt={d.name} className="h-20 w-20 rounded-full object-cover" />
              <div className="flex-1">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h2 className="font-display text-xl text-ink">{d.name}</h2>
                  <span className="text-sm text-ink-soft/60">
                    {d.city} · {d.years} 年 · {d.rating}（{d.reviewCount}）
                  </span>
                </div>
                <p className="mt-2 text-sm text-ink-soft/80">{d.bio}</p>
                <p className="mt-3 text-xs text-ink-soft/55">
                  {d.layouts.join(' / ')} · {d.styles.join(' / ')} · 预算 {d.budgetRange[0]}–
                  {d.budgetRange[1]}万
                </p>
              </div>
              <span className="text-sm font-medium text-teal sm:self-center">查看代表作 →</span>
            </Link>
          </li>
        ))}
      </ul>

      {!loading && list?.length === 0 && (
        <p className="mt-12 text-ink-soft/60">没有匹配的设计师，放宽一个筛选条件试试。</p>
      )}
    </div>
  )
}

function FilterRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-xs tracking-wide text-ink-soft/50">{label}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  )
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-10 rounded-lg px-3 text-sm transition ${
        active
          ? 'bg-ink text-chalk'
          : 'bg-paper/90 text-ink-soft ring-1 ring-mist/70 hover:ring-ink/20'
      }`}
    >
      {children}
    </button>
  )
}
