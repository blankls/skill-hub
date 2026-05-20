<template>
  <Teleport to="body">
    <Transition name="overlay">
      <div v-if="modelValue" class="fixed inset-0 z-50 flex flex-col" style="background: var(--dark-bg)">
        <div class="flex items-center justify-between px-6 py-4 border-b" style="border-color: rgba(0,245,255,0.15); background: var(--dark-card)">
          <div class="flex items-center gap-3">
            <span class="text-lg">📂</span>
            <span class="font-semibold text-lg" style="color: var(--text-light)">{{ skill.name }} · 文件浏览</span>
            <span class="text-xs font-mono px-2 py-0.5 rounded-full" style="color: var(--neon-cyan); background: rgba(0,245,255,0.1); border: 1px solid rgba(0,245,255,0.2)">{{ skill.files.length }} 文件</span>
          </div>
          <button
            @click="$emit('update:modelValue', false)"
            class="w-9 h-9 flex items-center justify-center rounded-lg transition-all hover:bg-white/10"
            style="color: var(--text-muted)"
          >
            <el-icon :size="20"><Close /></el-icon>
          </button>
        </div>
        <div class="flex-1 min-h-0">
          <FilesTab :skill="skill" />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { Close } from '@element-plus/icons-vue'
import FilesTab from '@/modules/skill-detail/components/FilesTab.vue'
import type { Skill } from '@/types'

interface Props {
  modelValue: boolean
  skill: Skill
}

defineProps<Props>()
defineEmits<{
  'update:modelValue': [value: boolean]
}>()

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    // handled by parent via v-model
  }
}

onMounted(() => document.addEventListener('keydown', onKeydown))
onUnmounted(() => document.removeEventListener('keydown', onKeydown))
</script>

<style scoped>
.overlay-enter-active,
.overlay-leave-active {
  transition: all 0.3s ease;
}
.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
