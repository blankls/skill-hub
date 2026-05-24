<template>
  <div class="skill-group-view">
    <div class="group-grid">
      <div
        v-for="group in groupedSkills"
        :key="group.name"
        class="group-section"
      >
      <div class="group-hero group" @click="handleGroupClick(group)">
        <div class="group-hero-header">
          <div
            class="group-hero-icon"
            :style="{ background: `linear-gradient(to bottom right, ${group.iconColor || 'var(--neon-cyan),var(--neon-purple)'})` }"
          >
            {{ group.name.charAt(0).toUpperCase() }}
          </div>
          <div class="group-hero-body">
            <div class="group-hero-title">
              <span class="group-name">{{ group.name }}</span>
              <span class="group-count">{{ group.skills.length }} 个技能</span>
            </div>
            <p v-if="group.description" class="group-desc">{{ group.description }}</p>
            <div v-if="group.tags.length > 0" class="group-tags">
              <span v-for="tag in group.tags" :key="tag" class="group-tag">
                #{{ tag }}
              </span>
            </div>
            <div v-if="group.skills.length > 0" class="skill-chips">
              <div
                v-for="skill in group.skills"
                :key="skill.id"
                class="skill-chip"
                @click.stop="handleClick(skill)"
              >
                <div
                  class="skill-chip-icon"
                  :style="{ background: `linear-gradient(to bottom right, ${skill.iconColor || 'var(--neon-cyan),var(--neon-purple)'})` }"
                >
                  {{ skill.name.charAt(0).toUpperCase() }}
                </div>
                <span class="skill-chip-name">{{ skill.name }}</span>
                <span class="skill-chip-source">[{{ getSourceLabel(skill.source.type) }}]</span>
              </div>
            </div>
          </div>
          <div class="group-hero-actions absolute top-4 right-4 flex flex-col gap-2 transition-all duration-300 transform z-10 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0">
            <template v-if="showAdminActions">
              <el-tooltip content="编辑分组" placement="left">
                <el-button circle size="small" class="action-btn" @click.stop="$emit('editGroup', group)">
                  <el-icon class="text-[var(--neon-cyan)]"><Edit /></el-icon>
                </el-button>
              </el-tooltip>
            </template>
            <el-tooltip content="导出分组" placement="left">
              <el-button circle size="small" class="action-btn export-btn" @click.stop="handleGroupExport(group)">
                <el-icon class="text-[var(--neon-purple)]"><Download /></el-icon>
              </el-button>
            </el-tooltip>
            <template v-if="showAdminActions">
              <el-tooltip content="删除分组" placement="left">
                <el-button circle size="small" class="action-btn delete-btn" @click.stop="handleGroupDelete(group)">
                  <el-icon class="text-red-400"><Delete /></el-icon>
                </el-button>
              </el-tooltip>
            </template>
          </div>
        </div>
      </div>
    </div>
    </div>

    <div v-if="groupedSkills.length === 0" class="empty-state">
      <div class="text-4xl mb-3">📂</div>
      <p class="text-[var(--text-muted)]">暂无分组</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { Edit, Download, Delete } from '@element-plus/icons-vue'
import { useSkillStore } from '@/stores/skillStore'
import type { Skill, SkillGroup } from '@/types'
import { getSourceLabel } from '@/utils/labels'
import { ElMessage, ElMessageBox } from 'element-plus'
import { exportGroupToZip, downloadBlob } from '@/utils/zipHandler'

interface GroupedSkill {
  name: string
  skills: Skill[]
  description: string
  readme?: string
  iconColor?: string
  tags: string[]
  groupEntity?: SkillGroup
}

interface Props {
  skills: Skill[]
  showAdminActions?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showAdminActions: false
})

defineEmits<{
  (e: 'edit', skill: Skill): void
  (e: 'editGroup', group: GroupedSkill): void
}>()

const router = useRouter()
const skillStore = useSkillStore()

const groupedSkills = computed(() => {
  const skillMap = new Map<string, Skill>()
  for (const s of props.skills) {
    skillMap.set(s.id, s)
  }

  const result: GroupedSkill[] = []

  for (const groupEntity of skillStore.groups) {
    const groupSkills = (groupEntity.skillIds || [])
      .map(id => skillMap.get(id))
      .filter((s): s is Skill => !!s)
    result.push({
      name: groupEntity.name,
      skills: groupSkills,
      description: groupEntity.description,
      readme: groupEntity.readme,
      iconColor: groupEntity.iconColor,
      tags: [...new Set(groupSkills.flatMap(s => s.tags || []))],
      groupEntity
    })
  }

  result.sort((a, b) => a.name.localeCompare(b.name))
  return result
})

function handleClick(skill: Skill) {
  router.push(`/skills/${skill.id}`)
}

function handleGroupClick(group: GroupedSkill) {
  const id = group.groupEntity?.id
  if (!id) return
  const path = props.showAdminActions ? `/admin/groups/${id}` : `/groups/${id}`
  router.push(path)
}

async function handleGroupExport(group: GroupedSkill) {
  try {
    const blob = await exportGroupToZip(group.name, group.skills)
    const filename = `${group.name.replace(/[^a-zA-Z0-9一-龥]/g, '_')}.zip`
    downloadBlob(blob, filename)
    ElMessage.success('导出成功！')
  } catch (e) {
    console.error('Export error:', e)
    ElMessage.error('导出失败')
  }
}

async function handleGroupDelete(group: GroupedSkill) {
  const id = group.groupEntity?.id
  if (!id) return
  try {
    await ElMessageBox.confirm(
      `确定要删除分组「${group.name}」吗？`,
      '确认删除',
      { confirmButtonText: '删除', cancelButtonText: '取消', type: 'warning' }
    )
    await skillStore.deleteGroup(id)
    ElMessage.success('删除成功！')
  } catch (e) {
    if (e !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}
</script>

<style scoped>
.group-section {
  width: 100%;
}

.group-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.group-hero {
  border-radius: 1rem;
  background: var(--dark-card);
  border: 1px solid rgba(14, 165, 233, 0.12);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
}

.group-hero:hover {
  border-color: rgba(14, 165, 233, 0.3);
  box-shadow: 0 0 20px rgba(0, 245, 255, 0.06);
}

.group-hero-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.5rem 1.5rem 1rem;
  position: relative;
}

.group-hero-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.25rem;
  font-weight: 900;
  font-family: monospace;
  flex-shrink: 0;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}

.group-hero-body {
  flex: 1;
  min-width: 0;
  padding-right: 0;
}

.group-hero-title {
  display: flex;
  align-items: baseline;
  gap: 0.625rem;
  margin-bottom: 0.5rem;
}

.group-name {
  font-size: 1.375rem;
  font-weight: 700;
  color: var(--text-light);
  background: linear-gradient(135deg, var(--neon-cyan), var(--neon-purple));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.group-count {
  font-size: 0.8125rem;
  color: var(--text-muted);
}

.group-desc {
  font-size: 0.9375rem;
  color: var(--text-muted);
  line-height: 1.6;
  margin-bottom: 0.5rem;
  max-width: 85%;
}

.group-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}

.group-tag {
  padding: 0.125rem 0.5rem;
  background: rgba(168, 85, 247, 0.15);
  border: 1px solid rgba(168, 85, 247, 0.3);
  color: var(--neon-purple);
  border-radius: 9999px;
  font-size: 0.6875rem;
  font-family: monospace;
}

.action-btn {
  background-color: var(--dark-card) !important;
  border: 1px solid rgba(14, 165, 233, 0.15) !important;
  backdrop-filter: blur(8px);
  transition: all 0.2s ease !important;
}

.action-btn:hover {
  transform: scale(1.15) !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
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

.skill-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.skill-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  border-radius: 9999px;
  border: 1px solid rgba(14, 165, 233, 0.1);
  background: rgba(255, 255, 255, 0.02);
  cursor: pointer;
  transition: all 0.2s;
}

.skill-chip:hover {
  border-color: rgba(14, 165, 233, 0.3);
  background: rgba(14, 165, 233, 0.06);
  transform: translateY(-1px);
}

.skill-chip-icon {
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.5rem;
  font-weight: 900;
  font-family: monospace;
  flex-shrink: 0;
}

.skill-chip-name {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--text-light);
}

.skill-chip-source {
  font-size: 0.5625rem;
  color: var(--neon-yellow);
  font-family: monospace;
  text-transform: uppercase;
}

.empty-state {
  text-align: center;
  padding: 4rem 1rem;
}

@media (max-width: 768px) {
  .group-grid {
    grid-template-columns: 1fr;
  }
  .group-hero-header {
    flex-direction: column;
    gap: 0.75rem;
    padding: 1rem;
  }

  .group-hero-actions {
    position: static !important;
    opacity: 1 !important;
    transform: translateX(0) !important;
    flex-direction: row !important;
    margin-top: 0.5rem;
  }

  .skill-chips {
    gap: 0.375rem;
  }
}
</style>
