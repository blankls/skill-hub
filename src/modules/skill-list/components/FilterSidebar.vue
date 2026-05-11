<template>
  <aside class="w-64 flex-shrink-0">
    <div class="sticky top-24 space-y-6">
      <div>
        <h3 class="font-semibold mb-3">来源</h3>
        <div class="space-y-2">
          <el-checkbox v-model="selectedSources" label="local">本地</el-checkbox>
          <el-checkbox v-model="selectedSources" label="github">GitHub</el-checkbox>
        </div>
      </div>
      <div>
        <h3 class="font-semibold mb-3">热门标签</h3>
        <div class="flex flex-wrap gap-2">
          <el-tag
            v-for="tag in allTags"
            :key="tag"
            :type="selectedTags.includes(tag) ? 'primary' : 'info'"
            effect="plain"
            class="cursor-pointer"
            @click="toggleTag(tag)"
          >
            {{ tag }}
          </el-tag>
        </div>
      </div>
      <div>
        <h3 class="font-semibold mb-3">评分</h3>
        <el-slider v-model="minRating" :min="0" :max="5" :step="0.5" show-input />
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSkillStore } from '@/stores/skillStore'

const emit = defineEmits<{
  (e: 'filter-change', filters: any): void
}>()

const skillStore = useSkillStore()
const selectedSources = ref<string[]>(['local', 'github'])
const selectedTags = ref<string[]>([])
const minRating = ref(0)

const allTags = computed(() => {
  const tags = new Set<string>()
  skillStore.skills.forEach(skill => {
    skill.tags.forEach(tag => tags.add(tag))
  })
  return Array.from(tags)
})

const toggleTag = (tag: string) => {
  const idx = selectedTags.value.indexOf(tag)
  if (idx > -1) {
    selectedTags.value.splice(idx, 1)
  } else {
    selectedTags.value.push(tag)
  }
  emitFilters()
}

const emitFilters = () => {
  emit('filter-change', {
    sources: selectedSources.value,
    tags: selectedTags.value,
    minRating: minRating.value
  })
}
</script>
