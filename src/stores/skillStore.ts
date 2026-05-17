import { defineStore } from 'pinia'
import { ref, computed, toRaw } from 'vue'
import type { Skill } from '@/types'
import { db } from '@/utils/db'
import { fetchFullSkillFromGitHub, fetchGitHubRepo } from '@/utils/githubClient'
import { ElMessage } from 'element-plus'

export const useSkillStore = defineStore('skill', () => {
  const skills = ref<Skill[]>([])
  const selectedSkill = ref<Skill | null>(null)
  const searchQuery = ref('')
  const selectedTag = ref('')
  const loading = ref(false)
  const syncingSkillIds = ref<Set<string>>(new Set())
  const viewMode = ref<'grid' | 'list'>('grid')

  const filteredSkills = computed(() => {
    let result = skills.value
    
    // 标签筛选
    if (selectedTag.value) {
      result = result.filter(skill => 
        skill.tags.includes(selectedTag.value)
      )
    }
    
    // 关键词搜索
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      result = result.filter(skill => 
        skill.name.toLowerCase().includes(q) ||
        skill.description.toLowerCase().includes(q) ||
        skill.tags.some(tag => tag.toLowerCase().includes(q))
      )
    }
    
    return result
  })

  async function loadSkills() {
    loading.value = true
    try {
      skills.value = await db.getAll()
    } finally {
      loading.value = false
    }
  }

  async function addSkill(skill: Skill) {
    const plain = JSON.parse(JSON.stringify(toRaw(skill)))
    await db.put(plain)
    skills.value.unshift(skill)
  }

  async function updateSkill(skill: Skill) {
    skill.updatedAt = new Date()
    const plain = JSON.parse(JSON.stringify(toRaw(skill)))
    await db.put(plain)
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

  function setSelectedTag(tag: string) {
    selectedTag.value = tag
  }

  function setViewMode(mode: 'grid' | 'list') {
    viewMode.value = mode
  }

  function isSyncing(skillId: string): boolean {
    return syncingSkillIds.value.has(skillId)
  }

  async function syncGitHubSkill(skillId: string, force: boolean = false): Promise<Skill | null> {
    const skill = skills.value.find(s => s.id === skillId)
    if (!skill || skill.source.type !== 'github' || !skill.source.githubMeta) {
      return null
    }

    if (syncingSkillIds.value.has(skillId)) {
      return null
    }

    syncingSkillIds.value.add(skillId)
    
    try {
      const meta = skill.source.githubMeta
      
      // 检查是否需要更新
      if (!force) {
        try {
          const latestRepo = await fetchGitHubRepo(meta.repoUrl)
          const remoteUpdatedAt = new Date(latestRepo.pushed_at)
          const lastSync = skill.source.lastSync ? new Date(skill.source.lastSync) : null
          
          if (lastSync && remoteUpdatedAt <= lastSync) {
            // 没有新内容，不需要更新
            if (!skill.source.isContentCached) {
              // 如果没有缓存，还是获取一次
              const fullSkill = await fetchFullSkillFromGitHub(
                meta.repoUrl,
                meta.branch,
                meta.subfolderPath,
                skill.id
              )
              fullSkill.createdAt = skill.createdAt
              await updateSkill(fullSkill)
              return fullSkill
            }
            return skill
          }
        } catch (e) {
          console.warn('Failed to check remote update:', e)
          // 网络错误时，如果有缓存，直接使用缓存
          if (skill.source.isContentCached) {
            return skill
          }
        }
      }
      
      // 获取完整内容
      const fullSkill = await fetchFullSkillFromGitHub(
        meta.repoUrl,
        meta.branch,
        meta.subfolderPath,
        skill.id
      )
      fullSkill.createdAt = skill.createdAt
      await updateSkill(fullSkill)
      
      ElMessage.success(`已同步 ${fullSkill.name}`)
      return fullSkill
    } catch (e) {
      console.error('Failed to sync GitHub skill:', e)
      ElMessage.error('同步失败，使用本地缓存')
      // 如果同步失败，返回原技能（如果已有缓存）
      return skill.source.isContentCached ? skill : null
    } finally {
      syncingSkillIds.value.delete(skillId)
    }
  }

  return {
    skills,
    filteredSkills,
    selectedSkill,
    searchQuery,
    selectedTag,
    loading,
    viewMode,
    loadSkills,
    addSkill,
    updateSkill,
    deleteSkill,
    selectSkill,
    setSearchQuery,
    setSelectedTag,
    setViewMode,
    syncGitHubSkill,
    isSyncing
  }
})
