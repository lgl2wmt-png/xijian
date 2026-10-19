import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  ApartmentOutlined,
  BarChartOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SettingOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import { ConfigProvider, Layout, Menu, theme, Typography, Button, Space, Tag } from 'antd'
import { LanguageSwitcher } from '../components/LanguageSwitcher'
import { getLangMeta } from '../i18n/languages'

const { Header, Sider, Content } = Layout

export function AdminLayout() {
  const { t, i18n } = useTranslation()
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const langMeta = getLangMeta(i18n.language)
  const antdLocale = langMeta.antd
  const isRtl = langMeta.dir === 'rtl'

  const menuItems = useMemo(
    () => [
      { key: '/admin/dashboard', icon: <BarChartOutlined />, label: t('admin.dashboard') },
      { key: '/admin/cases', icon: <ApartmentOutlined />, label: t('admin.cases') },
      { key: '/admin/designers', icon: <TeamOutlined />, label: t('admin.designers') },
      { key: '/admin/settings', icon: <SettingOutlined />, label: t('admin.settings') },
    ],
    [t],
  )

  const selected = useMemo(() => {
    const hit = menuItems.find((m) => location.pathname.startsWith(m.key))
    return hit?.key ?? '/admin/dashboard'
  }, [location.pathname, menuItems])

  return (
    <ConfigProvider
      locale={antdLocale}
      direction={isRtl ? 'rtl' : 'ltr'}
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: '#0b6e6a',
          borderRadius: 8,
          fontFamily: '"Noto Sans SC", "Segoe UI", system-ui, sans-serif',
        },
      }}
    >
      <Layout style={{ minHeight: '100vh' }} dir={langMeta.dir}>
        <Sider
          collapsible
          collapsed={collapsed}
          trigger={null}
          width={280}
          collapsedWidth={72}
          style={{ background: '#15202b' }}
        >
          <div
            style={{
              height: 56,
              margin: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: collapsed ? 'center' : 'flex-start',
              gap: 10,
              color: '#e8ecef',
              paddingInline: collapsed ? 0 : 8,
              minWidth: 0,
            }}
          >
            <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: 2, flexShrink: 0 }}>
              栖
            </span>
            {!collapsed && (
              <div style={{ minWidth: 0, overflow: 'hidden' }}>
                <div
                  style={{
                    fontWeight: 600,
                    lineHeight: 1.2,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                  title={t('admin.title')}
                >
                  {t('admin.title')}
                </div>
                <div style={{ fontSize: 11, opacity: 0.55 }}>{t('admin.subtitle')}</div>
              </div>
            )}
          </div>
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[selected]}
            items={menuItems}
            style={{ background: '#15202b', borderInlineEnd: 0 }}
            onClick={({ key }) => navigate(key)}
          />
        </Sider>
        <Layout>
          <Header
            style={{
              background: '#fff',
              padding: '0 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              borderBottom: '1px solid #f0f0f0',
              flexWrap: 'wrap',
            }}
          >
            <Space style={{ minWidth: 0 }}>
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed((v) => !v)}
              />
              <Typography.Text
                type="secondary"
                style={{
                  maxWidth: 200,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  display: 'inline-block',
                }}
              >
                {t('admin.console')}
              </Typography.Text>
            </Space>
            <Space wrap style={{ minWidth: 0 }}>
              <LanguageSwitcher variant="antd" />
              <Tag color="processing" style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {t('admin.mockTag')}
              </Tag>
              <Link to="/" className="whitespace-nowrap">
                {t('common.backHome')}
              </Link>
            </Space>
          </Header>
          <Content style={{ margin: 20 }}>
            <div
              style={{
                background: '#fff',
                borderRadius: 12,
                padding: 20,
                minHeight: 'calc(100vh - 112px)',
              }}
            >
              <Outlet />
            </div>
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  )
}
