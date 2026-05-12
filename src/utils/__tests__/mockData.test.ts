import { describe, it, expect } from 'vitest'
import { mockSkills } from '../mockData'

describe('mockData', () => {
  it('should provide valid skills data', () => {
    expect(Array.isArray(mockSkills)).toBe(true)
    expect(mockSkills.length).toBeGreaterThan(0)
  })

  it('should have required fields in each skill', () => {
    mockSkills.forEach(skill => {
      expect(skill.id).toBeDefined()
      expect(skill.name).toBeDefined()
      expect(skill.description).toBeDefined()
      expect(skill.version).toBeDefined()
      expect(skill.author).toBeDefined()
      expect(skill.sourceType).toBeDefined()
      expect(Array.isArray(skill.tags)).toBe(true)
    })
  })

  it('should have valid source types', () => {
    mockSkills.forEach(skill => {
      expect(['local', 'github']).toContain(skill.sourceType)
    })
  })
})
