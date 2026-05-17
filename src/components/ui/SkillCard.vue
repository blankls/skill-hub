<template>
  <div class="group skill-card rounded-2xl overflow-hidden cursor-pointer" @click.stop="handleClick">
    <div class="p-6 relative">
      <!-- 快速操作按钮 - 右侧悬浮 -->
      <div class="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0 z-10">
        <template v-if="showAdminActions">
          <el-tooltip content="编辑" placement="left">
            <el-button 
              circle 
              size="small" 
              class="action-btn edit-btn" 
              @click.stop="handleEdit"
            >
              <el-icon class="text-[var(--neon-cyan)]"><Edit /></el-icon>
            </el-button>
          </el-tooltip>
        </template>

        <el-tooltip content="下载" placement="left">
          <el-button 
            circle 
            size="small" 
            class="action-btn export-btn" 
            @click.stop="handleExport"
          >
            <el-icon class="text-[var(--neon-purple)]"><Download /></el-icon>
          </el-button>
        </el-tooltip>
        
        <template v-if="showAdminActions">
          <el-tooltip content="删除" placement="left">
            <el-button 
              circle 
              size="small" 
              class="action-btn delete-btn" 
              @click.stop="handleDelete"
            >
              <el-icon class="text-red-400"><Delete /></el-icon>
            </el-button>
          </el-tooltip>
        </template>
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
import { Edit, Download, Delete, User, Document } from '@element-plus/icons-vue'
import { useSkillStore } from '@/stores/skillStore'
import type { Skill } from '@/types'
import { exportSkillToZip, downloadBlob } from '@/utils/zipHandler'

interface Props {
  skill: Skill
  showAdminActions?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showAdminActions: false
})

const emit = defineEmits<{
  (e: 'edit', skill: Skill): void
}>()

const router = useRouter()
const skillStore = useSkillStore()

const handleClick = () => {
  const path = props.showAdminActions ? `/admin/skills/${props.skill.id}` : `/skills/${props.skill.id}`
  router.push(path)
}

const handleEdit = () => {
  emit('edit', props.skill)
}

const handleExport = async () => {
  try {
    const blob = await exportSkillToZip(props.skill)
    const filename = `${props.skill.name.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_')}.zip`
    downloadBlob(blob, filename)
    ElMessage.success('导出成功！')
  } catch (e) {
    console.error('Export error:', e)
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

/* 操作按钮样式 */
.action-btn {
  background-color: var(--dark-card) !important;
  border: 1px solid rgba(14, 165, 233, 0.15) !important;
  backdrop-filter: blur(8px);
  transition: all 0.2s ease !important;
  transform: scale(1);
}

.action-btn:hover {
  transform: scale(1.15) !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
}

.edit-btn {
  border-color: rgba(14, 165, 233, 0.3) !important;
}

.edit-btn:hover {
  background-color: rgba(14, 165, 233, 0.2) !important;
  border-color: rgba(14, 165, 233, 0.6) !important;
}

.export-btn {
  border-color: rgba(168, 85, 247, 0.3) !important;
}

.export-btn:hover {
  background-color: rgba(168, 85, 247, 0.2) !important;
  border-color: rgba(168, 85, 247, 0.6) !important;
}

.delete-btn {
  border-color: rgba(248, 113, 113, 0.3) !important;
}

.delete-btn:hover {
  background-color: rgba(248, 113, 113, 0.2) !important;
  border-color: rgba(248, 113, 113, 0.6) !important;
}

/* 工具提示样式 */
.skill-card :deep(.el-tooltip__popper) {
  background-color: var(--dark-card) !important;
  border: 1px solid rgba(14, 165, 233, 0.3) !important;
  border-radius: 8px !important;
}

.skill-card :deep(.el-tooltip__popper) .el-tooltip__arrow::before {
  background-color: var(--dark-card) !important;
  border-color: rgba(14, 165, 233, 0.3) !important;
}

.skill-card :deep(.el-tooltip__popper) .el-tooltip__content {
  color: var(--text-light) !important;
  font-family: 'Courier New', monospace !important;
  font-size: 12px !important;
  padding: 6px 12px !important;
}
</style>
