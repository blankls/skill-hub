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
          description="开始导入你的第一个 AI 技能，建立你的专属技能库"
          action-text="导入技能"
          :show-default-action="true"
          @action="showImport = true"
        >
          <template #icon>
            <span class="text-7xl">💻</span>
          </template>
        </EmptyState>
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
import EmptyState from '@/components/ui/EmptyState.vue'

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
