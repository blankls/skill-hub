import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useSkillStore } from '../skillStore'

describe('skillStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should initialize with empty skills', () => {
    const store = useSkillStore()
    expect(store.skills.length).toBe(0)
  })

  it('should set view mode', () => {
    const store = useSkillStore()
    expect(store.viewMode).toBe('grid')
    
    store.setViewMode('list')
    expect(store.viewMode).toBe('list')
    
    store.setViewMode('grid')
    expect(store.viewMode).toBe('grid')
  })
})
