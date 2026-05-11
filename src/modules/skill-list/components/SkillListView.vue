<template>
  <div class="space-y-4">
    <div v-for="skill in skills" :key="skill.id" class="bg-white dark:bg-dark-card rounded-xl p-6 border border-gray-200 dark:border-dark-border flex items-center gap-6 hover:shadow-lg transition-shadow cursor-pointer" @click="handleClick(skill)">
      <div class="w-14 h-14 rounded-xl gradient-bg flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
        {{ skill.name.charAt(0).toUpperCase() }}
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-3 mb-2">
          <h3 class="font-semibold text-lg truncate">{{ skill.name }}</h3>
          <el-tag size="small" :type="skill.sourceType === 'github' ? 'primary' : 'success'">
            {{ skill.sourceType === 'github' ? 'GitHub' : '本地' }}
          </el-tag>
          <span class="text-gray-500 text-sm">v{{ skill.version }}</span>
        </div>
        <p class="text-gray-600 dark:text-gray-400 truncate mb-2">{{ skill.description }}</p>
        <div class="flex items-center gap-4 text-sm text-gray-500">
          <span class="flex items-center gap-1">
            <el-icon><Star /></el-icon>
            {{ skill.rating }}
          </span>
          <span class="flex items-center gap-1">
            <el-icon><Download /></el-icon>
            {{ formatDownloads(skill.downloadCount) }}
          </span>
          <span>作者：{{ skill.author }}</span>
        </div>
      </div>
      <div class="flex gap-2">
        <el-tag v-for="tag in skill.tags.slice(0, 2)" :key="tag" size="small" effect="plain">
          {{ tag }}
        </el-tag>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Star, Download } from '@element-plus/icons-vue'
import type { Skill } from '@/types'

interface Props {
  skills: Skill[]
}

const props = defineProps<Props>()
const router = useRouter()

const handleClick = (skill: Skill) => {
  router.push(`/skills/${skill.id}`)
}

const formatDownloads = (num: number): string => {
  if (num >= 10000) return `${(num / 10000).toFixed(1)}万`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`
  return String(num)
}
</script>
