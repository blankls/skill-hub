<template>
  <div class="group bg-white dark:bg-dark-card rounded-2xl overflow-hidden border border-gray-200 dark:border-dark-border hover:shadow-xl hover:shadow-primary-500/10 transition-all duration-300 cursor-pointer" @click="handleClick">
    <div class="p-6">
      <div class="flex items-start justify-between mb-4">
        <div class="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center text-white text-xl font-bold">
          {{ skill.name.charAt(0).toUpperCase() }}
        </div>
        <el-tag :type="skill.sourceType === 'github' ? 'primary' : 'success'" size="small">
          {{ skill.sourceType === 'github' ? 'GitHub' : '本地' }}
        </el-tag>
      </div>
      <h3 class="text-lg font-semibold mb-2 group-hover:text-primary-600 transition-colors">
        {{ skill.name }}
      </h3>
      <p class="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
        {{ skill.description }}
      </p>
      <div class="flex flex-wrap gap-2 mb-4">
        <el-tag v-for="tag in skill.tags" :key="tag" size="small" effect="plain" class="text-xs">
          {{ tag }}
        </el-tag>
      </div>
      <div class="flex items-center justify-between text-sm text-gray-500">
        <span class="flex items-center gap-1">
          <el-icon><Star /></el-icon>
          {{ skill.rating }}
        </span>
        <span class="flex items-center gap-1">
          <el-icon><Download /></el-icon>
          {{ formatDownloads(skill.downloadCount) }}
        </span>
        <span>v{{ skill.version }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Star, Download } from '@element-plus/icons-vue'
import type { Skill } from '@/types'

interface Props {
  skill: Skill
}

const props = defineProps<Props>()
const router = useRouter()

const handleClick = () => {
  router.push(`/skills/${props.skill.id}`)
}

const formatDownloads = (num: number): string => {
  if (num >= 10000) return `${(num / 10000).toFixed(1)}万`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`
  return String(num)
}
</script>
