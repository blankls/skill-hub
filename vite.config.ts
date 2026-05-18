import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  base: './',  // 相对路径，本地和 GitHub Pages 均可用
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
