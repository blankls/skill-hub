import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

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

  async function login(password: string): Promise<{ success: boolean; error?: string; lockUntil?: string }> {
    try {
      const res = await fetch(`${API_BASE}/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })
      const data = await res.json()
      
      if (res.ok) {
        const now = Date.now()
        state.value = { isAuthenticated: true, timestamp: now }
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state.value))
        return { success: true }
      }
      
      // 返回错误信息
      return { 
        success: false, 
        error: data.error || '密码错误',
        lockUntil: data.lockUntil
      }
    } catch {
      return { success: false, error: '网络错误，请稍后重试' }
    }
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
