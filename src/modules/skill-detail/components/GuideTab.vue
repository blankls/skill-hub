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
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import type { Skill } from '@/types'

interface Props {
  skill: Skill
}

const props = defineProps<Props>()

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

const md = new MarkdownIt({
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang }).value
      } catch (__) {}
    }
    return escapeHtml(str)
  }
})

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
@import 'highlight.js/styles/github-dark.css';

.markdown-body h1,
.markdown-body h2,
.markdown-body h3 {
    margin-top: 1.2em;
    margin-bottom: 0.6em;
    font-weight: 600;
    color: var(--neon-cyan);
}

.markdown-body h1 { font-size: 1.5rem; }
.markdown-body h2 { font-size: 1.25rem; }
.markdown-body h3 { font-size: 1.1rem; }

.markdown-body p {
    margin-bottom: 1em;
    color: var(--text-light);
    line-height: 1.75;
}

.markdown-body code {
    background: rgba(14, 165, 233, 0.1);
    padding: 2px 6px;
    border-radius: 4px;
    font-family: var(--font-mono);
    color: var(--neon-cyan);
    font-size: 0.9em;
}

.markdown-body pre {
    background: rgba(15, 23, 42, 0.6);
    padding: 16px;
    border-radius: 8px;
    overflow-x: auto;
    border: 1px solid rgba(14, 165, 233, 0.2);
    margin-bottom: 1em;
}

.markdown-body pre code:not(.hljs) {
    background: transparent;
    padding: 0;
    border-radius: 0;
    color: var(--text-light);
}

.markdown-body a {
    color: var(--neon-purple);
    text-decoration: underline;
}

.markdown-body ul,
.markdown-body ol {
    color: var(--text-light);
    padding-left: 1.5em;
    margin-bottom: 1em;
}

.markdown-body li {
    margin-bottom: 0.3em;
}

.markdown-body blockquote {
    border-left: 3px solid rgba(14, 165, 233, 0.4);
    padding-left: 1em;
    color: var(--text-muted);
    margin-bottom: 1em;
}

.markdown-body table {
    border-collapse: collapse;
    margin-bottom: 1em;
    width: 100%;
}

.markdown-body th,
.markdown-body td {
    border: 1px solid rgba(14, 165, 233, 0.2);
    padding: 8px 12px;
    text-align: left;
}

.markdown-body th {
    background: rgba(14, 165, 233, 0.1);
    color: var(--neon-cyan);
    font-weight: 600;
}

.markdown-body td {
    color: var(--text-light);
}

.markdown-body strong {
    color: var(--neon-yellow);
}

.markdown-body img {
    max-width: 100%;
    border-radius: 8px;
}

.markdown-body hr {
    border: none;
    border-top: 1px solid rgba(14, 165, 233, 0.2);
    margin: 1.5em 0;
}
</style>
