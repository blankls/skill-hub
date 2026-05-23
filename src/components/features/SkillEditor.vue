<template>
  <el-dialog v-model="visible" :title="isNew ? '新建技能' : '编辑技能'" width="600px">
    <el-form :model="form" label-width="80px" class="mt-2">
      <el-form-item label="名称">
        <el-input v-model="form.name" placeholder="输入技能名称" />
      </el-form-item>
      <el-form-item label="描述">
        <el-input v-model="form.description" type="textarea" :rows="3" placeholder="输入技能描述" />
      </el-form-item>
      <div class="grid grid-cols-2 gap-4">
        <el-form-item label="版本">
          <el-input v-model="form.version" placeholder="1.0.0" />
        </el-form-item>
        <el-form-item label="作者">
          <el-input v-model="form.author" placeholder="输入作者名称" />
        </el-form-item>
      </div>
      <el-form-item label="标签">
        <el-select
          v-model="form.tags"
          multiple
          filterable
          allow-create
          default-first-option
          :max-collapse-tags="3"
          collapse-tags
          collapse-tags-tooltip
          placeholder="输入标签后按回车添加"
          @keydown.enter="handleTagEnter"
        >
          <el-option v-for="tag in suggestedTags" :key="tag" :label="tag" :value="tag" />
        </el-select>
      </el-form-item>
    </el-form>

    <div
      class="mt-2 border rounded-xl p-4 cursor-pointer transition-all hover:border-[var(--neon-cyan)]/50 hover:bg-[var(--neon-cyan)]/5"
      style="border-color: rgba(0,245,255,0.2); background: rgba(14,165,233,0.03)"
      @click="openFileBrowser"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <span class="text-xl">📂</span>
          <div>
            <div class="text-sm font-medium" style="color: var(--text-light)">管理文件</div>
            <div class="text-xs mt-0.5" style="color: var(--text-muted)">
              {{ files.length }} 个文件 · 点击打开文件浏览器
            </div>
          </div>
        </div>
        <div class="text-xs" style="color: var(--neon-cyan)">→</div>
      </div>
      <div
        v-if="files.length > 0"
        class="mt-3 pt-3 flex flex-wrap gap-1.5"
        style="border-color: rgba(0,245,255,0.1); border-top: 1px solid"
      >
        <span
          v-for="f in files.slice(0, 5)"
          :key="f.path"
          class="text-xs px-2 py-0.5 rounded-full font-mono"
          style="color: var(--neon-cyan); background: rgba(0,245,255,0.08); border: 1px solid rgba(0,245,255,0.15)"
        >
          {{ f.name }}
        </span>
        <span v-if="files.length > 5" class="text-xs px-2 py-0.5" style="color: var(--text-muted)">
          +{{ files.length - 5 }} 更多
        </span>
      </div>
    </div>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="save">保存</el-button>
    </template>
  </el-dialog>

  <FileBrowserOverlay
    v-model="showFileBrowser"
    :skill="tempSkill"
    :is-admin="true"
    @files-update="handleFilesUpdate"
    @update:model-value="onFileBrowserClose"
  />
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Skill, SkillFile } from '@/types'
import FileBrowserOverlay from '@/modules/skill-detail/components/FileBrowserOverlay.vue'
import { useSkillStore } from '@/stores/skillStore'

const skillStore = useSkillStore()

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
const showFileBrowser = ref(false)

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

const suggestedTags = computed(() => {
  const allTags = new Set<string>()
  skillStore.skills.forEach(s => s.tags?.forEach(t => allTags.add(t)))
  return [...allTags].filter(t => !form.value.tags?.includes(t)).sort()
})

function handleTagEnter(e: KeyboardEvent) {
  const input = (e.target as HTMLElement)?.querySelector?.('input') || e.target
  if (input instanceof HTMLInputElement && !input.value.trim()) {
    e.preventDefault()
    e.stopPropagation()
  }
}

const tempSkill = computed(() => ({
  id: props.skill?.id || 'temp',
  name: form.value.name || '未命名',
  description: form.value.description || '',
  version: form.value.version || '1.0.0',
  author: form.value.author || '',
  tags: form.value.tags || [],
  source: props.skill?.source || { type: 'local' as const },
  files: files.value,
  createdAt: props.skill?.createdAt || new Date(),
  updatedAt: new Date()
}))

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
    files.value = s.files ? s.files.map(f => ({ ...f })) : []
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

function handleFilesUpdate(newFiles: SkillFile[]) {
  files.value = newFiles
}

function openFileBrowser() {
  showFileBrowser.value = true
  visible.value = false
}

function onFileBrowserClose(val: boolean) {
  if (!val) {
    visible.value = true
  }
}

function save() {
  emit('save', {
    ...form.value,
    id: props.skill?.id || crypto.randomUUID(),
    files: files.value,
    source: props.skill?.source || { type: 'local' },
    createdAt: props.skill?.createdAt || new Date(),
    updatedAt: new Date()
  } as Skill)
  visible.value = false
}
</script>
