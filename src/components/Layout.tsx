import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { LanguageSwitcher } from './LanguageSwitcher'

export function Layout() {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const isHome = pathname === '/'
  const [menuOpen, setMenuOpen] = useState(false)

  const nav = useMemo(
    () => [
      { to: '/', label: t('nav.inspire'), hint: t('nav.inspireHint') },
      { to: '/galaxy', label: t('nav.galaxy'), hint: t('nav.galaxyHint') },
      { to: '/cases', label: t('nav.cases'), hint: t('nav.casesHint') },
      { to: '/designers', label: t('nav.designers'), hint: t('nav.designersHint') },
      { to: '/progress', label: t('nav.progress'), hint: t('nav.progressHint') },
    ],
    [t],
  )

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    [
      'min-w-0 max-w-[9.5rem] rounded-md px-2.5 py-2.5 text-sm transition-colors sm:max-w-[11rem] sm:px-3 sm:py-1.5 lg:max-w-none',
      isActive
        ? isHome
          ? 'bg-white/15 text-white'
          : 'bg-ink text-chalk'
        : isHome
          ? 'text-chalk/75 hover:text-white'
          : 'text-ink-soft/70 hover:text-ink',
    ].join(' ')

  return (
    <div className="flex min-h-screen flex-col">
      <header
        className={`sticky top-0 z-50 transition-colors ${
          isHome
            ? 'border-b border-white/10 bg-ink/70 text-chalk backdrop-blur-md'
            : 'border-b border-mist/40 bg-paper/90 text-ink backdrop-blur-md'
        }`}
      >
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-2 px-4 sm:h-16 sm:gap-3 sm:px-6">
          <NavLink to="/" className="group flex min-w-0 shrink-0 items-baseline gap-2">
            <span className="font-display truncate text-2xl tracking-tight">{t('common.brand')}</span>
            <span
              className={`hidden text-xs tracking-widest uppercase sm:inline ${
                isHome ? 'text-chalk/60' : 'text-ink-soft/50'
              }`}
            >
              {t('common.brandEn')}
            </span>
          </NavLink>

          <nav
            className="hidden min-w-0 flex-1 items-center justify-center gap-0.5 overflow-x-auto md:flex sm:gap-1"
            aria-label={t('nav.aria')}
          >
            {nav.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.to === '/'} className={linkClass}>
                <span className="block truncate leading-none" title={item.label}>
                  {item.label}
                </span>
                <span
                  className={`mt-0.5 hidden truncate text-[10px] leading-none lg:block ${
                    isHome ? 'text-chalk/45' : 'text-ink-soft/40'
                  }`}
                  title={item.hint}
                >
                  {item.hint}
                </span>
              </NavLink>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <div className="hidden min-w-fit sm:block">
              <LanguageSwitcher variant={isHome ? 'light' : 'dark'} />
            </div>
            <button
              type="button"
              className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-md md:hidden ${
                isHome ? 'hover:bg-white/10' : 'hover:bg-ink/5'
              }`}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              aria-label={menuOpen ? t('nav.closeMenu') : t('nav.openMenu')}
              onClick={() => setMenuOpen((v) => !v)}
            >
              <span className="sr-only">{t('nav.menu')}</span>
              <span className="flex w-5 flex-col gap-1.5" aria-hidden>
                <span
                  className={`block h-0.5 w-full origin-center transition ${
                    isHome ? 'bg-chalk' : 'bg-ink'
                  } ${menuOpen ? 'translate-y-2 rotate-45' : ''}`}
                />
                <span
                  className={`block h-0.5 w-full transition ${
                    isHome ? 'bg-chalk' : 'bg-ink'
                  } ${menuOpen ? 'opacity-0' : ''}`}
                />
                <span
                  className={`block h-0.5 w-full origin-center transition ${
                    isHome ? 'bg-chalk' : 'bg-ink'
                  } ${menuOpen ? '-translate-y-2 -rotate-45' : ''}`}
                />
              </span>
            </button>
          </div>
        </div>

        {menuOpen && (
          <div
            id="mobile-nav"
            className={`border-t md:hidden ${
              isHome ? 'border-white/10 bg-ink/95' : 'border-mist/40 bg-paper/98'
            }`}
          >
            <div className="px-4 pt-3 sm:hidden">
              <LanguageSwitcher variant={isHome ? 'light' : 'dark'} />
            </div>
            <nav
              className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3"
              aria-label={t('nav.mobileAria')}
            >
              {nav.map((item) => (
                <NavLink key={item.to} to={item.to} end={item.to === '/'} className={linkClass}>
                  <span className="truncate font-medium" title={item.label}>
                    {item.label}
                  </span>
                  <span
                    className={`ms-2 truncate text-xs ${isHome ? 'text-chalk/45' : 'text-ink-soft/45'}`}
                    title={item.hint}
                  >
                    {item.hint}
                  </span>
                </NavLink>
              ))}
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-mist/50 bg-ink pb-[max(0px,env(safe-area-inset-bottom))] text-chalk">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 sm:flex-row sm:items-end sm:justify-between sm:px-6">
          <div className="min-w-0">
            <p className="font-display text-xl">{t('common.brand')}</p>
            <p className="mt-2 max-w-md text-sm text-chalk/65">{t('footer.blurb')}</p>
          </div>
          <p className="shrink-0 text-xs text-chalk/45">{t('footer.license')}</p>
        </div>
      </footer>
    </div>
  )
}
