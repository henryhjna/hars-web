import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Force VITE_API_BASE_URL to /api, ignoring system environment variables
  define: {
    'import.meta.env.VITE_API_BASE_URL': JSON.stringify('/api')
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
