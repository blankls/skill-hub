<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">技能库</h1>
      <p class="text-gray-600 dark:text-gray-400">探索和发现有用的 AI Skills</p>
    </div>
    <div class="flex items-center justify-between mb-8">
      <div class="flex items-center gap-4">
        <el-input v-model="searchQuery" placeholder="搜索技能..." :prefix-icon="Search" class="w-80" />
        <el-select v-model="sortBy" placeholder="排序" class="w-40">
          <el-option label="最热门" value="downloads" />
          <el-option label="评分最高" value="rating" />
          <el-option label="最新更新" value="updated" />
        </el-select>
      </div>
      <div class="flex items-center gap-2">
        <el-button-group>
          <el-button :type="skillStore.viewMode === 'grid' ? 'primary' : ''" @click="skillStore.toggleViewMode()">
            <el-icon><Grid /></el-icon>
          </el-button>
          <el-button :type="skillStore.viewMode === 'list' ? 'primary' : ''" @click="skillStore.toggleViewMode()">
            <el-icon><List /></el-icon>
          </el-button>
        </el-button-group>
      </div>
    </div>
    <div class="flex gap-8">
      <FilterSidebar @filter-change="handleFilterChange" />
      <div class="flex-1">
        <div v-if="skillStore.loading" class="flex items-center justify-center py-20">
          <el-icon class="text-4xl text-primary-600 animate-spin"><Loading /></el-icon>
        </div>
        <template v-else>
          <SkillGridView v-if="skillStore.viewMode === 'grid'" :skills="displaySkills" />
          <SkillListView v-else :skills="displaySkills" />
          <div v-if="displaySkills.length === 0" class="text-center py-20 text-gray-500">
            <p>没有找到匹配的技能</p>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Search, Grid, List, Loading } from '@element-plus/icons-vue'
import { useSkillStore } from '@/stores/skillStore'
import FilterSidebar from './components/FilterSidebar.vue'
import SkillGridView from './components/SkillGridView.vue'
import SkillListView from './components/SkillListView.vue'

const skillStore = useSkillStore()
const searchQuery = ref('')
const sortBy = ref('downloads')
const filters = ref<any>({})

const displaySkills = computed(() => {
  let skills = [...skillStore.filteredSkills]
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    skills = skills.filter(s => 
      s.name.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q)
    )
  }
  if (filters.value.sources?.length) {
    skills = skills.filter(s => filters.value.sources.includes(s.sourceType))
  }
  if (filters.value.tags?.length) {
    skills = skills.filter(s => filters.value.tags.some((t: string) => s.tags.includes(t)))
  }
  if (filters.value.minRating) {
    skills = skills.filter(s => s.rating >= filters.value.minRating)
  }
  if (sortBy.value === 'downloads') {
    skills.sort((a, b) => b.downloadCount - a.downloadCount)
  } else if (sortBy.value === 'rating') {
    skills.sort((a, b) => b.rating - a.rating)
  } else if (sortBy.value === 'updated') {
    skills.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
  }
  return skills
})

const handleFilterChange = (newFilters: any) => {
  filters.value = newFilters
}

onMounted(() => {
  skillStore.loadSkills()
})
</script>
