<template>
  <el-button type="primary" :icon="Download" @click="handleExport" :loading="loading">
    导出 ZIP
  </el-button>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Download } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { exportSkillToZip, downloadBlob } from '@/utils/zipHandler'
import type { Skill } from '@/types'

interface Props {
  skill: Skill
}

const props = defineProps<Props>()
const loading = ref(false)

const handleExport = async () => {
  loading.value = true
  try {
    const blob = await exportSkillToZip(props.skill)
    downloadBlob(blob, `${props.skill.name}-${props.skill.version}.zip`)
    ElMessage.success('导出成功！')
  } catch (err) {
    ElMessage.error('导出失败')
  } finally {
    loading.value = false
  }
}
</script>
