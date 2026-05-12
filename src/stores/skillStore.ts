import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Skill } from '@/types'
import { db } from '@/utils/db'
import { mockSkills } from '@/utils/mockData'

export const useSkillStore = defineStore('skill', () => {
  const skills = ref<Skill[]>([])
  const selectedSkill = ref<Skill | null>(null)
  const searchQuery = ref('')
  const loading = ref(false)
  const viewMode = ref<'grid' | 'list'>('grid')

  const filteredSkills = computed(() => {
    if (!searchQuery.value) return skills.value
    const q = searchQuery.value.toLowerCase()
    return skills.value.filter(skill => 
      skill.name.toLowerCase().includes(q) ||
      skill.description.toLowerCase().includes(q) ||
      skill.tags.some(tag => tag.toLowerCase().includes(q))
    )
  })

  async function loadSkills() {
    loading.value = true
    try {
      const stored = await db.getAll()
      if (stored.length === 0) {
        for (const skill of mockSkills) {
          await db.put({ ...skill, source: { type: 'local' } })
        }
        skills.value = await db.getAll()
      } else {
        skills.value = stored
      }
    } finally {
      loading.value = false
    }
  }

  async function addSkill(skill: Skill) {
    await db.put(skill)
    skills.value.unshift(skill)
  }

  async function updateSkill(skill: Skill) {
    skill.updatedAt = new Date()
    await db.put(skill)
    const index = skills.value.findIndex(s => s.id === skill.id)
    if (index !== -1) skills.value[index] = skill
  }

  async function deleteSkill(id: string) {
    await db.delete(id)
    skills.value = skills.value.filter(s => s.id !== id)
    if (selectedSkill.value?.id === id) {
      selectedSkill.value = null
    }
  }

  function selectSkill(skill: Skill) {
    selectedSkill.value = skill
  }

  function setSearchQuery(query: string) {
    searchQuery.value = query
  }

  function setViewMode(mode: 'grid' | 'list') {
    viewMode.value = mode
  }

  return {
    skills,
    filteredSkills,
    selectedSkill,
    searchQuery,
    loading,
    viewMode,
    loadSkills,
    addSkill,
    updateSkill,
    deleteSkill,
    selectSkill,
    setSearchQuery,
    setViewMode
  }
})
