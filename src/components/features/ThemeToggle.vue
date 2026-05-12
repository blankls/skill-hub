<template>
  <button
    class="relative w-16 h-8 rounded-full cursor-pointer transition-all duration-300 overflow-hidden"
    :class="themeStore.isDark ? 'bg-gray-800 shadow-inner' : 'bg-gray-200 shadow-lg'"
    @click="themeStore.toggleTheme()"
  >
    <!-- Background icons -->
    <div class="absolute inset-0 flex items-center justify-between px-1">
      <span class="text-sm" :class="themeStore.isDark ? 'opacity-0' : 'opacity-100'">☀️</span>
      <span class="text-sm" :class="themeStore.isDark ? 'opacity-100' : 'opacity-0'">🌙</span>
    </div>
    <!-- Knob -->
    <div
      class="absolute top-1 left-1 w-6 h-6 rounded-full transition-all duration-300 flex items-center justify-center"
      :style="{
        transform: themeStore.isDark ? 'translateX(8px)' : 'translateX(0)',
        backgroundColor: themeStore.isDark ? '#374151' : '#fff',
        boxShadow: themeStore.isDark
          ? '0 0 0 1px rgba(255,255,255,0.1), 0 2px 8px rgba(0,0,0,0.3)'
          : '0 0 0 1px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.15)'
      }"
    >
      <span class="text-xs">
        {{ themeStore.isDark ? '🌙' : '☀️' }}
      </span>
    </div>
  </button>
</template>

<script setup lang="ts">
import { useThemeStore } from '@/stores/themeStore'

const themeStore = useThemeStore()
</script>
