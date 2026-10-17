import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { api } from '../api/client'
import { useFetch } from '../hooks/useFetch'

export function Cases() {
  const [params] = useSearchParams()
  const style = params.get('style') || undefined
  const location = useLocation()
  const query = (location.state as { query?: string } | null)?.query
  const { data: filtered, loading, error } = useFetch(() => api.cases(style), [style])

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <header className="max-w-2xl">
        <h1 className="font-display text-3xl text-ink sm:text-4xl">案例</h1>
        <p className="mt-3 text-ink-soft/75">
          决策发生在这里：每套方案都带面积、造价、工期——不是只能欣赏。
        </p>
        {(style || query) && (
          <p className="mt-4 text-sm text-teal">
            {style ? `风格筛选：${style}` : null}
            {query ? `诊断意向：${query}` : null}
          </p>
        )}
      </header>

      {loading && <p className="mt-10 text-ink-soft/60">从后端加载案例…</p>}
      {error && <p className="mt-10 text-warn">加载失败：{error}（请确认已启动 API）</p>}

      <div className="mt-10 columns-1 gap-6 sm:columns-2">
        {(filtered || []).map((c) => (
          <Link
            key={c.id}
            to={`/cases/${c.id}`}
            className="mb-6 block break-inside-avoid overflow-hidden rounded-2xl bg-paper/70 ring-1 ring-mist/60 transition hover:ring-teal/40"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-chalk-deep">
              <img src={c.cover} alt={c.title} className="h-full w-full object-cover" loading="lazy" />
            </div>
            <div className="p-5">
              <p className="text-xs tracking-wide text-teal">{c.style}</p>
              <h2 className="mt-1 font-display text-xl leading-snug text-ink">{c.title}</h2>
              <p className="mt-3 text-sm text-ink-soft/70">
                {c.area}㎡ · {c.layout} · {c.city}
              </p>
              <p className="mt-1 text-sm font-medium text-ink">
                总造价约 {c.budget} 万 · 工期 {c.duration} 天
              </p>
            </div>
          </Link>
        ))}
      </div>

      {!loading && filtered?.length === 0 && (
        <p className="mt-12 text-ink-soft/60">暂无该风格案例，试试其他入口。</p>
      )}
    </div>
  )
}
