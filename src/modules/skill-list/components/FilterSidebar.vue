<template>
  <aside class="w-72 flex-shrink-0 bg-[var(--dark-card)] rounded-xl p-6 shadow-lg border border-white/5">
    <div class="space-y-8">
      <!-- 来源筛选 -->
      <div class="filter-section">
        <h3 class="text-sm font-semibold text-[var(--text-light)] mb-4 flex items-center">
          <span class="w-1 h-4 bg-gradient-to-b from-[var(--neon-cyan)] to-[var(--neon-purple)] rounded-full mr-2"></span>
          数据来源
        </h3>
        <div class="space-y-2 ml-3">
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
        <h3 class="text-sm font-semibold text-[var(--text-light)] mb-4 flex items-center">
          <span class="w-1 h-4 bg-gradient-to-b from-[var(--neon-cyan)] to-[var(--neon-purple)] rounded-full mr-2"></span>
          标签筛选
        </h3>
        
        <div v-if="tagList.length > 0" class="space-y-1">
          <button
            v-for="(tag, index) in tagList"
            :key="tag.name"
            @click="onToggleTag(tag.name)"
            class="tag-filter-btn w-full flex items-center justify-between py-2.5 px-4 rounded-lg transition-all duration-300 hover:scale-[1.02]"
            :class="[
              skillStore.selectedTags.includes(tag.name) 
                ? 'ring-2 ring-offset-2 ring-offset-[var(--dark-card)]' 
                : 'hover:bg-white/5'
            ]"
            :style="{
              backgroundColor: skillStore.selectedTags.includes(tag.name) 
                ? getTagColor(tag.name, index).bg 
                : 'transparent',
              ringColor: getTagColor(tag.name, index).border,
              borderLeft: `3px solid ${getTagColor(tag.name, index).border}`
            }"
          >
            <div class="flex items-center">
              <span 
                class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                :style="{
                  backgroundColor: getTagColor(tag.name, index).bg,
                  color: getTagColor(tag.name, index).text,
                  border: `1px solid ${getTagColor(tag.name, index).border}`
                }"
              >
                #{{ tag.name }}
              </span>
            </div>
            <span class="text-xs px-2 py-1 rounded-full bg-white/10 text-[var(--text-muted)]">
              {{ tag.count }}
            </span>
          </button>
        </div>

        <div v-else class="text-center py-8 text-sm text-[var(--text-muted)]">
          暂无标签
        </div>

        <!-- 清除筛选 -->
        <button
          v-if="skillStore.selectedTags.length > 0"
          @click="onClearTags"
          class="mt-4 w-full py-2 px-4 rounded-lg text-sm text-[var(--neon-cyan)] hover:bg-[var(--neon-cyan)]/10 transition-colors border border-[var(--neon-cyan)]/30 hover:border-[var(--neon-cyan)]/50"
        >
          清除标签筛选 ({{ skillStore.selectedTags.length }})
        </button>
      </div>

      <!-- 评分筛选 -->
      <div class="filter-section">
        <h3 class="text-sm font-semibold text-[var(--text-light)] mb-4 flex items-center">
          <span class="w-1 h-4 bg-gradient-to-b from-[var(--neon-cyan)] to-[var(--neon-purple)] rounded-full mr-2"></span>
          最低评分
        </h3>
        <div class="px-2">
          <el-slider 
            :model-value="skillStore.minRating"
            @update:model-value="onRatingChange"
            :min="0" 
            :max="5" 
            :step="0.5" 
            :show-input="true"
            size="small"
            :show-stops="true"
          />
        </div>
      </div>

      <!-- 重置所有筛选 -->
      <button
        v-if="hasActiveFilters"
        @click="onResetAll"
        class="w-full py-3 px-4 rounded-lg text-sm font-medium bg-gradient-to-r from-[var(--neon-cyan)]/10 to-[var(--neon-purple)]/10 hover:from-[var(--neon-cyan)]/20 hover:to-[var(--neon-purple)]/20 text-[var(--text-light)] transition-all duration-300 border border-white/10 hover:border-white/20"
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

const skillStore = useSkillStore()

const localSources = ref<string[]>([...skillStore.selectedSources])

const sourceOptions = computed(() => [
  { 
    label: '本地技能', 
    value: 'local',
    count: skillStore.skills.filter(s => s.source.type === 'local').length
  },
  { 
    label: 'GitHub 技能', 
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

const hasActiveFilters = computed(() => {
  return skillStore.selectedTags.length > 0 || skillStore.minRating > 0
})

const onToggleTag = (tag: string) => {
  skillStore.toggleSelectedTag(tag)
}

const onClearTags = () => {
  skillStore.setSelectedTags([])
}

const onSourceChange = () => {
  skillStore.setSelectedSources([...localSources.value])
}

const onRatingChange = (val: number) => {
  skillStore.setMinRating(val)
}

const onResetAll = () => {
  skillStore.clearAllFilters()
  localSources.value = ['local', 'github']
}
</script>

<style scoped>
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

:deep(.el-slider__runway) {
  background-color: rgba(255, 255, 255, 0.1) !important;
}

:deep(.el-slider__bar) {
  background-color: var(--neon-cyan) !important;
}

:deep(.el-slider__button) {
  border-color: var(--neon-cyan) !important;
}

:deep(.el-slider__stop) {
  background-color: rgba(255, 255, 255, 0.2) !important;
}
</style>
