<template>
  <div v-if="guideFiles.length > 0" class="space-y-6">
    <div v-for="file in guideFiles" :key="file.path" class="rounded-xl overflow-hidden border border-[var(--neon-yellow)]/20" style="background: var(--dark-card)">
      <div class="px-4 py-3 border-b" style="border-color: rgba(234,179,8,0.15); background: rgba(234,179,8,0.03); display: flex; align-items: center; gap: 8px;">
        <span class="text-base">📘</span>
        <span class="font-semibold" style="color: var(--text-light)">{{ file.name }}</span>
        <span class="ml-auto text-xs rounded-full px-2 py-0.5 border" style="color: var(--neon-yellow); border-color: rgba(234,179,8,0.3); background: rgba(234,179,8,0.05)">指导文档</span>
      </div>
      <div class="p-6">
        <div class="markdown-body" v-html="renderMd(file.content)"></div>
      </div>
    </div>
  </div>
  <div v-else class="rounded-xl p-10 border border-[var(--neon-cyan)]/15 text-center" style="background: var(--dark-card)">
    <div class="text-4xl mb-4">📘</div>
    <h2 class="text-xl font-semibold mb-2" style="color: var(--text-muted)">暂无指导文档</h2>
    <p style="color: var(--text-muted)">这个技能没有 guide.md 指导文件</p>
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

function renderMd(content: string): string {
  return md.render(content)
}

const guideFiles = computed(() => {
  return props.skill.files.filter(f => {
    const name = f.name.toLowerCase()
    return name === 'guide.md'
  })
})
</script>

<style>
@import '@/assets/markdown-body.css';
</style>
