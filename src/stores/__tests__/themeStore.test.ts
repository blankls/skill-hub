import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useThemeStore } from '../themeStore'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
  removeItem: vi.fn()
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

describe('themeStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorageMock.getItem.mockClear()
    localStorageMock.setItem.mockClear()
  })

  it('should initialize with light theme', () => {
    const store = useThemeStore()
    expect(store.isDark).toBe(false)
  })

  it('should toggle theme', () => {
    const store = useThemeStore()
    expect(store.isDark).toBe(false)
    store.toggleTheme()
    expect(store.isDark).toBe(true)
    store.toggleTheme()
    expect(store.isDark).toBe(false)
  })

  it('should set theme explicitly', () => {
    const store = useThemeStore()
    store.setTheme(true)
    expect(store.isDark).toBe(true)
    store.setTheme(false)
    expect(store.isDark).toBe(false)
  })

  it('should load saved theme from localStorage', () => {
    localStorageMock.getItem.mockReturnValue('dark')
    const store = useThemeStore()
    store.initTheme()
    expect(store.isDark).toBe(true)
  })
})
