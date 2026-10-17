import cors from 'cors'
import express from 'express'
import fs from 'node:fs'
import http from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { WebSocketServer, type WebSocket } from 'ws'
import { db, migrate } from './db.js'
import { galaxyBundle } from './galaxy-data.js'
import { seedIfEmpty } from './seed.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const staticDir = process.env.SERVE_STATIC || path.join(__dirname, '..', 'dist')

migrate()
seedIfEmpty()

const app = express()
const PORT = Number(process.env.PORT) || 8787

app.use(cors())
app.use(express.json())

function mapCase(row: Record<string, unknown>) {
  return {
    id: row.id,
    title: row.title,
    style: row.style,
    area: row.area,
    layout: row.layout,
    city: row.city,
    budget: row.budget,
    duration: row.duration,
    cover: row.cover,
    images: JSON.parse(String(row.images)),
    before: row.before_img || undefined,
    after: row.after_img || undefined,
    designerId: row.designer_id,
    summary: row.summary,
  }
}

function mapDesigner(row: Record<string, unknown>) {
  return {
    id: row.id,
    name: row.name,
    avatar: row.avatar,
    years: row.years,
    styles: JSON.parse(String(row.styles)),
    layouts: JSON.parse(String(row.layouts)),
    budgetRange: [row.budget_min, row.budget_max] as [number, number],
    rating: row.rating,
    reviewCount: row.review_count,
    city: row.city,
    bio: row.bio,
    works: JSON.parse(String(row.works)),
  }
}

function mapStage(row: Record<string, unknown>) {
  return {
    id: row.id,
    name: row.name,
    planDate: row.plan_date,
    actualDate: row.actual_date || undefined,
    status: row.status,
    owner: row.owner,
    photo: row.photo || undefined,
    note: row.note || undefined,
    accepted: Boolean(row.accepted),
  }
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'xijian-api', time: new Date().toISOString() })
})

app.get('/api/styles', (_req, res) => {
  res.json([
    {
      name: '现代简约',
      blurb: '少即是多，让光线成为主角',
      image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&q=80',
      area: '89㎡',
      budget: '18–28万',
      city: '上海',
    },
    {
      name: '日式原木',
      blurb: '木纹与留白，日常也像度假',
      image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=80',
      area: '76㎡',
      budget: '15–22万',
      city: '杭州',
    },
    {
      name: '轻奢法式',
      blurb: '弧线与金属，仪式感不喧哗',
      image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80',
      area: '120㎡',
      budget: '35–50万',
      city: '深圳',
    },
    {
      name: '奶油风',
      blurb: '暖色包裹，下班即回家',
      image: 'https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=800&q=80',
      area: '95㎡',
      budget: '20–30万',
      city: '成都',
    },
  ])
})

app.get('/api/cases', (req, res) => {
  const style = String(req.query.style || '')
  const rows = style
    ? db.prepare('SELECT * FROM cases WHERE style = ?').all(style)
    : db.prepare('SELECT * FROM cases').all()
  res.json(rows.map((r) => mapCase(r as Record<string, unknown>)))
})

app.get('/api/cases/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM cases WHERE id = ?').get(req.params.id)
  if (!row) return res.status(404).json({ error: 'case not found' })
  res.json(mapCase(row as Record<string, unknown>))
})

app.get('/api/designers', (req, res) => {
  const layout = String(req.query.layout || '')
  const style = String(req.query.style || '')
  const budgetMin = Number(req.query.budgetMin ?? 0)
  const budgetMax = Number(req.query.budgetMax ?? 999)

  let rows = db.prepare('SELECT * FROM designers').all() as Record<string, unknown>[]
  rows = rows.filter((d) => {
    const layouts = JSON.parse(String(d.layouts)) as string[]
    const styles = JSON.parse(String(d.styles)) as string[]
    const layoutOk = !layout || layout === '全部户型' || layouts.includes(layout)
    const styleOk = !style || style === '全部风格' || styles.includes(style)
    const budgetOk = Number(d.budget_min) <= budgetMax && Number(d.budget_max) >= budgetMin
    return layoutOk && styleOk && budgetOk
  })
  res.json(rows.map(mapDesigner))
})

app.get('/api/designers/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM designers WHERE id = ?').get(req.params.id)
  if (!row) return res.status(404).json({ error: 'designer not found' })
  const reviews = db
    .prepare('SELECT * FROM reviews WHERE designer_id = ?')
    .all(req.params.id)
    .map((r) => {
      const x = r as Record<string, unknown>
      return {
        id: x.id,
        author: x.author,
        designerId: x.designer_id,
        score: x.score,
        text: x.text,
        photos: Boolean(x.photos),
        date: x.date,
      }
    })
  res.json({ ...mapDesigner(row as Record<string, unknown>), reviews })
})

app.post('/api/bookings', (req, res) => {
  const { designerId, name, phone, city, fromCase } = req.body ?? {}
  if (!designerId || !name || !phone || !city) {
    return res.status(400).json({ error: '姓名、手机号、城市、设计师必填' })
  }
  const info = db
    .prepare(
      `INSERT INTO bookings (designer_id,name,phone,city,from_case,created_at)
       VALUES (?,?,?,?,?,?)`,
    )
    .run(designerId, name, phone, city, fromCase || null, new Date().toISOString())
  res.status(201).json({ id: Number(info.lastInsertRowid), ok: true })
})

app.post('/api/quotes', (req, res) => {
  const { caseId, area, phone } = req.body ?? {}
  if (!area || !phone) return res.status(400).json({ error: '面积与手机号必填' })
  const a = Number(area)
  const estimateMin = Math.round(a * 0.28)
  const estimateMax = estimateMin + 8
  const info = db
    .prepare(
      `INSERT INTO quotes (case_id,area,phone,estimate_min,estimate_max,created_at)
       VALUES (?,?,?,?,?,?)`,
    )
    .run(caseId || null, a, phone, estimateMin, estimateMax, new Date().toISOString())
  res.status(201).json({
    id: Number(info.lastInsertRowid),
    estimateMin,
    estimateMax,
  })
})

app.get('/api/projects/mine', (_req, res) => {
  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get('p1') as
    | Record<string, unknown>
    | undefined
  if (!project) return res.status(404).json({ error: 'project not found' })
  const stages = db
    .prepare('SELECT * FROM stages WHERE project_id = ? ORDER BY sort_order')
    .all('p1')
    .map((r) => mapStage(r as Record<string, unknown>))
  res.json({
    id: project.id,
    name: project.name,
    address: project.address,
    startDate: project.start_date,
    endPlan: project.end_plan,
    budgetTotal: project.budget_total,
    budgetUsed: project.budget_used,
    status: project.status,
    weather: project.weather,
    stages,
  })
})

app.post('/api/projects/:id/stages/:stageId/accept', (req, res) => {
  const info = db
    .prepare('UPDATE stages SET accepted = 1 WHERE id = ? AND project_id = ?')
    .run(req.params.stageId, req.params.id)
  if (!info.changes) return res.status(404).json({ error: 'stage not found' })
  const ts = new Date().toTimeString().slice(0, 5)
  db.prepare('INSERT INTO site_logs (project_id,ts,message) VALUES (?,?,?)').run(
    req.params.id,
    ts,
    `业主确认验收 · 工序 ${req.params.stageId}`,
  )
  broadcast(req.params.id, { type: 'log', ts, message: `业主确认验收 · 工序 ${req.params.stageId}` })
  res.json({ ok: true })
})

app.post('/api/projects/:id/stages/:stageId/rectify', (req, res) => {
  const note = String(req.body?.note || '业主提出整改')
  db.prepare('UPDATE stages SET note = ? WHERE id = ? AND project_id = ?').run(
    note,
    req.params.stageId,
    req.params.id,
  )
  db.prepare(
    `INSERT INTO acceptances (project_id,title,status,created_at) VALUES (?,?,?,?)`,
  ).run(req.params.id, note, '整改中', new Date().toISOString().slice(0, 10))
  const ts = new Date().toTimeString().slice(0, 5)
  db.prepare('INSERT INTO site_logs (project_id,ts,message) VALUES (?,?,?)').run(
    req.params.id,
    ts,
    `整改单已创建：${note}`,
  )
  broadcast(req.params.id, { type: 'log', ts, message: `整改单已创建：${note}` })
  res.json({ ok: true })
})

app.get('/api/projects/:id/hud', (req, res) => {
  const id = req.params.id
  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(id) as
    | Record<string, unknown>
    | undefined
  if (!project) return res.status(404).json({ error: 'project not found' })

  const stages = db
    .prepare('SELECT * FROM stages WHERE project_id = ? ORDER BY sort_order')
    .all(id)
    .map((r) => mapStage(r as Record<string, unknown>))

  const zones = db.prepare('SELECT * FROM zones WHERE project_id = ?').all(id).map((r) => {
    const z = r as Record<string, unknown>
    return {
      id: z.id,
      name: z.name,
      x: z.x,
      y: z.y,
      w: z.w,
      h: z.h,
      status: z.status,
      stageName: z.stage_name,
      photo: z.photo || undefined,
    }
  })

  const logs = db
    .prepare('SELECT ts, message FROM site_logs WHERE project_id = ? ORDER BY id DESC LIMIT 30')
    .all(id)

  const expenses = db
    .prepare('SELECT category, amount FROM expenses WHERE project_id = ?')
    .all(id)

  const materials = db
    .prepare('SELECT name, stock, consumed, alert FROM materials WHERE project_id = ?')
    .all(id)

  const healthTrend = db
    .prepare('SELECT day, planned, actual FROM health_points WHERE project_id = ? ORDER BY id')
    .all(id)

  const quality = db
    .prepare('SELECT dimension, score FROM quality_scores WHERE project_id = ?')
    .all(id)

  const acceptances = db
    .prepare(
      'SELECT title, status, created_at AS createdAt FROM acceptances WHERE project_id = ? ORDER BY id DESC',
    )
    .all(id)

  const start = new Date(String(project.start_date))
  const end = new Date(String(project.end_plan))
  const now = new Date('2026-03-07T12:00:00')
  const daysTotal = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000))
  const daysElapsed = Math.min(
    daysTotal,
    Math.max(0, Math.round((now.getTime() - start.getTime()) / 86400000)),
  )
  const budgetPct = Math.round(
    (Number(project.budget_used) / Number(project.budget_total)) * 100,
  )
  const done = stages.filter((s) => s.status === 'done').length
  const completion = Math.round((done / Math.max(1, stages.length)) * 100)

  res.json({
    project: {
      id: project.id,
      name: project.name,
      address: project.address,
      status: project.status,
      weather: project.weather,
      budgetTotal: project.budget_total,
      budgetUsed: project.budget_used,
      budgetPct,
      daysElapsed,
      daysTotal,
      completion,
    },
    stages,
    zones,
    logs,
    expenses,
    materials,
    healthTrend,
    quality,
    acceptances,
  })
})

app.get('/api/galaxy', (_req, res) => {
  res.json(galaxyBundle)
})

app.post('/api/galaxy/ask', (req, res) => {
  const q = String(req.body?.question || '').trim()
  if (!q) return res.status(400).json({ error: '请输入问题' })

  const lower = q.toLowerCase()
  let highlightIds: string[] = []
  let reply = ''
  let styleHint: string | null = null

  if (/平替|太贵|超预算|岩板/.test(q)) {
    highlightIds = ['tvwall', 'slab', 'living']
    reply =
      '检测到预算压力：建议将「大理石电视墙」平替为「岩板电视墙」，约节省 8000 元，并降低基层成本。右侧可一键替换节点。'
  } else if (/原木|日式/.test(q)) {
    highlightIds = ['woodfloor', 'wardrobe', 'cabinet', 'bedroom', 'kitchen']
    styleHint = '日式原木'
    reply =
      '已按原木风高亮主卧地板、衣柜与橱柜节点。软装预算若压在 3 万内，建议优先保留木色主材、简化客厅石材。'
  } else if (/奶油/.test(q)) {
    highlightIds = ['sofa', 'living', 'slab']
    styleHint = '奶油风'
    reply = '奶油风路径：客厅布艺沙发 + 岩板浅色电视墙，避免高对比石材抢戏。'
  } else if (/马桶|智能|水电|插座/.test(q)) {
    highlightIds = ['toilet', 'socket', 'bath']
    reply =
      '智能马桶会牵动：预留插座（水电）、可能移位（泥瓦），预算约 +2000～4000。图中约束连线已标红相关节点。'
  } else if (/石膏|冲突|空调/.test(q)) {
    highlightIds = ['gypsum', 'ac', 'ceiling']
    reply = '复古石膏线与中央空调出风口存在冲突风险（红色连线）。建议取消石膏线或调整风口位置。'
  } else if (/预算|3万|軟装|软装/.test(q) || lower.includes('budget')) {
    highlightIds = ['sofa', 'living', 'core']
    reply = `当前图谱硬装向预算合计偏紧。软装 3 万场景下，建议先锁定沙发与灯具，石材改走平替。总池 ${galaxyBundle.totalBudget / 10000} 万。`
  } else {
    highlightIds = ['core', 'living', 'bedroom']
    reply =
      '已理解你的描述。可继续问：平替、原木风搭配、智能马桶工序影响，或拖动左侧时间轴查看阶段高亮。'
  }

  res.json({ question: q, reply, highlightIds, styleHint })
})

const server = http.createServer(app)
const wss = new WebSocketServer({ server, path: '/ws' })

const rooms = new Map<string, Set<WebSocket>>()

function broadcast(projectId: string, payload: unknown) {
  const set = rooms.get(projectId)
  if (!set) return
  const data = JSON.stringify(payload)
  for (const ws of set) {
    if (ws.readyState === ws.OPEN) ws.send(data)
  }
}

wss.on('connection', (ws, req) => {
  const url = new URL(req.url || '', `http://localhost:${PORT}`)
  const projectId = url.searchParams.get('project') || 'p1'
  if (!rooms.has(projectId)) rooms.set(projectId, new Set())
  rooms.get(projectId)!.add(ws)
  ws.send(JSON.stringify({ type: 'hello', projectId }))

  ws.on('close', () => {
    rooms.get(projectId)?.delete(ws)
  })
})

// Simulated live site activity
const liveMessages = [
  '木工赵师傅调整书柜层板高度',
  '质检抽查主卧垂直度：2mm 内',
  '辅材补货单已提交：哑光清漆 6L',
  '项目管家巡场打卡',
  '同层邻居水电验收通过（参考）',
]
setInterval(() => {
  const msg = liveMessages[Math.floor(Math.random() * liveMessages.length)]
  const ts = new Date().toTimeString().slice(0, 5)
  db.prepare('INSERT INTO site_logs (project_id,ts,message) VALUES (?,?,?)').run('p1', ts, msg)
  broadcast('p1', { type: 'log', ts, message: msg })
}, 12000)

if (fs.existsSync(staticDir)) {
  app.use(express.static(staticDir))
  app.get(/^(?!\/api\/|\/ws).*/, (_req, res) => {
    res.sendFile(path.join(staticDir, 'index.html'))
  })
  console.log(`[xijian-api] static → ${staticDir}`)
}

server.listen(PORT, () => {
  console.log(`[xijian-api] http://localhost:${PORT}`)
  console.log(`[xijian-api] ws://localhost:${PORT}/ws?project=p1`)
})
