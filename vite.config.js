import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { ugConvertPlugin } from './server/ug-convert-plugin.js'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load .env vars (incl. ANTHROPIC_API_KEY) for the dev-server endpoint.
  // No VITE_ prefix => never exposed to the browser bundle.
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), ugConvertPlugin(env)],
  }
})
