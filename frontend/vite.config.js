import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // 로컬 개발 시 API 프록시 (Docker 없이 실행할 때)
    proxy: {
      '/api': 'http://localhost:8080'
    }
  }
})
