<template>
  <!-- 左侧边缘指示条 -->
  <div
    class="fixed left-0 bottom-0 z-20 hidden lg:flex flex-col justify-center pointer-events-none transition-opacity duration-500"
    :class="leftVisible ? 'opacity-0' : 'opacity-100'"
    :style="{ top: topOffset, width: '3px', background: 'linear-gradient(to bottom, transparent 5%, var(--neon-cyan) 30%, var(--neon-cyan) 70%, transparent 95%)', boxShadow: '0 0 8px rgba(14,165,233,0.4), 0 0 20px rgba(14,165,233,0.15)' }"
  >
    <span class="indicator-text indicator-text-left">导航</span>
  </div>

  <!-- 左侧浮动导航 -->
  <div
    class="fixed left-0 bottom-0 z-30 hidden lg:flex flex-col items-center py-8 px-2 gap-4 transition-all duration-500 ease-in-out"
    :class="leftVisible ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'"
    :style="{ top: topOffset, width: '80px', background: 'var(--dark-card)', borderRight: '1px solid rgba(14,165,233,0.1)' }"
    @mouseenter="onSidebarEnter"
    @mouseleave="onSidebarLeave"
  >
    <button
      @click="$emit('back')"
      class="sidebar-btn w-12 h-12 xl:w-14 xl:h-14 rounded-xl flex items-center justify-center transition-all duration-200 hover:bg-[var(--neon-cyan)]/10 hover:scale-115 group relative"
      style="color: var(--text-muted); border: 1px solid rgba(14,165,233,0.15)"
    >
      <el-icon :size="18" class="xl:text-xl"><ArrowLeft /></el-icon>
      <span
        class="absolute left-full ml-2 px-2 py-1 rounded-md text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
        style="background: var(--dark-card); color: var(--text-light); border: 1px solid rgba(14,165,233,0.2)"
      >返回</span>
    </button>

    <div class="w-8 h-px my-1" style="background: rgba(14,165,233,0.15)"></div>

    <button
      v-for="nav in navItems"
      :key="nav.id"
      @click="$emit('navigate', nav.id)"
      class="sidebar-btn w-12 h-12 xl:w-14 xl:h-14 rounded-xl flex items-center justify-center transition-all duration-200 hover:bg-[var(--neon-cyan)]/10 hover:scale-115 group relative"
    >
      <span class="text-xl xl:text-2xl">{{ nav.icon }}</span>
      <span
        class="absolute left-full ml-2 px-2 py-1 rounded-md text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
        style="background: var(--dark-card); color: var(--text-light); border: 1px solid rgba(14,165,233,0.2)"
      >{{ nav.label }}</span>
    </button>

    <slot name="left-extra"></slot>
  </div>

  <!-- 右侧边缘指示条 -->
  <div
    class="fixed right-0 bottom-0 z-20 hidden lg:flex flex-col justify-center pointer-events-none transition-opacity duration-500"
    :class="rightVisible ? 'opacity-0' : 'opacity-100'"
    :style="{ top: topOffset, width: '3px', background: 'linear-gradient(to bottom, transparent 5%, var(--neon-cyan) 30%, var(--neon-cyan) 70%, transparent 95%)', boxShadow: '0 0 8px rgba(14,165,233,0.4), 0 0 20px rgba(14,165,233,0.15)' }"
  >
    <span class="indicator-text indicator-text-right">操作</span>
  </div>

  <!-- 右侧浮动操作栏 -->
  <div
    v-if="$slots['right-actions']"
    class="fixed right-0 bottom-0 z-30 hidden lg:flex flex-col items-center py-8 px-2 gap-3 xl:gap-4 transition-all duration-500 ease-in-out"
    :class="rightVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'"
    :style="{ top: topOffset, width: '80px', background: 'var(--dark-card)', borderLeft: '1px solid rgba(14,165,233,0.1)' }"
    @mouseenter="onSidebarEnter"
    @mouseleave="onSidebarLeave"
  >
    <div class="flex flex-col items-center gap-3 xl:gap-4">
      <slot name="right-actions"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft } from '@element-plus/icons-vue'
import { useHoverSidebar } from '@/composables/useHoverSidebar'

interface NavItem {
  id: string
  icon: string
  label: string
}

withDefaults(defineProps<{
  navItems: NavItem[]
  topOffset?: string
}>(), {
  topOffset: '4rem'
})

defineEmits<{
  back: []
  navigate: [id: string]
}>()

const { leftVisible, rightVisible, onSidebarEnter, onSidebarLeave } = useHoverSidebar()
</script>

<style scoped>
.indicator-text {
    writing-mode: vertical-rl;
    font-size: 10px;
    letter-spacing: 4px;
    color: var(--neon-cyan);
    opacity: 0.5;
    font-family: var(--font-mono);
    text-shadow: 0 0 6px rgba(14, 165, 233, 0.3);
    position: absolute;
}

.indicator-text-left {
    left: 6px;
}

.indicator-text-right {
    right: 6px;
}

.sidebar-btn {
  transform-origin: center;
}

.sidebar-btn:hover {
  box-shadow: 0 0 12px rgba(14, 165, 233, 0.2), 0 0 4px rgba(14, 165, 233, 0.1);
}

.sidebar-btn:active {
  transform: scale(0.95);
  box-shadow: none;
}
</style>
