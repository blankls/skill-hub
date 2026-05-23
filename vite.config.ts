import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  base: '/',
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('element-plus/icons-vue')) return 'element-icons'
            if (id.includes('element-plus')) return 'element-plus'
            if (id.includes('highlight.js')) return 'highlightjs'
            if (id.includes('markdown-it')) return 'markdown'
            if (id.includes('jszip')) return 'jszip'
            if (id.includes('vue') || id.includes('pinia') || id.includes('@vue')) return 'vue-vendor'
          }
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    chunkSizeWarningLimit: 600,
    emptyOutDir: true
  },
  publicDir: 'public',
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