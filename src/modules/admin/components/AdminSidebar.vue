<template>
  <aside class="admin-sidebar w-64 flex-shrink-0 bg-[var(--dark-card)] rounded-xl p-5 shadow-lg border border-white/5 sticky top-20 h-[calc(100vh-6rem)] overflow-y-auto scrollbar-auto flex flex-col">
    <h3 class="text-sm font-semibold text-[var(--text-light)] mb-4 flex items-center gap-2">
      <el-icon class="text-[var(--neon-cyan)]"><FolderOpened /></el-icon>
      分组导航
    </h3>

    <div class="flex-1 space-y-1">
      <button
        @click="emit('select', undefined)"
        :class="['nav-item', { active: selectedGroup === undefined }]"
      >
        <el-icon class="text-[var(--neon-cyan)]"><Grid /></el-icon>
        <span class="flex-1 text-left">全部技能</span>
        <span class="nav-badge">{{ totalCount }}</span>
      </button>

      <button
        v-for="group in groups"
        :key="group.name"
        @click="emit('select', group.name)"
        :class="['nav-item', { active: selectedGroup === group.name }]"
      >
        <div
          class="w-5 h-5 rounded flex-shrink-0 flex items-center justify-center text-white text-[10px] font-black font-mono"
          :style="{ background: `linear-gradient(to bottom right, ${group.iconColor || 'var(--neon-cyan),var(--neon-purple)'})` }"
        >
          {{ group.name.charAt(0).toUpperCase() }}
        </div>
        <span class="flex-1 text-left truncate">{{ group.name }}</span>
        <span class="nav-badge">{{ group.skills.length }}</span>
      </button>

      <button
        @click="emit('select', '__ungrouped__')"
        :class="['nav-item', { active: selectedGroup === '__ungrouped__' }]"
      >
        <el-icon class="text-[var(--text-muted)]"><Folder /></el-icon>
        <span class="flex-1 text-left">未分组</span>
        <span class="nav-badge">{{ ungroupedCount }}</span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Grid, Folder, FolderOpened } from '@element-plus/icons-vue'
import { useSkillStore } from '@/stores/skillStore'
import type { SkillGroup } from '@/types'

interface GroupNavItem {
  name: string
  skills: { id: string }[]
  iconColor?: string
}

interface Props {
  groups: GroupNavItem[]
  selectedGroup?: string
  ungroupedCount: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'select', groupName: string | undefined): void
}>()

const skillStore = useSkillStore()

const totalCount = computed(() => skillStore.skills.length)
</script>

<style scoped>
.admin-sidebar {
  background: var(--dark-card);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  width: 100%;
  padding: 0.625rem 0.75rem;
  border-radius: 0.5rem;
  border: none;
  background: transparent;
  color: var(--text-light);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.04);
}

.nav-item.active {
  background: rgba(14, 165, 233, 0.1);
  border: 1px solid rgba(14, 165, 233, 0.25);
  box-shadow: 0 0 12px rgba(0, 245, 255, 0.06);
}

.nav-badge {
  font-size: 0.6875rem;
  color: var(--text-muted);
  font-family: monospace;
  background: rgba(255, 255, 255, 0.05);
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  flex-shrink: 0;
}
</style>
