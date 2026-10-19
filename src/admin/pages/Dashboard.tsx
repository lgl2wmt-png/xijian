import { useEffect, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, Col, Row, Statistic, Typography } from 'antd'
import {
  EyeOutlined,
  FileImageOutlined,
  RiseOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import { init, use as registerEcharts } from 'echarts/core'
import { LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { adminKpi, listCases, listDesigners } from '../mockStore'

registerEcharts([LineChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer])

export function AdminDashboard() {
  const { t, i18n } = useTranslation()
  const chartRef = useRef<HTMLDivElement>(null)
  const caseCount = listCases().length
  const designerCount = listDesigners().length
  const labels = useMemo(
    () => [
      t('weekdays.mon'),
      t('weekdays.tue'),
      t('weekdays.wed'),
      t('weekdays.thu'),
      t('weekdays.fri'),
      t('weekdays.sat'),
      t('weekdays.sun'),
    ],
    [t],
  )

  useEffect(() => {
    const el = chartRef.current
    if (!el) return

    const chart = init(el)
    chart.setOption({
      color: ['#0b6e6a'],
      tooltip: { trigger: 'axis' },
      legend: { data: [t('admin.visitSeries')] },
      grid: { left: 48, right: 24, top: 48, bottom: 36 },
      xAxis: { type: 'category', data: labels, boundaryGap: false },
      yAxis: { type: 'value', splitLine: { lineStyle: { type: 'dashed' } } },
      series: [
        {
          name: t('admin.visitSeries'),
          type: 'line',
          smooth: true,
          showSymbol: true,
          symbolSize: 8,
          areaStyle: { color: 'rgba(11,110,106,0.15)' },
          lineStyle: { width: 3 },
          data: adminKpi.visitTrend,
        },
      ],
    })

    const resize = () => chart.resize()
    const t1 = window.setTimeout(resize, 0)
    const t2 = window.setTimeout(resize, 120)
    window.addEventListener('resize', resize)

    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
      window.removeEventListener('resize', resize)
      chart.dispose()
    }
  }, [t, labels, i18n.language])

  return (
    <div>
      <Typography.Title level={4} style={{ marginTop: 0 }}>
        {t('admin.dashboard')}
      </Typography.Title>
      <Typography.Paragraph type="secondary">{t('admin.dashboardDesc')}</Typography.Paragraph>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title={t('admin.visits')}
              value={adminKpi.visits}
              prefix={<EyeOutlined />}
              suffix={<RiseOutlined style={{ color: '#0b6e6a', fontSize: 14 }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic title={t('admin.caseCount')} value={caseCount} prefix={<FileImageOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title={t('admin.designerCount')}
              value={designerCount}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card title={t('admin.visitTrend')} style={{ marginTop: 16 }}>
        <div ref={chartRef} style={{ height: 320, width: '100%', minHeight: 320 }} />
      </Card>
    </div>
  )
}
