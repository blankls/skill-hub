<template>
  <div class="space-y-4">
    <div
      v-for="skill in skills"
      :key="skill.id"
      class="skill-card rounded-2xl p-4 md:p-6 flex flex-col md:flex-row md:items-center gap-4 md:gap-6 cursor-pointer transition-all group"
      @click="handleClick(skill)"
    >
      <div class="flex items-center gap-4 md:gap-6 w-full">
        <div class="w-14 h-14 rounded-xl flex items-center justify-center text-white text-2xl font-black font-mono flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300"
             :style="{ background: `linear-gradient(to bottom right, ${skill.iconColor || 'var(--neon-cyan),var(--neon-purple)'})` }"
        >
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
        <el-tooltip placement="top" :disabled="!isDescriptionLong(skill)">
          <template #content>
            <div class="max-w-lg whitespace-pre-line">{{ skill.description }}</div>
          </template>
          <p class="text-[var(--text-muted)] line-clamp-2 mb-3">{{ skill.description }}</p>
        </el-tooltip>
        <div class="flex flex-wrap items-center gap-3">
          <div class="flex flex-wrap gap-2">
            <span v-for="tag in skill.tags" :key="tag" class="px-3 py-1 bg-[var(--neon-purple)]/20 border border-[var(--neon-purple)]/30 text-[var(--neon-purple)] rounded-full text-xs font-mono">
              #{{ tag }}
            </span>
          </div>
          <div class="flex items-center gap-2 text-[var(--text-muted)] text-xs font-mono">
            <span class="flex items-center gap-1 text-orange-400">
              🔥 {{ skill.likes || 0 }}
            </span>
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
      </div>
      <!-- 快速操作按钮 -->
      <div class="action-buttons flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0 transition-transform duration-300">
        <template v-if="showAdminActions">
          <el-tooltip content="编辑" placement="top">
            <el-button 
              circle 
              size="small" 
              class="action-btn edit-btn" 
              @click.stop="handleEdit(skill)"
            >
              <el-icon class="text-[var(--neon-cyan)]"><Edit /></el-icon>
            </el-button>
          </el-tooltip>
        </template>

        <el-tooltip content="下载" placement="top">
          <el-button 
            circle 
            size="small" 
            class="action-btn export-btn" 
            @click.stop="handleExport(skill)"
          >
            <el-icon class="text-[var(--neon-purple)]"><Download /></el-icon>
          </el-button>
        </el-tooltip>
        
        <template v-if="showAdminActions">
          <el-tooltip content="删除" placement="top">
            <el-button 
              circle 
              size="small" 
              class="action-btn delete-btn" 
              @click.stop="handleDelete(skill)"
            >
              <el-icon class="text-red-400"><Delete /></el-icon>
            </el-button>
          </el-tooltip>
        </template>
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
  skills: Skill[]
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

const handleClick = (skill: Skill) => {
  const path = props.showAdminActions ? `/admin/skills/${skill.id}` : `/skills/${skill.id}`
  router.push(path)
}

const handleEdit = (skill: Skill) => {
  emit('edit', skill)
}

const handleExport = async (skill: Skill) => {
  try {
    const blob = await exportSkillToZip(skill)
    const filename = `${skill.name.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_')}.zip`
    downloadBlob(blob, filename)
    ElMessage.success('导出成功！')
  } catch (e) {
    console.error('Export error:', e)
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

const isDescriptionLong = (skill: any) => {
  return (skill.description?.length || 0) > 100
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
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.skill-card {
  background-color: var(--dark-card);
  border: 1px solid rgba(0, 245, 255, 0.1);
}

.skill-card:hover {
  border-color: rgba(0, 245, 255, 0.3);
  box-shadow: 0 0 15px rgba(0, 245, 255, 0.1);
  transform: translateX(5px);
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

@media (max-width: 768px) {
  .skill-card .action-buttons {
    opacity: 1 !important;
    transform: translateX(0) !important;
  }
}
</style>
