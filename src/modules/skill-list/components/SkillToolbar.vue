<template>
  <div class="bg-[var(--dark-card)]/90 backdrop-blur-xl border-b border-[var(--neon-cyan)]/20 p-5 sticky top-0 z-20">
    <div class="max-w-7xl mx-auto flex flex-wrap gap-4 items-center justify-between">
      <div class="flex items-center gap-4 flex-1">
        <el-input
          v-model="searchQuery"
          placeholder="> 搜索技能..."
          :prefix-icon="Search"
          clearable
          class="w-80"
          @input="handleSearch"
          style="--el-input-bg-color: var(--dark-bg); --el-input-border-color: rgba(0, 245, 255, 0.3); --el-input-text-color: var(--text-light); --el-input-placeholder-color: var(--text-muted);"
        />
        <el-select v-model="selectedTag" placeholder="#筛选标签" clearable class="w-40" style="--el-select-bg-color: var(--dark-bg); --el-select-border-color: rgba(0, 245, 255, 0.3);">
          <el-option v-for="tag in allTags" :key="tag" :label="tag" :value="tag" />
        </el-select>
      </div>

      <div class="flex items-center gap-3">
        <el-radio-group v-model="viewMode" size="small" @change="handleViewModeChange" style="--el-radio-button-text-color: var(--text-muted); --el-radio-button-bg-color: var(--dark-bg); --el-radio-button-border-color: rgba(0, 245, 255, 0.3); --el-radio-button-checked-text-color: var(--text-light); --el-radio-button-checked-bg-color: var(--neon-cyan); --el-radio-button-checked-border-color: var(--neon-cyan);">
          <el-radio-button value="grid">
            <el-icon><Grid /></el-icon>
          </el-radio-button>
          <el-radio-button value="list">
            <el-icon><List /></el-icon>
          </el-radio-button>
        </el-radio-group>
        <el-button type="primary" :icon="Upload" @click="showImport = true" class="bg-gradient-to-r from-[var(--neon-cyan)] to-[var(--neon-purple)] border-none text-white font-bold shadow-lg hover:shadow-[0_0_20px_rgba(0,245,255,0.5)]">
          [导入技能]
        </el-button>
      </div>
    </div>
  </div>

  <SkillImportModal v-model="showImport" @imported="handleImported" />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSkillStore } from '@/stores/skillStore'
import { Search, Upload, Grid, List } from '@element-plus/icons-vue'
import SkillImportModal from '@/components/features/SkillImportModal.vue'

const props = defineProps<{
  modelValue: string
  tags: string[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: string): void
  (e: 'update:viewMode', v: 'grid' | 'list'): void
  (e: 'update:selectedTag', v: string): void
}>()

const skillStore = useSkillStore()
const searchQuery = ref(props.modelValue)
const selectedTag = ref('')
const viewMode = ref<'grid' | 'list'>(skillStore.viewMode)
const showImport = ref(false)

const allTags = computed(() => {
  const tags = new Set<string>()
  skillStore.skills.forEach(s => s.tags.forEach(t => tags.add(t)))
  return Array.from(tags)
})

function handleSearch() {
  emit('update:modelValue', searchQuery.value)
  skillStore.setSearchQuery(searchQuery.value)
}

function handleViewModeChange(mode: 'grid' | 'list') {
  emit('update:viewMode', mode)
  skillStore.setViewMode(mode)
}

function handleImported() {
  skillStore.loadSkills()
}
</script>
