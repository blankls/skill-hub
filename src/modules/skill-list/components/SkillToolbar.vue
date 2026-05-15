<template>
  <div class="toolbar-container">
    <!-- 顶部工具栏 -->
    <div class="toolbar-top">
      <div class="max-w-[95rem] mx-auto flex flex-wrap gap-4 items-center justify-between">
        <!-- 搜索框 -->
        <div class="flex items-center gap-4 flex-1">
          <div class="relative flex-1 max-w-xl">
            <div class="relative flex items-center bg-[var(--dark-bg)] border border-[var(--neon-cyan)]/30 rounded-lg p-2 transition-all hover:border-[var(--neon-cyan)]/50 focus-within:border-[var(--neon-cyan)]">
              <el-icon class="text-[var(--neon-cyan)] text-xl flex-shrink-0"><Search /></el-icon>
              <el-input
                v-model="searchQuery"
                placeholder="搜索技能..."
                class="flex-1 bg-transparent no-input-border"
                :class="{ 'no-input-border': true }"
                clearable
                @input="handleSearch"
              />
            </div>
          </div>
        </div>

        <!-- 视图切换和导入按钮 -->
        <div class="flex items-center gap-3">
          <!-- 视图切换 -->
          <div class="flex items-center gap-1 p-1 bg-[var(--dark-bg)] border border-[var(--neon-cyan)]/20 rounded-lg">
            <button
              @click="handleViewModeChange('grid')"
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
              @click="handleViewModeChange('list')"
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
          
          <!-- 导入按钮 -->
          <button
            @click="showImport = true"
            class="px-6 py-2.5 bg-gradient-to-r from-[var(--neon-cyan)] to-[var(--neon-purple)] text-white font-bold rounded-lg transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,245,255,0.5)] flex items-center gap-2"
          >
            <el-icon><Upload /></el-icon>
            导入技能
          </button>
        </div>
      </div>
    </div>

    <!-- 标签云 -->
    <div v-if="allTags.length > 0" class="toolbar-bottom">
      <div class="max-w-[95rem] mx-auto flex flex-wrap items-center gap-2 py-3">
        <span class="text-[var(--text-muted)] text-sm mr-2 py-1">筛选标签:</span>
        <button
          v-for="tagData in sortedTags"
          :key="tagData.tag"
          @click="toggleTag(tagData.tag)"
          :class="[
            'px-4 py-1.5 rounded-full text-sm font-mono transition-all duration-300 flex items-center gap-2',
            selectedTag === tagData.tag
              ? 'bg-[var(--neon-cyan)] text-white shadow-[0_0_15px_rgba(0,245,255,0.4)]'
              : 'bg-[var(--dark-card)] text-[var(--text-light)] border border-[var(--neon-cyan)]/20 hover:border-[var(--neon-cyan)]/50 hover:text-[var(--neon-cyan)]'
          ]"
        >
          <span>#{{ tagData.tag }}</span>
          <span 
            class="text-xs px-1.5 py-0.5 rounded-full" 
            :class="selectedTag === tagData.tag ? 'bg-white/20' : 'bg-[var(--neon-cyan)]/20 text-[var(--neon-cyan)]'"
          >
            {{ tagData.count }}
          </span>
        </button>
        <button
          v-if="selectedTag"
          @click="clearTag"
          class="px-4 py-1.5 rounded-full text-sm bg-[var(--neon-yellow)]/20 text-[var(--neon-yellow)] border border-[var(--neon-yellow)]/30 hover:bg-[var(--neon-yellow)]/30 transition-all duration-300 flex items-center gap-1"
        >
          清除筛选
          <el-icon class="text-sm"><Close /></el-icon>
        </button>
      </div>
    </div>
  </div>

  <SkillImportModal v-model="showImport" @imported="handleImported" />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSkillStore } from '@/stores/skillStore'
import { Search, Upload, Grid, List, Close } from '@element-plus/icons-vue'
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

// 计算每个标签的数量并排序
const sortedTags = computed(() => {
  const tagCount: Record<string, number> = {}
  skillStore.skills.forEach(skill => {
    skill.tags.forEach(tag => {
      tagCount[tag] = (tagCount[tag] || 0) + 1
    })
  })
  return Object.entries(tagCount)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
})

function handleSearch() {
  emit('update:modelValue', searchQuery.value)
  skillStore.setSearchQuery(searchQuery.value)
}

function toggleTag(tag: string) {
  if (selectedTag.value === tag) {
    selectedTag.value = ''
  } else {
    selectedTag.value = tag
  }
  skillStore.setSelectedTag(selectedTag.value)
  emit('update:selectedTag', selectedTag.value)
}

function clearTag() {
  selectedTag.value = ''
  skillStore.setSelectedTag('')
  emit('update:selectedTag', '')
}

function handleViewModeChange(mode: 'grid' | 'list') {
  viewMode.value = mode
  emit('update:viewMode', mode)
  skillStore.setViewMode(mode)
}

function handleImported() {
  skillStore.loadSkills()
}
</script>

<style scoped>
.toolbar-container {
  background: var(--dark-card);
  backdrop-filter: blur-xl;
  border-bottom: 1px solid rgba(0, 245, 255, 0.2);
  position: sticky;
  top: 0;
  z-index: 20;
}

.toolbar-top {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid rgba(0, 245, 255, 0.1);
}

.toolbar-bottom {
  padding: 0 1.5rem;
  background: rgba(0, 0, 0, 0.1);
}

.no-input-border :deep(.el-input__wrapper) {
  box-shadow: none !important;
  border: none !important;
  background-color: transparent !important;
  padding: 0 !important;
}

.no-input-border :deep(.el-input__inner) {
  background-color: transparent !important;
  color: var(--text-light) !important;
}

.no-input-border :deep(.el-input__wrapper:hover),
.no-input-border :deep(.el-input__wrapper.is-focus) {
  box-shadow: none !important;
}

.no-input-border :deep(.el-input__placeholder) {
  color: var(--text-muted) !important;
}
</style>
