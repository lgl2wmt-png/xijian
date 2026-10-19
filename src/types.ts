export type StyleTag =
  | '现代简约'
  | '日式原木'
  | '轻奢法式'
  | '奶油风'
  | '工业风'

export interface StyleCard {
  name: StyleTag
  blurb: string
  image: string
  area: string
  budget: string
  city: string
}

export interface CaseItem {
  id: string
  title: string
  style: StyleTag
  area: number
  layout: string
  city: string
  budget: number
  duration: number
  cover: string
  images: string[]
  before?: string
  after?: string
  designerId: string
  summary: string
}

export interface Designer {
  id: string
  name: string
  avatar: string
  years: number
  styles: StyleTag[]
  layouts: string[]
  budgetRange: [number, number]
  rating: number
  reviewCount: number
  city: string
  bio: string
  works: string[]
}

export interface Review {
  id: string
  author: string
  designerId: string
  score: number
  text: string
  photos: boolean
  date: string
}

export type StageStatus = 'done' | 'active' | 'pending'

export interface ProgressStage {
  id: string
  name: string
  planDate: string
  actualDate?: string
  status: StageStatus
  owner: string
  photo?: string
  note?: string
  accepted?: boolean
}

export interface ProjectProgress {
  id: string
  name: string
  address: string
  startDate: string
  endPlan: string
  budgetTotal: number
  budgetUsed: number
  status?: string
  weather?: string
  stages: ProgressStage[]
}

export interface HudZone {
  id: string
  name: string
  x: number
  y: number
  w: number
  h: number
  status: StageStatus
  stageName?: string
  photo?: string
}

export interface HudData {
  project: {
    id: string
    name: string
    address: string
    status: string
    weather: string
    budgetTotal: number
    budgetUsed: number
    budgetPct: number
    daysElapsed: number
    daysTotal: number
    completion: number
  }
  stages: ProgressStage[]
  zones: HudZone[]
  logs: { ts: string; message: string }[]
  expenses: { category: string; amount: number }[]
  materials: { name: string; stock: number; consumed: number; alert: number }[]
  healthTrend: { day: string; planned: number; actual: number }[]
  quality: { dimension: string; score: number }[]
  acceptances: { title: string; status: string; createdAt: string }[]
}

export type GalaxyPhase = 'design' | 'hard' | 'soft' | 'movein'

export interface GalaxyNode {
  id: string
  label: string
  kind: 'core' | 'room' | 'item'
  parent?: string
  budget: number
  eco?: string
  priceNote?: string
  concern?: string
  styleTags: string[]
  phase: GalaxyPhase
  hidden?: boolean
}

export interface GalaxyEdge {
  id: string
  source: string
  target: string
  kind: 'contains' | 'constraint' | 'conflict'
  note?: string
}

export interface GalaxySubstitute {
  fromId: string
  toId: string
  toLabel: string
  budgetDelta: number
  reason: string
}

export interface GalaxyData {
  title: string
  totalBudget: number
  phases: { id: GalaxyPhase; label: string }[]
  nodes: GalaxyNode[]
  edges: GalaxyEdge[]
  substitutes: GalaxySubstitute[]
  prompts: string[]
}

export interface GalaxyAskResult {
  question: string
  reply: string
  highlightIds: string[]
  styleHint: string | null
}

/** Crowdsourced renovation task order (客户发单 / 工人接单 / 后台审核). */
export type OrderStatus =
  | 'pending_review' // 待审核
  | 'open' // 待接单
  | 'in_progress' // 进行中
  | 'completed' // 已完成
  | 'rejected' // 已驳回

export type WorkerTrade =
  | 'plumbing' // 水电
  | 'carpentry' // 木工
  | 'painting' // 油漆
  | 'tiling' // 泥瓦
  | 'install' // 安装

export interface Order {
  id: string
  clientId: string
  title: string
  description: string
  budget: number
  trade: WorkerTrade
  status: OrderStatus
  workerId: string | null
  createdAt: string
  updatedAt: string
}

export type AppRole = 'client' | 'worker' | 'admin'

/** 工人资质：已认证 / 待认证 / 已禁用 */
export type WorkerCertStatus = 'verified' | 'pending' | 'disabled'

export interface WorkerProfile {
  id: string
  name: string
  trade: WorkerTrade
  city: string
  phone: string
  /** @deprecated prefer certStatus */
  enabled: boolean
  certStatus: WorkerCertStatus
  years: number
}
