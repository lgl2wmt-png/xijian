import { mockCases, mockDesigners } from '../api/mockData'
import type { CaseItem, Designer, StyleTag } from '../types'

/** In-memory admin store (mutated by CRUD; resets on refresh). */
let cases = mockCases.map((c) => ({ ...c, images: [...c.images] }))
let designers = mockDesigners.map((d) => ({
  ...d,
  styles: [...d.styles] as StyleTag[],
  layouts: [...d.layouts],
  works: [...d.works],
}))

export const adminKpi = {
  visits: 128460,
  visitTrend: [8200, 9100, 8800, 10200, 11500, 12100, 13400],
  visitLabels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
}

export function listCases() {
  return cases
}

export function upsertCase(item: CaseItem) {
  const i = cases.findIndex((c) => c.id === item.id)
  if (i >= 0) cases[i] = item
  else cases = [item, ...cases]
  return item
}

export function removeCase(id: string) {
  cases = cases.filter((c) => c.id !== id)
}

export function nextCaseId() {
  const n = cases.length + 1
  return `c${n}${Date.now().toString(36).slice(-3)}`
}

export function listDesigners(): Designer[] {
  return designers
}

export function upsertDesigner(item: Designer) {
  const i = designers.findIndex((d) => d.id === item.id)
  if (i >= 0) designers[i] = item
  else designers = [item, ...designers]
  return item
}

export function removeDesigner(id: string) {
  designers = designers.filter((d) => d.id !== id)
}

export function nextDesignerId() {
  return `d${designers.length + 1}${Date.now().toString(36).slice(-3)}`
}
