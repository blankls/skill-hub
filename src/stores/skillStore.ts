import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Skill } from '@/types'
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

  const loadSkills = async () => {
    loading.value = true
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      skills.value = mockSkills
    } finally {
      loading.value = false
    }
  }

  const selectSkill = (skill: Skill) => {
    selectedSkill.value = skill
  }

  const setSearchQuery = (query: string) => {
    searchQuery.value = query
  }

  const toggleViewMode = () => {
    viewMode.value = viewMode.value === 'grid' ? 'list' : 'grid'
  }

  return {
    skills,
    selectedSkill,
    filteredSkills,
    searchQuery,
    loading,
    viewMode,
    loadSkills,
    selectSkill,
    setSearchQuery,
    toggleViewMode
  }
})
