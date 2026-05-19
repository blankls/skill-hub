import { defineStore } from 'pinia'
import { ref, computed, toRaw, onUnmounted } from 'vue'
import type { Skill } from '@/types'
import { db } from '@/utils/db'
import { fetchFullSkillFromGitHub, fetchSkillsFromSameRepo, fetchGitHubRepo, clearRepoCache, type SyncProgress } from '@/utils/githubClient'
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
  const selectedTags = ref<string[]>([])
  const selectedSources = ref<string[]>(['local', 'github'])
  const minRating = ref(0)
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

    if (selectedTags.value.length > 0) {
      result = result.filter(skill =>
        selectedTags.value.some(tag => skill.tags.includes(tag))
      )
    }

    if (selectedSources.value.length > 0) {
      result = result.filter(skill =>
        selectedSources.value.includes(skill.source.type)
      )
    }

    if (minRating.value > 0) {
      result = result.filter(skill =>
        (skill.rating || 0) >= minRating.value
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

  function setSelectedTags(tags: string[]) {
    selectedTags.value = tags
  }

  function toggleSelectedTag(tag: string) {
    const idx = selectedTags.value.indexOf(tag)
    if (idx > -1) {
      selectedTags.value.splice(idx, 1)
    } else {
      selectedTags.value.push(tag)
    }
  }

  function setSelectedSources(sources: string[]) {
    selectedSources.value = sources
  }

  function setMinRating(rating: number) {
    minRating.value = rating
  }

  function clearAllFilters() {
    selectedTag.value = ''
    selectedTags.value = []
    selectedSources.value = ['local', 'github']
    minRating.value = 0
    searchQuery.value = ''
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

  // 批量同步所有 GitHub 技能（按仓库分组高效同步）
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

    let completedCount = 0

    function updateProgress(skillName?: string) {
      batchSyncProgress.value = {
        current: completedCount,
        total: skillsToSync.length,
        currentSkill: skillName || ''
      }
    }

    try {
      if (force) {
        clearRepoCache()
      }

      // 按 repoUrl 分组
      const repoGroups = new Map<string, Skill[]>()
      for (const skill of skillsToSync) {
        const repoUrl = skill.source.githubMeta?.repoUrl
        if (!repoUrl) continue
        const existing = repoGroups.get(repoUrl)
        if (existing) {
          existing.push(skill)
        } else {
          repoGroups.set(repoUrl, [skill])
        }
      }

      for (const [repoUrl, groupSkills] of repoGroups) {
        if (groupSkills.length === 1) {
          // 单技能仓库 → 走原来的流程
          const skill = groupSkills[0]
          updateProgress(skill.name)
          try {
            await syncGitHubSkill(skill.id, force, false)
          } catch (e) {
            console.error(`Failed to sync ${skill.name}:`, e)
          }
          completedCount++
          updateProgress()
        } else {
          // 多技能同仓 → 高效批量同步
          const meta = groupSkills[0].source.githubMeta!
          const branch = meta.branch

          const skillConfigs = groupSkills.map(s => ({
            id: s.id,
            name: s.name,
            subfolderPath: s.source.githubMeta?.subfolderPath,
            existingFiles: s.files,
            force
          }))

          try {
            const updatedSkills = await fetchSkillsFromSameRepo(
              repoUrl,
              branch,
              skillConfigs,
              (skillId, progress) => {
                syncProgress.value.set(skillId, progress)
              }
            )

            for (const updatedSkill of updatedSkills) {
              const original = groupSkills.find(s => s.id === updatedSkill.id)
              if (original) {
                updatedSkill.createdAt = original.createdAt
                await updateSkill(updatedSkill)
              }
              completedCount++
              updateProgress(updatedSkill.name)
            }
          } catch (e) {
            console.error(`Failed to batch sync from repo ${repoUrl}:`, e)
            // 降级：逐个同步
            for (const skill of groupSkills) {
              updateProgress(skill.name)
              try {
                await syncGitHubSkill(skill.id, force, false)
              } catch (e2) {
                console.error(`Failed to sync ${skill.name}:`, e2)
              }
              completedCount++
            }
            updateProgress()
          }
        }
      }

      completedCount = skillsToSync.length
      updateProgress()
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
    selectedTags,
    selectedSources,
    minRating,
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
    setSelectedTags,
    toggleSelectedTag,
    setSelectedSources,
    setMinRating,
    clearAllFilters,
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
