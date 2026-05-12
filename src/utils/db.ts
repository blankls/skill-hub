import localforage from 'localforage'
import type { Skill } from '@/types'

localforage.config({
  name: 'SkillHub',
  storeName: 'skills'
})

export const db = {
  async getAll(): Promise<Skill[]> {
    const skills: Skill[] = []
    await localforage.iterate((value: Skill, key) => {
      skills.push(value)
    })
    return skills.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  },

  async get(id: string): Promise<Skill | null> {
    return await localforage.getItem(id)
  },

  async put(skill: Skill): Promise<void> {
    await localforage.setItem(skill.id, skill)
  },

  async delete(id: string): Promise<void> {
    await localforage.removeItem(id)
  },

  async clear(): Promise<void> {
    await localforage.clear()
  }
}
