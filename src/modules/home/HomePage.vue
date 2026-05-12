<template>
  <div class="h-screen overflow-hidden">
    <el-carousel
      height="100vh"
      direction="vertical"
      :autoplay="false"
      :arrow="true"
      :show-indicators="true"
      indicator-position="right"
      arrow="always"
    >
      <!-- Page 1: Hero Section -->
      <el-carousel-item>
        <div class="h-full w-full">
          <HeroSection />
        </div>
      </el-carousel-item>

      <!-- Page 2: Features Section -->
      <el-carousel-item>
        <div class="h-full w-full flex items-center justify-center">
          <section class="py-20 w-full bg-[var(--dark-card)]/30">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div class="text-center mb-16">
                <h2 class="text-3xl font-bold mb-4 text-[var(--text-light)] font-mono">> PLATFORM FEATURES</h2>
                <p class="text-[var(--text-muted)] max-w-2xl mx-auto">
                  Powerful features to manage your AI Skills efficiently
                </p>
              </div>
              <div class="grid md:grid-cols-3 gap-8">
                <div v-for="feature in features" :key="feature.title" class="skill-card p-8 rounded-2xl">
                  <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--neon-cyan)] to-[var(--neon-purple)] flex items-center justify-center text-white text-2xl mb-6 shadow-lg">
                    <el-icon><component :is="feature.icon" /></el-icon>
                  </div>
                  <h3 class="text-xl font-semibold mb-3 text-[var(--text-light)] font-mono">{{ feature.title }}</h3>
                  <p class="text-[var(--text-muted)]">{{ feature.description }}</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </el-carousel-item>

      <!-- Page 3: Popular Skills -->
      <el-carousel-item>
        <div class="h-full w-full flex items-center justify-center">
          <section class="py-20 w-full">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div class="flex items-center justify-between mb-12">
                <div>
                  <h2 class="text-3xl font-bold mb-2 text-[var(--text-light)] font-mono">> POPULAR SKILLS</h2>
                  <p class="text-[var(--text-muted)]">Most popular AI Skills</p>
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
        </div>
      </el-carousel-item>
    </el-carousel>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import HeroSection from './components/HeroSection.vue'
import SkillCard from '@/components/ui/SkillCard.vue'
import { useSkillStore } from '@/stores/skillStore'
import { Search, Folder, Download, Link, MagicStick, Monitor } from '@element-plus/icons-vue'

const skillStore = useSkillStore()

const features = ref([
  {
    icon: Search,
    title: 'Smart Search',
    description: 'Quickly find the Skills you need with keyword and tag filtering'
  },
  {
    icon: Folder,
    title: 'Dual Sources',
    description: 'Support both local Skills and popular Skills from GitHub'
  },
  {
    icon: Download,
    title: 'One-Click Export',
    description: 'Export in ZIP format for easy sharing and migration'
  },
  {
    icon: Link,
    title: 'GitHub Integration',
    description: 'Directly jump to original repository to view complete source code'
  },
  {
    icon: MagicStick,
    title: 'Tool Details',
    description: 'Detailed display of each tool\'s parameters, examples and usage'
  },
  {
    icon: Monitor,
    title: 'Theme Switch',
    description: 'Support dark/light themes to protect your eyes'
  }
])

const popularSkills = computed(() => {
  return [...skillStore.skills]
    .sort((a, b) => b.downloadCount - a.downloadCount)
    .slice(0, 4)
})

onMounted(() => {
  skillStore.loadSkills()
})
</script>

<style scoped>
:deep(.el-carousel__indicator--horizontal) {
  background: rgba(255, 255, 255, 0.3) !important;
}

:deep(.el-carousel__indicator--horizontal.is-active) {
  background: var(--neon-cyan) !important;
  box-shadow: 0 0 10px var(--neon-cyan);
}

:deep(.el-carousel__arrow) {
  background-color: rgba(0, 245, 255, 0.2) !important;
  border: 1px solid rgba(0, 245, 255, 0.5) !important;
  color: var(--text-light) !important;
}

:deep(.el-carousel__arrow:hover) {
  background-color: rgba(0, 245, 255, 0.4) !important;
}
</style>
