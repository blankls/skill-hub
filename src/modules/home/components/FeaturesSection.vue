<template>
  <section id="features" class="snap-start h-screen flex items-center bg-[var(--dark-card)]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
      <div class="text-center mb-16">
        <h2 class="text-4xl font-bold mb-4 text-[var(--text-light)] font-mono">PLATFORM FEATURES</h2>
        <p class="text-[var(--text-muted)] max-w-2xl mx-auto">
          Powerful Features to Manage Your AI Skills Efficiently
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
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Search, Folder, Download, Link, MagicStick, Monitor } from '@element-plus/icons-vue'

const features = ref([
  {
    icon: Search,
    title: 'Smart Search',
    description: 'Quickly find the skills you need with keyword and tag filtering'
  },
  {
    icon: Folder,
    title: 'Dual Sources',
    description: 'Support both local skills and popular GitHub skills'
  },
  {
    icon: Download,
    title: 'One-Click Export',
    description: 'Export in ZIP format for easy sharing and migration'
  },
  {
    icon: Link,
    title: 'GitHub Integration',
    description: 'Direct links to original repositories for full source code'
  },
  {
    icon: MagicStick,
    title: 'Tool Details',
    description: 'Detailed display of each tool\'s parameters, examples, and usage'
  },
  {
    icon: Monitor,
    title: 'Theme Toggle',
    description: 'Dark and light theme support to protect your eyes'
  }
])
</script>
