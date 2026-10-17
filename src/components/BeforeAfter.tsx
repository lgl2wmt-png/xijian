import { useRef, useState } from 'react'

interface BeforeAfterProps {
  before: string
  after: string
  beforeLabel?: string
  afterLabel?: string
}

export function BeforeAfter({
  before,
  after,
  beforeLabel = '改造前',
  afterLabel = '改造后',
}: BeforeAfterProps) {
  const [pos, setPos] = useState(50)
  const dragging = useRef(false)
  const box = useRef<HTMLDivElement>(null)

  const update = (clientX: number) => {
    const el = box.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const next = ((clientX - rect.left) / rect.width) * 100
    setPos(Math.min(96, Math.max(4, next)))
  }

  return (
    <div
      ref={box}
      className="relative aspect-[16/10] w-full cursor-ew-resize overflow-hidden rounded-xl select-none"
      onPointerDown={(e) => {
        dragging.current = true
        e.currentTarget.setPointerCapture(e.pointerId)
        update(e.clientX)
      }}
      onPointerMove={(e) => {
        if (dragging.current) update(e.clientX)
      }}
      onPointerUp={() => {
        dragging.current = false
      }}
    >
      <img src={after} alt={afterLabel} className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${pos}%` }}>
        <img
          src={before}
          alt={beforeLabel}
          className="h-full max-w-none object-cover"
          style={{ width: box.current ? `${box.current.clientWidth}px` : '100%' }}
        />
      </div>
      <div
        className="absolute inset-y-0 w-0.5 bg-white shadow-[0_0_12px_rgba(0,0,0,0.35)]"
        style={{ left: `${pos}%` }}
      >
        <div className="absolute top-1/2 left-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-ink shadow-md">
          <span className="text-xs font-semibold">↔</span>
        </div>
      </div>
      <span className="absolute bottom-3 left-3 rounded bg-ink/70 px-2 py-1 text-xs text-chalk">
        {beforeLabel}
      </span>
      <span className="absolute right-3 bottom-3 rounded bg-ink/70 px-2 py-1 text-xs text-chalk">
        {afterLabel}
      </span>
    </div>
  )
}
