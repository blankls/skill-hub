<template>
  <div class="min-h-screen bg-[var(--dark-bg)]">
    <SkillToolbar
      v-model="searchQuery"
      :tags="allTags"
      @update:modelValue="skillStore.setSearchQuery"
      @update:viewMode="skillStore.setViewMode"
    />

    <div class="max-w-[95rem] mx-auto p-6">
      <div v-if="skillStore.loading" class="text-center py-20">
        <el-icon class="text-5xl text-[var(--neon-cyan)] animate-spin"><Loading /></el-icon>
        <p class="mt-6 text-[var(--text-muted)] text-lg">加载技能中...</p>
      </div>
      <div v-else-if="skillStore.filteredSkills.length === 0">
        <EmptyState 
          title="技能仓库为空"
          description="技能库中暂无技能，等待管理员添加技能"
        >
          <template #icon>
            <span class="text-7xl">💻</span>
          </template>
        </EmptyState>
      </div>
      <div v-else>
        <SkillGridView v-if="skillStore.viewMode === 'grid'" :skills="skillStore.filteredSkills" :showAdminActions="false" />
        <SkillListView v-else :skills="skillStore.filteredSkills" :showAdminActions="false" />
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
import EmptyState from '@/components/ui/EmptyState.vue'

const route = useRoute()
const skillStore = useSkillStore()
const searchQuery = ref('')

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

<style scoped>
/* Mobile Responsive */
@media (max-width: 768px) {
  .max-w-[95rem].mx-auto.p-6 {
    padding: 1rem !important;
  }
  
  .py-20 {
    padding-top: 3rem !important;
    padding-bottom: 3rem !important;
  }
  
  .text-5xl {
    font-size: 2rem !important;
  }
  
  /* Grid spacing for mobile */
  :deep(.grid.gap-6) {
    gap: 1rem !important;
  }
  
  /* List spacing for mobile */
  :deep(.space-y-4) > * + * {
    margin-top: 1rem !important;
  }
}
</style>
