<template>
  <aside
    class="filter-sidebar w-80 flex-shrink-0 bg-[var(--dark-card)] rounded-xl p-5 shadow-lg border border-white/5 sticky top-20 h-[calc(100vh-6rem)] overflow-y-auto scrollbar-auto"
    :class="{ 'mobile-drawer-open': mobileOpen }"
  >
    <div class="mobile-drawer-header">
      <h2 class="text-base font-semibold text-[var(--text-light)]">筛选条件</h2>
      <button @click="emit('close')" class="mobile-drawer-close" aria-label="关闭">
        <el-icon class="text-lg"><Close /></el-icon>
      </button>
    </div>

    <div class="space-y-5">
      <!-- 视图切换 - 第一个位置，紧凑 -->
      <div class="flex items-center justify-between">
        <div class="view-toggle">
          <button
            @click="skillStore.setViewMode('grid')"
            :class="['view-toggle-btn', { active: skillStore.viewMode === 'grid' }]"
          >
            <el-icon><Grid /></el-icon>
          </button>
          <button
            @click="skillStore.setViewMode('list')"
            :class="['view-toggle-btn', { active: skillStore.viewMode === 'list' }]"
          >
            <el-icon><List /></el-icon>
          </button>
        </div>
        <span class="text-sm text-[var(--text-muted)]">{{ skillStore.filteredSkills.length }} / {{ skillStore.skills.length }}</span>
      </div>

      <!-- 搜索框 -->
      <div class="filter-section">
        <div class="relative flex items-center bg-[var(--dark-bg)] border border-[var(--neon-cyan)]/30 rounded-lg p-1.5 transition-all hover:border-[var(--neon-cyan)]/50 focus-within:border-[var(--neon-cyan)]">
          <el-icon class="text-[var(--neon-cyan)] text-lg flex-shrink-0 ml-1"><Search /></el-icon>
          <el-input
            :model-value="skillStore.searchQuery"
            @update:model-value="onSearchChange"
            placeholder="搜索技能..."
            class="flex-1 bg-transparent no-input-border"
            clearable
          />
        </div>
      </div>

      <!-- 来源筛选 -->
      <div class="filter-section">
        <h3 class="text-sm font-semibold text-[var(--text-light)] mb-3 flex items-center">
          <span class="w-1 h-4 bg-gradient-to-b from-[var(--neon-cyan)] to-[var(--neon-purple)] rounded-full mr-2"></span>
          数据来源
        </h3>
        <div class="space-y-1 ml-1">
          <label 
            v-for="source in sourceOptions" 
            :key="source.value"
            class="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-white/5 cursor-pointer transition-all duration-200 group"
          >
            <div class="flex items-center">
              <input 
                type="checkbox" 
                :value="source.value"
                v-model="localSources"
                @change="onSourceChange"
                class="w-4 h-4 rounded border-gray-600 text-[var(--neon-cyan)] focus:ring-[var(--neon-cyan)] focus:ring-offset-0 bg-transparent"
              />
              <span class="ml-3 text-sm text-[var(--text-muted)] group-hover:text-[var(--text-light)] transition-colors">
                {{ source.label }}
              </span>
            </div>
            <span class="text-xs text-[var(--text-muted)] opacity-60">
              {{ source.count }}
            </span>
          </label>
        </div>
      </div>

      <!-- 标签筛选 -->
      <div class="filter-section">
        <h3 class="text-sm font-semibold text-[var(--text-light)] mb-3 flex items-center">
          <span class="w-1 h-4 bg-gradient-to-b from-[var(--neon-cyan)] to-[var(--neon-purple)] rounded-full mr-2"></span>
          标签筛选
          <button 
            v-if="tagList.length > defaultTagLimit"
            @click="showAllTags = !showAllTags"
            class="ml-auto text-xs text-[var(--neon-cyan)] hover:underline"
          >
            {{ showAllTags ? '收起' : `+${tagList.length - defaultTagLimit} 更多` }}
          </button>
        </h3>
        
        <div v-if="tagList.length > 0" class="space-y-1">
          <button
            v-for="(tag, index) in displayedTags"
            :key="tag.name"
            @click="onToggleTag(tag.name)"
            class="tag-filter-btn w-full flex items-center justify-between py-2 px-3 rounded-lg transition-all duration-300 hover:scale-[1.02]"
            :class="[
              skillStore.selectedTags.includes(tag.name) 
                ? 'ring-2 ring-offset-1 ring-offset-[var(--dark-card)]' 
                : 'hover:bg-white/5'
            ]"
            :style="{
              backgroundColor: skillStore.selectedTags.includes(tag.name) 
                ? getTagColor(tag.name, index).bg 
                : 'transparent',
              borderLeft: `3px solid ${getTagColor(tag.name, index).border}`
            }"
          >
            <div class="flex items-center">
              <span 
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                :style="{
                  backgroundColor: getTagColor(tag.name, index).bg,
                  color: getTagColor(tag.name, index).text,
                  border: `1px solid ${getTagColor(tag.name, index).border}`
                }"
              >
                #{{ tag.name }}
              </span>
            </div>
            <span class="text-xs px-2 py-0.5 rounded-full bg-white/10 text-[var(--text-muted)]">
              {{ tag.count }}
            </span>
          </button>
        </div>

        <div v-else class="text-center py-6 text-sm text-[var(--text-muted)]">
          暂无标签
        </div>

        <button
          v-if="skillStore.selectedTags.length > 0"
          @click="onClearTags"
          class="mt-3 w-full py-1.5 px-3 rounded-lg text-sm text-[var(--neon-cyan)] hover:bg-[var(--neon-cyan)]/10 transition-colors border border-[var(--neon-cyan)]/30 hover:border-[var(--neon-cyan)]/50"
        >
          清除标签筛选 ({{ skillStore.selectedTags.length }})
        </button>
      </div>

      <!-- 排序方式 -->
      <div class="filter-section">
        <h3 class="text-sm font-semibold text-[var(--text-light)] mb-3 flex items-center">
          <span class="w-1 h-4 bg-gradient-to-b from-[var(--neon-cyan)] to-[var(--neon-purple)] rounded-full mr-2"></span>
          排序方式
        </h3>
        <div class="space-y-1">
          <button
            v-for="opt in sortOptions"
            :key="opt.value"
            @click="onSortChange(opt.value)"
            class="w-full flex items-center justify-between py-2 px-3 rounded-lg transition-all duration-200 hover:bg-white/5"
            :class="skillStore.sortBy === opt.value ? 'bg-[var(--neon-cyan)]/10 text-[var(--neon-cyan)]' : 'text-[var(--text-muted)]'"
          >
            <div class="flex items-center gap-2">
              <span class="text-base">{{ opt.icon }}</span>
              <span class="text-sm">{{ opt.label }}</span>
            </div>
            <span
              v-if="skillStore.sortBy === opt.value"
              class="text-xs text-[var(--neon-cyan)] px-1"
            >
              {{ skillStore.sortOrder === 'desc' ? '↓' : '↑' }}
            </span>
          </button>
        </div>
      </div>

      <!-- 重置所有筛选 -->
      <button
        v-if="hasActiveFilters"
        @click="onResetAll"
        class="w-full py-2.5 px-4 rounded-lg text-sm font-medium bg-gradient-to-r from-[var(--neon-cyan)]/10 to-[var(--neon-purple)]/10 hover:from-[var(--neon-cyan)]/20 hover:to-[var(--neon-purple)]/20 text-[var(--text-light)] transition-all duration-300 border border-white/10 hover:border-white/20"
      >
        重置所有筛选条件
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSkillStore } from '@/stores/skillStore'
import { getTagColor } from '@/utils/tagColors'
import { Search, Grid, List, Close } from '@element-plus/icons-vue'

defineProps<{ mobileOpen: boolean }>()

const emit = defineEmits<{
    close: []
}>()

const skillStore = useSkillStore()

const localSources = ref<string[]>([...skillStore.selectedSources])
const showAllTags = ref(false)
const defaultTagLimit = 8

const sourceOptions = computed(() => [
  { 
    label: '本地导入', 
    value: 'local',
    count: skillStore.skills.filter(s => ['zip', 'skillmd', 'local'].includes(s.source.type)).length
  },
  { 
    label: 'GitHub 同步', 
    value: 'github',
    count: skillStore.skills.filter(s => s.source.type === 'github').length
  }
])

const tagList = computed(() => {
  const tagCount: Record<string, number> = {}
  
  skillStore.skills.forEach(skill => {
    skill.tags.forEach(tag => {
      tagCount[tag] = (tagCount[tag] || 0) + 1
    })
  })
  
  return Object.entries(tagCount)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
})

const displayedTags = computed(() => {
  if (showAllTags.value) return tagList.value
  return tagList.value.slice(0, defaultTagLimit)
})

const hasActiveFilters = computed(() => {
  return skillStore.selectedTags.length > 0 || skillStore.searchQuery !== ''
})

const sortOptions = [
  { value: 'updated', label: '最近更新', icon: '🕐' },
  { value: 'likes', label: '最多点赞', icon: '🔥' },
  { value: 'name', label: '名称排序', icon: '🔤' },
  { value: 'files', label: '文件最多', icon: '📁' },
]

const onSortChange = (val: string) => {
  if (skillStore.sortBy === val) {
    skillStore.toggleSortOrder()
  } else {
    skillStore.setSortBy(val)
    skillStore.setSortOrder('desc')
  }
}

const onSearchChange = (val: string) => {
  skillStore.setSearchQuery(val)
}

const onToggleTag = (tag: string) => {
  skillStore.toggleSelectedTag(tag)
}

const onClearTags = () => {
  skillStore.setSelectedTags([])
}

const onSourceChange = () => {
  skillStore.setSelectedSources([...localSources.value])
}

const onResetAll = () => {
  skillStore.clearAllFilters()
  localSources.value = ['local', 'github']
}
</script>

<style scoped>
.view-toggle {
    display: inline-flex;
    align-items: center;
    background: var(--dark-bg);
    border: 1px solid rgba(0, 245, 255, 0.15);
    border-radius: 8px;
    padding: 2px;
    gap: 2px;
    height: 30px;
}

.view-toggle-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 24px;
    border-radius: 6px;
    border: none;
    cursor: pointer;
    background: transparent;
    color: var(--text-muted);
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    font-size: 14px;
}

.view-toggle-btn:hover {
    color: var(--neon-cyan);
    background: rgba(0, 245, 255, 0.08);
}

.view-toggle-btn.active {
    background: linear-gradient(135deg, var(--neon-cyan), var(--neon-purple));
    color: #fff;
    box-shadow: 0 2px 8px rgba(0, 245, 255, 0.3);
}

.mobile-drawer-header {
    display: none;
}

@media (max-width: 768px) {
    .filter-sidebar {
        display: block !important;
        position: fixed;
        top: 0;
        left: 0;
        z-index: 50;
        width: 85vw;
        max-width: 320px;
        height: 100vh;
        border-radius: 0;
        transform: translateX(-100%);
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        padding-top: 0;
    }

    .filter-sidebar.mobile-drawer-open {
        transform: translateX(0);
    }

    .mobile-drawer-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1rem 0;
        margin-bottom: 0.5rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    .mobile-drawer-close {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 2rem;
        height: 2rem;
        border-radius: 0.5rem;
        color: var(--text-muted);
        background: transparent;
        border: none;
        cursor: pointer;
        transition: all 0.2s;
    }

    .mobile-drawer-close:hover {
        color: var(--neon-cyan);
        background: rgba(255, 255, 255, 0.05);
    }
}

.tag-filter-btn {
  position: relative;
  overflow: hidden;
}

.tag-filter-btn::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  transform: translate(-50%, -50%);
  transition: width 0.5s ease, height 0.5s ease;
  pointer-events: none;
}

.tag-filter-btn:active::before {
  width: 200px;
  height: 200px;
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

:deep(.el-slider__runway) {
  background-color: rgba(255, 255, 255, 0.15) !important;
  height: 6px !important;
  border-radius: 3px !important;
}

:deep(.el-slider__bar) {
  background: linear-gradient(90deg, var(--neon-cyan), var(--neon-purple)) !important;
  height: 6px !important;
  border-radius: 3px !important;
}

:deep(.el-slider__button-wrapper) {
  top: -14px !important;
}

:deep(.el-slider__button) {
  width: 16px !important;
  height: 16px !important;
  border: 2px solid var(--neon-cyan) !important;
  background-color: var(--dark-card) !important;
}
</style>
