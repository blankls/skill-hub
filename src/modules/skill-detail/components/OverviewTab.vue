<template>
  <div>
    <div v-if="overviewFile" class="rounded-xl p-6 border border-[var(--neon-purple)]/20" style="background: var(--dark-card)">
      <div class="flex items-center gap-2 mb-4">
        <span class="text-sm">📄</span>
        <h2 class="text-xl font-semibold" style="color: var(--text-light)">{{ overviewFile.name }}</h2>
        <span class="ml-auto text-xs rounded-full px-2 py-0.5 border" style="color: var(--neon-cyan); border-color: rgba(0,245,255,0.3); background: rgba(0,245,255,0.05)">文档</span>
      </div>
      <div class="markdown-container">
        <div 
          class="markdown-body" 
          v-html="renderedContent"
        ></div>
      </div>
    </div>

    <div v-else class="rounded-xl p-10 border border-[var(--neon-cyan)]/15 text-center" style="background: var(--dark-card)">
      <div class="text-4xl mb-4">📭</div>
      <h2 class="text-xl font-semibold mb-2" style="color: var(--text-muted)">暂无文档</h2>
      <p style="color: var(--text-muted)">这个技能没有 README.md 或 SKILL.md 文档</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { createMarkdownRenderer } from '@/utils/markdown'
import type { Skill } from '@/types'

interface Props {
  skill: Skill
}

const props = defineProps<Props>()

const md = createMarkdownRenderer()

const overviewFile = computed(() => {
  const files = props.skill.files
  const readme = files.find(f => f.name.toLowerCase() === 'readme.md' || f.path.toLowerCase() === 'readme.md')
  if (readme) return readme
  return files.find(f => f.name.toLowerCase() === 'skill.md' || f.path.toLowerCase() === 'skill.md')
})

const renderedContent = computed(() => {
  if (overviewFile.value) {
    return md.render(overviewFile.value.content)
  }
  return ''
})
</script>

<style scoped>
.markdown-container {
  position: relative;
}
</style>

<style>
@import '@/assets/markdown-body.css';
</style>
