import { useTranslation } from 'react-i18next'
import { Button, Card, Form, Input, Switch, Typography, message } from 'antd'

export function AdminSettings() {
  const { t } = useTranslation()
  const [form] = Form.useForm()

  return (
    <div>
      <Typography.Title level={4} style={{ marginTop: 0 }}>
        {t('admin.settings')}
      </Typography.Title>
      <Typography.Paragraph type="secondary">{t('admin.settingsDesc')}</Typography.Paragraph>

      <Card title={t('admin.settingsCard')} style={{ maxWidth: 640 }}>
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            siteName: t('common.brand'),
            supportEmail: 'hello@xijian.demo',
            mockMode: true,
            allowBooking: true,
            maintenance: false,
          }}
          onFinish={() => message.success(t('admin.settingsSaved'))}
        >
          <Form.Item name="siteName" label={t('admin.siteName')} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="supportEmail" label={t('admin.supportEmail')}>
            <Input type="email" />
          </Form.Item>
          <Form.Item name="mockMode" label={t('admin.mockMode')} valuePropName="checked">
            <Switch checkedChildren={t('admin.on')} unCheckedChildren={t('admin.off')} />
          </Form.Item>
          <Form.Item name="allowBooking" label={t('admin.allowBooking')} valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="maintenance" label={t('admin.maintenance')} valuePropName="checked">
            <Switch />
          </Form.Item>
          <Button type="primary" htmlType="submit">
            {t('admin.saveSettings')}
          </Button>
        </Form>
      </Card>
    </div>
  )
}
