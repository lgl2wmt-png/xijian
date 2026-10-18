/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  /** 公网 API 根地址；Mock 开启时可留空 */
  readonly VITE_API_BASE?: string
  /** 默认开启前端 Mock；设为 "false" 才走真实后端 */
  readonly VITE_USE_MOCK?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
