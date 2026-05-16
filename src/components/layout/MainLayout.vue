<template>
  <div class="min-h-screen flex flex-col">
    <AppHeader />
    <main class="flex-1">
      <slot />
    </main>
    <AppFooter v-if="!isDetailPage" />
  </div>
</template>

<script setup lang="ts">
import AppHeader from './AppHeader.vue'
import AppFooter from './AppFooter.vue'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const isDetailPage = computed(() => {
  return route.path.includes('/skills/') && route.path.split('/').length >= 3
})
</script>
