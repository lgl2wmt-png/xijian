import type { GalaxyAskResult, StyleTag } from '../types'
import {
  getMockHud,
  getMockProject,
  mockCases,
  mockDesigners,
  mockGalaxy,
  mockReviews,
  mockStages,
  mockStyles,
} from './mockData'

function delay<T>(value: T, ms = 120): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

let bookingSeq = 100

export const mockApi = {
  health: () => delay({ ok: true as const, service: 'xijian-mock', time: new Date().toISOString() }),

  styles: () => delay([...mockStyles]),

  cases: (style?: string) =>
    delay(
      style && style !== '全部风格'
        ? mockCases.filter((c) => c.style === style)
        : [...mockCases],
    ),

  case: async (id: string) => {
    const item = mockCases.find((c) => c.id === id)
    if (!item) throw new Error('case not found')
    return delay(item)
  },

  designers: (q: {
    layout?: string
    style?: string
    budgetMin?: number
    budgetMax?: number
  }) => {
    const budgetMin = q.budgetMin ?? 0
    const budgetMax = q.budgetMax ?? 999
    const list = mockDesigners.filter((d) => {
      const layoutOk =
        !q.layout || q.layout === '全部户型' || d.layouts.includes(q.layout)
      const styleOk =
        !q.style ||
        q.style === '全部风格' ||
        d.styles.includes(q.style as StyleTag)
      const budgetOk = d.budgetRange[0] <= budgetMax && d.budgetRange[1] >= budgetMin
      return layoutOk && styleOk && budgetOk
    })
    return delay(list)
  },

  designer: async (id: string) => {
    const d = mockDesigners.find((x) => x.id === id)
    if (!d) throw new Error('designer not found')
    const reviews = mockReviews.filter((r) => r.designerId === id)
    return delay({ ...d, reviews })
  },

  createBooking: async (_body: {
    designerId: string
    name: string
    phone: string
    city: string
    fromCase?: string
  }) => delay({ id: ++bookingSeq }),

  createQuote: async (body: { caseId?: string; area: number; phone: string }) => {
    const a = Number(body.area) || 80
    const estimateMin = Math.round(a * 0.28)
    return delay({ estimateMin, estimateMax: estimateMin + 8 })
  },

  myProject: () => delay(getMockProject()),

  acceptStage: async (_projectId: string, stageId: string) => {
    const stage = mockStages.find((s) => s.id === stageId)
    if (!stage) throw new Error('stage not found')
    stage.accepted = true
    return delay({ ok: true as const })
  },

  rectifyStage: async (_projectId: string, stageId: string, note?: string) => {
    const stage = mockStages.find((s) => s.id === stageId)
    if (!stage) throw new Error('stage not found')
    stage.note = note || '业主提出整改'
    return delay({ ok: true as const })
  },

  hud: (_projectId = 'p1') => delay(getMockHud()),

  galaxy: () => delay({ ...mockGalaxy, nodes: [...mockGalaxy.nodes], edges: [...mockGalaxy.edges] }),

  galaxyAsk: async (question: string): Promise<GalaxyAskResult> => {
    const q = question.trim()
    if (!q) throw new Error('请输入问题')
    let highlightIds: string[] = []
    let reply = ''
    let styleHint: string | null = null
    if (/平替|太贵|超预算|岩板/.test(q)) {
      highlightIds = ['tvwall', 'slab', 'living']
      reply =
        '检测到预算压力：建议将「大理石电视墙」平替为「岩板电视墙」，约节省 8000 元，并降低基层成本。'
    } else if (/原木|日式/.test(q)) {
      highlightIds = ['woodfloor', 'wardrobe', 'cabinet', 'bedroom', 'kitchen']
      styleHint = '日式原木'
      reply = '已按原木风高亮主卧地板、衣柜与橱柜节点。'
    } else if (/奶油/.test(q)) {
      highlightIds = ['sofa', 'living', 'slab']
      styleHint = '奶油风'
      reply = '奶油风路径：客厅布艺沙发 + 岩板浅色电视墙。'
    } else if (/马桶|智能|水电|插座/.test(q)) {
      highlightIds = ['toilet', 'socket', 'bath']
      reply = '智能马桶会牵动：预留插座（水电）、可能移位（泥瓦）。'
    } else if (/石膏|冲突|空调/.test(q)) {
      highlightIds = ['gypsum', 'ac', 'ceiling']
      reply = '复古石膏线与中央空调出风口存在冲突风险。'
    } else if (/预算|软装/.test(q)) {
      highlightIds = ['sofa', 'living', 'core']
      reply = `软装预算紧张时，建议先锁定沙发与灯具。总池 ${mockGalaxy.totalBudget / 10000} 万。`
    } else {
      highlightIds = ['core', 'living', 'bedroom']
      reply = '已理解你的描述。可继续问：平替、原木风搭配、智能马桶工序影响。'
    }
    return delay({ question: q, reply, highlightIds, styleHint })
  },
}
