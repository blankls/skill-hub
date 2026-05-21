<template>
  <section class="py-12 md:py-20 bg-[var(--dark-bg)]">
    <div class="max-w-[100rem] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12">
      <div class="flex items-center justify-between mb-6 md:mb-12">
        <div>
          <h2 class="text-2xl md:text-4xl 2xl:text-5xl font-bold mb-2 text-[var(--text-light)]">热门技能</h2>
          <p class="text-sm md:text-lg 2xl:text-xl text-[var(--text-muted)]">最受欢迎的 AI Skills</p>
        </div>
        <router-link to="/skills">
          <el-button class="bg-gradient-to-r from-[var(--neon-cyan)] to-[var(--neon-purple)] border-none text-white font-bold">查看全部</el-button>
        </router-link>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-4 gap-3 md:gap-6 2xl:gap-8">
        <SkillCardCompact v-for="skill in popularSkills" :key="skill.id" :skill="skill" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import SkillCardCompact from '@/components/ui/SkillCardCompact.vue'
import { useSkillStore } from '@/stores/skillStore'

const skillStore = useSkillStore()

const popularSkills = computed(() => {
  return [...skillStore.skills]
    .sort((a, b) => {
      const likesDiff = (b.likes || 0) - (a.likes || 0)
      if (likesDiff !== 0) return likesDiff
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    })
    .slice(0, 4)
})

onMounted(() => {
  skillStore.loadSkills()
})
</script>
