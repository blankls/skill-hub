<template>
  <div class="min-h-screen bg-[var(--dark-bg)]">
    <div class="max-w-[95rem] mx-auto px-4 sm:px-6 lg:px-8 py-12">
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

      <!-- 统计卡片 + 视图切换 同行 -->
      <div class="flex items-center gap-6 mb-6 flex-wrap">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 min-w-0">
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
              <span class="text-2xl">📁</span>
            </div>
            <div>
              <div class="text-2xl font-bold text-[var(--neon-yellow)] font-mono">{{ totalFiles }}</div>
              <div class="text-sm text-[var(--text-muted)]">文件总数</div>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-1 p-1 bg-[var(--dark-card)] border border-[var(--neon-cyan)]/20 rounded-lg shrink-0">
          <button
            @click="viewMode = 'grid'"
            :class="[
              'p-2 rounded-md transition-all duration-300 flex items-center justify-center',
              viewMode === 'grid' 
                ? 'bg-[var(--neon-cyan)] text-white shadow-[0_0_10px_rgba(0,245,255,0.4)]' 
                : 'text-[var(--text-muted)] hover:text-[var(--neon-cyan)] hover:bg-[var(--neon-cyan)]/10'
            ]"
          >
            <el-icon class="text-xl"><Grid /></el-icon>
          </button>
          <button
            @click="viewMode = 'list'"
            :class="[
              'p-2 rounded-md transition-all duration-300 flex items-center justify-center',
              viewMode === 'list' 
                ? 'bg-[var(--neon-cyan)] text-white shadow-[0_0_10px_rgba(0,245,255,0.4)]' 
                : 'text-[var(--text-muted)] hover:text-[var(--neon-cyan)] hover:bg-[var(--neon-cyan)]/10'
            ]"
          >
            <el-icon class="text-xl"><List /></el-icon>
          </button>
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
        <SkillGridView 
          v-if="viewMode === 'grid'" 
          :skills="skillStore.skills" 
          :showAdminActions="true" 
          @edit="handleEdit"
        />
        <SkillListView 
          v-else 
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
import { ref, computed, onMounted } from 'vue'
import { useSkillStore } from '@/stores/skillStore'
import { useAuthStore } from '@/stores/authStore'
import SkillImportModal from '@/components/features/SkillImportModal.vue'
import SkillGridView from '@/modules/skill-list/components/SkillGridView.vue'
import SkillListView from '@/modules/skill-list/components/SkillListView.vue'
import SkillEditor from '@/components/features/SkillEditor.vue'
import type { Skill } from '@/types'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Grid, List, Loading, SwitchButton } from '@element-plus/icons-vue'

import { useRouter } from 'vue-router'

const router = useRouter()
const skillStore = useSkillStore()
const authStore = useAuthStore()
const showImport = ref(false)
const viewMode = ref<'grid' | 'list'>('grid')
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
    router.replace('/')
    ElMessage.success('已安全登出')
  } catch {
    // 用户取消
  }
}

onMounted(async () => {
  if (!authStore.checkSession()) {
    try {
      const { value } = await ElMessageBox.prompt('请输入管理密码', '身份验证', {
        inputType: 'password',
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        inputValidator(val) {
          if (!val) return '密码不能为空'
          return true
        }
      })
      if (authStore.login(value)) {
        ElMessage.success('验证通过')
      } else {
        ElMessage.error('密码错误')
        router.replace('/')
        return
      }
    } catch {
      router.replace('/')
      return
    }
  }
  skillStore.loadSkills()
})
</script>
