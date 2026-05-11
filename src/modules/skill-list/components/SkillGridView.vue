<template>
  <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
    <SkillCard v-for="skill in skills" :key="skill.id" :skill="skill" />
  </div>
</template>

<script setup lang="ts">
import SkillCard from '@/components/ui/SkillCard.vue'
import type { Skill } from '@/types'

interface Props {
  skills: Skill[]
}

defineProps<Props>()
</script>
