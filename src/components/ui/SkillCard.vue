<template>
  <div class="group bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-gray-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300 cursor-pointer" @click="handleClick">
    <div class="p-6">
      <div class="flex items-start justify-between mb-4">
        <div class="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center text-white text-xl font-bold">
          {{ skill.name.charAt(0).toUpperCase() }}
        </div>
        <el-tag :type="skill.source.type === 'github' ? 'primary' : 'success'" size="small">
          {{ getSourceLabel(skill.source.type) }}
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
        <span>v{{ skill.version }}</span>
        <span class="text-xs text-gray-400">
          {{ formatDate(skill.updatedAt) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import type { Skill } from '@/types'

interface Props {
  skill: Skill
}

const props = defineProps<Props>()
const router = useRouter()

const handleClick = () => {
  router.push(`/skills/${props.skill.id}`)
}

const getSourceLabel = (type: string) => {
  const labels: Record<string, string> = {
    local: '本地',
    zip: 'ZIP',
    github: 'GitHub',
    skillmd: 'Markdown'
  }
  return labels[type] || '本地'
}

const formatDate = (date: Date | string) => {
  const d = new Date(date)
  return d.toLocaleDateString('zh-CN')
}
</script>
