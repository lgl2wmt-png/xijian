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
import type { Designer, StyleTag } from '../../types'
import { labelOf } from '../../i18n/labels'
import { listDesigners, nextDesignerId, removeDesigner, upsertDesigner } from '../mockStore'

const styleOptions: StyleTag[] = ['现代简约', '日式原木', '轻奢法式', '奶油风', '工业风']

export function DesignersAdmin() {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const [version, setVersion] = useState(0)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Designer | null>(null)
  const [form] = Form.useForm()

  const data = useMemo(() => {
    void version
    const q = query.trim().toLowerCase()
    const all = listDesigners()
    if (!q) return all
    return all.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.city.toLowerCase().includes(q) ||
        d.id.toLowerCase().includes(q),
    )
  }, [query, version])

  const openCreate = () => {
    setEditing(null)
    form.resetFields()
    form.setFieldsValue({
      years: 5,
      rating: 4.8,
      reviewCount: 10,
      city: '上海',
      styles: ['现代简约'],
      layouts: ['小户型'],
      budgetMin: 15,
      budgetMax: 35,
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&q=80&fm=webp',
    })
    setOpen(true)
  }

  const openEdit = (row: Designer) => {
    setEditing(row)
    form.setFieldsValue({
      ...row,
      budgetMin: row.budgetRange[0],
      budgetMax: row.budgetRange[1],
    })
    setOpen(true)
  }

  const onSubmit = async () => {
    const values = await form.validateFields()
    const id = editing?.id ?? nextDesignerId()
    const item: Designer = {
      id,
      name: values.name,
      avatar: values.avatar,
      years: Number(values.years),
      styles: values.styles,
      layouts: values.layouts,
      budgetRange: [Number(values.budgetMin), Number(values.budgetMax)],
      rating: Number(values.rating),
      reviewCount: Number(values.reviewCount),
      city: values.city,
      bio: values.bio || '',
      works: editing?.works ?? [],
    }
    upsertDesigner(item)
    setVersion((v) => v + 1)
    setOpen(false)
    message.success(editing ? t('admin.designerUpdated') : t('admin.designerCreated'))
  }

  const columns: ColumnsType<Designer> = [
    { title: t('admin.colId'), dataIndex: 'id', width: 100 },
    { title: t('admin.colName'), dataIndex: 'name', width: 120 },
    { title: t('admin.colCity'), dataIndex: 'city', width: 100 },
    {
      title: t('admin.colStyle'),
      dataIndex: 'styles',
      render: (styles: string[]) => styles.join('、'),
    },
    {
      title: t('admin.colBudgetRange'),
      key: 'budget',
      width: 130,
      render: (_, row) => `${row.budgetRange[0]}–${row.budgetRange[1]}`,
    },
    { title: t('admin.colRating'), dataIndex: 'rating', width: 80 },
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
              removeDesigner(row.id)
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
            {t('admin.designers')}
          </Typography.Title>
          <Typography.Text type="secondary">{t('admin.designersDesc')}</Typography.Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          {t('admin.addDesigner')}
        </Button>
      </Space>

      <Input
        allowClear
        prefix={<SearchOutlined />}
        placeholder={t('admin.searchDesigners')}
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
          showTotal: (n) => t('admin.totalItems', { count: n }),
        }}
      />

      <Modal
        title={editing ? t('admin.editDesigner') : t('admin.addDesigner')}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={onSubmit}
        okText={t('common.save')}
        cancelText={t('common.cancel')}
        destroyOnHidden
        width={640}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 12 }}>
          <Form.Item name="name" label={t('admin.colName')} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="city" label={t('admin.colCity')} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="styles" label={t('admin.colStyle')} rules={[{ required: true }]}>
            <Select
              mode="multiple"
              options={styleOptions.map((s) => ({ value: s, label: labelOf(t, s) }))}
            />
          </Form.Item>
          <Form.Item name="layouts" label={t('admin.fieldLayout')} rules={[{ required: true }]}>
            <Select
              mode="tags"
              options={(['小户型', '老房改造', '大平层', '别墅'] as const).map((v) => ({
                value: v,
                label: labelOf(t, v),
              }))}
            />
          </Form.Item>
          <Space wrap>
            <Form.Item name="budgetMin" label={t('admin.fieldBudget')} rules={[{ required: true }]}>
              <InputNumber min={1} style={{ width: 140 }} />
            </Form.Item>
            <Form.Item name="budgetMax" label={t('admin.colBudgetRange')} rules={[{ required: true }]}>
              <InputNumber min={1} style={{ width: 140 }} />
            </Form.Item>
            <Form.Item name="years" label={t('admin.fieldYears')} rules={[{ required: true }]}>
              <InputNumber min={1} style={{ width: 120 }} />
            </Form.Item>
            <Form.Item name="rating" label={t('admin.colRating')} rules={[{ required: true }]}>
              <InputNumber min={1} max={5} step={0.1} style={{ width: 120 }} />
            </Form.Item>
            <Form.Item name="reviewCount" label={t('admin.fieldReviews')} rules={[{ required: true }]}>
              <InputNumber min={0} style={{ width: 120 }} />
            </Form.Item>
          </Space>
          <Form.Item name="avatar" label={t('admin.fieldAvatar')} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="bio" label={t('admin.fieldBio')}>
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
