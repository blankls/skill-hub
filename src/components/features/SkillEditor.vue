<template>
  <el-dialog v-model="visible" :title="isNew ? '新建技能' : '编辑技能'" width="900px">
    <el-tabs v-model="activeTab" class="cyber-tabs">
      <!-- 基本信息 -->
      <el-tab-pane label="[基本信息]" name="info">
        <el-form :model="form" label-width="100px" class="mt-4">
          <el-form-item label="名称">
            <el-input v-model="form.name" placeholder="输入技能名称" />
          </el-form-item>
          <el-form-item label="描述">
            <el-input v-model="form.description" type="textarea" :rows="4" placeholder="输入技能描述" />
          </el-form-item>
          <el-form-item label="版本">
            <el-input v-model="form.version" placeholder="1.0.0" />
          </el-form-item>
          <el-form-item label="作者">
            <el-input v-model="form.author" placeholder="输入作者名称" />
          </el-form-item>
          <el-form-item label="标签">
            <el-select v-model="form.tags" multiple filterable allow-create placeholder="输入标签后按回车添加">
              <el-option v-for="tag in form.tags" :key="tag" :label="tag" :value="tag" />
            </el-select>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <!-- 文件管理 -->
      <el-tab-pane label="[文件内容]" name="files">
        <div class="mt-4">
          <!-- 新建文件按钮 -->
          <div class="flex justify-between items-center mb-4">
            <span class="text-[var(--text-muted)] font-mono text-sm">> 文件列表 ({{ files.length }} 个文件)</span>
            <el-button 
              size="small" 
              @click="addNewFile"
              class="bg-[var(--neon-cyan)]/20 border border-[var(--neon-cyan)]/50 hover:border-[var(--neon-cyan)] text-[var(--neon-cyan)]"
            >
              <el-icon><Plus /></el-icon>
              新建文件
            </el-button>
          </div>

          <!-- 文件列表 -->
          <div v-if="files.length === 0" class="text-center py-12 text-[var(--text-muted)]">
            <span class="text-4xl mb-4 block">📄</span>
            <p>暂无文件</p>
            <p class="text-sm mt-2">点击上方按钮添加文件</p>
          </div>

          <div v-else class="space-y-3">
            <div 
              v-for="(file, index) in files" 
              :key="index"
              class="bg-[var(--dark-bg)] border border-[var(--neon-cyan)]/20 rounded-xl overflow-hidden"
            >
              <!-- 文件头部 -->
              <div class="flex items-center justify-between px-4 py-3 border-b border-[var(--neon-cyan)]/10">
                <div class="flex items-center gap-3">
                  <span class="text-[var(--neon-yellow)]">📄</span>
                  <input 
                    v-model="file.name" 
                    class="bg-transparent border-none outline-none text-[var(--text-light)] font-mono text-sm"
                    placeholder="文件名"
                  />
                  <span class="text-xs text-[var(--text-muted)]">{{ getLanguage(file.name) }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <el-button 
                    size="small" 
                    circle
                    class="text-[var(--text-muted)] hover:text-[var(--neon-cyan)]"
                    @click="toggleFileEdit(index)"
                  >
                    <el-icon>
                      <Check v-if="editingIndex === index" />
                      <Edit v-else />
                    </el-icon>
                  </el-button>
                  <el-button 
                    size="small" 
                    circle
                    class="text-[var(--text-muted)] hover:text-red-400"
                    @click="deleteFile(index)"
                  >
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
              </div>

              <!-- 文件内容编辑 -->
              <div class="p-4">
                <textarea
                  v-model="file.content"
                  :disabled="editingIndex !== index"
                  class="w-full h-32 p-3 bg-[var(--dark-card)] border border-[var(--neon-cyan)]/20 rounded-lg text-[var(--text-light)] font-mono text-sm resize-none outline-none disabled:opacity-50"
                  placeholder="输入文件内容..."
                ></textarea>
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="save">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Skill, SkillFile } from '@/types'
import { Plus, Edit, Check, Delete } from '@element-plus/icons-vue'

const props = defineProps<{
  modelValue: boolean
  skill?: Skill
}>()
const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'save', skill: Skill): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
})
const isNew = computed(() => !props.skill)
const activeTab = ref('info')
const editingIndex = ref<number | null>(null)

const form = ref<Partial<Skill>>({
  name: '',
  description: '',
  version: '1.0.0',
  author: '',
  tags: [],
  source: { type: 'local' },
  files: [],
  createdAt: new Date(),
  updatedAt: new Date()
})

const files = ref<SkillFile[]>([])

watch(() => props.skill, (s) => {
  if (s) {
    form.value = { 
      name: s.name,
      description: s.description,
      version: s.version,
      author: s.author,
      tags: [...s.tags],
      source: s.source,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt
    }
    files.value = s.files ? [...s.files] : []
  } else {
    form.value = {
      name: '',
      description: '',
      version: '1.0.0',
      author: '',
      tags: [],
      source: { type: 'local' },
      createdAt: new Date(),
      updatedAt: new Date()
    }
    files.value = []
  }
}, { immediate: true })

function addNewFile() {
  files.value.push({
    id: crypto.randomUUID(),
    name: 'new_file.txt',
    path: 'new_file.txt',
    content: '',
    language: 'text'
  })
  editingIndex.value = files.value.length - 1
}

function toggleFileEdit(index: number) {
  if (editingIndex.value === index) {
    editingIndex.value = null
  } else {
    editingIndex.value = index
  }
}

function deleteFile(index: number) {
  files.value.splice(index, 1)
  if (editingIndex.value === index) {
    editingIndex.value = null
  }
}

function getLanguage(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || ''
  const map: Record<string, string> = {
    ts: 'TypeScript',
    tsx: 'TypeScript',
    js: 'JavaScript',
    jsx: 'JavaScript',
    py: 'Python',
    java: 'Java',
    cpp: 'C++',
    go: 'Go',
    rs: 'Rust',
    md: 'Markdown',
    json: 'JSON',
    yaml: 'YAML',
    yml: 'YAML',
    html: 'HTML',
    css: 'CSS',
    sh: 'Shell',
    sql: 'SQL'
  }
  return map[ext] || 'Text'
}

function save() {
  const updatedFiles = files.value.map(f => ({
    ...f,
    path: f.name
  }))

  emit('save', {
    ...form.value,
    id: props.skill?.id || crypto.randomUUID(),
    files: updatedFiles,
    source: props.skill?.source || { type: 'local' },
    createdAt: props.skill?.createdAt || new Date(),
    updatedAt: new Date()
  } as Skill)
  visible.value = false
}
</script>

<style scoped>
.cyber-tabs :deep(.el-tabs__header) {
  border-color: rgba(0, 245, 255, 0.2) !important;
  margin: 0 !important;
}

.cyber-tabs :deep(.el-tabs__item) {
  color: var(--text-muted) !important;
  font-family: 'Courier New', monospace !important;
  font-size: 14px !important;
}

.cyber-tabs :deep(.el-tabs__item.is-active) {
  color: var(--neon-cyan) !important;
}

.cyber-tabs :deep(.el-tabs__active-bar) {
  background-color: var(--neon-cyan) !important;
}
</style>