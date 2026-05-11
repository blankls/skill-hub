import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useSkillStore } from '../skillStore'
import { mockSkills } from '@/utils/mockData'

describe('skillStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should initialize with empty skills', () => {
    const store = useSkillStore()
    expect(store.skills.length).toBe(0)
  })

  it('should load skills', async () => {
    const store = useSkillStore()
    await store.loadSkills()
    expect(store.skills.length).toBe(mockSkills.length)
  })

  it('should select a skill', async () => {
    const store = useSkillStore()
    await store.loadSkills()
    const skill = store.skills[0]
    store.selectSkill(skill)
    expect(store.selectedSkill).toEqual(skill)
  })

  it('should filter skills by search query', async () => {
    const store = useSkillStore()
    await store.loadSkills()
    store.setSearchQuery('Web')
    expect(store.filteredSkills.length).toBeGreaterThan(0)
  })
})
