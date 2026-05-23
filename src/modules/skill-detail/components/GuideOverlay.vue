<template>
  <Teleport to="body">
    <Transition name="overlay">
      <div v-if="modelValue" class="fixed inset-0 z-50 flex flex-col overflow-hidden" style="background: var(--dark-bg)">
        <div class="flex items-center justify-between px-6 py-4 border-b flex-shrink-0" style="border-color: rgba(234,179,8,0.15); background: var(--dark-card)">
          <div class="flex items-center gap-3">
            <span class="text-lg">📘</span>
            <span class="font-semibold text-lg" style="color: var(--text-light)">{{ skill.name }} · 指导</span>
          </div>
          <button
            @click="$emit('update:modelValue', false)"
            class="w-9 h-9 flex items-center justify-center rounded-lg transition-all hover:bg-white/10"
            style="color: var(--text-muted)"
          >
            <el-icon :size="20"><Close /></el-icon>
          </button>
        </div>
        <div class="flex-1 min-h-0 overflow-y-auto custom-scroll px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 py-6 sm:py-8">
          <GuideTab :skill="skill" />
        </div>
        <DetailSidebar
          :nav-items="navItems"
          top-offset="0px"
          @back="$emit('update:modelValue', false)"
          @navigate="(id) => $emit('navigate', id)"
        >
          <template #right-actions>
            <slot name="right-actions"></slot>
          </template>
        </DetailSidebar>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { Close } from '@element-plus/icons-vue'
import GuideTab from '@/modules/skill-detail/components/GuideTab.vue'
import DetailSidebar from '@/components/features/DetailSidebar.vue'
import type { Skill } from '@/types'

defineProps<{
  modelValue: boolean
  skill: Skill
}>()

defineEmits<{
  'update:modelValue': [value: boolean]
  navigate: [id: string]
}>()

const navItems = [
  { id: 'overview', icon: '📄', label: '简介' },
  { id: 'guide', icon: '📘', label: '指导' },
  { id: 'files', icon: '📂', label: '文件' },
]
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
