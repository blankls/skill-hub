<template>
  <button
    @click="handleExport"
    :disabled="loading"
    class="action-btn rounded-xl flex items-center justify-center transition-all hover:bg-white/5 group relative border border-[rgba(0,245,255,0.15)] w-9 h-9 lg:w-10 lg:h-10"
    :class="$attrs.class"
    title="导出 ZIP"
  >
    <span class="text-lg">{{ loading ? '⏳' : '📥' }}</span>
    <span
      class="absolute right-full mr-2 px-2 py-1 rounded-md text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
      style="background: var(--dark-card); color: var(--text-light); border: 1px solid rgba(0,245,255,0.2)"
    >导出</span>
  </button>
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
