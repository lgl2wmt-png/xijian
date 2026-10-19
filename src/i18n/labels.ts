import type { TFunction } from 'i18next'

/** Chinese domain values from API / filters → i18n keys */
const MAP: Record<string, string> = {
  全部户型: 'catalog.layoutAll',
  小户型: 'catalog.layoutSmall',
  老房改造: 'catalog.layoutReno',
  大平层: 'catalog.layoutFlat',
  别墅: 'catalog.layoutVilla',
  两室一厅: 'catalog.layout2br',
  全部风格: 'catalog.styleAll',
  现代简约: 'catalog.styleModern',
  日式原木: 'catalog.styleJapandi',
  轻奢法式: 'catalog.styleFrench',
  奶油风: 'catalog.styleCream',
  工业风: 'catalog.styleIndustrial',
  全部预算: 'catalog.budgetAll',
  '15万以内': 'catalog.budgetLow',
  '15–35万': 'catalog.budgetMid',
  '35万以上': 'catalog.budgetHigh',
}

export function labelOf(t: TFunction, zh: string): string {
  const key = MAP[zh]
  return key ? t(key) : zh
}
