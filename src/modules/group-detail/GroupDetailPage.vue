<template>
  <div class="h-full bg-[var(--dark-bg)] overflow-hidden relative">
    <div v-if="loading" class="flex items-center justify-center py-20">
      <el-icon class="text-4xl text-[var(--neon-cyan)] animate-spin"><Loading /></el-icon>
      <p class="ml-4 text-[var(--text-muted)]">加载分组中...</p>
    </div>

    <template v-else-if="group">
      <div class="h-full overflow-y-auto scrollbar-auto">
        <div class="mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-12 py-6 sm:py-8 lg:py-10 2xl:py-14 pt-24 lg:pt-12 max-w-[100rem]">
          <div class="rounded-xl overflow-hidden border border-[var(--neon-purple)]/30 mb-6" style="background: var(--dark-card)">
            <div class="px-6 py-4 border-b border-[var(--neon-purple)]/15 flex items-center gap-3" style="background: rgba(168,85,247,0.05)">
              <div
                class="w-10 h-10 sm:w-12 sm:h-12 2xl:w-14 2xl:h-14 rounded-xl flex items-center justify-center text-white text-lg sm:text-xl 2xl:text-2xl font-black font-mono shadow-lg"
                :style="{ background: `linear-gradient(to bottom right, ${group.iconColor || 'var(--neon-purple),var(--neon-cyan)'})` }"
              >
                {{ group.name.charAt(0).toUpperCase() }}
              </div>
              <span class="font-semibold text-xl sm:text-2xl 2xl:text-3xl" style="color: var(--text-light)">{{ group.name }}</span>
              <span class="ml-auto px-3 py-1.5 rounded-full bg-[var(--neon-purple)]/10 text-[var(--neon-purple)] border border-[var(--neon-purple)]/30 text-xs 2xl:text-sm font-mono">
                {{ groupSkills.length }} 个技能
              </span>
            </div>
            <div class="p-6">
              <p v-if="group.description" class="text-base 2xl:text-lg leading-relaxed mb-4" style="color: var(--text-muted)">{{ group.description }}</p>
              <div v-if="aggregatedTags.length > 0" class="flex flex-wrap gap-1.5">
                <span v-for="tag in aggregatedTags" :key="tag"
                  class="px-2.5 py-0.5 bg-[var(--neon-purple)]/15 border border-[var(--neon-purple)]/30 text-[var(--neon-purple)] rounded-full text-xs font-mono">
                  #{{ tag }}
                </span>
              </div>
            </div>
          </div>

          <div class="mb-6">
            <div class="flex items-center gap-2 mb-4">
              <span class="text-lg">🧠</span>
              <span class="font-semibold text-base 2xl:text-lg" style="color: var(--text-light)">包含技能</span>
              <span class="text-xs text-[var(--text-muted)] ml-1">{{ groupSkills.length }} 个</span>
            </div>
            <div v-if="groupSkills.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <SkillCard
                v-for="skill in groupSkills"
                :key="skill.id"
                :skill="skill"
                :show-admin-actions="false"
                :hide-actions="true"
                @edit="handleEditSkill"
              />
            </div>
            <div v-else class="rounded-xl p-10 border border-[var(--neon-cyan)]/15 text-center" style="background: var(--dark-card)">
              <div class="text-4xl mb-4">📭</div>
              <h2 class="text-xl font-semibold mb-2" style="color: var(--text-muted)">暂无技能</h2>
              <p style="color: var(--text-muted)">该分组下还没有关联的技能</p>
            </div>
          </div>
        </div>
      </div>

      <DetailSidebar
        :nav-items="navItems"
        top-offset="5rem"
        @back="router.back()"
        @navigate="openOverlay"
      >
        <template #right-actions>
          <button
            v-if="!isFromAdmin"
            @click="handleLike"
            :disabled="likeDisabled"
            class="sidebar-btn action-btn w-12 h-12 xl:w-14 xl:h-14 rounded-xl flex items-center justify-center transition-all duration-200 group relative border border-[rgba(14,165,233,0.15)]"
            :class="[likeDisabled ? 'opacity-40 cursor-not-allowed' : (liking ? 'bg-orange-500/15 border-orange-500/30 hover:scale-115' : 'hover:bg-[var(--neon-cyan)]/10 hover:scale-115')]"
            :title="likeDisabled ? '请稍候...' : (liking ? '取消点赞' : '点赞')"
          >
            <span class="text-xl xl:text-2xl">{{ liking ? '❤️' : '🤍' }}</span>
            <span
              class="absolute right-full mr-2 px-2 py-1 rounded-md text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
              style="background: var(--dark-card); color: var(--text-light); border: 1px solid rgba(14,165,233,0.2)"
            >{{ liking ? '取消点赞' : '点赞' }}</span>
          </button>
          <button
            v-if="isFromAdmin"
            @click="showGroupEditor = true"
            class="sidebar-btn action-btn w-12 h-12 xl:w-14 xl:h-14 rounded-xl flex items-center justify-center transition-all duration-200 hover:bg-[var(--neon-cyan)]/10 hover:scale-115 group relative border border-[rgba(14,165,233,0.15)]"
            title="编辑"
          >
            <span class="text-xl xl:text-2xl">✏️</span>
            <span
              class="absolute right-full mr-2 px-2 py-1 rounded-md text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
              style="background: var(--dark-card); color: var(--text-light); border: 1px solid rgba(14,165,233,0.2)"
            >编辑</span>
          </button>
          <button
            @click="handleExportGroup"
            :disabled="exporting"
            class="sidebar-btn action-btn w-12 h-12 xl:w-14 xl:h-14 rounded-xl flex items-center justify-center transition-all duration-200 hover:bg-[var(--neon-cyan)]/10 hover:scale-115 group relative border border-[rgba(14,165,233,0.15)]"
            title="导出"
          >
            <span class="text-xl xl:text-2xl">{{ exporting ? '⏳' : '📥' }}</span>
            <span
              class="absolute right-full mr-2 px-2 py-1 rounded-md text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
              style="background: var(--dark-card); color: var(--text-light); border: 1px solid rgba(14,165,233,0.2)"
            >导出</span>
          </button>
          <button
            v-if="isFromAdmin"
            @click="handleDeleteGroup"
            class="sidebar-btn action-btn w-12 h-12 xl:w-14 xl:h-14 rounded-xl flex items-center justify-center transition-all duration-200 hover:bg-red-500/10 hover:scale-115 group relative border border-[rgba(14,165,233,0.15)]"
            title="删除"
          >
            <span class="text-xl xl:text-2xl">🗑️</span>
            <span
              class="absolute right-full mr-2 px-2 py-1 rounded-md text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
              style="background: var(--dark-card); color: var(--text-light); border: 1px solid rgba(14,165,233,0.2)"
            >删除</span>
          </button>
        </template>
      </DetailSidebar>

      <GuideOverlay
        v-model="showGuide"
        :group-name="group.name"
        :readme="group.readme"
      />

      <GroupEditorModal v-model="showGroupEditor" :group="group" @save="handleSaveGroup" />
      <SkillEditor v-model="showSkillEditor" :skill="editingSkill" @save="handleSaveSkill" />
    </template>

    <div v-else class="text-center py-20">
      <h2 class="text-2xl font-bold mb-4 text-[var(--text-light)]">未找到分组</h2>
      <router-link to="/skills">
        <el-button type="primary" class="bg-gradient-to-r from-[var(--neon-cyan)] to-[var(--neon-purple)] border-none text-white font-bold">
          返回技能库
        </el-button>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, defineAsyncComponent } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'
import { useSkillStore } from '@/stores/skillStore'
import { useAuthStore } from '@/stores/authStore'
import SkillCard from '@/components/ui/SkillCard.vue'
import DetailSidebar from '@/components/features/DetailSidebar.vue'
import GroupEditorModal from '@/components/features/GroupEditorModal.vue'
import GuideOverlay from './components/GuideOverlay.vue'
import type { Skill, SkillGroup } from '@/types'
import { exportGroupToZip, downloadBlob } from '@/utils/zipHandler'
import { getLikedGroups, saveLikedGroup, removeLikedGroup } from '@/utils/likedStorage'

const SkillEditor = defineAsyncComponent(() => import('@/components/features/SkillEditor.vue'))

const route = useRoute()
const router = useRouter()
const skillStore = useSkillStore()
const authStore = useAuthStore()

const loading = ref(true)
const liking = ref(false)
const likeDisabled = ref(false)
const exporting = ref(false)
const showGroupEditor = ref(false)
const showSkillEditor = ref(false)
const showGuide = ref(false)
const editingSkill = ref<Skill | undefined>()

const group = computed<SkillGroup | null>(() => {
  return skillStore.groups.find(g => g.id === route.params.id) || null
})

const groupSkills = computed<Skill[]>(() => {
  if (!group.value) return []
  const ids = new Set(group.value.skillIds || [])
  return skillStore.skills.filter(s => ids.has(s.id))
})

const aggregatedTags = computed(() => {
  return [...new Set(groupSkills.value.flatMap(s => s.tags || []))].sort()
})

const isFromAdmin = computed(() => {
  return route.path.startsWith('/admin') && authStore.isAuthenticated
})

const navItems = computed(() => {
  return [
    { id: 'guide', icon: '📘', label: '指导' },
  ]
})

function openOverlay(id: string) {
  if (id === 'guide') showGuide.value = true
}

async function handleLike() {
  if (!group.value || likeDisabled.value) return
  likeDisabled.value = true
  try {
    if (liking.value) {
      removeLikedGroup(group.value.id)
      liking.value = false
    } else {
      saveLikedGroup(group.value.id)
      liking.value = true
    }
  } finally {
    likeDisabled.value = false
  }
}

async function handleExportGroup() {
  if (!group.value || exporting.value) return
  exporting.value = true
  try {
    const blob = await exportGroupToZip(group.value.name, groupSkills.value)
    downloadBlob(blob, `${group.value.name}.zip`)
    ElMessage.success('导出成功！')
  } catch {
    ElMessage.error('导出失败')
  } finally {
    exporting.value = false
  }
}

function handleEditSkill(skill: Skill) {
  editingSkill.value = skill
  showSkillEditor.value = true
}

async function handleSaveSkill(skill: Skill) {
  try {
    await skillStore.updateSkill(skill)
    ElMessage.success('技能更新成功')
    showSkillEditor.value = false
  } catch {
    ElMessage.error('保存失败')
  }
}

async function handleSaveGroup(updatedGroup: SkillGroup) {
  try {
    const oldGroup = skillStore.groups.find(g => g.id === updatedGroup.id)
    const oldSkillIds = new Set(oldGroup?.skillIds || [])
    const newSkillIds = new Set(updatedGroup.skillIds)

    await skillStore.updateGroup(updatedGroup)

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
      if (skill && skill.group !== updatedGroup.name) {
        skill.group = updatedGroup.name
        await skillStore.updateSkill(skill)
      }
    }

    ElMessage.success('分组已更新')
  } catch {
    ElMessage.error('保存分组失败')
  }
}

async function handleDeleteGroup() {
  if (!group.value) return
  try {
    await ElMessageBox.confirm(
      `确定删除分组「${group.value.name}」？组内 ${groupSkills.value.length} 个技能将变为未分组。`,
      '确认删除',
      { confirmButtonText: '删除', cancelButtonText: '取消', type: 'warning' }
    )
    await skillStore.deleteGroup(group.value.id)
    const { db } = await import('@/utils/db')
    for (const skill of groupSkills.value) {
      skill.group = ''
      skill.updatedAt = new Date()
      await db.update(JSON.parse(JSON.stringify(skill)))
    }
    ElMessage.success('分组已删除')
    router.push(isFromAdmin.value ? '/admin' : '/skills')
  } catch { /* cancel */ }
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && showGuide.value) {
    showGuide.value = false
  }
}

onMounted(async () => {
  if (skillStore.skills.length === 0) {
    await skillStore.loadSkills()
  }
  loading.value = false
  if (group.value) {
    liking.value = getLikedGroups().has(group.value.id)
  }
  document.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown)
})
</script>
