<template>
  <section class="py-20">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between mb-12">
        <div>
          <h2 class="text-3xl font-bold mb-2">热门技能</h2>
          <p class="text-gray-600 dark:text-gray-400">最受欢迎的 AI Skills</p>
        </div>
        <router-link to="/skills">
          <el-button type="primary">查看全部</el-button>
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
    .sort((a, b) => b.downloadCount - a.downloadCount)
    .slice(0, 4)
})

onMounted(() => {
  skillStore.loadSkills()
})
</script>
