import type { CapacitorConfig } from '@capacitor/cli'

/**
 * Android WebView defaults to blocking cleartext (HTTP).
 * Demo / LAN APIs often use http:// — enable cleartext so App→API works.
 * Production should use HTTPS and can set cleartext: false.
 */
const config: CapacitorConfig = {
  appId: 'com.xijian.app',
  appName: '栖见',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true,
  },
  android: {
    allowMixedContent: true,
  },
}

export default config
