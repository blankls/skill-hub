<template>
  <el-button type="primary" :icon="Download" @click="handleExport" :loading="loading">
    导出 ZIP
  </el-button>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Download } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import JSZip from 'jszip'
import type { Skill } from '@/types'

interface Props {
  skill: Skill
}

const props = defineProps<Props>()
const loading = ref(false)

const handleExport = async () => {
  loading.value = true
  try {
    const zip = new JSZip()
    const metadata = {
      name: props.skill.name,
      version: props.skill.version,
      author: props.skill.author,
      tools: props.skill.tools
    }
    zip.file('skill.json', JSON.stringify(metadata, null, 2))
    if (props.skill.readme) {
      zip.file('README.md', props.skill.readme)
    }
    const blob = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${props.skill.name}-${props.skill.version}.zip`
    a.click()
    URL.revokeObjectURL(url)
    ElMessage.success('导出成功！')
  } catch (err) {
    ElMessage.error('导出失败')
  } finally {
    loading.value = false
  }
}
</script>
