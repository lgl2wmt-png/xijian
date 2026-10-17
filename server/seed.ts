import { db } from './db.js'

export function seedIfEmpty() {
  const caseCount = db.prepare('SELECT COUNT(*) AS n FROM cases').get() as { n: number }
  if (caseCount.n > 0) {
    console.log('[seed] already populated, skip')
    return
  }

  const seed = db.transaction(() => {
    const insertCase = db.prepare(`
      INSERT INTO cases VALUES (@id,@title,@style,@area,@layout,@city,@budget,@duration,@cover,@images,@before_img,@after_img,@designer_id,@summary)
    `)
    const insertDesigner = db.prepare(`
      INSERT INTO designers VALUES (@id,@name,@avatar,@years,@styles,@layouts,@budget_min,@budget_max,@rating,@review_count,@city,@bio,@works)
    `)
    const insertReview = db.prepare(`
      INSERT INTO reviews VALUES (@id,@author,@designer_id,@score,@text,@photos,@date)
    `)

    insertDesigner.run({
      id: 'd1',
      name: '林知夏',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&q=80',
      years: 9,
      styles: JSON.stringify(['现代简约', '奶油风']),
      layouts: JSON.stringify(['小户型', '老房改造']),
      budget_min: 15,
      budget_max: 35,
      rating: 4.9,
      review_count: 128,
      city: '上海',
      bio: '相信空间应该服务于生活节奏，而不是风格标签。',
      works: JSON.stringify(['c1', 'c4']),
    })
    insertDesigner.run({
      id: 'd2',
      name: '青山彻',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&q=80',
      years: 12,
      styles: JSON.stringify(['日式原木']),
      layouts: JSON.stringify(['小户型', '大平层']),
      budget_min: 12,
      budget_max: 40,
      rating: 4.8,
      review_count: 96,
      city: '杭州',
      bio: '材料诚实，工艺克制，把「空」留给家人。',
      works: JSON.stringify(['c2']),
    })
    insertDesigner.run({
      id: 'd3',
      name: '苏晚晴',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&q=80',
      years: 7,
      styles: JSON.stringify(['轻奢法式', '现代简约']),
      layouts: JSON.stringify(['大平层', '别墅']),
      budget_min: 30,
      budget_max: 80,
      rating: 4.9,
      review_count: 74,
      city: '深圳',
      bio: '用光影与比例做奢，而不是堆砌。',
      works: JSON.stringify(['c3']),
    })

    insertCase.run({
      id: 'c1',
      title: '80㎡老房，如何多出一间书房',
      style: '现代简约',
      area: 80,
      layout: '两室一厅',
      city: '上海·静安',
      budget: 22,
      duration: 75,
      cover: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200&q=80',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200&q=80',
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80',
        'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&q=80',
      ]),
      before_img: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=900&q=80',
      after_img: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=900&q=80',
      designer_id: 'd1',
      summary: '打通阳台与客厅，用可移动书柜分隔出半开放书房，不动承重墙完成功能升级。',
    })
    insertCase.run({
      id: 'c2',
      title: '76㎡日式小宅：原木与收纳共生',
      style: '日式原木',
      area: 76,
      layout: '两室一厅',
      city: '杭州·余杭',
      budget: 18,
      duration: 68,
      cover: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1200&q=80',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1200&q=80',
        'https://images.unsplash.com/photo-1615529328331-f8917597711f?w=1200&q=80',
      ]),
      before_img: null,
      after_img: null,
      designer_id: 'd2',
      summary: '全屋定制地台与壁柜，把晾晒、储物、睡卧整合进同一木色体系。',
    })
    insertCase.run({
      id: 'c3',
      title: '120㎡轻奢：客餐厅一体的弧线叙事',
      style: '轻奢法式',
      area: 120,
      layout: '三室两厅',
      city: '深圳·南山',
      budget: 42,
      duration: 95,
      cover: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&q=80',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&q=80',
        'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=1200&q=80',
      ]),
      before_img: null,
      after_img: null,
      designer_id: 'd3',
      summary: '弧形吊顶与金属线条引导动线，厨房做半开放中岛，兼顾宴请与日常。',
    })
    insertCase.run({
      id: 'c4',
      title: '95㎡奶油风：给孩子一间可长大的房',
      style: '奶油风',
      area: 95,
      layout: '三室一厅',
      city: '成都·高新',
      budget: 26,
      duration: 80,
      cover: 'https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=1200&q=80',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=1200&q=80',
        'https://images.unsplash.com/photo-1615874959474-d609969a20ed?w=1200&q=80',
      ]),
      before_img: null,
      after_img: null,
      designer_id: 'd1',
      summary: '儿童房预留可拆隔断，学龄后可改为书房，软装全部可替换。',
    })

    insertReview.run({
      id: 'r1',
      author: '陈先生 · 静安业主',
      designer_id: 'd1',
      score: 5,
      text: '工期比合同晚了三天，但每天都有现场照片。水电验收我提了两处整改，都在三天内改完。',
      photos: 1,
      date: '2025-11',
    })
    insertReview.run({
      id: 'r2',
      author: '周女士 · 余杭业主',
      designer_id: 'd2',
      score: 4,
      text: '原木色比效果图略深一档，沟通后换了板材。整体满意，扣一星是材料延期一周。',
      photos: 1,
      date: '2025-09',
    })
    insertReview.run({
      id: 'r3',
      author: '王女士 · 南山业主',
      designer_id: 'd3',
      score: 5,
      text: '中岛尺寸现场微调后更好用。敢展示整改记录的平台，我反而更放心。',
      photos: 0,
      date: '2026-01',
    })

    db.prepare(`
      INSERT INTO projects VALUES ('p1','保利天悦 · 01 户','上海市静安区','2026-01-08','2026-04-08',220000,149600,'normal','阴转多云 16°C · 明日宜贴砖')
    `).run()

    const stages = [
      ['s1', '水电', '01-20', '01-19', 'done', '工长 · 张师傅', 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&q=80', '卫生间增加地暖回路，已验收。', 1, 1],
      ['s2', '泥瓦', '02-15', '02-18', 'done', '泥工 · 李师傅', 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&q=80', '防水闭水 48h 通过，瓷砖空鼓率 0。', 0, 2],
      ['s3', '木工', '03-05', null, 'active', '木工 · 赵师傅', 'https://images.unsplash.com/photo-1556912173-46c336c7fd55?w=600&q=80', '书柜柜体安装中，预计 03-08 完成。', 0, 3],
      ['s4', '油漆', '03-20', null, 'pending', '待排班', null, null, 0, 4],
      ['s5', '安装', '04-02', null, 'pending', '待排班', null, null, 0, 5],
    ] as const

    const insertStage = db.prepare(`
      INSERT INTO stages (id,project_id,name,plan_date,actual_date,status,owner,photo,note,accepted,sort_order)
      VALUES (?,?,?,?,?,?,?,?,?,?,?)
    `)
    for (const s of stages) {
      insertStage.run(s[0], 'p1', s[1], s[2], s[3], s[4], s[5], s[6], s[7], s[8], s[9])
    }

    const insertZone = db.prepare(`
      INSERT INTO zones VALUES (@id,@project_id,@name,@x,@y,@w,@h,@status,@stage_name,@photo)
    `)
    insertZone.run({
      id: 'z1', project_id: 'p1', name: '客厅', x: 8, y: 18, w: 42, h: 38,
      status: 'done', stage_name: '泥瓦', photo: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&q=80',
    })
    insertZone.run({
      id: 'z2', project_id: 'p1', name: '主卧', x: 54, y: 12, w: 38, h: 32,
      status: 'active', stage_name: '木工', photo: 'https://images.unsplash.com/photo-1556912173-46c336c7fd55?w=400&q=80',
    })
    insertZone.run({
      id: 'z3', project_id: 'p1', name: '厨卫', x: 8, y: 60, w: 28, h: 28,
      status: 'done', stage_name: '水电', photo: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&q=80',
    })
    insertZone.run({
      id: 'z4', project_id: 'p1', name: '次卧', x: 54, y: 50, w: 38, h: 36,
      status: 'pending', stage_name: '油漆', photo: null,
    })

    const insertLog = db.prepare('INSERT INTO site_logs (project_id,ts,message) VALUES (?,?,?)')
    for (const [ts, message] of [
      ['10:23', '瓦工张师傅 入场'],
      ['11:05', '主卧柜体板材清点完成 · 18 件'],
      ['12:40', '午饭轮换，现场断电休息'],
      ['14:00', '完成卫生间防水涂刷复查'],
      ['15:22', '书柜侧板安装 · 进度 60%'],
      ['16:10', '材料员登记：五金件到货'],
    ]) {
      insertLog.run('p1', ts, message)
    }

    const insertExp = db.prepare('INSERT INTO expenses (project_id,category,amount) VALUES (?,?,?)')
    for (const [c, a] of [
      ['主材', 62000],
      ['辅材', 18500],
      ['人工', 48000],
      ['定制', 16000],
      ['其他', 5100],
    ] as const) {
      insertExp.run('p1', c, a)
    }

    const insertMat = db.prepare(
      'INSERT INTO materials (project_id,name,stock,consumed,alert) VALUES (?,?,?,?,?)',
    )
    for (const [n, s, c, a] of [
      ['瓷砖', 120, 95, 0],
      ['板材', 40, 28, 0],
      ['油漆', 18, 2, 1],
      ['管材', 80, 80, 0],
      ['五金', 200, 45, 0],
      ['水泥', 30, 30, 0],
    ] as const) {
      insertMat.run('p1', n, s, c, a)
    }

    const insertHp = db.prepare(
      'INSERT INTO health_points (project_id,day,planned,actual) VALUES (?,?,?,?)',
    )
    for (const [d, p, a] of [
      ['W1', 12, 14],
      ['W2', 28, 26],
      ['W3', 45, 42],
      ['W4', 58, 55],
      ['W5', 70, 61],
      ['W6', 82, 68],
    ] as const) {
      insertHp.run('p1', d, p, a)
    }

    const insertQ = db.prepare(
      'INSERT INTO quality_scores (project_id,dimension,score) VALUES (?,?,?)',
    )
    for (const [d, s] of [
      ['验收合格率', 96],
      ['平整度', 92],
      ['垂直度', 90],
      ['水电规范', 94],
      ['防水闭水', 98],
      ['空鼓率', 88],
    ] as const) {
      insertQ.run('p1', d, s)
    }

    const insertAcc = db.prepare(
      'INSERT INTO acceptances (project_id,title,status,created_at) VALUES (?,?,?,?)',
    )
    insertAcc.run('p1', '水电隐蔽工程验收', '已通过', '2026-01-19')
    insertAcc.run('p1', '泥瓦防水闭水验收', '待业主确认', '2026-02-18')
    insertAcc.run('p1', '主卧柜体整改单 #03', '整改中', '2026-03-06')
  })

  seed()
  console.log('[seed] done → server/data/xijian.sqlite')
}

// CLI: npm run seed
const isDirect =
  Boolean(process.argv[1]) &&
  (process.argv[1].endsWith('seed.ts') || process.argv[1].endsWith('seed.js'))
if (isDirect) {
  import('./db.js').then(({ migrate }) => {
    migrate()
    seedIfEmpty()
  })
}
