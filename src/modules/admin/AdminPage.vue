<template>
  <div class="min-h-screen bg-[var(--dark-bg)]">
    <!-- 顶部工具栏（类似技能列表页面） -->
    <div class="toolbar-container bg-[var(--dark-card)] border-b border-[var(--neon-cyan)]/20 sticky top-0 z-20">
      <div class="max-w-[95rem] mx-auto px-6 py-4">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <!-- 标题 -->
          <div>
            <h1 class="text-xl font-bold text-[var(--neon-cyan)] font-mono flex items-center gap-3">
              <span class="text-2xl">⚙️</span>
              > 管理面板
            </h1>
            <p class="text-sm text-[var(--text-muted)] font-mono">技能导入与管理</p>
          </div>
          
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
    </div>

    <!-- 内容区域 -->
    <div class="max-w-[95rem] mx-auto p-6">
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

      <!-- 加载状态 -->
      <div v-if="skillStore.loading" class="text-center py-20">
        <el-icon class="text-5xl text-[var(--neon-cyan)] animate-spin"><Loading /></el-icon>
        <p class="mt-6 text-[var(--text-muted)] text-lg">加载技能中...</p>
      </div>

      <!-- 空状态 -->
      <div v-else-if="skillStore.skills.length === 0" class="text-center py-20">
        <div class="text-7xl mb-6">📭</div>
        <h3 class="text-xl font-bold text-[var(--text-light)] mb-3">暂无技能</h3>
        <p class="text-[var(--text-muted)] mb-6">点击上方按钮导入你的第一个技能</p>
      </div>

      <!-- 技能列表 -->
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
import { ref, computed } from 'vue'
import { useSkillStore } from '@/stores/skillStore'
import { Plus, Grid, List, Loading } from '@element-plus/icons-vue'
import SkillImportModal from '@/components/features/SkillImportModal.vue'
import SkillGridView from '@/modules/skill-list/components/SkillGridView.vue'
import SkillListView from '@/modules/skill-list/components/SkillListView.vue'
import SkillEditor from '@/components/features/SkillEditor.vue'
import type { Skill } from '@/types'
import { ElMessage } from 'element-plus'

const skillStore = useSkillStore()
const showImport = ref(false)
const viewMode = ref<'grid' | 'list'>('grid')
const showEdit = ref(false)
const editingSkill = ref<Skill | undefined>()

const totalTags = computed(() => {
  const tags = new Set<string>()
  skillStore.skills.forEach(s => s.tags.forEach(t => tags.add(t)))
  return tags.size
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
</script>

<style scoped>
.toolbar-container {
  backdrop-filter: blur-xl;
}
</style>