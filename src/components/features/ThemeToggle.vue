<template>
  <el-button
    :icon="themeStore.isDark ? Sunny : Moon"
    circle
    @click="themeStore.toggleTheme()"
  />
</template>

<script setup lang="ts">
import { useThemeStore } from '@/stores/themeStore'
import { Sunny, Moon } from '@element-plus/icons-vue'

const themeStore = useThemeStore()
</script>
