<template>
  <div class="min-h-screen bg-[var(--dark-bg)]">
    <SkillToolbar />

    <div class="flex">
      <!-- 左侧筛选栏 - 靠左贴边 -->
      <FilterSidebar v-if="skillStore.skills.length > 0" />

      <!-- 右侧内容区 -->
      <div class="flex-1 min-w-0 p-6">
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
        <div v-else class="max-w-[80rem] mx-auto">
          <SkillGridView v-if="skillStore.viewMode === 'grid'" :skills="skillStore.filteredSkills" :showAdminActions="false" />
          <SkillListView v-else :skills="skillStore.filteredSkills" :showAdminActions="false" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useSkillStore } from '@/stores/skillStore'
import { Loading } from '@element-plus/icons-vue'
import SkillToolbar from './components/SkillToolbar.vue'
import SkillGridView from './components/SkillGridView.vue'
import SkillListView from './components/SkillListView.vue'
import FilterSidebar from './components/FilterSidebar.vue'
import EmptyState from '@/components/ui/EmptyState.vue'

const route = useRoute()
const skillStore = useSkillStore()

function applyUrlFilters() {
  if (route.query.q) {
    skillStore.setSearchQuery(route.query.q as string)
  }
  if (route.query.tag) {
    const tag = route.query.tag as string
    if (!skillStore.selectedTags.includes(tag)) {
      skillStore.toggleSelectedTag(tag)
    }
  }
}

onMounted(() => {
  applyUrlFilters()
})

watch(() => route.query.tag, (newTag) => {
  if (newTag) {
    const tag = newTag as string
    if (!skillStore.selectedTags.includes(tag)) {
      skillStore.setSelectedTags([tag])
    }
  }
})

watch(() => route.query.q, (newQ) => {
  if (newQ) {
    skillStore.setSearchQuery(newQ as string)
  }
})
</script>

<style scoped>
@media (max-width: 768px) {
  :deep(aside) {
    display: none !important;
  }

  .flex-1.min-w-0.p-6 {
    padding: 1rem !important;
  }

  .py-20 {
    padding-top: 3rem !important;
    padding-bottom: 3rem !important;
  }
  
  .text-5xl {
    font-size: 2rem !important;
  }
}
</style>
