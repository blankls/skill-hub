<template>
  <div class="grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-6 h-full min-h-0">
    <div class="col-span-1 md:col-span-1 min-h-0 overflow-hidden">
      <FileTreePanel
        :files="displayFiles"
        :is-admin="isAdmin"
        @select="handleSelect"
        @files-update="handleFilesUpdate"
      />
    </div>
    <div class="col-span-1 md:col-span-4 min-h-0 overflow-hidden">
      <CodeViewer
        :file="selectedFile"
        :is-admin="isAdmin"
        @save="handleFileSave"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Skill, SkillFile } from '@/types'
import FileTreePanel from './FileTreePanel.vue'
import CodeViewer from './CodeViewer.vue'

interface Props {
  skill: Skill
  isAdmin: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'files-update': [files: SkillFile[]]
}>()

const selectedPath = ref<string | null>(null)
const adminFiles = ref<SkillFile[]>([...props.skill.files])

const displayFiles = computed(() => {
  return props.isAdmin ? adminFiles.value : props.skill.files
})

const selectedFile = computed(() => {
  if (!selectedPath.value) return null
  return displayFiles.value.find(f => f.path === selectedPath.value) || null
})

watch(
  () => props.skill.files,
  (newFiles) => {
    adminFiles.value = [...newFiles]
  },
  { deep: true }
)

function handleSelect(path: string) {
  selectedPath.value = path
}

function handleFilesUpdate(newFiles: SkillFile[]) {
  adminFiles.value = newFiles
  emit('files-update', newFiles)
}

function handleFileSave(updatedFile: SkillFile) {
  const idx = adminFiles.value.findIndex(f => f.path === updatedFile.path)
  if (idx !== -1) {
    adminFiles.value.splice(idx, 1, updatedFile)
  }
  emit('files-update', adminFiles.value)
}
</script>