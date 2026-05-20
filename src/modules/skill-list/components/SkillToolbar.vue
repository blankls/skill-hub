<template>
  <div class="toolbar-container">
    <div class="toolbar-top">
      <div class="flex flex-wrap gap-4 items-center justify-between">
        <h2 class="text-lg font-semibold text-[var(--text-light)]">技能列表</h2>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSkillStore } from '@/stores/skillStore'

const skillStore = useSkillStore()
</script>

<style scoped>
.toolbar-container {
  background: var(--dark-card);
  backdrop-filter: blur-xl;
  border-bottom: 1px solid rgba(0, 245, 255, 0.2);
  position: sticky;
  top: 0;
  z-index: 20;
}

.toolbar-top {
  padding: 1rem 1.5rem;
}

@media (max-width: 768px) {
  .toolbar-top {
    padding: 0.75rem 1rem !important;
  }
}
</style>
