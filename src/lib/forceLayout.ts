export type SimNode = {
  id: string
  x: number
  y: number
  vx: number
  vy: number
  r: number
  fx?: number
  fy?: number
}

export type SimEdge = { source: string; target: string }

/** 轻量力导向：无需 D3，足够演示级星系图 */
export function tickForce(
  nodes: SimNode[],
  edges: SimEdge[],
  width: number,
  height: number,
  alpha = 0.35,
) {
  const byId = new Map(nodes.map((n) => [n.id, n]))
  const cx = width / 2
  const cy = height / 2

  // repulsion
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i]
      const b = nodes[j]
      let dx = b.x - a.x
      let dy = b.y - a.y
      let dist = Math.hypot(dx, dy) || 0.01
      const minDist = a.r + b.r + 18
      if (dist < minDist) dist = minDist
      const force = ((800 * alpha) / (dist * dist)) * 40
      const fx = (dx / dist) * force
      const fy = (dy / dist) * force
      if (a.fx == null) {
        a.vx -= fx
        a.vy -= fy
      }
      if (b.fx == null) {
        b.vx += fx
        b.vy += fy
      }
    }
  }

  // spring edges
  for (const e of edges) {
    const a = byId.get(e.source)
    const b = byId.get(e.target)
    if (!a || !b) continue
    const dx = b.x - a.x
    const dy = b.y - a.y
    const dist = Math.hypot(dx, dy) || 0.01
    const ideal = a.r + b.r + 70
    const force = (dist - ideal) * 0.02 * alpha
    const fx = (dx / dist) * force
    const fy = (dy / dist) * force
    if (a.fx == null) {
      a.vx += fx
      a.vy += fy
    }
    if (b.fx == null) {
      b.vx -= fx
      b.vy -= fy
    }
  }

  // center gravity (core stronger via radius already)
  for (const n of nodes) {
    if (n.fx != null) {
      n.x = n.fx
      n.y = n.fy ?? n.y
      n.vx = 0
      n.vy = 0
      continue
    }
    n.vx += (cx - n.x) * 0.008 * alpha
    n.vy += (cy - n.y) * 0.008 * alpha
    n.vx *= 0.85
    n.vy *= 0.85
    n.x += n.vx
    n.y += n.vy
    n.x = Math.min(width - n.r, Math.max(n.r, n.x))
    n.y = Math.min(height - n.r, Math.max(n.r, n.y))
  }
}
