<template>
  <div class="grid grid-cols-4 gap-6">
    <div class="col-span-1">
      <div class="bg-white dark:bg-dark-card rounded-xl p-4 border border-gray-200 dark:border-dark-border">
        <h3 class="font-semibold mb-4">文件结构</h3>
        <FileTree v-if="skill.files" :nodes="skill.files" @select="handleFileSelect" />
        <div v-else class="text-center py-10 text-gray-500">
          暂无文件信息
        </div>
      </div>
    </div>
    <div class="col-span-3">
      <div v-if="selectedFile" class="bg-white dark:bg-dark-card rounded-xl overflow-hidden border border-gray-200 dark:border-dark-border">
        <CodeViewer :node="selectedFile" />
      </div>
      <div v-else class="bg-white dark:bg-dark-card rounded-xl p-8 border border-gray-200 dark:border-dark-border text-center text-gray-500">
        <p>请从左侧选择一个文件查看</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import FileTree from '@/components/ui/FileTree.vue'
import CodeViewer from '@/components/ui/CodeViewer.vue'
import type { Skill, FileNode } from '@/types'

interface Props {
  skill: Skill
}

const props = defineProps<Props>()
const selectedFile = ref<FileNode | null>(null)

const handleFileSelect = (file: FileNode) => {
  selectedFile.value = file
}
</script>
