<template>
  <div class="file-tree">
    <div v-for="node in nodes" :key="node.path" class="mb-1">
      <div class="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer" @click="handleNodeClick(node)">
        <el-icon v-if="node.type === 'folder'">
          <component :is="expandedNodes.has(node.path) ? FolderOpened : Folder" />
        </el-icon>
        <el-icon v-else><Document /></el-icon>
        <span>{{ node.name }}</span>
      </div>
      <div v-if="node.type === 'folder' && node.children && expandedNodes.has(node.path)" class="ml-4 border-l border-gray-200 dark:border-gray-700">
        <FileTree :nodes="node.children" @select="$emit('select', $event)" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Folder, FolderOpened, Document } from '@element-plus/icons-vue'
import type { FileNode } from '@/types'

interface Props {
  nodes: FileNode[]
}

defineProps<Props>()
const emit = defineEmits<{
  (e: 'select', node: FileNode): void
}>()

const expandedNodes = ref<Set<string>>(new Set())

const handleNodeClick = (node: FileNode) => {
  if (node.type === 'folder') {
    if (expandedNodes.value.has(node.path)) {
      expandedNodes.value.delete(node.path)
    } else {
      expandedNodes.value.add(node.path)
    }
  } else {
    emit('select', node)
  }
}
</script>
