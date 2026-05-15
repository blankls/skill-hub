<template>
  <section class="py-20 bg-[var(--dark-bg)]">
    <div class="max-w-[95rem] mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between mb-12">
        <div>
          <h2 class="text-4xl font-bold mb-2 text-[var(--text-light)] font-mono">热门技能</h2>
          <p class="text-lg text-[var(--text-muted)]">最受欢迎的 AI Skills</p>
        </div>
        <router-link to="/skills">
          <el-button class="bg-gradient-to-r from-[var(--neon-cyan)] to-[var(--neon-purple)] border-none text-white font-bold font-mono">查看全部</el-button>
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
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 4)
})

onMounted(() => {
  skillStore.loadSkills()
})
</script>
