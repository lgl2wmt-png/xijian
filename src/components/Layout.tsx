import { NavLink, Outlet, useLocation } from 'react-router-dom'

const nav = [
  { to: '/', label: '灵感', hint: '从场景开始' },
  { to: '/galaxy', label: '星图', hint: '设计决策' },
  { to: '/cases', label: '案例', hint: '方案筛选' },
  { to: '/designers', label: '找服务', hint: '信任与人选' },
  { to: '/progress', label: '我的', hint: '过程管控' },
]

export function Layout() {
  const { pathname } = useLocation()
  const isHome = pathname === '/'

  return (
    <div className="min-h-screen flex flex-col">
      <header
        className={`sticky top-0 z-50 transition-colors ${
          isHome
            ? 'bg-ink/70 text-chalk backdrop-blur-md border-b border-white/10'
            : 'bg-paper/90 text-ink backdrop-blur-md border-b border-mist/40'
        }`}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <NavLink to="/" className="group flex items-baseline gap-2">
            <span className="font-display text-2xl tracking-tight">栖见</span>
            <span
              className={`hidden text-xs tracking-widest uppercase sm:inline ${
                isHome ? 'text-chalk/60' : 'text-ink-soft/50'
              }`}
            >
              XIJIAN
            </span>
          </NavLink>

          <nav className="flex items-center gap-1 sm:gap-2" aria-label="主旅程">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  [
                    'rounded-md px-2.5 py-1.5 text-sm transition-colors sm:px-3',
                    isActive
                      ? isHome
                        ? 'bg-white/15 text-white'
                        : 'bg-ink text-chalk'
                      : isHome
                        ? 'text-chalk/75 hover:text-white'
                        : 'text-ink-soft/70 hover:text-ink',
                  ].join(' ')
                }
              >
                <span className="block leading-none">{item.label}</span>
                <span
                  className={`mt-0.5 hidden text-[10px] leading-none sm:block ${
                    isHome ? 'text-chalk/45' : 'text-ink-soft/40'
                  }`}
                >
                  {item.hint}
                </span>
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-mist/50 bg-ink text-chalk">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 sm:flex-row sm:items-end sm:justify-between sm:px-6">
          <div>
            <p className="font-display text-xl">栖见</p>
            <p className="mt-2 max-w-md text-sm text-chalk/65">
              开源家装旅程平台 · 每个页面只解决一个焦虑：从哪开始、能不能实现、选谁、做得怎么样。
            </p>
          </div>
          <p className="text-xs text-chalk/45">MIT License · Demo 数据仅供演示</p>
        </div>
      </footer>
    </div>
  )
}
