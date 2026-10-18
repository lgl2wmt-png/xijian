/** 服务端：外链图统一 WebP */
export function toWebp(url: string | null | undefined): string | undefined {
  if (!url) return undefined
  if (!url.includes('images.unsplash.com')) return url
  try {
    const u = new URL(url)
    u.searchParams.set('fm', 'webp')
    u.searchParams.set('auto', 'format')
    if (!u.searchParams.has('q')) u.searchParams.set('q', '80')
    return u.toString()
  } catch {
    return url
  }
}

export function toWebpList(jsonOrArr: string | string[]): string[] {
  const arr = typeof jsonOrArr === 'string' ? (JSON.parse(jsonOrArr) as string[]) : jsonOrArr
  return arr.map((u) => toWebp(u) || u)
}
