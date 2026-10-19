import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Input, Space, Table, Tag, Typography, message } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { WorkerCertStatus, WorkerProfile } from '../../types'
import { useOrderStore } from '../../store/orderStore'

const certColor: Record<WorkerCertStatus, string> = {
  verified: 'success',
  pending: 'gold',
  disabled: 'default',
}

export function WorkersAdmin() {
  const { t } = useTranslation()
  const workers = useOrderStore((s) => s.workers)
  const setWorkerCertStatus = useOrderStore((s) => s.setWorkerCertStatus)
  const [query, setQuery] = useState('')

  const data = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return workers
    return workers.filter(
      (w) =>
        w.id.toLowerCase().includes(q) ||
        w.name.toLowerCase().includes(q) ||
        w.city.toLowerCase().includes(q) ||
        w.phone.includes(q),
    )
  }, [workers, query])

  const setStatus = (id: string, status: WorkerCertStatus) => {
    setWorkerCertStatus(id, status)
    message.success(t('adminWorkers.statusUpdated'))
  }

  const columns: ColumnsType<WorkerProfile> = [
    { title: t('adminWorkers.colId'), dataIndex: 'id', width: 90 },
    { title: t('adminWorkers.colName'), dataIndex: 'name', width: 120 },
    {
      title: t('adminWorkers.colTrade'),
      dataIndex: 'trade',
      width: 120,
      render: (trade: WorkerProfile['trade']) => t(`trade.${trade}`),
    },
    { title: t('adminWorkers.colCity'), dataIndex: 'city', width: 100 },
    { title: t('adminWorkers.colPhone'), dataIndex: 'phone', width: 130 },
    { title: t('adminWorkers.colYears'), dataIndex: 'years', width: 90 },
    {
      title: t('adminWorkers.colCert'),
      dataIndex: 'certStatus',
      width: 120,
      render: (st: WorkerCertStatus | undefined, row) => {
        const status = st ?? (row.enabled ? 'verified' : 'disabled')
        return <Tag color={certColor[status]}>{t(`adminWorkers.cert.${status}`)}</Tag>
      },
    },
    {
      title: t('adminWorkers.colActions'),
      key: 'actions',
      width: 280,
      render: (_, row) => {
        const status = row.certStatus ?? (row.enabled ? 'verified' : 'disabled')
        return (
          <Space wrap size={0}>
            {status !== 'verified' && (
              <Button type="link" size="small" onClick={() => setStatus(row.id, 'verified')}>
                {t('adminWorkers.verify')}
              </Button>
            )}
            {status !== 'pending' && (
              <Button type="link" size="small" onClick={() => setStatus(row.id, 'pending')}>
                {t('adminWorkers.markPending')}
              </Button>
            )}
            {status !== 'disabled' && (
              <Button type="link" size="small" danger onClick={() => setStatus(row.id, 'disabled')}>
                {t('adminWorkers.disable')}
              </Button>
            )}
          </Space>
        )
      },
    },
  ]

  return (
    <div>
      <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 16 }} wrap>
        <div>
          <Typography.Title level={4} style={{ margin: 0 }}>
            {t('adminWorkers.title')}
          </Typography.Title>
          <Typography.Text type="secondary">{t('adminWorkers.desc')}</Typography.Text>
        </div>
      </Space>

      <Input
        allowClear
        prefix={<SearchOutlined />}
        placeholder={t('adminWorkers.search')}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ maxWidth: 360, marginBottom: 16 }}
      />

      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        scroll={{ x: 1000 }}
        pagination={{
          pageSize: 8,
          showTotal: (n) => t('admin.totalItems', { count: n }),
        }}
      />
    </div>
  )
}
