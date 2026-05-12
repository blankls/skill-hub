import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  const isDark = ref(false)

  function initTheme() {
    const stored = localStorage.getItem('theme')
    if (stored) {
      isDark.value = stored === 'dark'
    } else {
      isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    applyTheme()
  }

  function toggleTheme() {
    isDark.value = !isDark.value
    applyTheme()
  }

  function applyTheme() {
    const root = document.documentElement
    if (isDark.value) {
      root.classList.add('dark')
      root.style.setProperty('--gradient-start', '#0f172a')
      root.style.setProperty('--gradient-end', '#1e293b')
    } else {
      root.classList.remove('dark')
      root.style.setProperty('--gradient-start', '#f8fafc')
      root.style.setProperty('--gradient-end', '#e2e8f0')
    }
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
  }

  return {
    isDark,
    initTheme,
    toggleTheme
  }
})
