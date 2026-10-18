/** Unsplash / 外链图片统一走 WebP（CDN 支持 fm=webp） */
export function toWebp(url: string | undefined | null): string {
  if (!url) return ''
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

export function toWebpAll(urls: string[] | undefined): string[] {
  return (urls || []).map(toWebp)
}
