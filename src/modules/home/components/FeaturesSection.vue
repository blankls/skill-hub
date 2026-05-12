<template>
  <section class="w-full h-full py-16 flex items-center bg-[var(--dark-bg)]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-16">
        <h2 class="text-4xl font-bold mb-4 text-[var(--text-light)] font-mono">
          PLATFORM FEATURES
        </h2>
        <p class="text-[var(--text-muted)] max-w-2xl mx-auto text-lg">
          Powerful Features for Efficient AI Skill Management
        </p>
      </div>
      <div class="grid md:grid-cols-3 gap-8">
        <div v-for="feature in features" :key="feature.title" class="skill-card p-8">
          <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--neon-cyan)] to-[var(--neon-purple)] flex items-center justify-center text-white text-2xl mb-6 shadow-lg">
            <el-icon><component :is="feature.icon" /></el-icon>
          </div>
          <h3 class="text-xl font-semibold mb-3 text-[var(--text-light)] font-mono">{{ feature.title }}</h3>
          <p class="text-[var(--text-muted)]">{{ feature.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Search, Folder, Download, Link, MagicStick, Monitor } from '@element-plus/icons-vue'

const features = ref([
  {
    icon: Search,
    title: 'SMART SEARCH',
    description: 'Quickly find the skills you need with keyword and tag filtering'
  },
  {
    icon: Folder,
    title: 'DUAL SOURCES',
    description: 'Supports both local skills and popular GitHub skills'
  },
  {
    icon: Download,
    title: 'ONE-CLICK EXPORT',
    description: 'Export in ZIP format for easy sharing and migration'
  },
  {
    icon: Link,
    title: 'GITHUB INTEGRATION',
    description: 'Jump directly to original repositories and view full source code'
  },
  {
    icon: MagicStick,
    title: 'TOOL DETAILS',
    description: 'Detailed display of each tool\'s parameters, examples, and usage'
  },
  {
    icon: Monitor,
    title: 'THEME TOGGLE',
    description: 'Supports dark/light themes to protect your eyes'
  }
])
</script>
