import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Input, Space, Table, Tag, Typography, message } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { Order, OrderStatus } from '../../types'
import { useOrderStore } from '../../store/orderStore'

const statusColor: Record<OrderStatus, string> = {
  pending_review: 'gold',
  open: 'blue',
  in_progress: 'processing',
  completed: 'success',
  rejected: 'error',
}

export function OrdersAdmin() {
  const { t } = useTranslation()
  const orders = useOrderStore((s) => s.orders)
  const updateOrderStatus = useOrderStore((s) => s.updateOrderStatus)
  const [query, setQuery] = useState('')

  const data = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return orders
    return orders.filter(
      (o) =>
        o.id.toLowerCase().includes(q) ||
        o.title.toLowerCase().includes(q) ||
        o.clientId.toLowerCase().includes(q) ||
        o.status.includes(q),
    )
  }, [orders, query])

  const approve = (id: string) => {
    updateOrderStatus(id, 'open')
    message.success(t('adminOrders.approved'))
  }

  const reject = (id: string) => {
    updateOrderStatus(id, 'rejected')
    message.success(t('adminOrders.rejected'))
  }

  const columns: ColumnsType<Order> = [
    { title: t('adminOrders.colId'), dataIndex: 'id', width: 140, ellipsis: true },
    { title: t('adminOrders.colTitle'), dataIndex: 'title', ellipsis: true },
    {
      title: t('adminOrders.colTrade'),
      dataIndex: 'trade',
      width: 110,
      render: (trade: Order['trade']) => t(`trade.${trade}`),
    },
    {
      title: t('adminOrders.colBudget'),
      dataIndex: 'budget',
      width: 100,
      render: (n: number) => t('workerHall.budget', { n }),
    },
    {
      title: t('adminOrders.colStatus'),
      dataIndex: 'status',
      width: 120,
      render: (st: OrderStatus) => (
        <Tag color={statusColor[st]}>{t(`orderStatus.${st}`)}</Tag>
      ),
    },
    {
      title: t('adminOrders.colClient'),
      dataIndex: 'clientId',
      width: 120,
      ellipsis: true,
    },
    {
      title: t('adminOrders.colWorker'),
      dataIndex: 'workerId',
      width: 100,
      render: (wid: string | null) => wid || '—',
    },
    {
      title: t('adminOrders.colActions'),
      key: 'actions',
      width: 200,
      fixed: 'right',
      render: (_, row) =>
        row.status === 'pending_review' ? (
          <Space wrap>
            <Button type="link" size="small" onClick={() => approve(row.id)}>
              {t('adminOrders.approve')}
            </Button>
            <Button type="link" size="small" danger onClick={() => reject(row.id)}>
              {t('adminOrders.reject')}
            </Button>
          </Space>
        ) : (
          <Typography.Text type="secondary">—</Typography.Text>
        ),
    },
  ]

  const pendingCount = orders.filter((o) => o.status === 'pending_review').length

  return (
    <div>
      <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 16 }} wrap>
        <div>
          <Typography.Title level={4} style={{ margin: 0 }}>
            {t('adminOrders.title')}
          </Typography.Title>
          <Typography.Text type="secondary">
            {t('adminOrders.desc', { count: pendingCount })}
          </Typography.Text>
        </div>
      </Space>

      <Input
        allowClear
        prefix={<SearchOutlined />}
        placeholder={t('adminOrders.search')}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ maxWidth: 360, marginBottom: 16 }}
      />

      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        scroll={{ x: 960 }}
        pagination={{
          pageSize: 8,
          showTotal: (n) => t('admin.totalItems', { count: n }),
        }}
      />
    </div>
  )
}
