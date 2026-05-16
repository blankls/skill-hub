<template>
  <div class="space-y-6">
    <!-- Skill Info Card -->
    <div class="skill-card bg-[var(--dark-card)] rounded-xl p-6 border border-gray-200 dark:border-gray-700">
      <h2 class="text-xl font-semibold mb-4 text-[var(--text-light)]">关于</h2>
      <p class="text-[var(--text-muted)] mb-6">{{ skill.description }}</p>
      
      <!-- Tags -->
      <div v-if="skill.tags && skill.tags.length > 0" class="mb-6">
        <h3 class="text-sm font-semibold mb-3 text-[var(--text-light)]">标签</h3>
        <div class="flex flex-wrap gap-2">
          <span 
            v-for="tag in skill.tags" 
            :key="tag" 
            class="px-3 py-1 rounded-full text-sm font-mono text-white"
            :style="{ 
              background: `linear-gradient(135deg, var(--neon-cyan), var(--neon-purple))` 
            }"
          >
            #{{ tag }}
          </span>
        </div>
      </div>
      
      <!-- Info Grid -->
      <div class="grid grid-cols-2 gap-4 text-sm">
        <div class="flex items-center gap-2">
          <span class="text-[var(--text-muted)]">版本:</span> 
          <span class="text-[var(--text-light)] font-mono">v{{ skill.version }}</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-[var(--text-muted)]">作者:</span> 
          <span class="text-[var(--text-light)]">{{ skill.author }}</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-[var(--text-muted)]">来源:</span> 
          <span class="text-[var(--neon-cyan)] font-mono">{{ getSourceLabel(skill.source.type) }}</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-[var(--text-muted)]">更新时间:</span> 
          <span class="text-[var(--text-light)]">{{ formatDate(skill.updatedAt) }}</span>
        </div>
      </div>
    </div>
    
    <!-- Markdown Content -->
    <div v-if="markdownFile" class="skill-card bg-[var(--dark-card)] rounded-xl p-6 border border-gray-200 dark:border-gray-700">
      <h2 class="text-xl font-semibold mb-4 text-[var(--text-light)]">{{ markdownFile.name }}</h2>
      <div class="prose dark:prose-invert max-w-none text-[var(--text-light)]" v-html="renderedReadme"></div>
    </div>
    
    <!-- Empty State -->
    <div v-else class="skill-card bg-[var(--dark-card)] rounded-xl p-6 border border-gray-200 dark:border-gray-700 text-center">
      <h2 class="text-xl font-semibold mb-2 text-[var(--text-muted)]">暂无文档</h2>
      <p class="text-[var(--text-muted)]">这个技能没有 README.md 或 SKILL.md 文档</p>
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

<style scoped>
.skill-card {
  transition: all 0.3s ease;
}
</style>

<style>
.prose h1, .prose h2, .prose h3 { 
  margin-top: 1em; 
  margin-bottom: 0.5em; 
  font-weight: 600; 
  color: var(--text-light);
}
.prose p { 
  margin-bottom: 1em; 
  color: var(--text-muted);
}
.prose code { 
  background: var(--dark-card); 
  padding: 2px 6px; 
  border-radius: 4px; 
  font-family: var(--font-mono);
  color: var(--neon-cyan);
}
.prose a {
  color: var(--neon-purple);
  text-decoration: underline;
}
.prose ul, .prose ol {
  color: var(--text-muted);
}
</style>
