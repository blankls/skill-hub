<template>
  <div class="min-h-screen flex flex-col h-screen overflow-hidden">
    <AppHeader />
    <main class="flex-1 overflow-y-auto">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import AppHeader from './AppHeader.vue'
import AppFooter from './AppFooter.vue'
</script>
