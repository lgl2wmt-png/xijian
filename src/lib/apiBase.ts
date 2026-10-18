/**
 * API / WebSocket origin for web, PWA, and Capacitor shells.
 *
 * Priority:
 * 1. `VITE_API_BASE` (build-time, e.g. https://api.example.com or http://192.168.1.8:8787)
 * 2. Same origin when served over http(s) (Vite / Docker / reverse proxy)
 * 3. Empty relative paths as last resort
 *
 * Capacitor WebView is typically `https://localhost` or `capacitor://localhost`,
 * so without VITE_API_BASE the app cannot reach the Node API — set it when packaging.
 */
export function getApiBase(): string {
  const fromEnv = (import.meta.env.VITE_API_BASE as string | undefined)?.trim()
  if (fromEnv) return fromEnv.replace(/\/$/, '')

  if (typeof window === 'undefined') return ''

  const { protocol, host } = window.location
  if (protocol === 'http:' || protocol === 'https:') {
    // Capacitor Android often uses https://localhost — that is NOT the Node API
    if (host === 'localhost' && isLikelyCapacitorShell()) {
      console.warn(
        '[xijian] Capacitor shell detected without VITE_API_BASE; API calls will fail. Set VITE_API_BASE to your LAN/public API.',
      )
      return ''
    }
    return ''
  }

  return ''
}

function isLikelyCapacitorShell(): boolean {
  return (
    !!(window as Window & { Capacitor?: unknown }).Capacitor ||
    document.querySelector('html.plt-capacitor, body.hybrid') != null
  )
}

/** Join API base with a path that must start with `/`. */
export function apiUrl(path: string): string {
  const base = getApiBase()
  const p = path.startsWith('/') ? path : `/${path}`
  return base ? `${base}${p}` : p
}

export function wsUrl(pathWithQuery: string): string {
  const base = getApiBase()
  if (base) {
    const u = new URL(base)
    const proto = u.protocol === 'https:' ? 'wss:' : 'ws:'
    const q = pathWithQuery.startsWith('/') ? pathWithQuery : `/${pathWithQuery}`
    return `${proto}//${u.host}${q}`
  }
  const proto = window.location.protocol === 'https:' ? 'wss' : 'ws'
  const q = pathWithQuery.startsWith('/') ? pathWithQuery : `/${pathWithQuery}`
  return `${proto}://${window.location.host}${q}`
}
