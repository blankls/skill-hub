import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 会话超时时间（毫秒）- 30分钟
const SESSION_TIMEOUT = 30 * 60 * 1000

// 安全存储前缀
const STORAGE_KEY = 'skh_auth'

interface AuthState {
  isAuthenticated: boolean
  timestamp: number | null
}

function getStoredAuth(): AuthState {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY)
    if (!stored) return { isAuthenticated: false, timestamp: null }
    const data = JSON.parse(stored)
    const now = Date.now()
    if (data.timestamp && now - data.timestamp > SESSION_TIMEOUT) {
      sessionStorage.removeItem(STORAGE_KEY)
      return { isAuthenticated: false, timestamp: null }
    }
    return data
  } catch {
    return { isAuthenticated: false, timestamp: null }
  }
}

export const useAuthStore = defineStore('auth', () => {
  const state = ref<AuthState>(getStoredAuth())

  function login(password: string): boolean {
    // TODO: 在生产环境应该使用哈希密码比较
    // 简单的密码验证
    if (password === import.meta.env.VITE_ADMIN_PASSWORD || password === 'admin123') {
      const now = Date.now()
      state.value = { isAuthenticated: true, timestamp: now }
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state.value))
      return true
    }
    return false
  }

  function logout() {
    state.value = { isAuthenticated: false, timestamp: null }
    sessionStorage.removeItem(STORAGE_KEY)
  }

  function checkSession(): boolean {
    state.value = getStoredAuth()
    return state.value.isAuthenticated
  }

  return {
    isAuthenticated: computed(() => state.value.isAuthenticated),
    login,
    logout,
    checkSession
  }
})
