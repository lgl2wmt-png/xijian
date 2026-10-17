import { Link } from 'react-router-dom'

interface StickyCtaProps {
  primaryTo: string
  primaryLabel: string
  secondaryTo?: string
  secondaryLabel?: string
}

function Action({
  to,
  className,
  children,
}: {
  to: string
  className: string
  children: React.ReactNode
}) {
  if (to.startsWith('#')) {
    return (
      <a href={to} className={className}>
        {children}
      </a>
    )
  }
  return (
    <Link to={to} className={className}>
      {children}
    </Link>
  )
}

export function StickyCta({
  primaryTo,
  primaryLabel,
  secondaryTo,
  secondaryLabel,
}: StickyCtaProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-mist/60 bg-paper/95 p-3 backdrop-blur-md sm:p-4">
      <div className="mx-auto flex max-w-6xl gap-3">
        {secondaryTo && secondaryLabel && (
          <Action
            to={secondaryTo}
            className="flex min-h-11 flex-1 items-center justify-center rounded-lg border border-ink/15 px-4 text-sm font-medium text-ink transition hover:bg-chalk"
          >
            {secondaryLabel}
          </Action>
        )}
        <Action
          to={primaryTo}
          className="flex min-h-11 flex-[1.4] items-center justify-center rounded-lg bg-teal px-4 text-sm font-semibold text-white transition hover:bg-teal-bright"
        >
          {primaryLabel}
        </Action>
      </div>
    </div>
  )
}
