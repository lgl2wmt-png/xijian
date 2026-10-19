import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Typography,
  message,
} from 'antd'
import { PlusOutlined, SearchOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { CaseItem, StyleTag } from '../../types'
import { labelOf } from '../../i18n/labels'
import { listCases, nextCaseId, removeCase, upsertCase } from '../mockStore'

const styleOptions: StyleTag[] = ['现代简约', '日式原木', '轻奢法式', '奶油风', '工业风']

export function CasesAdmin() {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const [version, setVersion] = useState(0)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<CaseItem | null>(null)
  const [form] = Form.useForm<CaseItem>()

  const data = useMemo(() => {
    void version
    const q = query.trim().toLowerCase()
    const all = listCases()
    if (!q) return all
    return all.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        c.style.includes(q) ||
        c.id.toLowerCase().includes(q),
    )
  }, [query, version])

  const openCreate = () => {
    setEditing(null)
    form.resetFields()
    form.setFieldsValue({
      style: '现代简约',
      area: 80,
      budget: 20,
      duration: 70,
      layout: '两室一厅',
      city: '上海',
      cover: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&q=80&fm=webp',
      summary: '',
    })
    setOpen(true)
  }

  const openEdit = (row: CaseItem) => {
    setEditing(row)
    form.setFieldsValue(row)
    setOpen(true)
  }

  const onSubmit = async () => {
    const values = await form.validateFields()
    const id = editing?.id ?? nextCaseId()
    const item: CaseItem = {
      id,
      title: values.title,
      style: values.style,
      area: Number(values.area),
      layout: values.layout,
      city: values.city,
      budget: Number(values.budget),
      duration: Number(values.duration),
      cover: values.cover,
      images: editing?.images?.length ? editing.images : [values.cover],
      designerId: editing?.designerId ?? 'd1',
      summary: values.summary || '',
      before: editing?.before,
      after: editing?.after,
    }
    upsertCase(item)
    setVersion((v) => v + 1)
    setOpen(false)
    message.success(editing ? t('admin.caseUpdated') : t('admin.caseCreated'))
  }

  const columns: ColumnsType<CaseItem> = [
    { title: t('admin.colId'), dataIndex: 'id', width: 100 },
    { title: t('admin.colTitle'), dataIndex: 'title', ellipsis: true },
    { title: t('admin.colStyle'), dataIndex: 'style', width: 110 },
    { title: t('admin.colCity'), dataIndex: 'city', width: 120 },
    { title: t('admin.colArea'), dataIndex: 'area', width: 90 },
    {
      title: t('admin.colBudget'),
      dataIndex: 'budget',
      width: 100,
    },
    {
      title: t('admin.colActions'),
      key: 'actions',
      width: 160,
      render: (_, row) => (
        <Space>
          <Button type="link" size="small" onClick={() => openEdit(row)}>
            {t('common.edit')}
          </Button>
          <Popconfirm
            title={t('common.confirmDelete')}
            onConfirm={() => {
              removeCase(row.id)
              setVersion((v) => v + 1)
              message.success(t('common.deleted'))
            }}
          >
            <Button type="link" size="small" danger>
              {t('common.delete')}
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 16 }} wrap>
        <div>
          <Typography.Title level={4} style={{ margin: 0 }}>
            {t('admin.cases')}
          </Typography.Title>
          <Typography.Text type="secondary">{t('admin.casesDesc')}</Typography.Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          {t('admin.addCase')}
        </Button>
      </Space>

      <Input
        allowClear
        prefix={<SearchOutlined />}
        placeholder={t('admin.searchCases')}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ maxWidth: 360, marginBottom: 16 }}
      />

      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        pagination={{
          pageSize: 5,
          showSizeChanger: true,
          showTotal: (n) => t('admin.totalItems', { count: n }),
        }}
      />

      <Modal
        title={editing ? t('admin.editCase') : t('admin.addCase')}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={onSubmit}
        okText={t('common.save')}
        cancelText={t('common.cancel')}
        destroyOnHidden
        width={640}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 12 }}>
          <Form.Item
            name="title"
            label={t('admin.fieldTitle')}
            rules={[{ required: true, message: t('admin.fieldTitle') }]}
          >
            <Input />
          </Form.Item>
          <Space style={{ width: '100%' }} styles={{ item: { flex: 1 } }} wrap>
            <Form.Item
              name="style"
              label={t('admin.fieldStyle')}
              rules={[{ required: true }]}
              style={{ minWidth: 180, flex: 1 }}
            >
              <Select
                options={styleOptions.map((s) => ({ value: s, label: labelOf(t, s) }))}
              />
            </Form.Item>
            <Form.Item
              name="city"
              label={t('admin.fieldCity')}
              rules={[{ required: true }]}
              style={{ minWidth: 180, flex: 1 }}
            >
              <Input />
            </Form.Item>
          </Space>
          <Space wrap style={{ width: '100%' }}>
            <Form.Item name="area" label={t('admin.fieldArea')} rules={[{ required: true }]}>
              <InputNumber min={20} style={{ width: 140 }} />
            </Form.Item>
            <Form.Item name="budget" label={t('admin.fieldBudget')} rules={[{ required: true }]}>
              <InputNumber min={1} style={{ width: 140 }} />
            </Form.Item>
            <Form.Item name="duration" label={t('admin.fieldDuration')} rules={[{ required: true }]}>
              <InputNumber min={1} style={{ width: 140 }} />
            </Form.Item>
          </Space>
          <Form.Item name="layout" label={t('admin.fieldLayout')} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="cover" label={t('admin.fieldCover')} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="summary" label={t('admin.fieldSummary')}>
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
