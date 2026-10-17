/** 设计期「星系决策图」静态图谱（可被前端本地调预算后回写） */

export type GalaxyNode = {
  id: string
  label: string
  kind: 'core' | 'room' | 'item'
  parent?: string
  budget: number
  eco?: string
  priceNote?: string
  concern?: string
  styleTags: string[]
  phase: 'design' | 'hard' | 'soft' | 'movein'
  hidden?: boolean
}

export type GalaxyEdge = {
  id: string
  source: string
  target: string
  kind: 'contains' | 'constraint' | 'conflict'
  note?: string
}

export type GalaxySubstitute = {
  fromId: string
  toId: string
  toLabel: string
  budgetDelta: number
  reason: string
}

export const galaxyBundle = {
  title: '80㎡ 老房改造 · 决策星图',
  totalBudget: 220000,
  phases: [
    { id: 'design', label: '设计阶段' },
    { id: 'hard', label: '硬装施工' },
    { id: 'soft', label: '软装进场' },
    { id: 'movein', label: '入住' },
  ],
  nodes: [
    {
      id: 'core',
      label: '全屋预算池',
      kind: 'core',
      budget: 220000,
      styleTags: ['现代简约'],
      phase: 'design',
      priceNote: '硬装+部分定制，不含家电',
    },
    {
      id: 'living',
      label: '客厅',
      kind: 'room',
      parent: 'core',
      budget: 68000,
      styleTags: ['现代简约', '奶油风'],
      phase: 'design',
    },
    {
      id: 'bedroom',
      label: '主卧',
      kind: 'room',
      parent: 'core',
      budget: 42000,
      styleTags: ['现代简约'],
      phase: 'design',
    },
    {
      id: 'kitchen',
      label: '厨房',
      kind: 'room',
      parent: 'core',
      budget: 55000,
      styleTags: ['现代简约'],
      phase: 'design',
    },
    {
      id: 'bath',
      label: '卫生间',
      kind: 'room',
      parent: 'core',
      budget: 35000,
      styleTags: ['现代简约'],
      phase: 'hard',
    },
    {
      id: 'sofa',
      label: '布艺沙发',
      kind: 'item',
      parent: 'living',
      budget: 8000,
      eco: 'OEKO-TEX',
      styleTags: ['奶油风', '现代简约'],
      phase: 'soft',
      priceNote: '市场均价 6–12k',
    },
    {
      id: 'tvwall',
      label: '大理石电视墙',
      kind: 'item',
      parent: 'living',
      budget: 18000,
      eco: '天然石材 · 注意氡',
      styleTags: ['轻奢法式'],
      phase: 'hard',
      concern: 'Critical：严重超客厅软装预算占比，基层找平成本高',
      priceNote: '岩板平替可省约 8k',
    },
    {
      id: 'ac',
      label: '中央空调',
      kind: 'item',
      parent: 'living',
      budget: 22000,
      eco: '一级能效',
      styleTags: ['现代简约'],
      phase: 'hard',
      concern: '需预留吊顶高度 ≥ 280mm',
    },
    {
      id: 'ceiling',
      label: '吊顶高度',
      kind: 'item',
      parent: 'living',
      budget: 6000,
      styleTags: ['现代简约'],
      phase: 'hard',
      priceNote: '与中央空调强约束',
    },
    {
      id: 'gypsum',
      label: '复古石膏线',
      kind: 'item',
      parent: 'living',
      budget: 3500,
      styleTags: ['轻奢法式'],
      phase: 'hard',
      concern: '与中央空调出风口位置可能冲突',
    },
    {
      id: 'wardrobe',
      label: '定制衣柜',
      kind: 'item',
      parent: 'bedroom',
      budget: 16000,
      eco: 'E0 板材',
      styleTags: ['日式原木', '现代简约'],
      phase: 'hard',
    },
    {
      id: 'woodfloor',
      label: '原木地板',
      kind: 'item',
      parent: 'bedroom',
      budget: 12000,
      eco: 'FSC',
      styleTags: ['日式原木'],
      phase: 'hard',
      priceNote: '强化地板平替可省 4k',
    },
    {
      id: 'cabinet',
      label: '橱柜',
      kind: 'item',
      parent: 'kitchen',
      budget: 28000,
      eco: 'ENF 级',
      styleTags: ['现代简约', '日式原木'],
      phase: 'hard',
    },
    {
      id: 'tile',
      label: '岩板台面',
      kind: 'item',
      parent: 'kitchen',
      budget: 9000,
      eco: '低吸水率',
      styleTags: ['现代简约'],
      phase: 'hard',
    },
    {
      id: 'toilet',
      label: '智能马桶',
      kind: 'item',
      parent: 'bath',
      budget: 6500,
      eco: '节水 3 档',
      styleTags: ['现代简约'],
      phase: 'soft',
      concern: '需预留插座 + 可能移位泥瓦',
    },
    {
      id: 'socket',
      label: '预留插座',
      kind: 'item',
      parent: 'bath',
      budget: 400,
      styleTags: ['现代简约'],
      phase: 'hard',
    },
    {
      id: 'slab',
      label: '岩板电视墙（平替）',
      kind: 'item',
      parent: 'living',
      budget: 10000,
      eco: '低辐射',
      styleTags: ['现代简约', '奶油风'],
      phase: 'hard',
      priceNote: '大理石平替方案',
      hidden: true,
    },
  ] as GalaxyNode[],
  edges: [
    { id: 'e1', source: 'core', target: 'living', kind: 'contains' },
    { id: 'e2', source: 'core', target: 'bedroom', kind: 'contains' },
    { id: 'e3', source: 'core', target: 'kitchen', kind: 'contains' },
    { id: 'e4', source: 'core', target: 'bath', kind: 'contains' },
    { id: 'e5', source: 'living', target: 'sofa', kind: 'contains' },
    { id: 'e6', source: 'living', target: 'tvwall', kind: 'contains' },
    { id: 'e7', source: 'living', target: 'ac', kind: 'contains' },
    { id: 'e8', source: 'living', target: 'ceiling', kind: 'contains' },
    { id: 'e9', source: 'living', target: 'gypsum', kind: 'contains' },
    { id: 'e10', source: 'bedroom', target: 'wardrobe', kind: 'contains' },
    { id: 'e11', source: 'bedroom', target: 'woodfloor', kind: 'contains' },
    { id: 'e12', source: 'kitchen', target: 'cabinet', kind: 'contains' },
    { id: 'e13', source: 'kitchen', target: 'tile', kind: 'contains' },
    { id: 'e14', source: 'bath', target: 'toilet', kind: 'contains' },
    { id: 'e15', source: 'bath', target: 'socket', kind: 'contains' },
    {
      id: 'e16',
      source: 'ac',
      target: 'ceiling',
      kind: 'constraint',
      note: '改空调机型会联动吊顶高度与预算',
    },
    {
      id: 'e17',
      source: 'toilet',
      target: 'socket',
      kind: 'constraint',
      note: '智能马桶 → 必须增加预留插座',
    },
    {
      id: 'e18',
      source: 'gypsum',
      target: 'ac',
      kind: 'conflict',
      note: '石膏线与出风口位置冲突风险',
    },
    {
      id: 'e19',
      source: 'living',
      target: 'slab',
      kind: 'contains',
    },
  ] as GalaxyEdge[],
  substitutes: [
    {
      fromId: 'tvwall',
      toId: 'slab',
      toLabel: '岩板电视墙',
      budgetDelta: -8000,
      reason: '观感接近，基层与运费更低，适合预算回收',
    },
    {
      fromId: 'woodfloor',
      toId: 'woodfloor',
      toLabel: '强化地板（示意）',
      budgetDelta: -4000,
      reason: '保留原木色调，牺牲部分脚感',
    },
  ] as GalaxySubstitute[],
  prompts: [
    '帮我搭配一套原木风的客餐厅，预算 3 万软装',
    '电视墙太贵了，有什么平替？',
    '智能马桶会牵动哪些工序？',
  ],
}
