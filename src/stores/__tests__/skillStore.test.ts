import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useSkillStore } from '../skillStore'
import { mockSkills } from '@/utils/mockData'
import type { Skill } from '@/types'

// Mock the db module
vi.mock('@/utils/db', () => ({
  db: {
    getAll: vi.fn().mockResolvedValue([]),
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    clear: vi.fn()
  }
}))

describe('skillStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
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

  it('should add a new skill', async () => {
    const store = useSkillStore()
    const newSkill: Skill = {
      id: 'test-id-123',
      name: 'Test Skill',
      description: 'Test Description',
      version: '1.0.0',
      author: 'Test Author',
      tags: ['test', 'demo'],
      source: { type: 'local' },
      files: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    await store.addSkill(newSkill)
    expect(store.skills.length).toBe(1)
    expect(store.skills[0].name).toBe('Test Skill')
  })

  it('should update a skill', async () => {
    const store = useSkillStore()
    const initialSkill: Skill = {
      id: 'test-update-id',
      name: 'Original Name',
      description: 'Original Description',
      version: '1.0.0',
      author: 'Original Author',
      tags: [],
      source: { type: 'local' },
      files: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    await store.addSkill(initialSkill)
    
    const updatedSkill = {
      ...initialSkill,
      name: 'Updated Name',
      version: '2.0.0'
    }
    
    await store.updateSkill(updatedSkill)
    
    const found = store.skills.find(s => s.id === 'test-update-id')
    expect(found?.name).toBe('Updated Name')
    expect(found?.version).toBe('2.0.0')
  })

  it('should delete a skill', async () => {
    const store = useSkillStore()
    const skillToDelete: Skill = {
      id: 'skill-to-delete',
      name: 'Delete Me',
      description: 'Will be removed',
      version: '1.0.0',
      author: 'Tester',
      tags: [],
      source: { type: 'local' },
      files: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    await store.addSkill(skillToDelete)
    expect(store.skills.length).toBe(1)
    
    await store.deleteSkill('skill-to-delete')
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
