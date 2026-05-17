<template>
  <div>
    <!-- GitHub 仓库信息 -->
    <div v-if="githubMeta" class="rounded-xl overflow-hidden border border-[var(--neon-purple)]/30 mb-6" style="background: var(--dark-card)">
      <div class="px-5 py-3 border-b border-[var(--neon-purple)]/15 flex items-center gap-2" style="background: rgba(168,85,247,0.05)">
        <span class="text-base">🚀</span>
        <span class="font-semibold text-sm" style="color: var(--neon-purple)">GitHub 仓库</span>
      </div>
      <div class="p-5">
        <div class="flex items-start justify-between flex-wrap gap-4">
          <div class="min-w-0">
            <a :href="githubMeta.subfolderUrl || githubMeta.repoUrl" target="_blank" class="text-lg font-bold hover:underline transition-colors truncate block" style="color: var(--neon-cyan)">
              {{ githubMeta.full_name + (hasSubfolder ? '/' + subfolderRelative : '') }}
            </a>
            <el-tooltip placement="top" :disabled="!isGithubDescriptionLong">
              <template #content>
                <div class="max-w-lg whitespace-pre-line">{{ githubMeta.description }}</div>
              </template>
              <p 
                v-if="githubMeta.description" 
                class="text-sm mt-1.5 leading-relaxed max-w-2xl cursor-pointer hover:text-[var(--neon-cyan)]"
                :class="{ 'line-clamp-2': isGithubDescriptionLong }"
              >
                {{ githubMeta.description }}
              </p>
            </el-tooltip>
          </div>
          <div class="flex items-center gap-4 text-sm shrink-0 flex-wrap">
            <a :href="githubMeta.repoUrl" target="_blank" class="flex items-center gap-1.5 hover:opacity-80 transition-opacity" style="color: var(--text-muted)">
              <span class="text-base">🏠</span>
              <span class="font-mono text-xs" style="color: var(--neon-cyan)">{{ githubMeta.repoUrl.split('/').slice(-2).join('/') }}</span>
              <span class="text-[10px]" style="color: var(--text-muted)">↗</span>
            </a>
            <div class="flex items-center gap-1.5" style="color: var(--text-muted)">
              <span>🌿</span>
              <span class="font-mono px-1.5 py-0.5 text-xs rounded" style="background: rgba(0,245,255,0.08); color: var(--neon-cyan)">{{ githubMeta.branch }}</span>
            </div>
            <div class="flex items-center gap-1.5" style="color: var(--text-muted)">
              <span class="text-yellow-400 text-base">⭐</span>
              <span class="font-mono font-bold" style="color: var(--text-light)">{{ formatNumber(githubMeta.stars) }}</span>
            </div>
            <div class="flex items-center gap-1.5" style="color: var(--text-muted)">
              <span class="text-green-400 text-base">⑂</span>
              <span class="font-mono font-bold" style="color: var(--text-light)">{{ formatNumber(githubMeta.forks) }}</span>
            </div>
            <div class="flex items-center gap-1.5" style="color: var(--text-muted)">
              <span class="text-blue-400 text-base">👁</span>
              <span class="font-mono font-bold" style="color: var(--text-light)">{{ formatNumber(githubMeta.watchers) }}</span>
            </div>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t" style="border-color: rgba(168,85,247,0.1)">
          <div v-if="githubMeta.language" class="flex items-center gap-1.5 text-xs">
            <span class="w-2.5 h-2.5 rounded-full" :style="{ background: languageColor(githubMeta.language) }"></span>
            <span style="color: var(--text-muted)">{{ githubMeta.language }}</span>
          </div>
          <div v-if="githubMeta.license" class="flex items-center gap-1.5 text-xs">
            <span style="color: var(--text-muted)">📜</span>
            <span class="font-mono px-2 py-0.5 rounded" style="color: var(--neon-yellow); background: rgba(234,179,8,0.1); border: 1px solid rgba(234,179,8,0.2)">{{ githubMeta.license }}</span>
          </div>
          <div class="flex items-center gap-1.5 text-xs" style="color: var(--text-muted)">
            <span>📅</span>
            <span>{{ formatDate(githubMeta.createdAt) }} 创建</span>
          </div>
          <div class="flex items-center gap-1.5 text-xs" style="color: var(--text-muted)">
            <span>🔄</span>
            <span>{{ formatDate(githubMeta.updatedAt) }} 更新</span>
          </div>
        </div>

        <div v-if="githubMeta.topics.length > 0" class="flex flex-wrap gap-1.5 mt-3 pt-3 border-t" style="border-color: rgba(168,85,247,0.1)">
          <span v-for="topic in githubMeta.topics" :key="topic"
            class="px-2.5 py-0.5 rounded-full text-xs transition-colors"
            style="color: var(--neon-cyan); background: rgba(0,245,255,0.08); border: 1px solid rgba(0,245,255,0.15)">
            {{ topic }}
          </span>
        </div>
      </div>
    </div>

    <!-- Markdown Content - README.md 优先，其次 SKILL.md -->
    <div v-if="overviewFile" class="rounded-xl p-6 border border-[var(--neon-purple)]/20" style="background: var(--dark-card)">
      <div class="flex items-center gap-2 mb-4">
        <span class="text-sm">📄</span>
        <h2 class="text-xl font-semibold" style="color: var(--text-light)">{{ overviewFile.name }}</h2>
        <span class="ml-auto text-xs rounded-full px-2 py-0.5 border" style="color: var(--neon-cyan); border-color: rgba(0,245,255,0.3); background: rgba(0,245,255,0.05)">文档</span>
      </div>
      <div class="markdown-container">
        <div 
          class="markdown-body" 
          :class="{ 'content-collapsed': !isExpanded && isContentLong }"
          v-html="renderedContent"
        ></div>
        <div 
          v-if="isContentLong" 
          class="expand-toggle flex justify-center mt-4"
        >
          <button 
            @click="isExpanded = !isExpanded"
            class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:opacity-80"
            style="color: var(--neon-cyan); background: rgba(0,245,255,0.1); border: 1px solid rgba(0,245,255,0.3)"
          >
            <el-icon v-if="!isExpanded"><ArrowDown /></el-icon>
            <el-icon v-else><ArrowUp /></el-icon>
            {{ isExpanded ? '收起' : '展开' }}
          </button>
        </div>
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
import { ref, computed, nextTick, watch } from 'vue'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import { ArrowDown, ArrowUp } from '@element-plus/icons-vue'
import type { Skill, GithubMeta } from '@/types'

interface Props {
  skill: Skill
}

const props = defineProps<Props>()
const isExpanded = ref(false)

// 当技能变化时重置展开状态
watch(() => props.skill, () => {
  isExpanded.value = false
}, { immediate: true })

const githubMeta = computed<GithubMeta | null>(() => {
  return props.skill.source?.githubMeta || null
})

const isGithubDescriptionLong = computed(() => {
  return (githubMeta.value?.description?.length || 0) > 100
})

const hasSubfolder = computed(() => {
  if (!githubMeta.value) return false
  return githubMeta.value.subfolderUrl !== githubMeta.value.repoUrl
})

const subfolderRelative = computed(() => {
  if (!githubMeta.value) return ''
  return githubMeta.value.subfolderUrl
    .replace(githubMeta.value.repoUrl + '/tree/' + githubMeta.value.branch + '/', '')
})

function formatNumber(n: number): string {
  if (n >= 100000) return (n / 1000).toFixed(0) + 'k'
  if (n >= 10000) return (n / 1000).toFixed(1) + 'k'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k'
  return n.toString()
}

function formatDate(d: string): string {
  if (!d) return ''
  const date = new Date(d)
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

function languageColor(lang: string): string {
  const colors: Record<string, string> = {
    TypeScript: '#3178c6',
    JavaScript: '#f1e05a',
    Python: '#3572a5',
    Go: '#00add8',
    Rust: '#dea584',
    Java: '#b07219',
    Ruby: '#701516',
    C: '#555555',
    'C++': '#f34b7d',
    HTML: '#e34c26',
    CSS: '#563d7c',
    Shell: '#89e051',
    Vue: '#41b883',
    Svelte: '#ff3e00',
    Lua: '#000080',
    Swift: '#f05138',
    Kotlin: '#a97bff',
    Dart: '#00b4ab',
    PHP: '#4f5d95'
  }
  return colors[lang] || '#8b8b8b'
}

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

const isContentLong = computed(() => {
  if (!overviewFile.value) return false
  return overviewFile.value.content.length > 500
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.markdown-container {
  position: relative;
}

.content-collapsed {
  max-height: 300px !important;
  overflow: hidden;
  position: relative;
}

.content-collapsed::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100px;
  background: linear-gradient(to bottom, transparent, var(--dark-card));
  pointer-events: none;
  z-index: 10;
}
</style>

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
