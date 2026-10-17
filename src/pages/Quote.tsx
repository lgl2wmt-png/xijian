import { useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '../api/client'
import { useFetch } from '../hooks/useFetch'

export function Quote() {
  const [params] = useSearchParams()
  const caseId = params.get('case') || undefined
  const { data: caseItem } = useFetch(
    () => (caseId ? api.case(caseId) : Promise.resolve(null)),
    [caseId],
  )
  const [done, setDone] = useState<{ min: number; max: number } | null>(null)
  const [area, setArea] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState<string | null>(null)

  const areaValue = area || (caseItem?.area ? String(caseItem.area) : '80')

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      const res = await api.createQuote({
        caseId,
        area: Number(areaValue),
        phone,
      })
      setDone({ min: res.estimateMin, max: res.estimateMax })
    } catch (err) {
      setError(err instanceof Error ? err.message : '提交失败')
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="font-display text-3xl text-ink">获取同户型报价</h1>
      <p className="mt-3 text-ink-soft/75">
        {caseItem
          ? `基于案例「${caseItem.title}」粗算，正式报价需设计师上门量房。`
          : '输入面积，先拿到区间感，再决定是否留资。'}
      </p>

      {done ? (
        <div className="mt-10 rounded-2xl bg-paper/80 p-6 ring-1 ring-mist/60">
          <p className="font-display text-2xl text-ink">
            约 {done.min}–{done.max} 万
          </p>
          <p className="mt-3 text-sm text-ink-soft/70">
            已写入 quotes 表。含基础硬装与部分定制，不含家电软装。
          </p>
          <Link to="/designers" className="mt-6 inline-block text-sm font-medium text-teal">
            去匹配设计师 →
          </Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-8 space-y-5">
          <label className="block text-sm">
            <span className="text-ink-soft/60">建筑面积（㎡）</span>
            <input
              type="number"
              min={20}
              max={500}
              value={areaValue}
              onChange={(e) => setArea(e.target.value)}
              className="mt-1.5 min-h-12 w-full rounded-lg border border-mist bg-paper px-3 outline-none focus:border-teal"
              required
            />
          </label>
          <label className="block text-sm">
            <span className="text-ink-soft/60">手机号</span>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="用于接收报价明细"
              className="mt-1.5 min-h-12 w-full rounded-lg border border-mist bg-paper px-3 outline-none focus:border-teal"
            />
          </label>
          {error && <p className="text-sm text-warn">{error}</p>}
          <button
            type="submit"
            className="min-h-12 w-full rounded-lg bg-teal text-sm font-semibold text-white hover:bg-teal-bright"
          >
            获取报价区间
          </button>
        </form>
      )}
    </div>
  )
}
