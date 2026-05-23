<template>
  <div class="h-full bg-[var(--dark-bg)] flex flex-col overflow-hidden">
    <!-- 未登录状态：什么都不显示，只处理登录流程 -->
    <div v-if="!isAuthenticated" class="h-full flex items-center justify-center">
    </div>
    
    <!-- 已登录状态：显示管理页面 -->
    <div v-else class="flex-1 min-h-0 overflow-y-auto scrollbar-auto max-w-[95rem] mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 class="text-3xl font-bold text-[var(--text-light)]">技能管理</h1>
          <p class="mt-1 text-[var(--text-muted)]">管理技能库中的技能，添加、编辑和删除技能</p>
        </div>
        <div class="flex items-center gap-3">
          <!-- 登出按钮 -->
          <button
            @click="handleLogout"
            class="px-4 py-2.5 bg-[var(--dark-card)] border border-[var(--neon-cyan)]/30 text-[var(--text-light)] font-medium rounded-lg transition-all duration-300 hover:bg-[var(--neon-cyan)]/10 hover:border-[var(--neon-cyan)] flex items-center gap-2"
          >
            <el-icon><SwitchButton /></el-icon>
            登出
          </button>
          <!-- 添加技能按钮 -->
          <div class="flex items-center gap-3">
            <button
              @click="openCreateSkill"
              class="px-6 py-2.5 bg-gradient-to-r from-[var(--neon-cyan)] to-[var(--neon-purple)] text-white font-bold rounded-lg transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,245,255,0.5)] flex items-center gap-2 hover:scale-105"
            >
              <el-icon class="text-lg"><Plus /></el-icon>
              添加技能
            </button>
          </div>
        </div>
      </div>

      <!-- 统计卡片 -->
      <div class="flex items-center gap-6 mb-6 flex-wrap">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1 min-w-0">
          <div class="bg-[var(--dark-card)] border border-[var(--neon-cyan)]/30 rounded-xl p-4 flex items-center gap-4">
            <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-[var(--neon-cyan)]/20 to-[var(--neon-cyan)]/5 flex items-center justify-center">
              <span class="text-2xl">🧠</span>
            </div>
            <div>
              <div class="text-2xl font-bold text-[var(--neon-cyan)] font-mono">{{ skillStore.skills.length }}</div>
              <div class="text-sm text-[var(--text-muted)]">技能总数</div>
            </div>
          </div>
          <div class="bg-[var(--dark-card)] border border-[var(--neon-purple)]/30 rounded-xl p-4 flex items-center gap-4">
            <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-[var(--neon-purple)]/20 to-[var(--neon-purple)]/5 flex items-center justify-center">
              <span class="text-2xl">🏷️</span>
            </div>
            <div>
              <div class="text-2xl font-bold text-[var(--neon-purple)] font-mono">{{ totalTags }}</div>
              <div class="text-sm text-[var(--text-muted)]">标签数量</div>
            </div>
          </div>
          <div class="bg-[var(--dark-card)] border border-[var(--neon-yellow)]/30 rounded-xl p-4 flex items-center gap-4">
            <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-[var(--neon-yellow)]/20 to-[var(--neon-yellow)]/5 flex items-center justify-center">
              <span class="text-2xl">📄</span>
            </div>
            <div>
              <div class="text-2xl font-bold text-[var(--neon-yellow)] font-mono">{{ totalFiles }}</div>
              <div class="text-sm text-[var(--text-muted)]">文件总数</div>
            </div>
          </div>
          <div class="bg-[var(--dark-card)] border border-[var(--neon-green)]/30 rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:bg-[var(--neon-green)]/5 transition-all duration-300" @click="handleQuickSync">
            <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-[var(--neon-green)]/20 to-[var(--neon-green)]/5 flex items-center justify-center">
              <el-icon v-if="skillStore.batchSyncing" class="text-2xl animate-spin text-[var(--neon-green)]"><Loading /></el-icon>
              <span v-else class="text-2xl">🐙</span>
            </div>
            <div class="flex-1">
              <div class="text-2xl font-bold text-[var(--neon-green)] font-mono">{{ gitHubSkillCount }}</div>
              <div class="text-sm text-[var(--text-muted)]">GitHub 技能</div>
            </div>
            <div class="text-[var(--neon-green)] text-xs opacity-70">
              点击同步
            </div>
          </div>
        </div>
      </div>

      <!-- 同步进度提示 -->
      <div v-if="skillStore.batchSyncing" class="mb-6 p-4 bg-[var(--dark-card)] border border-[var(--neon-cyan)]/30 rounded-xl">
        <div class="flex items-center gap-3">
          <el-icon class="animate-spin text-[var(--neon-cyan)]"><Loading /></el-icon>
          <div class="flex-1">
            <div class="text-[var(--text-light)]">正在同步 GitHub 技能</div>
            <div class="text-sm text-[var(--text-muted)] mt-1">
              {{ skillStore.batchSyncProgress.current }}/{{ skillStore.batchSyncProgress.total }}
              <span v-if="skillStore.batchSyncProgress.currentSkill" class="text-[var(--neon-cyan)] ml-2">
                {{ skillStore.batchSyncProgress.currentSkill }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 技能列表 -->
      <div v-if="skillStore.loading" class="flex items-center justify-center py-20">
        <el-icon class="animate-spin text-4xl text-[var(--neon-cyan)]"><Loading /></el-icon>
      </div>
      <div v-else-if="skillStore.skills.length === 0" class="text-center py-20">
        <div class="text-4xl mb-4">📦</div>
        <p class="text-[var(--text-muted)]">暂无技能，点击上方「添加技能」开始</p>
      </div>
      <div v-else>
        <SkillListView 
          :skills="skillStore.skills" 
          :showAdminActions="true"
          @edit="handleEdit"
        />
      </div>
    </div>

    <!-- 导入模态框 -->
    <SkillImportModal v-model="showImport" @imported="handleImported" />
    
    <!-- 编辑模态框 -->
    <SkillEditor v-model="showEdit" :skill="editingSkill" @save="handleSave" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useSkillStore } from '@/stores/skillStore'
import { useAuthStore } from '@/stores/authStore'
import SkillImportModal from '@/components/features/SkillImportModal.vue'
import SkillListView from '@/modules/skill-list/components/SkillListView.vue'
import SkillEditor from '@/components/features/SkillEditor.vue'
import type { Skill } from '@/types'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Loading, SwitchButton } from '@element-plus/icons-vue'

import { useRouter } from 'vue-router'

const router = useRouter()
const skillStore = useSkillStore()
const authStore = useAuthStore()
const isAuthenticated = computed(() => authStore.isAuthenticated)
const showImport = ref(false)
const showEdit = ref(false)
const editingSkill = ref<Skill | undefined>()

const totalTags = computed(() => {
  const allTags = new Set<string>()
  skillStore.skills.forEach(s => s.tags?.forEach(t => allTags.add(t)))
  return allTags.size
})

const totalFiles = computed(() => {
  return skillStore.skills.reduce((sum, s) => sum + (s.files?.length || 0), 0)
})

const gitHubSkillCount = computed(() => {
  return skillStore.gitHubSkills.length
})

function openCreateSkill() {
  showImport.value = true
}

function handleImported() {
  skillStore.loadSkills()
}

function handleEdit(skill: Skill) {
  editingSkill.value = skill
  showEdit.value = true
}

async function handleSave(skill: Skill) {
  try {
    await skillStore.updateSkill(skill)
    ElMessage.success('保存成功！')
    showEdit.value = false
  } catch (e) {
    ElMessage.error('保存失败')
  }
}

async function handleLogout() {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '确认登出', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    })
    authStore.logout()
    skillStore.stopAutoSync()
    router.replace('/')
    ElMessage.success('已安全登出')
  } catch {
    // 用户取消
  }
}

async function handleQuickSync() {
  if (skillStore.batchSyncing) return
  await skillStore.batchSyncAllGitHubSkills(false)
}

onMounted(async () => {
  if (!authStore.checkSession()) {
    await promptPassword()
  }
  if (!isAuthenticated.value) return
  await skillStore.loadSkills()
  skillStore.startAutoSync()
})

async function promptPassword() {
  const maxRetries = 3
  let lockedMessage = ''
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const { value } = await ElMessageBox.prompt(
        lockedMessage || (i > 0 ? `密码错误，还剩 ${maxRetries - i} 次机会` : '请输入管理密码'),
        '身份验证',
        {
          inputType: 'password',
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          inputValidator(val) {
            if (!val) return '请输入密码'
            return true
          }
        }
      )
      
      const result = await authStore.login(value!)
      
      if (result.success) {
        return
      }
      
      // 处理锁定
      if (result.lockUntil) {
        const lockTime = new Date(result.lockUntil)
        const minutes = Math.ceil((lockTime.getTime() - Date.now()) / 60000)
        lockedMessage = `账户已锁定，请 ${minutes} 分钟后再试`
        ElMessage.error(result.error)
        break
      }
      
      // 普通错误，继续循环
      lockedMessage = ''
    } catch {
      break
    }
  }
  router.replace('/')
}

onUnmounted(() => {
  skillStore.stopAutoSync()
})
</script>

<style scoped>
/* Mobile Responsive */
@media (max-width: 768px) {
  .px-4.sm\:px-6.lg\:px-8 {
    padding: 1rem !important;
  }
  
  .py-12 {
    padding-top: 2rem !important;
    padding-bottom: 2rem !important;
  }
  
  .flex.flex-col.md\:flex-row {
    flex-direction: column !important;
    gap: 1rem !important;
  }
  
  h1 {
    font-size: 1.5rem !important;
  }
  
  .flex.items-center.gap-3 {
    width: 100% !important;
  }
  
  .flex.items-center.gap-3 button {
    flex: 1 !important;
  }
  
  .grid.grid-cols-1.md\:grid-cols-4 {
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  }
  
  .w-12.h-12 {
    width: 2.5rem !important;
    height: 2.5rem !important;
  }
  
  .text-2xl.font-bold {
    font-size: 1.25rem !important;
  }
  
  .flex.items-center.gap-6.mb-6 {
    flex-direction: column !important;
  }
  
  .flex.items-center.gap-6.mb-6 .flex.flex-col {
    flex-direction: row !important;
    width: 100% !important;
  }
}

@media (max-width: 640px) {
  .grid.grid-cols-1.md\:grid-cols-4 {
    grid-template-columns: repeat(1, minmax(0, 1fr)) !important;
  }
  
  .flex.items-center.gap-3 button {
    width: 100% !important;
  }
}
</style>
