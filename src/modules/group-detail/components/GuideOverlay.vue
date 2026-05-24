<template>
  <Teleport to="body">
    <Transition name="overlay">
      <div v-if="modelValue" class="fixed inset-0 z-50 flex flex-col overflow-hidden" style="background: var(--dark-bg)">
        <div class="flex items-center justify-between px-6 py-4 border-b flex-shrink-0" style="border-color: rgba(234,179,8,0.15); background: var(--dark-card)">
          <div class="flex items-center gap-3">
            <span class="text-lg">📘</span>
            <span class="font-semibold text-lg" style="color: var(--text-light)">{{ groupName }} · 指导</span>
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
          <div v-if="readme" class="rounded-xl overflow-hidden border border-[var(--neon-yellow)]/20" style="background: var(--dark-card)">
            <div class="px-4 py-3 border-b flex items-center gap-2" style="border-color: rgba(234,179,8,0.15); background: rgba(234,179,8,0.03)">
              <span class="text-base">📘</span>
              <span class="font-semibold" style="color: var(--text-light)">{{ groupName }}</span>
              <span class="ml-auto text-xs rounded-full px-2 py-0.5 border" style="color: var(--neon-yellow); border-color: rgba(234,179,8,0.3); background: rgba(234,179,8,0.05)">指导文档</span>
            </div>
            <div class="p-6">
              <div class="markdown-body" v-html="renderMd(readme)"></div>
            </div>
          </div>
          <div v-else class="rounded-xl p-10 border border-[var(--neon-cyan)]/15 text-center" style="background: var(--dark-card)">
            <div class="text-4xl mb-4">📘</div>
            <h2 class="text-xl font-semibold mb-2" style="color: var(--text-muted)">暂无指导文档</h2>
            <p style="color: var(--text-muted)">该分组还没有指导文档</p>
          </div>
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
import DetailSidebar from '@/components/features/DetailSidebar.vue'
import { createMarkdownRenderer } from '@/utils/markdown'

const md = createMarkdownRenderer()

function renderMd(text: string): string {
  return md.render(text)
}

defineProps<{
  modelValue: boolean
  groupName: string
  readme?: string
}>()

defineEmits<{
  'update:modelValue': [value: boolean]
  navigate: [id: string]
}>()

const navItems = [
  { id: 'guide', icon: '📘', label: '指导' },
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

<style>
@import '@/assets/markdown-body.css';
</style>