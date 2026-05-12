<template>
  <div class="min-h-screen bg-gray-50 dark:bg-slate-900">
    <SkillToolbar
      v-model="searchQuery"
      :tags="allTags"
      @update:modelValue="skillStore.setSearchQuery"
      @update:viewMode="skillStore.setViewMode"
    />

    <div class="max-w-7xl mx-auto p-6">
      <div v-if="skillStore.loading" class="text-center py-20">
        <el-icon class="text-4xl text-primary-500 animate-spin"><Loading /></el-icon>
        <p class="mt-4 text-gray-600">加载中...</p>
      </div>
      <div v-else-if="skillStore.filteredSkills.length === 0" class="text-center py-20">
        <p class="text-gray-500">暂无技能</p>
        <el-button type="primary" class="mt-4" @click="showImport = true">
          导入第一个技能
        </el-button>
      </div>
      <div v-else>
        <SkillGridView v-if="skillStore.viewMode === 'grid'" :skills="skillStore.filteredSkills" />
        <SkillListView v-else :skills="skillStore.filteredSkills" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useSkillStore } from '@/stores/skillStore'
import { Loading } from '@element-plus/icons-vue'
import SkillToolbar from './components/SkillToolbar.vue'
import SkillGridView from './components/SkillGridView.vue'
import SkillListView from './components/SkillListView.vue'

const route = useRoute()
const skillStore = useSkillStore()
const searchQuery = ref('')
const showImport = ref(false)

const allTags = computed(() => {
  const tags = new Set<string>()
  skillStore.skills.forEach(s => s.tags.forEach(t => tags.add(t)))
  return Array.from(tags)
})

onMounted(() => {
  if (route.query.q) {
    searchQuery.value = route.query.q as string
    skillStore.setSearchQuery(searchQuery.value)
  }
  if (route.query.tag) {
    searchQuery.value = route.query.tag as string
    skillStore.setSearchQuery(searchQuery.value)
  }
})
</script>
