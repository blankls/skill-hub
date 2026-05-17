import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    host: true,
    open: true,
    allowedHosts: [
      "3026b84w47.goho.co"
    ]
  },
  test: {
    environment: 'happy-dom',
    globals: true
  }
})
