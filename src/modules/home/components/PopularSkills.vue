<template>
  <section class="w-full h-full py-16 flex items-center bg-[var(--dark-bg)]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between mb-12">
        <div>
          <h2 class="text-4xl font-bold mb-2 text-[var(--text-light)] font-mono">
            POPULAR SKILLS
          </h2>
          <p class="text-[var(--text-muted)]">
            Most Popular AI Skills
          </p>
        </div>
        <router-link to="/skills">
          <el-button type="primary" class="bg-gradient-to-r from-[var(--neon-cyan)] to-[var(--neon-purple)] border-none text-white font-bold font-mono">
            VIEW ALL
          </el-button>
        </router-link>
      </div>
      <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SkillCard v-for="skill in popularSkills" :key="skill.id" :skill="skill" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import SkillCard from '@/components/ui/SkillCard.vue'
import { useSkillStore } from '@/stores/skillStore'

const skillStore = useSkillStore()

const popularSkills = computed(() => {
  return [...skillStore.skills]
    .slice(0, 4)
})

onMounted(() => {
  if (skillStore.skills.length === 0) {
    skillStore.loadSkills()
  }
})
</script>
