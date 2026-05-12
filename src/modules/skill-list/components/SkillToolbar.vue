<template>
  <div class="bg-white dark:bg-slate-800 shadow-sm p-4 sticky top-0 z-20">
    <div class="max-w-7xl mx-auto flex flex-wrap gap-4 items-center justify-between">
      <div class="flex items-center gap-4 flex-1">
        <el-input
          v-model="searchQuery"
          placeholder="搜索技能..."
          :prefix-icon="Search"
          clearable
          class="w-80"
          @input="handleSearch"
        />
        <el-select v-model="selectedTag" placeholder="筛选标签" clearable class="w-40">
          <el-option v-for="tag in allTags" :key="tag" :label="tag" :value="tag" />
        </el-select>
      </div>

      <div class="flex items-center gap-3">
        <el-radio-group v-model="viewMode" size="small" @change="handleViewModeChange">
          <el-radio-button value="grid">
            <el-icon><Grid /></el-icon>
          </el-radio-button>
          <el-radio-button value="list">
            <el-icon><List /></el-icon>
          </el-radio-button>
        </el-radio-group>
        <el-button type="primary" :icon="Upload" @click="showImport = true">
          导入技能
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
