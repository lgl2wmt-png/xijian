import fs from 'node:fs'

function ensureImport(s) {
  if (s.includes("from 'react-i18next'")) return s
  return s.replace(
    "import { Link } from 'react-router-dom'",
    "import { useTranslation } from 'react-i18next'\r\nimport { Link } from 'react-router-dom'",
  )
}

let sandbox = ensureImport(fs.readFileSync('src/pages/Sandbox.tsx', 'utf8'))
if (!sandbox.includes('const { t } = useTranslation()')) {
  sandbox = sandbox.replace(
    'export function Sandbox() {\r\n  const { data, loading, error }',
    'export function Sandbox() {\r\n  const { t } = useTranslation()\r\n  const { data, loading, error }',
  )
}
sandbox = sandbox.replace("'沙盘数据不可用'", "t('sandboxUi.unavailable')")
sandbox = sandbox.replace('>返回进度页</Link>', ">{t('sandboxUi.backProgress')}</Link>")
fs.writeFileSync('src/pages/Sandbox.tsx', sandbox, 'utf8')
console.log('Sandbox', sandbox.includes('const { t } = useTranslation()'), sandbox.includes("t('sandboxUi.unavailable')"))

let hud = ensureImport(fs.readFileSync('src/pages/Hud.tsx', 'utf8'))
if (!hud.includes('const { t } = useTranslation()')) {
  hud = hud.replace(
    'export function Hud() {\r\n',
    'export function Hud() {\r\n  const { t } = useTranslation()\r\n',
  )
}
hud = hud.replace('连接工地数据…', "{t('hudUi.connecting')}")
hud = hud.replace("'HUD 数据不可用'", "t('hudUi.unavailable')")
hud = hud.replace('>返回进度页</Link>', ">{t('hudUi.backProgress')}</Link>")
hud = hud.replace(
  "project.status === 'normal' ? '正常' : project.status === 'warn' ? '警告' : '停工'",
  "project.status === 'normal' ? t('hudUi.statusNormal') : project.status === 'warn' ? t('hudUi.statusWarn') : t('hudUi.statusStop')",
)
fs.writeFileSync('src/pages/Hud.tsx', hud, 'utf8')
console.log('Hud', hud.includes('const { t } = useTranslation()'), hud.includes("t('hudUi.connecting')"))
