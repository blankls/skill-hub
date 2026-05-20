<template>
  <div class="h-full flex flex-col" :class="{ 'overflow-hidden': !isHomePage }">
    <AppHeader />
    <main class="flex-1" :class="{ 'min-h-0': !isHomePage }">
      <slot />
    </main>
    <AppFooter v-if="showFooter" />
  </div>
</template>

<script setup lang="ts">
import AppHeader from './AppHeader.vue'
import AppFooter from './AppFooter.vue'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const isHomePage = computed(() => route.path === '/')

const showFooter = computed(() => {
  const path = route.path
  if (path.startsWith('/skills') || path.startsWith('/admin')) return false
  return true
})
</script>
