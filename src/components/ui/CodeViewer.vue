<template>
  <div class="code-viewer">
    <div class="flex items-center justify-between bg-gray-800 text-white px-4 py-2 rounded-t-lg">
      <span class="text-sm">{{ node.name }}</span>
      <el-button type="primary" size="small" link text @click="copyCode">
        <el-icon><DocumentCopy /></el-icon>
        复制
      </el-button>
    </div>
    <div class="code-block rounded-t-none">
      <pre><code :class="`language-${node.language || 'text'}`">{{ node.content || '' }}</code></pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css'
import { DocumentCopy } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { FileNode } from '@/types'

interface Props {
  node: FileNode
}

const props = defineProps<Props>()

onMounted(() => {
  hljs.highlightAll()
})

const copyCode = async () => {
  if (props.node.content) {
    await navigator.clipboard.writeText(props.node.content)
    ElMessage.success('已复制到剪贴板')
  }
}
</script>
