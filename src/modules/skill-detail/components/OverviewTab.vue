<template>
  <div class="space-y-6">
    <div class="bg-white dark:bg-dark-card rounded-xl p-6 border border-gray-200 dark:border-dark-border">
      <h2 class="text-xl font-semibold mb-4">关于</h2>
      <p class="text-gray-600 dark:text-gray-400">{{ skill.description }}</p>
    </div>
    <div v-if="skill.readme" class="bg-white dark:bg-dark-card rounded-xl p-6 border border-gray-200 dark:border-dark-border">
      <h2 class="text-xl font-semibold mb-4">README</h2>
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

const renderedReadme = computed(() => {
  if (props.skill.readme) {
    return md.render(props.skill.readme)
  }
  return ''
})
</script>

<style>
.prose h1, .prose h2, .prose h3 { margin-top: 1em; margin-bottom: 0.5em; font-weight: 600; }
.prose p { margin-bottom: 1em; }
.prose code { background: #f3f4f6; padding: 2px 6px; border-radius: 4px; }
.dark .prose code { background: #374151; }
</style>
