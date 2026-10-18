import { lazy, Suspense, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { HeroPicture } from '../components/HeroPicture'

const HomeBelow = lazy(() =>
  import('./HomeBelow').then((m) => ({ default: m.HomeBelow })),
)

const trust = ['平台担保交易', '环保材料可溯源', '先行赔付', '真实业主评价']

export function Home() {
  const navigate = useNavigate()
  const [hint, setHint] = useState('')

  const onDiagnose = (e: FormEvent) => {
    e.preventDefault()
    navigate('/cases', { state: { query: hint || '户型诊断' } })
  }

  return (
    <div>
      <section className="relative min-h-[92vh] overflow-hidden grain">
        <HeroPicture alt="老房改造后的明亮客厅" />
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

      <Suspense
        fallback={
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6" aria-busy>
            <div className="h-8 w-48 animate-pulse rounded bg-mist/40" />
            <div className="mt-10 flex gap-5">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-[420px] w-[78vw] max-w-[320px] shrink-0 animate-pulse rounded-2xl bg-mist/30 sm:w-[300px]"
                />
              ))}
            </div>
          </div>
        }
      >
        <HomeBelow />
      </Suspense>
    </div>
  )
}
