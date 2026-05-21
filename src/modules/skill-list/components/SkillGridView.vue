<template>
  <div class="skill-grid">
    <SkillCard 
      v-for="skill in skills" 
      :key="skill.id" 
      :skill="skill" 
      :showAdminActions="showAdminActions"
      @edit="$emit('edit', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import SkillCard from '@/components/ui/SkillCard.vue'
import type { Skill } from '@/types'

interface Props {
  skills: Skill[]
  showAdminActions?: boolean
}

withDefaults(defineProps<Props>(), {
  showAdminActions: false
})

defineEmits<{
  (e: 'edit', skill: Skill): void
}>()
</script>

<style scoped>
.skill-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

@media (max-width: 768px) {
  .skill-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}

@media (min-width: 1920px) {
  .skill-grid {
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: 2rem;
  }
}
</style>
