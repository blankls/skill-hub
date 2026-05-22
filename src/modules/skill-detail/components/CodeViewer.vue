<template>
  <div class="h-full min-h-0 flex flex-col rounded-xl overflow-hidden border border-[var(--neon-purple)]/20" style="background: var(--dark-card)">
    <template v-if="props.file">
      <div class="flex-shrink-0 px-4 py-2.5 border-b flex items-center gap-2" style="border-color: rgba(168,85,247,0.15); background: rgba(14,165,233,0.05)">
        <span style="color: var(--neon-cyan)">📄</span>
        <span class="font-mono text-sm truncate" style="color: var(--text-light)">{{ props.file.name }}</span>
        <span class="text-xs font-mono px-2 py-0.5 rounded whitespace-nowrap" :style="{ color: 'var(--neon-cyan)', background: 'rgba(14,165,233,0.1)' }">
          {{ langLabel }}
          <template v-if="isEditing"> ↺</template>
        </span>
        <span class="text-xs whitespace-nowrap" style="color: var(--text-muted)">{{ fileSizeStr }}</span>
        <span class="text-xs whitespace-nowrap" style="color: var(--text-muted)">{{ lineCount }} 行</span>

        <div class="ml-auto flex items-center gap-1">
          <button
            v-if="!isEditing && isAdmin"
            @click="enterEdit"
            class="w-7 h-7 flex items-center justify-center rounded transition-all hover:bg-white/10"
            style="color: var(--text-muted)"
            title="编辑"
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

      <div class="flex-1 min-h-0" :class="isEditing ? 'overflow-hidden' : 'overflow-y-auto'" style="background: var(--dark-bg)">
        <template v-if="isEditing">
          <textarea
            ref="textareaRef"
            v-model="editedContent"
            @input="hasUnsavedChanges = true"
            class="w-full h-full p-4 font-mono text-sm leading-relaxed resize-none border-0 outline-none"
            style="background: var(--dark-bg); color: var(--text-light); font-family: var(--font-mono)"
            spellcheck="false"
          ></textarea>
        </template>
        <template v-else>
          <pre class="m-0 p-4 text-sm leading-relaxed code-lines" style="color: var(--text-light); background: var(--dark-bg); font-family: var(--font-mono)" v-html="highlightedResult"></pre>
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
import type { SkillFile } from '@/types'

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

const langMap: Record<string, string> = {
  ts: 'TS',
  js: 'JS',
  vue: 'Vue',
  md: 'MD',
  json: 'JSON',
  css: 'CSS',
  html: 'HTML',
  yaml: 'YAML',
  py: 'Python',
}

const langLabel = computed(() => {
  if (!props.file?.language) return '-'
  return langMap[props.file.language] || props.file.language
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

const highlightedResult = computed(() => {
  if (!props.file) return ''
  const raw = hljsResult.value
  if (!raw) return ''
  return raw
    .split('\n')
    .map((line, i) => `<span class="code-line">${line || ' '}</span>`)
    .join('\n')
})

const hljsResult = computed(() => {
  if (!props.file) return ''
  const lang = props.file.language || 'text'
  try {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(props.file.content, { language: lang }).value
    }
  } catch {
    //
  }
  return hljs.highlightAuto(props.file.content).value
})

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

watch(() => props.file, () => {
  isEditing.value = false
  hasUnsavedChanges.value = false
})
</script>

<style scoped>
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: rgba(14, 165, 233, 0.2) transparent;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 5px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(14, 165, 233, 0.2);
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(14, 165, 233, 0.4);
}

.code-lines {
  counter-reset: line;
}

.code-lines :deep(.code-line) {
  display: block;
}

.code-lines :deep(.code-line)::before {
  counter-increment: line;
  content: counter(line);
  display: inline-block;
  width: 40px;
  text-align: right;
  margin-right: 16px;
  color: rgba(255, 255, 255, 0.25);
  user-select: none;
}

button:hover {
  box-shadow: 0 0 8px rgba(14, 165, 233, 0.25);
}
</style>