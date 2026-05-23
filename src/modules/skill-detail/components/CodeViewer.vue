<template>
  <div class="h-full min-h-0 flex flex-col rounded-xl overflow-hidden border border-[var(--neon-purple)]/20" style="background: var(--dark-card)">
    <template v-if="props.file">
      <div class="flex-shrink-0 px-4 py-2.5 border-b flex items-center gap-2" style="border-color: rgba(168,85,247,0.15); background: rgba(14,165,233,0.05)">
        <FileIcon :filename="props.file.name" type="file" :size="16" />
        <span class="font-mono text-sm truncate" style="color: var(--text-light)">{{ props.file.name }}</span>
        <span class="text-xs font-mono px-2 py-0.5 rounded whitespace-nowrap" :style="{ color: 'var(--neon-cyan)', background: 'rgba(14,165,233,0.1)' }">
          {{ langLabel }}
          <template v-if="isEditing"> ↺</template>
        </span>
        <span class="text-xs whitespace-nowrap" style="color: var(--text-muted)">{{ fileSizeStr }}</span>
        <span class="text-xs whitespace-nowrap" style="color: var(--text-muted)">{{ lineCount }} 行</span>
        <span class="text-xs whitespace-nowrap" style="color: var(--text-muted)">{{ charCount }} 字符</span>

        <div class="ml-auto flex items-center gap-1">
          <button
            v-if="!isEditing && isAdmin && previewMode !== 'image'"
            @click="enterEdit"
            class="w-7 h-7 flex items-center justify-center rounded transition-all hover:bg-white/10"
            style="color: var(--text-muted)"
            :title="previewMode === 'markdown' ? '编辑源码' : '编辑'"
          >
            ✏️
          </button>
          <template v-if="isEditing">
            <button
              @click="handleSave"
              class="w-7 h-7 flex items-center justify-center rounded transition-all hover:scale-110"
              style="color: var(--neon-cyan)"
              title="保存"
            >
              💾
            </button>
            <button
              @click="handleCancel"
              class="w-7 h-7 flex items-center justify-center rounded transition-all hover:scale-110"
              style="color: var(--neon-pink)"
              title="取消"
            >
              ❌
            </button>
          </template>
        </div>
      </div>

      <div class="flex-1 min-h-0" :class="isEditing ? 'overflow-hidden' : 'overflow-y-auto custom-scroll'" style="background: var(--dark-bg)">
        <template v-if="isRendering">
          <div class="flex items-center justify-center h-full">
            <div class="text-center">
              <div class="render-spinner mx-auto mb-3"></div>
              <p class="text-sm" style="color: var(--text-muted)">渲染中...</p>
            </div>
          </div>
        </template>

        <template v-else-if="isEditing">
          <textarea
            ref="textareaRef"
            v-model="editedContent"
            @input="hasUnsavedChanges = true"
            class="w-full h-full p-4 font-mono text-sm leading-relaxed resize-none border-0 outline-none"
            style="background: var(--dark-bg); color: var(--text-light); font-family: var(--font-mono)"
            spellcheck="false"
          ></textarea>
        </template>

        <template v-else-if="previewMode === 'image'">
          <div class="flex items-center justify-center h-full p-8">
            <img
              :src="imageDataUrl"
              :alt="props.file.name"
              class="max-w-full max-h-full object-contain rounded-lg"
              style="border: 1px solid rgba(0,245,255,0.1)"
            />
          </div>
        </template>

        <template v-else-if="previewMode === 'markdown'">
          <div class="p-6 markdown-body" v-html="renderedMarkdown"></div>
        </template>

        <template v-else>
          <div class="code-table-wrapper flex-1 min-h-0 overflow-y-auto custom-scroll" style="background: var(--dark-bg)">
            <table class="code-table">
              <tbody v-html="highlightedResult"></tbody>
            </table>
          </div>
        </template>
      </div>
    </template>

    <template v-else>
      <div class="flex-1 flex items-center justify-center p-8" style="color: var(--text-muted)">
        <div class="text-center">
          <div class="text-5xl mb-4">📂</div>
          <p class="text-base">请从左侧选择一个文件查看</p>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css'
import MarkdownIt from 'markdown-it'
import type { SkillFile } from '@/types'
import FileIcon from '@/components/ui/FileIcon.vue'

interface Props {
  file: SkillFile | null
  isAdmin: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  save: [file: SkillFile]
  cancel: []
}>()

const isEditing = ref(false)
const editedContent = ref('')
const hasUnsavedChanges = ref(false)
const textareaRef = ref<HTMLTextAreaElement | null>(null)
const isRendering = ref(false)

const extToHljs: Record<string, string> = {
  ts: 'typescript',
  tsx: 'typescript',
  js: 'javascript',
  jsx: 'javascript',
  mjs: 'javascript',
  vue: 'xml',
  html: 'xml',
  md: 'markdown',
  json: 'json',
  css: 'css',
  scss: 'scss',
  less: 'less',
  yaml: 'yaml',
  yml: 'yaml',
  py: 'python',
  sh: 'bash',
  bash: 'bash',
  zsh: 'bash',
  bat: 'dos',
  ps1: 'powershell',
  sql: 'sql',
  xml: 'xml',
  toml: 'ini',
  ini: 'ini',
  env: 'bash',
  conf: 'nginx',
  dockerfile: 'dockerfile',
  makefile: 'makefile',
  rs: 'rust',
  go: 'go',
  java: 'java',
  kt: 'kotlin',
  rb: 'ruby',
  php: 'php',
  c: 'c',
  cpp: 'cpp',
  h: 'c',
  graphql: 'graphql',
  gql: 'graphql',
}

const imageExtensions = new Set(['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico', 'bmp'])

function getFileExt(filename: string): string {
  const parts = filename.split('.')
  return parts.length > 1 ? parts.pop()!.toLowerCase() : ''
}

function detectHljsLang(filename: string): string | null {
  const ext = getFileExt(filename)
  if (!ext) return null
  const lowerName = filename.toLowerCase()
  if (lowerName === 'dockerfile') return 'dockerfile'
  if (lowerName === 'makefile') return 'makefile'
  return extToHljs[ext] || null
}

const previewMode = computed<'code' | 'markdown' | 'image'>(() => {
  if (!props.file) return 'code'
  const ext = getFileExt(props.file.name)
  if (imageExtensions.has(ext)) return 'image'
  if (ext === 'md' || ext === 'mdx') return 'markdown'
  return 'code'
})

const langLabel = computed(() => {
  if (!props.file) return '-'
  const ext = getFileExt(props.file.name)
  if (!ext) return 'Text'
  const labels: Record<string, string> = {
    ts: 'TS', tsx: 'TSX', js: 'JS', jsx: 'JSX', mjs: 'MJS',
    vue: 'Vue', html: 'HTML', md: 'MD', json: 'JSON',
    css: 'CSS', scss: 'SCSS', less: 'LESS', yaml: 'YAML', yml: 'YAML',
    py: 'Python', sh: 'Shell', bash: 'Bash', rs: 'Rust', go: 'Go',
    java: 'Java', kt: 'Kotlin', rb: 'Ruby', php: 'PHP',
    sql: 'SQL', xml: 'XML', toml: 'TOML', ini: 'INI',
    svg: 'SVG', png: 'PNG', jpg: 'JPG', gif: 'GIF', webp: 'WebP',
  }
  return labels[ext] || ext.toUpperCase()
})

const fileSizeStr = computed(() => {
  if (!props.file?.content) return '0 B'
  const bytes = new Blob([props.file.content]).size
  if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  if (bytes >= 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return bytes + ' B'
})

const lineCount = computed(() => {
  if (!props.file?.content) return 0
  return props.file.content.split('\n').length
})

const charCount = computed(() => {
  if (!props.file?.content) return 0
  return props.file.content.length
})

const imageDataUrl = computed(() => {
  if (!props.file || previewMode.value !== 'image') return ''
  const ext = getFileExt(props.file.name)
  const mimeMap: Record<string, string> = {
    png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg',
    gif: 'image/gif', svg: 'image/svg+xml', webp: 'image/webp',
    ico: 'image/x-icon', bmp: 'image/bmp',
  }
  const mime = mimeMap[ext] || 'application/octet-stream'
  if (ext === 'svg') {
    return `data:${mime};utf8,${encodeURIComponent(props.file.content)}`
  }
  return `data:${mime};base64,${props.file.content}`
})

const md = new MarkdownIt({
  html: false,
  linkify: true,
  highlight: function (str: string, lang: string) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang }).value
      } catch { /* empty */ }
    }
    return ''
  }
})

const renderedMarkdown = computed(() => {
  if (!props.file?.content) return ''
  return md.render(props.file.content)
})

const highlightedResult = computed(() => {
  if (!props.file) return ''
  const content = props.file.content || ''
  const ext = getFileExt(props.file.name)

  let highlighted: string
  if (ext === 'json') {
    try {
      const formatted = JSON.stringify(JSON.parse(content), null, 2)
      highlighted = hljs.highlight(formatted, { language: 'json' }).value
    } catch {
      highlighted = hljs.highlightAuto(content).value
    }
  } else {
    const lang = detectHljsLang(props.file.name)
    try {
      if (lang && hljs.getLanguage(lang)) {
        highlighted = hljs.highlight(content, { language: lang }).value
      } else {
        highlighted = hljs.highlightAuto(content).value
      }
    } catch {
      highlighted = escapeHtml(content)
    }
  }

  return highlighted
    .split('\n')
    .map((line, i) => `<tr class="code-row"><td class="line-num">${i + 1}</td><td class="line-content">${line || ' '}</td></tr>`)
    .join('')
})

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function enterEdit() {
  editedContent.value = props.file?.content || ''
  hasUnsavedChanges.value = false
  isEditing.value = true
  nextTick(() => {
    textareaRef.value?.focus()
  })
}

function handleSave() {
  if (!props.file) return
  emit('save', { ...props.file, content: editedContent.value })
  isEditing.value = false
  hasUnsavedChanges.value = false
}

function handleCancel() {
  isEditing.value = false
  hasUnsavedChanges.value = false
  emit('cancel')
}

watch(() => props.file, (_newFile, oldFile) => {
  isEditing.value = false
  hasUnsavedChanges.value = false
  if (_newFile && _newFile !== oldFile) {
    isRendering.value = true
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        isRendering.value = false
      })
    })
  }
})
</script>

<style scoped>
.render-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(14, 165, 233, 0.15);
  border-top-color: var(--neon-cyan);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.custom-scroll {
  scrollbar-width: thin;
  scrollbar-color: rgba(14, 165, 233, 0.2) transparent;
}

.custom-scroll::-webkit-scrollbar {
  width: 5px;
}

.custom-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scroll::-webkit-scrollbar-thumb {
  background: rgba(14, 165, 233, 0.2);
  border-radius: 3px;
}

.custom-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(14, 165, 233, 0.4);
}

button:hover {
  box-shadow: 0 0 8px rgba(14, 165, 233, 0.25);
}

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

<style>
.code-table-wrapper {
  scrollbar-width: thin;
  scrollbar-color: rgba(14, 165, 233, 0.2) transparent;
}

.code-table-wrapper::-webkit-scrollbar {
  width: 5px;
}

.code-table-wrapper::-webkit-scrollbar-track {
  background: transparent;
}

.code-table-wrapper::-webkit-scrollbar-thumb {
  background: rgba(14, 165, 233, 0.2);
  border-radius: 3px;
}

.code-table-wrapper::-webkit-scrollbar-thumb:hover {
  background: rgba(14, 165, 233, 0.4);
}

.code-table {
  border-collapse: collapse;
  width: 100%;
  font-family: var(--font-mono);
  font-size: 13px;
  line-height: 1.6;
  color: var(--text-light);
  table-layout: fixed;
}

.code-table .line-num {
  width: 52px;
  min-width: 52px;
  max-width: 52px;
  padding: 0 12px 0 0;
  text-align: right;
  color: rgba(255, 255, 255, 0.2);
  user-select: none;
  font-size: 0.85em;
  vertical-align: top;
  white-space: nowrap;
}

.code-table .line-content {
  padding: 0 16px;
  white-space: pre;
  vertical-align: top;
  overflow: visible;
}

.code-table .code-row:hover .line-num {
  color: rgba(255, 255, 255, 0.4);
}

.code-table .code-row:hover .line-content {
  background: rgba(14, 165, 233, 0.04);
}
</style>
