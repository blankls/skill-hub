<template>
  <div class="h-full bg-[var(--dark-bg)] flex flex-col overflow-hidden">
    <!-- 未登录状态 -->
    <div v-if="!isAuthenticated" class="h-full flex items-center justify-center">
      <div class="text-center">
        <div class="text-6xl mb-6">🔒</div>
        <h2 class="text-2xl font-bold text-[var(--text-light)] mb-3">需要身份验证</h2>
        <p class="text-[var(--text-muted)] mb-6">正在跳转到登录...</p>
      </div>
    </div>

    <!-- 已登录 -->
    <div v-else class="flex-1 min-h-0 flex flex-col">
      <!-- 顶部区 -->
      <div class="px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-12 py-6 border-b border-white/5">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 class="text-3xl font-bold text-[var(--text-light)]">技能管理</h1>
            <p class="mt-1 text-[var(--text-muted)]">管理技能库中的技能和分组</p>
          </div>
          <div class="flex items-center gap-3">
            <button
              @click="handleLogout"
              class="px-4 py-2.5 bg-[var(--dark-card)] border border-[var(--neon-cyan)]/30 text-[var(--text-light)] font-medium rounded-lg transition-all duration-300 hover:bg-[var(--neon-cyan)]/10 hover:border-[var(--neon-cyan)] flex items-center gap-2"
            >
              <el-icon><SwitchButton /></el-icon>
              登出
            </button>
            <button
              @click="showGroupEditor = true"
              class="px-5 py-2.5 bg-gradient-to-r from-[var(--neon-purple)] to-[var(--neon-cyan)] text-white font-bold rounded-lg transition-all duration-300 hover:shadow-[0_0_20px_rgba(168,85,247,0.5)] flex items-center gap-2 hover:scale-105"
            >
              <el-icon class="text-lg"><FolderAdd /></el-icon>
              添加分组
            </button>
            <button
              @click="openCreateSkill"
              class="px-6 py-2.5 bg-gradient-to-r from-[var(--neon-cyan)] to-[var(--neon-purple)] text-white font-bold rounded-lg transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,245,255,0.5)] flex items-center gap-2 hover:scale-105"
            >
              <el-icon class="text-lg"><Plus /></el-icon>
              添加技能
            </button>
          </div>
        </div>

        <!-- 统计卡片 -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="bg-[var(--dark-card)] border border-[var(--neon-cyan)]/30 rounded-xl p-5 flex items-center gap-4">
            <div class="w-14 h-14 rounded-lg bg-gradient-to-br from-[var(--neon-cyan)]/20 to-[var(--neon-cyan)]/5 flex items-center justify-center">
              <span class="text-2xl">🧠</span>
            </div>
            <div>
              <div class="text-3xl font-bold text-[var(--neon-cyan)] font-mono">{{ skillStore.skills.length }}</div>
              <div class="text-sm text-[var(--text-muted)] mt-0.5">技能总数</div>
            </div>
          </div>
          <div class="bg-[var(--dark-card)] border border-[var(--neon-purple)]/30 rounded-xl p-5 flex items-center gap-4">
            <div class="w-14 h-14 rounded-lg bg-gradient-to-br from-[var(--neon-purple)]/20 to-[var(--neon-purple)]/5 flex items-center justify-center">
              <span class="text-2xl">🏷️</span>
            </div>
            <div>
              <div class="text-3xl font-bold text-[var(--neon-purple)] font-mono">{{ totalTags }}</div>
              <div class="text-sm text-[var(--text-muted)] mt-0.5">标签数量</div>
            </div>
          </div>
          <div class="bg-[var(--dark-card)] border border-[var(--neon-yellow)]/30 rounded-xl p-5 flex items-center gap-4">
            <div class="w-14 h-14 rounded-lg bg-gradient-to-br from-[var(--neon-yellow)]/20 to-[var(--neon-yellow)]/5 flex items-center justify-center">
              <span class="text-2xl">📄</span>
            </div>
            <div>
              <div class="text-3xl font-bold text-[var(--neon-yellow)] font-mono">{{ totalFiles }}</div>
              <div class="text-sm text-[var(--text-muted)] mt-0.5">文件总数</div>
            </div>
          </div>
          <div class="bg-[var(--dark-card)] border border-[var(--neon-green)]/30 rounded-xl p-5 flex items-center gap-4 cursor-pointer hover:bg-[var(--neon-green)]/5 transition-all duration-300" @click="handleQuickSync">
            <div class="w-14 h-14 rounded-lg bg-gradient-to-br from-[var(--neon-green)]/20 to-[var(--neon-green)]/5 flex items-center justify-center">
              <el-icon v-if="skillStore.batchSyncing" class="text-2xl animate-spin text-[var(--neon-green)]"><Loading /></el-icon>
              <span v-else class="text-2xl">🐙</span>
            </div>
            <div class="flex-1">
              <div class="text-3xl font-bold text-[var(--neon-green)] font-mono">{{ gitHubSkillCount }}</div>
              <div class="text-sm text-[var(--text-muted)] mt-0.5">GitHub 技能</div>
            </div>
            <div class="text-[var(--neon-green)] text-xs opacity-70">点击同步</div>
          </div>
        </div>

        <!-- 同步进度 -->
        <div v-if="skillStore.batchSyncing" class="mt-4 p-4 bg-[var(--dark-card)] border border-[var(--neon-cyan)]/30 rounded-xl">
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
      </div>

      <!-- 主体两栏 -->
      <div class="flex-1 min-h-0 flex overflow-hidden px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-12 py-6 gap-6">
        <!-- 侧边栏 -->
        <AdminSidebar
          :groups="sidebarGroups"
          :selected-group="selectedGroup"
          :ungrouped-count="ungroupedSkills.length"
          @select="handleGroupSelect"
        />

        <!-- 内容区 -->
        <div class="flex-1 min-w-0 overflow-y-auto scrollbar-auto">
          <div v-if="skillStore.loading" class="flex items-center justify-center py-20">
            <el-icon class="animate-spin text-4xl text-[var(--neon-cyan)]"><Loading /></el-icon>
          </div>

          <div v-else-if="skillStore.skills.length === 0" class="text-center py-20">
            <div class="text-4xl mb-4">📦</div>
            <p class="text-[var(--text-muted)]">暂无技能，点击上方「添加技能」开始</p>
          </div>

          <!-- 全部技能视图 -->
          <template v-else-if="selectedGroup === undefined">
            <AdminGroupView
              :skills="skillStore.skills"
              @edit="handleEdit"
              @editGroup="handleEditGroup"
            />
            <div v-if="ungroupedSkills.length > 0" class="mt-8">
              <div class="flex items-baseline gap-2 mb-4">
                <h2 class="text-lg font-semibold text-[var(--text-muted)]">未分组技能</h2>
                <span class="text-sm text-[var(--text-muted)] opacity-70">{{ ungroupedSkills.length }} 个</span>
              </div>
              <div class="skill-grid">
                <SkillCard
                  v-for="skill in ungroupedSkills"
                  :key="skill.id"
                  :skill="skill"
                  :show-admin-actions="true"
                  @edit="handleEdit"
                />
              </div>
            </div>
          </template>

          <!-- 特定分组视图 -->
          <template v-else-if="selectedGroup !== '__ungrouped__'">
            <div class="mb-4">
              <h2 class="text-xl font-bold text-[var(--text-light)]">{{ selectedGroup }}</h2>
              <p class="text-sm text-[var(--text-muted)] mt-1">{{ selectedGroupSkills.length }} 个技能</p>
            </div>
            <div class="skill-grid">
              <SkillCard
                v-for="skill in selectedGroupSkills"
                :key="skill.id"
                :skill="skill"
                :show-admin-actions="true"
                @edit="handleEdit"
              />
            </div>
          </template>

          <!-- 未分组视图 -->
          <template v-else>
            <div class="mb-4">
              <h2 class="text-xl font-bold text-[var(--text-muted)]">未分组技能</h2>
              <p class="text-sm text-[var(--text-muted)] mt-1">{{ ungroupedSkills.length }} 个</p>
            </div>
            <div class="skill-grid">
              <SkillCard
                v-for="skill in ungroupedSkills"
                :key="skill.id"
                :skill="skill"
                :show-admin-actions="true"
                @edit="handleEdit"
              />
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- 模态框 -->
    <SkillImportModal v-model="showImport" @imported="handleImported" />
    <SkillEditor v-model="showEdit" :skill="editingSkill" @save="handleSave" />
    <GroupEditorModal v-model="showGroupEditor" :group="editingGroup" @save="handleSaveGroup" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, defineAsyncComponent } from 'vue'
import { useSkillStore } from '@/stores/skillStore'
import { useAuthStore } from '@/stores/authStore'
import SkillImportModal from '@/components/features/SkillImportModal.vue'
import GroupEditorModal from '@/components/features/GroupEditorModal.vue'
import AdminGroupView from '@/modules/admin/AdminGroupView.vue'
import AdminSidebar from '@/modules/admin/components/AdminSidebar.vue'
import SkillCard from '@/components/ui/SkillCard.vue'
const SkillEditor = defineAsyncComponent(() => import('@/components/features/SkillEditor.vue'))
import type { Skill, SkillGroup } from '@/types'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Loading, SwitchButton, FolderAdd } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const skillStore = useSkillStore()
const authStore = useAuthStore()
const isAuthenticated = computed(() => authStore.isAuthenticated)
const showImport = ref(false)
const showEdit = ref(false)
const editingSkill = ref<Skill | undefined>()
const showGroupEditor = ref(false)
const editingGroup = ref<SkillGroup | undefined>()
const selectedGroup = ref<string | undefined>(undefined)

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

const ungroupedSkills = computed(() => {
  const groupedIds = new Set<string>()
  for (const g of skillStore.groups) {
    for (const id of g.skillIds || []) {
      groupedIds.add(id)
    }
  }
  return skillStore.skills.filter(s => !groupedIds.has(s.id))
})

const sidebarGroups = computed(() => {
  const skillMap = new Map(skillStore.skills.map(s => [s.id, s]))
  return skillStore.groups.map(g => ({
    name: g.name,
    iconColor: g.iconColor,
    skills: (g.skillIds || []).map(id => skillMap.get(id)).filter(s => !!s) as { id: string }[]
  }))
})

const selectedGroupSkills = computed(() => {
  if (!selectedGroup.value || selectedGroup.value === '__ungrouped__') return []
  const group = skillStore.groups.find(g => g.name === selectedGroup.value)
  if (!group) return []
  const skillMap = new Map(skillStore.skills.map(s => [s.id, s]))
  return (group.skillIds || []).map(id => skillMap.get(id)).filter(s => !!s) as Skill[]
})

function handleGroupSelect(name: string | undefined) {
  selectedGroup.value = name
}

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

async function handleSaveGroup(group: SkillGroup) {
  try {
    const isEdit = skillStore.groups.some(g => g.id === group.id)
    const oldGroup = isEdit ? skillStore.groups.find(g => g.id === group.id) : null
    const oldSkillIds = new Set(oldGroup?.skillIds || [])
    const newSkillIds = new Set(group.skillIds)

    if (isEdit) {
      await skillStore.updateGroup(group)
    } else {
      await skillStore.addGroup(group)
    }

    for (const id of oldSkillIds) {
      if (!newSkillIds.has(id)) {
        const skill = skillStore.skills.find(s => s.id === id)
        if (skill) {
          skill.group = ''
          await skillStore.updateSkill(skill)
        }
      }
    }

    for (const id of newSkillIds) {
      const skill = skillStore.skills.find(s => s.id === id)
      if (skill && skill.group !== group.name) {
        skill.group = group.name
        await skillStore.updateSkill(skill)
      }
    }

    ElMessage.success(isEdit ? '分组已更新' : '分组已创建')
  } catch (e) {
    ElMessage.error('保存分组失败')
  }
}

function handleEditGroup(group: any) {
  editingGroup.value = group.groupEntity
  showGroupEditor.value = true
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

      if (result.lockUntil) {
        const lockTime = new Date(result.lockUntil)
        const minutes = Math.ceil((lockTime.getTime() - Date.now()) / 60000)
        lockedMessage = `账户已锁定，请 ${minutes} 分钟后再试`
        ElMessage.error(result.error)
        break
      }

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
.skill-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.25rem;
}

@media (max-width: 768px) {
  .skill-grid {
    grid-template-columns: 1fr;
  }
}
</style>
