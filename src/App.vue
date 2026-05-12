<template>
  <div id="app">
    <MainLayout>
      <router-view />
    </MainLayout>
  </div>
</template>

<script setup lang="ts">
import MainLayout from '@/components/layout/MainLayout.vue'
import { onMounted } from 'vue'
import { useThemeStore } from '@/stores/themeStore'
import { useSkillStore } from '@/stores/skillStore'

const themeStore = useThemeStore()
const skillStore = useSkillStore()

onMounted(() => {
  themeStore.initTheme()
  skillStore.loadSkills()
})
</script>

<style scoped>
#app {
  min-height: 100vh;
}
</style>
