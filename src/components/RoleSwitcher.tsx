import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import type { AppRole } from '../types'
import { useOrderStore } from '../store/orderStore'

type Props = {
  variant?: 'light' | 'dark'
}

const ROLES: AppRole[] = ['client', 'worker', 'admin']

export function RoleSwitcher({ variant = 'dark' }: Props) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const role = useOrderStore((s) => s.role)
  const setRole = useOrderStore((s) => s.setRole)

  const base =
    variant === 'light'
      ? 'border-white/25 bg-white/10 text-chalk'
      : 'border-mist/60 bg-white/80 text-ink'

  return (
    <label className="inline-flex max-w-full min-w-0 items-center gap-1.5">
      <span className="sr-only">{t('nav.role')}</span>
      <select
        aria-label={t('nav.role')}
        className={`min-h-9 min-w-fit max-w-[8.5rem] truncate rounded-md border px-2 py-1 text-sm outline-none focus:border-teal ${base}`}
        value={role}
        onChange={(e) => {
          const next = e.target.value as AppRole
          setRole(next)
          if (next === 'admin') navigate('/admin')
          else if (next === 'worker') navigate('/worker')
          else navigate('/publish')
        }}
      >
        {ROLES.map((r) => (
          <option key={r} value={r}>
            {t(
              r === 'client'
                ? 'nav.roleClient'
                : r === 'worker'
                  ? 'nav.roleWorker'
                  : 'nav.roleAdmin',
            )}
          </option>
        ))}
      </select>
    </label>
  )
}
