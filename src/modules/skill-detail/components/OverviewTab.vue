<template>
  <div class="space-y-6">
    <div class="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
      <h2 class="text-xl font-semibold mb-4">关于</h2>
      <p class="text-gray-600 dark:text-gray-400">{{ skill.description }}</p>
      <div class="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div>
          <span class="text-gray-500">版本:</span> v{{ skill.version }}
        </div>
        <div>
          <span class="text-gray-500">作者:</span> {{ skill.author }}
        </div>
        <div>
          <span class="text-gray-500">来源:</span> {{ getSourceLabel(skill.source.type) }}
        </div>
        <div>
          <span class="text-gray-500">更新时间:</span> {{ formatDate(skill.updatedAt) }}
        </div>
      </div>
    </div>
    <div v-if="markdownFile" class="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
      <h2 class="text-xl font-semibold mb-4">{{ markdownFile.name }}</h2>
      <div class="prose dark:prose-invert max-w-none" v-html="renderedReadme"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import MarkdownIt from 'markdown-it'
import type { Skill } from '@/types'

interface Props {
  skill: Skill
}

const props = defineProps<Props>()

const md = new MarkdownIt()

const markdownFile = computed(() => {
  return props.skill.files.find(f => 
    f.path.toLowerCase().includes('readme') || 
    f.name.toLowerCase() === 'skill.md' ||
    f.language === 'markdown'
  )
})

const renderedReadme = computed(() => {
  if (markdownFile.value) {
    return md.render(markdownFile.value.content)
  }
  return ''
})

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

<style>
.prose h1, .prose h2, .prose h3 { margin-top: 1em; margin-bottom: 0.5em; font-weight: 600; }
.prose p { margin-bottom: 1em; }
.prose code { background: #f3f4f6; padding: 2px 6px; border-radius: 4px; }
.dark .prose code { background: #374151; }
</style>
