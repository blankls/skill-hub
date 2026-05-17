import { defineStore } from 'pinia'
import { ref, computed, toRaw, onUnmounted } from 'vue'
import type { Skill } from '@/types'
import { db } from '@/utils/db'
import { fetchFullSkillFromGitHub, fetchGitHubRepo, type SyncProgress } from '@/utils/githubClient'
import { ElMessage } from 'element-plus'

// 定时任务配置
const SYNC_INTERVAL_HOURS = 24 // 每天同步一次
const BATCH_SIZE = 3 // 每批同步 3 个技能
const SYNC_DELAY_MS = 2000 // 每个技能之间间隔 2 秒

export const useSkillStore = defineStore('skill', () => {
  const skills = ref<Skill[]>([])
  const selectedSkill = ref<Skill | null>(null)
  const searchQuery = ref('')
  const selectedTag = ref('')
  const loading = ref(false)
  const syncingSkillIds = ref<Set<string>>(new Set())
  const syncProgress = ref<Map<string, SyncProgress>>(new Map())
  const viewMode = ref<'grid' | 'list'>('grid')
  
  // 批量同步状态
  const batchSyncing = ref(false)
  const batchSyncProgress = ref({
    current: 0,
    total: 0,
    currentSkill: ''
  })
  
  // 定时任务
  let syncTimer: ReturnType<typeof setInterval> | null = null

  const filteredSkills = computed(() => {
    let result = skills.value
    
    if (selectedTag.value) {
      result = result.filter(skill => 
        skill.tags.includes(selectedTag.value)
      )
    }
    
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

  const gitHubSkills = computed(() => 
    skills.value.filter(s => s.source.type === 'github')
  )

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
    syncProgress.value.delete(id)
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

  function getSyncProgress(skillId: string): SyncProgress | undefined {
    return syncProgress.value.get(skillId)
  }

  // 加载技能（不自动同步）
  async function loadAndSelectSkill(skillId: string): Promise<Skill | null> {
    const skill = skills.value.find(s => s.id === skillId)
    if (!skill) return null
    selectSkill(skill)
    return skill
  }

  // 同步单个 GitHub 技能
  async function syncGitHubSkill(
    skillId: string, 
    force: boolean = false,
    showMessage: boolean = true
  ): Promise<Skill | null> {
    const skill = skills.value.find(s => s.id === skillId)
    if (!skill || skill.source.type !== 'github' || !skill.source.githubMeta) {
      return null
    }

    if (syncingSkillIds.value.has(skillId)) {
      return null
    }

    syncingSkillIds.value.add(skillId)
    syncProgress.value.set(skillId, { stage: 'checking', current: 0, total: 0 })
    
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
                skill.id,
                skill.files,
                (progress) => syncProgress.value.set(skillId, progress)
              )
              fullSkill.createdAt = skill.createdAt
              await updateSkill(fullSkill)
              if (showMessage) ElMessage.success(`已同步 ${fullSkill.name}`)
              return fullSkill
            }
            syncProgress.value.set(skillId, { stage: 'complete', current: 1, total: 1 })
            return skill
          }
        } catch (e) {
          console.warn('Failed to check remote update:', e)
          if (skill.source.isContentCached) {
            syncProgress.value.set(skillId, { stage: 'complete', current: 1, total: 1 })
            return skill
          }
        }
      }
      
      const fullSkill = await fetchFullSkillFromGitHub(
        meta.repoUrl,
        meta.branch,
        meta.subfolderPath,
        skill.id,
        skill.files,
        (progress) => syncProgress.value.set(skillId, progress)
      )
      fullSkill.createdAt = skill.createdAt
      await updateSkill(fullSkill)
      
      syncProgress.value.set(skillId, { stage: 'complete', current: 1, total: 1 })
      if (showMessage) ElMessage.success(`已同步 ${fullSkill.name}`)
      return fullSkill
    } catch (e) {
      console.error('Failed to sync GitHub skill:', e)
      if (showMessage) ElMessage.error('同步失败，使用本地缓存')
      return skill.source.isContentCached ? skill : null
    } finally {
      syncingSkillIds.value.delete(skillId)
    }
  }

  // 批量同步所有 GitHub 技能
  async function batchSyncAllGitHubSkills(force: boolean = false) {
    if (batchSyncing.value) {
      ElMessage.warning('已有同步任务进行中')
      return
    }

    const skillsToSync = gitHubSkills.value
    if (skillsToSync.length === 0) {
      ElMessage.info('没有 GitHub 技能需要同步')
      return
    }

    batchSyncing.value = true
    batchSyncProgress.value = {
      current: 0,
      total: skillsToSync.length,
      currentSkill: ''
    }

    try {
      for (let i = 0; i < skillsToSync.length; i += BATCH_SIZE) {
        const batch = skillsToSync.slice(i, i + BATCH_SIZE)
        
        for (const skill of batch) {
          batchSyncProgress.value.currentSkill = skill.name
          try {
            await syncGitHubSkill(skill.id, force, false)
          } catch (e) {
            console.error(`Failed to sync ${skill.name}:`, e)
          }
          batchSyncProgress.value.current++
          
          if (i + BATCH_SIZE < skillsToSync.length) {
            await new Promise(r => setTimeout(r, SYNC_DELAY_MS))
          }
        }
      }
      
      ElMessage.success(`批量同步完成，共同步 ${skillsToSync.length} 个技能`)
    } catch (e) {
      console.error('Batch sync failed:', e)
      ElMessage.error('批量同步失败')
    } finally {
      batchSyncing.value = false
      batchSyncProgress.value = { current: 0, total: 0, currentSkill: '' }
    }
  }

  // 启动定时同步任务
  function startAutoSync() {
    if (syncTimer) {
      clearInterval(syncTimer)
    }
    
    const checkAndSync = async () => {
      const now = new Date()
      const lastAutoSyncKey = 'lastAutoSync'
      const lastAutoSync = localStorage.getItem(lastAutoSyncKey)
      
      if (lastAutoSync) {
        const lastSyncDate = new Date(lastAutoSync)
        const hoursSinceLastSync = (now.getTime() - lastSyncDate.getTime()) / (1000 * 60 * 60)
        
        if (hoursSinceLastSync < SYNC_INTERVAL_HOURS) {
          return
        }
      }
      
      if (gitHubSkills.value.length > 0 && !batchSyncing.value) {
        console.log('Starting scheduled GitHub sync...')
        await batchSyncAllGitHubSkills(false)
        localStorage.setItem(lastAutoSyncKey, now.toISOString())
      }
    }
    
    // 立即检查一次
    checkAndSync()
    
    // 每小时检查一次是否需要同步
    syncTimer = setInterval(checkAndSync, 60 * 60 * 1000)
  }

  // 停止定时同步任务
  function stopAutoSync() {
    if (syncTimer) {
      clearInterval(syncTimer)
      syncTimer = null
    }
  }

  onUnmounted(() => {
    stopAutoSync()
  })

  return {
    skills,
    filteredSkills,
    gitHubSkills,
    selectedSkill,
    searchQuery,
    selectedTag,
    loading,
    viewMode,
    syncingSkillIds,
    syncProgress,
    batchSyncing,
    batchSyncProgress,
    loadSkills,
    addSkill,
    updateSkill,
    deleteSkill,
    selectSkill,
    setSearchQuery,
    setSelectedTag,
    setViewMode,
    syncGitHubSkill,
    batchSyncAllGitHubSkills,
    isSyncing,
    getSyncProgress,
    loadAndSelectSkill,
    startAutoSync,
    stopAutoSync
  }
})
