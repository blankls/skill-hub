<template>
  <div class="min-h-screen bg-[var(--dark-bg)]">
    <div class="max-w-[95rem] mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div v-if="loading" class="flex items-center justify-center py-20">
        <el-icon class="text-4xl text-[var(--neon-cyan)] animate-spin"><Loading /></el-icon>
        <p class="ml-4 text-[var(--text-muted)]">加载技能中...</p>
      </div>
      <template v-else-if="skill">
        <!-- Return Button & Header -->
        <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
          <!-- 左侧：返回按钮 + 技能信息 -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-4 mb-4">
              <el-button
                @click="router.back()"
                class="flex items-center gap-2 bg-[var(--dark-card)] border border-[var(--neon-cyan)]/30 hover:border-[var(--neon-cyan)] hover:bg-[var(--neon-cyan)]/10 text-[var(--text-light)] rounded-xl transition-all"
              >
                <el-icon><ArrowLeft /></el-icon>
                <span>返回</span>
              </el-button>
            </div>
            <div class="min-w-0">
              <h1 class="text-3xl font-bold mb-2 text-[var(--text-light)] truncate">{{ skill.name }}</h1>
              <div class="flex flex-wrap items-center gap-3 mb-2 text-sm">
                <span class="px-2 py-1 rounded-full bg-[var(--neon-yellow)]/10 text-[var(--neon-yellow)] border border-[var(--neon-yellow)]/30">
                  {{ getSourceLabel(skill.source.type) }}
                </span>
                <span class="text-[var(--text-muted)] font-mono">v{{ skill.version }}</span>
                <span v-if="skill.author" class="text-[var(--text-muted)]">
                  <el-icon class="mr-1"><User /></el-icon>{{ skill.author }}
                </span>
              </div>
              <el-tooltip placement="top" :disabled="!isDescriptionLong">
                <template #content>
                  <div class="max-w-lg whitespace-pre-line">{{ skill.description }}</div>
                </template>
                <p 
                  class="text-[var(--text-muted)]"
                  :class="{ 'line-clamp-3 hover:text-[var(--neon-cyan)]': isDescriptionLong }"
                >
                  {{ skill.description }}
                </p>
              </el-tooltip>
            </div>
          </div>

          <!-- 右侧：操作按钮组 -->
          <div class="flex flex-wrap gap-3 items-start">
            <el-button 
              v-if="isGitHubSkill && isFromAdmin" 
              @click="handleSync"
              :loading="syncing"
              class="flex items-center gap-2 bg-[var(--dark-card)] border border-[var(--neon-cyan)]/50 hover:border-[var(--neon-cyan)] text-[var(--text-light)] rounded-xl"
            >
              <el-icon><Refresh /></el-icon> 同步
            </el-button>
            <el-button v-if="isFromAdmin" @click="showEditor = true" class="flex items-center gap-2 bg-[var(--dark-card)] border border-[var(--neon-yellow)]/50 hover:border-[var(--neon-yellow)] text-[var(--text-light)] rounded-xl">
              <el-icon><Edit /></el-icon> 编辑
            </el-button>
            <ZipExportBtn :skill="skill" />
            <el-button v-if="isFromAdmin" type="danger" @click="handleDelete" class="flex items-center gap-2 rounded-xl">
              <el-icon><Delete /></el-icon> 删除
            </el-button>
          </div>
        </div>
        
        <!-- GitHub 同步状态提示 -->
        <div v-if="isGitHubSkill && !skill.source.isContentCached" class="mb-4 p-4 bg-[var(--neon-yellow)]/10 border border-[var(--neon-yellow)]/30 rounded-xl">
          <p class="text-[var(--neon-yellow)] text-sm">
            <el-icon class="mr-1"><InfoFilled /></el-icon>
            此技能内容尚未完全加载，正在从 GitHub 获取完整内容...
          </p>
        </div>
        
        <!-- 同步中提示 -->
        <div v-if="syncing && skill.source.isContentCached" class="mb-4 p-4 bg-[var(--neon-cyan)]/10 border border-[var(--neon-cyan)]/30 rounded-xl">
          <p class="text-[var(--neon-cyan)] text-sm flex items-center gap-2">
            <el-icon class="animate-spin"><Loading /></el-icon>
            正在从 GitHub 同步最新内容...
          </p>
        </div>
        
        <div class="mt-8">
          <el-tabs v-model="activeTab">
            <el-tab-pane label="概览" name="overview">
              <OverviewTab :skill="skill" />
            </el-tab-pane>
            <el-tab-pane label="指导" name="guide">
              <GuideTab :skill="skill" />
            </el-tab-pane>
            <el-tab-pane label="文件" name="files">
              <FilesTab :skill="skill" />
            </el-tab-pane>
          </el-tabs>
        </div>
      </template>
      <div v-else class="text-center py-20">
        <h2 class="text-2xl font-bold mb-4 text-[var(--text-light)]">未找到技能</h2>
        <router-link to="/skills">
          <el-button type="primary" class="bg-gradient-to-r from-[var(--neon-cyan)] to-[var(--neon-purple)] border-none text-white font-bold">
            返回技能库
          </el-button>
        </router-link>
      </div>
    </div>

    <SkillEditor v-model="showEditor" :skill="skill" @save="handleSave" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Loading, ArrowLeft, Edit, Delete, Refresh, InfoFilled, User } from '@element-plus/icons-vue'
import { useSkillStore } from '@/stores/skillStore'
import SkillEditor from '@/components/features/SkillEditor.vue'
import ZipExportBtn from '@/components/features/ZipExportBtn.vue'
import OverviewTab from './components/OverviewTab.vue'
import GuideTab from './components/GuideTab.vue'
import FilesTab from './components/FilesTab.vue'

const route = useRoute()
const router = useRouter()
const skillStore = useSkillStore()
const loading = ref(true)
const syncing = ref(false)
const activeTab = ref('overview')
const showEditor = ref(false)

const skill = computed(() => {
  return skillStore.skills.find(s => s.id === route.params.id) || null
})

const isDescriptionLong = computed(() => {
  return (skill.value?.description?.length || 0) > 150
})

const isGitHubSkill = computed(() => {
  return skill.value?.source.type === 'github'
})

const isFromAdmin = computed(() => {
  return route.path.startsWith('/admin')
})

function getSourceLabel(type: string) {
  const labels: Record<string, string> = {
    local: '本地',
    zip: 'ZIP',
    github: 'GitHub',
    skillmd: 'Markdown'
  }
  return labels[type] || '本地'
}

async function handleSync() {
  if (!skill.value) return
  syncing.value = true
  try {
    await skillStore.syncGitHubSkill(skill.value.id, true)
    ElMessage.success('同步成功')
  } catch (e) {
    ElMessage.error('同步失败')
  } finally {
    syncing.value = false
  }
}

async function handleSave(updatedSkill: any) {
  await skillStore.updateSkill(updatedSkill)
  ElMessage.success('技能更新成功')
}

async function handleDelete() {
  try {
    await ElMessageBox.confirm('确定要删除这个技能吗？', '确认删除', {
      type: 'warning'
    })
    if (skill.value) {
      await skillStore.deleteSkill(skill.value.id)
      ElMessage.success('技能删除成功')
      router.push(isFromAdmin.value ? '/admin' : '/skills')
    }
  } catch (e) {
  }
}

onMounted(async () => {
  if (skillStore.skills.length === 0) {
    await skillStore.loadSkills()
  }
  loading.value = false
})
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

:deep(.el-tabs__header) {
  border-color: rgba(0,245,255,0.2) !important;
}

:deep(.el-tabs__item) {
  color: var(--text-muted) !important;
}

:deep(.el-tabs__item.is-active) {
  color: var(--neon-cyan) !important;
}

:deep(.el-tabs__active-bar) {
  background-color: var(--neon-cyan) !important;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .px-4.sm\:px-6.lg\:px-8 {
    padding: 1rem !important;
  }
  
  .py-12 {
    padding-top: 2rem !important;
    padding-bottom: 2rem !important;
  }
  
  .flex.flex-col.sm\:flex-row {
    flex-direction: column !important;
    gap: 1rem !important;
  }
  
  h1 {
    font-size: 1.5rem !important;
  }
  
  .flex.flex-wrap.gap-3.items-start {
    width: 100% !important;
  }
  
  .flex.flex-wrap.gap-3.items-start .el-button {
    flex: 1 1 45% !important;
  }
  
  :deep(.el-tabs__item) {
    padding-left: 0.75rem !important;
    padding-right: 0.75rem !important;
    font-size: 0.875rem !important;
  }
}

@media (max-width: 640px) {
  .flex.flex-wrap.gap-3.items-start .el-button {
    flex: 1 1 100% !important;
  }
  
  :deep(.el-tabs__item) {
    padding-left: 0.5rem !important;
    padding-right: 0.5rem !important;
    font-size: 0.75rem !important;
  }
}
</style>
