import { useEffect, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, Col, Row, Statistic, Typography } from 'antd'
import {
  CheckCircleOutlined,
  FieldTimeOutlined,
  FileAddOutlined,
  RiseOutlined,
  WalletOutlined,
} from '@ant-design/icons'
import { init, use as registerEcharts } from 'echarts/core'
import { BarChart, LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { useOrderStore } from '../../store/orderStore'

registerEcharts([
  LineChart,
  BarChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  CanvasRenderer,
])

function isSameDay(iso: string, ref = new Date()) {
  const d = new Date(iso)
  return (
    d.getFullYear() === ref.getFullYear() &&
    d.getMonth() === ref.getMonth() &&
    d.getDate() === ref.getDate()
  )
}

export function AdminDashboard() {
  const { t, i18n } = useTranslation()
  const chartRef = useRef<HTMLDivElement>(null)
  const statusChartRef = useRef<HTMLDivElement>(null)
  const orders = useOrderStore((s) => s.orders)

  const todayNew = orders.filter((o) => isSameDay(o.createdAt)).length
  const openCount = orders.filter((o) => o.status === 'open').length
  const inProgressCount = orders.filter((o) => o.status === 'in_progress').length
  const pendingReview = orders.filter((o) => o.status === 'pending_review').length
  const totalBudget = orders.reduce((sum, o) => sum + o.budget, 0)

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

  const last7Publish = useMemo(() => {
    const days: number[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setHours(12, 0, 0, 0)
      d.setDate(d.getDate() - i)
      days.push(orders.filter((o) => isSameDay(o.createdAt, d)).length)
    }
    return days
  }, [orders])

  const statusCounts = useMemo(
    () => ({
      pending_review: orders.filter((o) => o.status === 'pending_review').length,
      open: orders.filter((o) => o.status === 'open').length,
      in_progress: orders.filter((o) => o.status === 'in_progress').length,
      completed: orders.filter((o) => o.status === 'completed').length,
      rejected: orders.filter((o) => o.status === 'rejected').length,
    }),
    [orders],
  )

  useEffect(() => {
    const el = chartRef.current
    if (!el) return
    const chart = init(el)
    chart.setOption({
      color: ['#0b6e6a'],
      tooltip: { trigger: 'axis' },
      legend: { data: [t('adminDash.publishSeries')] },
      grid: { left: 48, right: 24, top: 48, bottom: 36 },
      xAxis: { type: 'category', data: labels, boundaryGap: false },
      yAxis: { type: 'value', minInterval: 1, splitLine: { lineStyle: { type: 'dashed' } } },
      series: [
        {
          name: t('adminDash.publishSeries'),
          type: 'line',
          smooth: true,
          showSymbol: true,
          symbolSize: 8,
          areaStyle: { color: 'rgba(11,110,106,0.15)' },
          lineStyle: { width: 3 },
          data: last7Publish,
        },
      ],
    })
    const resize = () => chart.resize()
    const t1 = window.setTimeout(resize, 0)
    window.addEventListener('resize', resize)
    return () => {
      window.clearTimeout(t1)
      window.removeEventListener('resize', resize)
      chart.dispose()
    }
  }, [t, labels, last7Publish, i18n.language])

  useEffect(() => {
    const el = statusChartRef.current
    if (!el) return
    const chart = init(el)
    chart.setOption({
      color: ['#d4a017', '#1677ff', '#0b6e6a', '#52c41a', '#ff4d4f'],
      tooltip: { trigger: 'axis' },
      grid: { left: 48, right: 24, top: 24, bottom: 36 },
      xAxis: {
        type: 'category',
        data: [
          t('orderStatus.pending_review'),
          t('orderStatus.open'),
          t('orderStatus.in_progress'),
          t('orderStatus.completed'),
          t('orderStatus.rejected'),
        ],
        axisLabel: { interval: 0, rotate: 20 },
      },
      yAxis: { type: 'value', minInterval: 1 },
      series: [
        {
          type: 'bar',
          barWidth: 28,
          data: [
            statusCounts.pending_review,
            statusCounts.open,
            statusCounts.in_progress,
            statusCounts.completed,
            statusCounts.rejected,
          ],
        },
      ],
    })
    const resize = () => chart.resize()
    const t1 = window.setTimeout(resize, 0)
    window.addEventListener('resize', resize)
    return () => {
      window.clearTimeout(t1)
      window.removeEventListener('resize', resize)
      chart.dispose()
    }
  }, [t, statusCounts, i18n.language])

  return (
    <div>
      <Typography.Title level={4} style={{ marginTop: 0 }}>
        {t('admin.dashboard')}
      </Typography.Title>
      <Typography.Paragraph type="secondary">{t('adminDash.desc')}</Typography.Paragraph>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={t('adminDash.todayNew')}
              value={todayNew}
              prefix={<FileAddOutlined />}
              suffix={<RiseOutlined style={{ color: '#0b6e6a', fontSize: 14 }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={t('adminDash.openJobs')}
              value={openCount}
              prefix={<FieldTimeOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={t('adminDash.inProgress')}
              value={inProgressCount}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={t('adminDash.totalBudget')}
              value={Number(totalBudget.toFixed(2))}
              prefix={<WalletOutlined />}
              suffix={t('adminDash.budgetUnit')}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={14}>
          <Card title={t('adminDash.publishTrend')}>
            <div ref={chartRef} style={{ height: 300, width: '100%', minHeight: 300 }} />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title={t('adminDash.statusBreakdown', { pending: pendingReview })}>
            <div ref={statusChartRef} style={{ height: 300, width: '100%', minHeight: 300 }} />
          </Card>
        </Col>
      </Row>
    </div>
  )
}
