<template>
  <div class="space-y-6">
    <div class="bg-[var(--dark-card)] rounded-2xl p-6 border border-[var(--neon-cyan)]/20">
      <h2 class="text-xl font-semibold mb-4 text-[var(--neon-cyan)] font-mono uppercase">About</h2>
      <p class="text-[var(--text-muted)]">{{ skill.description }}</p>
      <div class="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div class="flex items-center gap-2">
          <span class="text-[var(--neon-yellow)] font-mono uppercase">version:</span>
          <span class="text-[var(--text-light)]">v{{ skill.version }}</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-[var(--neon-yellow)] font-mono uppercase">author:</span>
          <span class="text-[var(--text-light)]">{{ skill.author }}</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-[var(--neon-yellow)] font-mono uppercase">source:</span>
          <span class="text-[var(--text-light)]">{{ getSourceLabel(skill.source.type) }}</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-[var(--neon-yellow)] font-mono uppercase">updated:</span>
          <span class="text-[var(--text-light)]">{{ formatDate(skill.updatedAt) }}</span>
        </div>
      </div>
    </div>
    <div v-if="markdownFile" class="bg-[var(--dark-card)] rounded-2xl p-6 border border-[var(--neon-purple)]/20">
      <h2 class="text-xl font-semibold mb-4 text-[var(--neon-purple)] font-mono uppercase">{{ markdownFile.name }}</h2>
      <div class="markdown-content" v-html="renderedReadme"></div>
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
    local: 'LOCAL',
    zip: 'ZIP',
    github: 'GITHUB',
    skillmd: 'MARKDOWN'
  }
  return labels[type] || 'LOCAL'
}

const formatDate = (date: Date | string) => {
  const d = new Date(date)
  return d.toLocaleDateString('en-US')
}
</script>

<style scoped>
.markdown-content :deep(h1), 
.markdown-content :deep(h2), 
.markdown-content :deep(h3) { 
  margin-top: 1em; 
  margin-bottom: 0.5em; 
  font-weight: 600;
  color: var(--neon-cyan);
  font-family: 'Courier New', monospace;
}

.markdown-content :deep(p) { 
  margin-bottom: 1em;
  color: var(--text-light);
}

.markdown-content :deep(code) { 
  background: var(--dark-bg); 
  padding: 2px 6px; 
  border-radius: 4px;
  border: 1px solid rgba(0, 245, 255, 0.2);
  color: var(--neon-pink);
}

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  color: var(--text-light);
}
</style>
