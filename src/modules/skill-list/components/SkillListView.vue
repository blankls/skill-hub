<template>
  <div class="space-y-4">
    <div
      v-for="skill in skills"
      :key="skill.id"
      class="skill-card rounded-2xl p-6 flex items-center gap-6 cursor-pointer transition-all group"
      @click="handleClick(skill)"
    >
      <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--neon-cyan)] to-[var(--neon-purple)] flex items-center justify-center text-white text-2xl font-black font-mono flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300">
        {{ skill.name.charAt(0).toUpperCase() }}
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-3 mb-2">
          <h3 class="font-semibold text-lg truncate text-[var(--text-light)] font-mono group-hover:text-[var(--neon-cyan)] transition-colors">{{ skill.name }}</h3>
          <span class="text-[var(--neon-yellow)] text-xs font-mono uppercase">
            [{{ getSourceLabel(skill.source.type) }}]
          </span>
          <span class="text-[var(--neon-yellow)] font-mono text-sm font-bold">v{{ skill.version }}</span>
        </div>
        <p class="text-[var(--text-muted)] truncate mb-3">{{ skill.description }}</p>
        <div class="flex flex-wrap items-center gap-3">
          <div class="flex flex-wrap gap-2">
            <span v-for="tag in skill.tags" :key="tag" class="px-3 py-1 bg-[var(--neon-purple)]/20 border border-[var(--neon-purple)]/30 text-[var(--neon-purple)] rounded-full text-xs font-mono">
              #{{ tag }}
            </span>
          </div>
          <div class="flex items-center gap-2 text-[var(--text-muted)] text-xs font-mono">
            <span class="flex items-center gap-1">
              <el-icon class="text-xs"><Document /></el-icon>
              {{ skill.files.length }} 文件
            </span>
            <span v-if="skill.author" class="flex items-center gap-1">
              <el-icon class="text-xs"><User /></el-icon>
              {{ skill.author }}
            </span>
          </div>
        </div>
      </div>
      <!-- 快速操作按钮 -->
      <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <el-button 
          circle 
          size="small" 
          class="bg-[var(--dark-card)] border border-[var(--neon-cyan)]/30 hover:border-[var(--neon-cyan)] hover:bg-[var(--neon-cyan)]/10" 
          @click.stop="handleEdit(skill)"
        >
          <el-icon class="text-[var(--neon-cyan)]"><Edit /></el-icon>
        </el-button>
        <el-button 
          circle 
          size="small" 
          class="bg-[var(--dark-card)] border border-[var(--neon-yellow)]/30 hover:border-[var(--neon-yellow)] hover:bg-[var(--neon-yellow)]/10" 
          @click.stop="handleDuplicate(skill)"
        >
          <el-icon class="text-[var(--neon-yellow)]"><DocumentCopy /></el-icon>
        </el-button>
        <el-button 
          circle 
          size="small" 
          class="bg-[var(--dark-card)] border border-[var(--neon-purple)]/30 hover:border-[var(--neon-purple)] hover:bg-[var(--neon-purple)]/10" 
          @click.stop="handleExport(skill)"
        >
          <el-icon class="text-[var(--neon-purple)]"><Download /></el-icon>
        </el-button>
        <el-button 
          circle 
          size="small" 
          type="danger" 
          @click.stop="handleDelete(skill)"
        >
          <el-icon><Delete /></el-icon>
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Edit, DocumentCopy, Download, Delete, User, Document } from '@element-plus/icons-vue'
import { useSkillStore } from '@/stores/skillStore'
import type { Skill } from '@/types'
import { exportSkillToZip } from '@/utils/zipHandler'

interface Props {
  skills: Skill[]
}

const props = defineProps<Props>()
const router = useRouter()
const skillStore = useSkillStore()

const handleClick = (skill: Skill) => {
  router.push(`/skills/${skill.id}`)
}

const handleEdit = (skill: Skill) => {
  router.push(`/skills/${skill.id}`)
}

const handleDuplicate = async (skill: Skill) => {
  try {
    const copiedSkill: Skill = {
      ...skill,
      id: crypto.randomUUID(),
      name: `${skill.name} (副本)`,
      createdAt: new Date(),
      updatedAt: new Date(),
      source: { type: 'local' }
    }
    await skillStore.addSkill(copiedSkill)
    ElMessage.success('技能复制成功！')
  } catch (e) {
    ElMessage.error('复制失败')
  }
}

const handleExport = async (skill: Skill) => {
  try {
    await exportSkillToZip(skill)
    ElMessage.success('导出成功！')
  } catch (e) {
    ElMessage.error('导出失败')
  }
}

const handleDelete = async (skill: Skill) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除技能「${skill.name}」吗？`,
      '确认删除',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    await skillStore.deleteSkill(skill.id)
    ElMessage.success('删除成功！')
  } catch (e) {
    if (e !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const getSourceLabel = (type: string) => {
  const labels: Record<string, string> = {
    local: '本地',
    zip: 'ZIP',
    github: 'GitHub',
    skillmd: 'MD'
  }
  return labels[type] || '本地'
}
</script>

<style scoped>
.skill-card {
  background-color: var(--dark-card);
  border: 1px solid rgba(0, 245, 255, 0.1);
}

.skill-card:hover {
  border-color: rgba(0, 245, 255, 0.3);
  box-shadow: 0 0 15px rgba(0, 245, 255, 0.1);
  transform: translateX(5px);
}
</style>
