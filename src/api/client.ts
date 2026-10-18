import type {
  CaseItem,
  Designer,
  GalaxyAskResult,
  GalaxyData,
  HudData,
  ProjectProgress,
  Review,
  StyleCard,
} from '../types'
import { apiUrl, wsUrl } from '../lib/apiBase'
import { mockApi } from './mockApi'

/**
 * 默认走前端 Mock（Vercel 静态部署无需后端）。
 * 接真实 Express：`.env` 设 `VITE_USE_MOCK=false`，并配置 `VITE_API_BASE`（或同源代理）。
 */
export const useMockApi = import.meta.env.VITE_USE_MOCK !== 'false'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const url = apiUrl(path)
  const headers = new Headers(init?.headers)
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  const res = await fetch(url, { ...init, headers })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error((body as { error?: string }).error || `请求失败 ${res.status}`)
  }
  return res.json() as Promise<T>
}

const liveApi = {
  health: () => request<{ ok: boolean }>('/api/health'),
  styles: () => request<StyleCard[]>('/api/styles'),
  cases: (style?: string) =>
    request<CaseItem[]>(style ? `/api/cases?style=${encodeURIComponent(style)}` : '/api/cases'),
  case: (id: string) => request<CaseItem>(`/api/cases/${id}`),
  designers: (q: { layout?: string; style?: string; budgetMin?: number; budgetMax?: number }) => {
    const params = new URLSearchParams()
    if (q.layout) params.set('layout', q.layout)
    if (q.style) params.set('style', q.style)
    if (q.budgetMin != null) params.set('budgetMin', String(q.budgetMin))
    if (q.budgetMax != null) params.set('budgetMax', String(q.budgetMax))
    const qs = params.toString()
    return request<Designer[]>(`/api/designers${qs ? `?${qs}` : ''}`)
  },
  designer: (id: string) =>
    request<Designer & { reviews: Review[] }>(`/api/designers/${id}`),
  createBooking: (body: {
    designerId: string
    name: string
    phone: string
    city: string
    fromCase?: string
  }) => request<{ id: number }>('/api/bookings', { method: 'POST', body: JSON.stringify(body) }),
  createQuote: (body: { caseId?: string; area: number; phone: string }) =>
    request<{ estimateMin: number; estimateMax: number }>('/api/quotes', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  myProject: () => request<ProjectProgress>('/api/projects/mine'),
  acceptStage: (projectId: string, stageId: string) =>
    request<{ ok: boolean }>(`/api/projects/${projectId}/stages/${stageId}/accept`, {
      method: 'POST',
    }),
  rectifyStage: (projectId: string, stageId: string, note?: string) =>
    request<{ ok: boolean }>(`/api/projects/${projectId}/stages/${stageId}/rectify`, {
      method: 'POST',
      body: JSON.stringify({ note }),
    }),
  hud: (projectId = 'p1') => request<HudData>(`/api/projects/${projectId}/hud`),
  galaxy: () => request<GalaxyData>('/api/galaxy'),
  galaxyAsk: (question: string) =>
    request<GalaxyAskResult>('/api/galaxy/ask', {
      method: 'POST',
      body: JSON.stringify({ question }),
    }),
}

export const api = useMockApi ? mockApi : liveApi

export function siteWsUrl(projectId = 'p1') {
  if (useMockApi) return ''
  return wsUrl(`/ws?project=${projectId}`)
}
