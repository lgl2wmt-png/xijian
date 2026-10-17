import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { useFetch } from '../hooks/useFetch'

const trust = ['平台担保交易', '环保材料可溯源', '先行赔付', '真实业主评价']

export function Home() {
  const navigate = useNavigate()
  const [hint, setHint] = useState('')
  const { data: styles, loading } = useFetch(() => api.styles(), [])

  const onDiagnose = (e: FormEvent) => {
    e.preventDefault()
    navigate('/cases', { state: { query: hint || '户型诊断' } })
  }

  return (
    <div>
      <section className="relative min-h-[92vh] overflow-hidden grain">
        <img
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1800&q=85"
          alt="老房改造后的明亮客厅"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/25" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_40%,transparent_0%,rgba(21,32,43,0.35)_100%)]" />

        <div className="relative mx-auto flex min-h-[92vh] max-w-6xl flex-col justify-end px-4 pb-20 pt-28 sm:px-6 sm:pb-24">
          <p className="animate-fade-up font-display text-4xl text-chalk sm:text-6xl lg:text-7xl text-balance">
            栖见
          </p>
          <h1 className="animate-fade-up-delay mt-4 max-w-2xl font-display text-2xl leading-snug text-chalk/95 sm:text-3xl lg:text-4xl text-balance">
            80㎡老房，如何多出一间书房
          </h1>
          <p className="animate-fade-up-delay-2 mt-4 max-w-lg text-base text-chalk/70 sm:text-lg">
            不知道从哪开始？先上传户型，让系统带你走完灵感到方案的第一步。
          </p>

          <form
            onSubmit={onDiagnose}
            className="animate-fade-up-delay-2 mt-8 flex w-full max-w-xl flex-col gap-3 sm:flex-row"
          >
            <label className="sr-only" htmlFor="floorplan">
              描述户型或上传意向
            </label>
            <input
              id="floorplan"
              value={hint}
              onChange={(e) => setHint(e.target.value)}
              placeholder="例如：两室一厅，想加书房，预算 20 万"
              className="min-h-12 flex-1 rounded-lg border border-white/20 bg-white/10 px-4 text-chalk placeholder:text-chalk/45 outline-none backdrop-blur-sm focus:border-teal-bright"
            />
            <button
              type="submit"
              className="min-h-12 rounded-lg bg-teal px-6 text-sm font-semibold text-white transition hover:bg-teal-bright"
            >
              AI 户型诊断
            </button>
          </form>
        </div>
      </section>

      <section className="border-b border-mist/50 bg-paper/80">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-8 gap-y-3 px-4 py-5 sm:px-6">
          {trust.map((t) => (
            <span key={t} className="flex items-center gap-2 text-sm text-ink-soft">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-teal animate-soft-pulse" />
              {t}
            </span>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="max-w-xl">
          <h2 className="font-display text-3xl text-ink sm:text-4xl">从风格走进案例</h2>
          <p className="mt-3 text-ink-soft/75">
            浏览时自然形成预算与风格认知——每张图都带着面积、造价与城市。
          </p>
        </div>

        <div className="mt-10 flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory">
          {loading && <p className="text-ink-soft/60">加载风格…</p>}
          {(styles || []).map((s) => (
            <Link
              key={s.name}
              to={`/cases?style=${encodeURIComponent(s.name)}`}
              className="group relative h-[420px] w-[78vw] max-w-[320px] shrink-0 snap-start overflow-hidden rounded-2xl sm:w-[300px]"
            >
              <img
                src={s.image}
                alt={s.name}
                className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/25 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 text-chalk">
                <p className="font-display text-2xl">{s.name}</p>
                <p className="mt-1 text-sm text-chalk/70">{s.blurb}</p>
                <p className="mt-4 text-xs tracking-wide text-chalk/55">
                  {s.area} · {s.budget} · {s.city}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-t border-mist/50 bg-ink text-chalk">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div>
            <h2 className="font-display text-3xl sm:text-4xl">种草之后，立刻能行动</h2>
            <p className="mt-4 max-w-md text-chalk/65">
              内容流里穿插同款报价与设计师入口，避免「看完就走」。
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <Link
              to="/galaxy"
              className="min-h-12 rounded-lg bg-teal px-5 py-3 text-center text-sm font-semibold text-white hover:bg-teal-bright"
            >
              打开决策星图
            </Link>
            <Link
              to="/cases/c1"
              className="min-h-12 rounded-lg border border-chalk/25 px-5 py-3 text-center text-sm font-medium text-chalk hover:bg-white/5"
            >
              看同款案例报价
            </Link>
            <Link
              to="/designers"
              className="min-h-12 rounded-lg border border-chalk/25 px-5 py-3 text-center text-sm font-medium text-chalk hover:bg-white/5"
            >
              找同款设计师
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
