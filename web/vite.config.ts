import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  if (mode === 'production' && !env.VITE_API_BASE_URL?.trim()) {
    throw new Error(
      'VITE_API_BASE_URL is missing for production build. Add web/.env.production (tracked in git) or run: VITE_API_BASE_URL=https://your-api.../api npm run build'
    )
  }

  return {
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://6bkc76dp4c.execute-api.ap-south-1.amazonaws.com',
        changeOrigin: true,
      },
    },
  },
  }
})
