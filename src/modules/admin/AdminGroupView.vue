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
          <div v-if="group.skills.length > 0" class="skill-card-grid">
            <SkillCard
              v-for="skill in group.skills"
              :key="skill.id"
              :skill="skill"
              :show-admin-actions="true"
              @edit="$emit('edit', $event)"
            />
          </div>
          <div v-else class="empty-group">
            <span class="text-[var(--text-muted)] text-sm">暂无技能，点击编辑分组添加</span>
          </div>
        </div>
      </Transition>
    </div>

    <div v-if="groupedSkills.length === 0" class="empty-state">
      <div class="text-4xl mb-3">📂</div>
      <p class="text-[var(--text-muted)]">暂无分组，点击上方「添加分组」开始</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Edit, Delete, ArrowDown } from '@element-plus/icons-vue'
import { useSkillStore } from '@/stores/skillStore'
import SkillCard from '@/components/ui/SkillCard.vue'
import type { Skill, SkillGroup } from '@/types'

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

function toggleCollapse(name: string) {
  if (collapsedGroups.value.has(name)) {
    collapsedGroups.value.delete(name)
  } else {
    collapsedGroups.value.add(name)
  }
}

function handleGroupClick(group: GroupedSkill) {
  const id = group.groupEntity?.id
  if (!id) return
  router.push(`/admin/groups/${id}`)
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
  font-size: 16px;
  transition: transform 0.25s ease;
  flex-shrink: 0;
}

.collapse-icon.collapsed {
  transform: rotate(-90deg);
}

.group-icon {
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 0.625rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.125rem;
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
  gap: 0.625rem;
}

.group-name {
  font-size: 1.125rem;
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
  font-size: 0.8125rem;
  color: var(--text-muted);
  margin-top: 0.25rem;
  line-height: 1.5;
}

.group-header-actions {
  display: flex;
  gap: 0.25rem;
  flex-shrink: 0;
}

.group-body {
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding: 1rem;
}

.empty-group {
  padding: 1.5rem;
  text-align: center;
}

.skill-card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.25rem;
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
  max-height: 4000px;
}

.empty-state {
  text-align: center;
  padding: 4rem 1rem;
}

@media (max-width: 768px) {
  .skill-card-grid {
    grid-template-columns: 1fr;
  }
}
</style>
