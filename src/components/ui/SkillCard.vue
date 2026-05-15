<template>
  <div class="group skill-card rounded-2xl overflow-hidden cursor-pointer" @click.stop="handleClick">
    <div class="p-6 relative">
      <!-- 快速操作按钮 - 右侧悬浮 -->
      <div class="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0 z-10">
        <el-button 
          circle 
          size="small" 
          class="bg-[var(--dark-card)] border border-[var(--neon-cyan)]/30 hover:border-[var(--neon-cyan)] hover:bg-[var(--neon-cyan)]/10" 
          @click.stop="handleEdit"
        >
          <el-icon class="text-[var(--neon-cyan)]"><Edit /></el-icon>
        </el-button>
        <el-button 
          circle 
          size="small" 
          class="bg-[var(--dark-card)] border border-[var(--neon-yellow)]/30 hover:border-[var(--neon-yellow)] hover:bg-[var(--neon-yellow)]/10" 
          @click.stop="handleDuplicate"
        >
          <el-icon class="text-[var(--neon-yellow)]"><DocumentCopy /></el-icon>
        </el-button>
        <el-button 
          circle 
          size="small" 
          class="bg-[var(--dark-card)] border border-[var(--neon-purple)]/30 hover:border-[var(--neon-purple)] hover:bg-[var(--neon-purple)]/10" 
          @click.stop="handleExport"
        >
          <el-icon class="text-[var(--neon-purple)]"><Download /></el-icon>
        </el-button>
        <el-button 
          circle 
          size="small" 
          type="danger" 
          @click.stop="handleDelete"
        >
          <el-icon><Delete /></el-icon>
        </el-button>
      </div>
      
      <div class="flex items-start justify-between mb-4">
        <div class="flex items-center gap-3">
          <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--neon-cyan)] to-[var(--neon-purple)] flex items-center justify-center text-white text-2xl font-black font-mono shadow-lg group-hover:scale-110 transition-transform duration-300">
            {{ skill.name.charAt(0).toUpperCase() }}
          </div>
          <div>
            <span class="text-[var(--neon-yellow)] text-xs font-mono uppercase tracking-wider">
              [{{ getSourceLabel(skill.source.type) }}]
            </span>
          </div>
        </div>
      </div>
      
      <h3 class="text-xl font-bold mb-3 text-[var(--text-light)] group-hover:text-[var(--neon-cyan)] transition-colors">
        {{ skill.name }}
      </h3>
      
      <p class="text-[var(--text-muted)] text-sm mb-5 line-clamp-2">
        {{ skill.description }}
      </p>
      
      <div class="flex flex-wrap gap-2 mb-5">
        <span v-for="tag in skill.tags" :key="tag" class="px-3 py-1 bg-[var(--neon-purple)]/20 border border-[var(--neon-purple)]/30 text-[var(--neon-purple)] rounded-full text-xs font-mono">
          #{{ tag }}
        </span>
      </div>
      
      <div class="flex items-center justify-between pt-4 border-t border-[var(--neon-cyan)]/10">
        <div class="flex items-center gap-3">
          <span class="text-[var(--neon-yellow)] font-mono text-sm font-semibold">
            v{{ skill.version }}
          </span>
          <span v-if="skill.author" class="text-[var(--text-muted)] text-xs font-mono flex items-center gap-1">
            <el-icon class="text-xs"><User /></el-icon>
            {{ skill.author }}
          </span>
        </div>
        <div class="flex items-center gap-3 text-xs text-[var(--text-muted)] font-mono">
          <span class="flex items-center gap-1">
            <el-icon class="text-xs"><Document /></el-icon>
            {{ skill.files.length }} 文件
          </span>
          <span>{{ formatDate(skill.updatedAt) }}</span>
        </div>
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
  skill: Skill
}

const props = defineProps<Props>()
const router = useRouter()
const skillStore = useSkillStore()

const handleClick = () => {
  router.push(`/skills/${props.skill.id}`)
}

const handleEdit = () => {
  router.push(`/skills/${props.skill.id}`)
}

const handleDuplicate = async () => {
  try {
    const copiedSkill: Skill = {
      ...props.skill,
      id: crypto.randomUUID(),
      name: `${props.skill.name} (副本)`,
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

const handleExport = async () => {
  try {
    await exportSkillToZip(props.skill)
    ElMessage.success('导出成功！')
  } catch (e) {
    ElMessage.error('导出失败')
  }
}

const handleDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要删除技能「${props.skill.name}」吗？`,
      '确认删除',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    await skillStore.deleteSkill(props.skill.id)
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

const formatDate = (date: Date | string) => {
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const oneDay = 24 * 60 * 60 * 1000
  
  if (diff < oneDay) {
    return '今天'
  } else if (diff < 7 * oneDay) {
    return `${Math.floor(diff / oneDay)} 天前`
  } else {
    return d.toLocaleDateString('zh-CN')
  }
}
</script>

<style scoped>
.skill-card {
  background-color: var(--dark-card);
  border: 1px solid rgba(14, 165, 233, 0.1);
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.skill-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--neon-cyan), var(--neon-purple), var(--neon-yellow));
  opacity: 0.6;
  transition: opacity 0.2s ease;
}

.skill-card:hover {
  border-color: rgba(14, 165, 233, 0.3);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.skill-card:hover::before {
  opacity: 1;
}
</style>
