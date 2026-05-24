<template>
  <div class="admin-group-view">
    <div
      v-for="group in groupedSkills"
      :key="group.name"
      class="group-section"
    >
      <div class="group-header">
        <div class="group-header-left">
          <el-icon class="collapse-icon" :class="{ collapsed: collapsedGroups.has(group.name) }" @click.stop="toggleCollapse(group.name)">
            <ArrowDown />
          </el-icon>
          <div
            class="group-icon"
            :style="{ background: `linear-gradient(to bottom right, ${group.iconColor || 'var(--neon-cyan),var(--neon-purple)'})` }"
            @click.stop="handleGroupClick(group)"
          >
            {{ group.name.charAt(0).toUpperCase() }}
          </div>
          <div class="group-header-info" @click.stop="handleGroupClick(group)">
            <div class="group-header-top">
              <span class="group-name">{{ group.name }}</span>
              <span class="group-count">{{ group.skills.length }} 个技能</span>
            </div>
            <p v-if="group.description" class="group-desc">{{ group.description }}</p>
          </div>
        </div>
        <div class="group-header-actions" @click.stop>
          <el-tooltip content="编辑分组" placement="top">
            <el-button circle size="small" class="action-btn" @click="$emit('editGroup', group)">
              <el-icon class="text-[var(--neon-cyan)]"><Edit /></el-icon>
            </el-button>
          </el-tooltip>
          <el-tooltip content="删除分组" placement="top">
            <el-button circle size="small" class="action-btn delete-btn" @click="handleDeleteGroup(group)">
              <el-icon class="text-red-400"><Delete /></el-icon>
            </el-button>
          </el-tooltip>
        </div>
      </div>

      <Transition name="collapse">
        <div v-show="!collapsedGroups.has(group.name)" class="group-body">
          <div v-if="group.skills.length > 0" class="compact-card-grid">
            <div
              v-for="skill in group.skills"
              :key="skill.id"
              class="compact-card group"
              @click="handleClick(skill)"
            >
              <div class="compact-card-top">
                <div
                  class="compact-card-icon"
                  :style="{ background: `linear-gradient(to bottom right, ${skill.iconColor || 'var(--neon-cyan),var(--neon-purple)'})` }"
                >
                  {{ skill.name.charAt(0).toUpperCase() }}
                </div>
                <div class="compact-card-info">
                  <div class="compact-card-title">
                    <span class="compact-card-name">{{ skill.name }}</span>
                    <span class="compact-card-source">[{{ getSourceLabel(skill.source.type) }}]</span>
                  </div>
                  <p class="compact-card-desc">{{ skill.description }}</p>
                </div>
              </div>
              <div class="compact-card-bottom">
                <div class="compact-card-meta">
                  <span class="compact-card-version">v{{ skill.version }}</span>
                  <span v-if="skill.author" class="compact-card-author">{{ skill.author }}</span>
                </div>
                <div class="compact-card-actions opacity-0 group-hover:opacity-100 transition-opacity">
                  <el-tooltip content="编辑" placement="top">
                    <el-button circle size="small" class="action-btn" @click.stop="$emit('edit', skill)">
                      <el-icon class="text-[var(--neon-cyan)]"><Edit /></el-icon>
                    </el-button>
                  </el-tooltip>
                  <el-tooltip content="从分组移除" placement="top">
                    <el-button circle size="small" class="action-btn" @click.stop="handleRemoveFromGroup(skill, group)">
                      <el-icon class="text-orange-400"><Minus /></el-icon>
                    </el-button>
                  </el-tooltip>
                  <el-tooltip content="删除" placement="top">
                    <el-button circle size="small" class="action-btn delete-btn" @click.stop="$emit('deleteSkill', skill)">
                      <el-icon class="text-red-400"><Delete /></el-icon>
                    </el-button>
                  </el-tooltip>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="empty-group">
            <span class="text-[var(--text-muted)] text-sm">暂无技能，点击编辑分组添加</span>
          </div>
        </div>
      </Transition>
    </div>

    <div v-if="ungroupedSkills.length > 0" class="ungrouped-section">
      <div class="ungrouped-header">
        <span class="ungrouped-title">未分组技能</span>
        <span class="ungrouped-count">{{ ungroupedSkills.length }} 个</span>
      </div>
      <div class="ungrouped-grid">
        <SkillCard
          v-for="skill in ungroupedSkills"
          :key="skill.id"
          :skill="skill"
          :showAdminActions="true"
          @edit="$emit('edit', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Edit, Delete, Minus, ArrowDown } from '@element-plus/icons-vue'
import { useSkillStore } from '@/stores/skillStore'
import SkillCard from '@/components/ui/SkillCard.vue'
import type { Skill, SkillGroup } from '@/types'
import { getSourceLabel } from '@/utils/labels'

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
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'edit', skill: Skill): void
  (e: 'editGroup', group: GroupedSkill): void
  (e: 'deleteSkill', skill: Skill): void
}>()

const router = useRouter()
const skillStore = useSkillStore()
const collapsedGroups = ref(new Set<string>())

const groupedSkills = computed(() => {
  const skillMap = new Map<string, Skill>()
  for (const s of props.skills) {
    skillMap.set(s.id, s)
  }

  const result: GroupedSkill[] = []
  const groupedSkillIds = new Set<string>()

  for (const groupEntity of skillStore.groups) {
    const groupSkills = (groupEntity.skillIds || [])
      .map(id => skillMap.get(id))
      .filter((s): s is Skill => !!s)
    groupSkills.forEach(s => groupedSkillIds.add(s.id))
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

const ungroupedSkills = computed(() => {
  const groupedIds = new Set<string>()
  for (const g of skillStore.groups) {
    for (const id of g.skillIds || []) {
      groupedIds.add(id)
    }
  }
  return props.skills.filter(s => !groupedIds.has(s.id))
})

function toggleCollapse(name: string) {
  if (collapsedGroups.value.has(name)) {
    collapsedGroups.value.delete(name)
  } else {
    collapsedGroups.value.add(name)
  }
}

function handleClick(skill: Skill) {
  router.push(`/admin/skills/${skill.id}`)
}

function handleGroupClick(group: GroupedSkill) {
  const id = group.groupEntity?.id
  if (!id) return
  router.push(`/admin/groups/${id}`)
}

async function handleRemoveFromGroup(skill: Skill, group: GroupedSkill) {
  if (!group.groupEntity) return
  try {
    await ElMessageBox.confirm(
      `将「${skill.name}」从分组「${group.name}」中移除？`,
      '移除确认',
      { confirmButtonText: '移除', cancelButtonText: '取消', type: 'warning' }
    )
    const updated = { ...group.groupEntity }
    updated.skillIds = updated.skillIds.filter(id => id !== skill.id)
    await skillStore.updateGroup(updated)
    skill.group = ''
    skill.updatedAt = new Date()
    const { db } = await import('@/utils/db')
    await db.update(JSON.parse(JSON.stringify(skill)))
    ElMessage.success('已移除')
  } catch { /* cancel */ }
}

async function handleDeleteGroup(group: GroupedSkill) {
  if (!group.groupEntity) return
  try {
    await ElMessageBox.confirm(
      `确定删除分组「${group.name}」？组内 ${group.skills.length} 个技能将变为未分组。`,
      '确认删除',
      { confirmButtonText: '删除', cancelButtonText: '取消', type: 'warning' }
    )
    await skillStore.deleteGroup(group.groupEntity.id)
    const { db } = await import('@/utils/db')
    for (const skill of group.skills) {
      skill.group = ''
      skill.updatedAt = new Date()
      await db.update(JSON.parse(JSON.stringify(skill)))
    }
    ElMessage.success('分组已删除')
  } catch { /* cancel */ }
}
</script>

<style scoped>
.group-section {
  margin-bottom: 1.5rem;
  border: 1px solid rgba(14, 165, 233, 0.1);
  border-radius: 1rem;
  overflow: hidden;
  background: var(--dark-card);
}

.group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  cursor: pointer;
  transition: background 0.2s;
  user-select: none;
}

.group-header:hover {
  background: rgba(255, 255, 255, 0.03);
}

.group-header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
  min-width: 0;
}

.collapse-icon {
  color: var(--text-muted);
  font-size: 14px;
  transition: transform 0.25s ease;
  flex-shrink: 0;
}

.collapse-icon.collapsed {
  transform: rotate(-90deg);
}

.group-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1rem;
  font-weight: 900;
  font-family: monospace;
  flex-shrink: 0;
  cursor: pointer;
  transition: transform 0.2s;
}

.group-icon:hover {
  transform: scale(1.05);
}

.group-header-info {
  flex: 1;
  min-width: 0;
  cursor: pointer;
}

.group-header-top {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}

.group-name {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-light);
  background: linear-gradient(135deg, var(--neon-cyan), var(--neon-purple));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.group-count {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.group-desc {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-top: 0.125rem;
  line-height: 1.4;
}

.group-header-actions {
  display: flex;
  gap: 0.25rem;
  flex-shrink: 0;
}

.group-body {
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding: 0.75rem;
}

.empty-group {
  padding: 1.5rem;
  text-align: center;
}

.compact-card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 0.75rem;
}

.compact-card {
  padding: 0.875rem;
  border-radius: 0.75rem;
  border: 1px solid rgba(14, 165, 233, 0.08);
  background: rgba(255, 255, 255, 0.02);
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  overflow: hidden;
}

.compact-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--neon-cyan), var(--neon-purple));
  opacity: 0;
  transition: opacity 0.2s;
}

.compact-card:hover {
  border-color: rgba(14, 165, 233, 0.25);
  background: rgba(255, 255, 255, 0.04);
  transform: translateY(-1px);
}

.compact-card:hover::before {
  opacity: 1;
}

.compact-card-top {
  display: flex;
  align-items: flex-start;
  gap: 0.625rem;
  margin-bottom: 0.625rem;
}

.compact-card-icon {
  width: 2rem;
  height: 2rem;
  border-radius: 0.375rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.75rem;
  font-weight: 900;
  font-family: monospace;
  flex-shrink: 0;
}

.compact-card-info {
  flex: 1;
  min-width: 0;
}

.compact-card-title {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  margin-bottom: 0.25rem;
}

.compact-card-name {
  font-weight: 600;
  color: var(--text-light);
  font-size: 0.8125rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.compact-card-source {
  color: var(--neon-yellow);
  font-size: 0.5625rem;
  font-family: monospace;
  text-transform: uppercase;
  flex-shrink: 0;
}

.compact-card-desc {
  font-size: 0.6875rem;
  color: var(--text-muted);
  line-clamp: 2;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.4;
}

.compact-card-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 0.5rem;
  border-top: 1px solid rgba(14, 165, 233, 0.06);
}

.compact-card-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.compact-card-version {
  color: var(--neon-yellow);
  font-size: 0.6875rem;
  font-family: monospace;
  font-weight: 600;
}

.compact-card-author {
  color: var(--text-muted);
  font-size: 0.625rem;
  font-family: monospace;
}

.compact-card-actions {
  display: flex;
  gap: 0.125rem;
}

.ungrouped-section {
  margin-top: 1.5rem;
  border: 1px dashed rgba(14, 165, 233, 0.15);
  border-radius: 1rem;
  overflow: hidden;
}

.ungrouped-header {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  padding: 0.875rem 1.25rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  background: rgba(255, 255, 255, 0.02);
}

.ungrouped-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-muted);
}

.ungrouped-count {
  font-size: 0.75rem;
  color: var(--text-muted);
  opacity: 0.7;
}

.ungrouped-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  padding: 1rem;
}

.action-btn {
  background-color: transparent !important;
  border: 1px solid rgba(14, 165, 233, 0.15) !important;
  transition: all 0.2s ease !important;
}

.action-btn:hover {
  transform: scale(1.1) !important;
  background-color: rgba(14, 165, 233, 0.1) !important;
}

.delete-btn:hover {
  background-color: rgba(248, 113, 113, 0.1) !important;
  border-color: rgba(248, 113, 113, 0.4) !important;
}

.collapse-enter-active,
.collapse-leave-active {
  transition: all 0.25s ease;
  overflow: hidden;
}

.collapse-enter-from,
.collapse-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
}

.collapse-enter-to,
.collapse-leave-from {
  opacity: 1;
  max-height: 2000px;
}

.empty-state {
  text-align: center;
  padding: 4rem 1rem;
}

@media (max-width: 768px) {
  .compact-card-grid {
    grid-template-columns: 1fr;
  }

  .compact-card-actions {
    opacity: 1 !important;
  }
}
</style>
