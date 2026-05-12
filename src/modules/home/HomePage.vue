<template>
  <div class="w-full">
    <!-- Page 1: Hero -->
    <section class="min-h-screen w-full flex items-center relative">
      <HeroSection />
      <div class="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[var(--text-muted)] cursor-pointer animate-bounce" @click="scrollToSection('features')">
        <span class="font-mono text-sm">SCROLL</span>
        <el-icon class="text-2xl"><ArrowDown /></el-icon>
      </div>
    </section>

    <!-- Page 2: Features -->
    <section class="min-h-screen w-full flex items-center relative" id="features">
      <FeaturesSection />
      <div class="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[var(--text-muted)] cursor-pointer animate-bounce" @click="scrollToSection('skills')">
        <span class="font-mono text-sm">SCROLL</span>
        <el-icon class="text-2xl"><ArrowDown /></el-icon>
      </div>
    </section>

    <!-- Page 3: Popular Skills -->
    <section class="min-h-screen w-full flex items-center relative" id="skills">
      <PopularSkills />
      <div class="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[var(--text-muted)] cursor-pointer animate-bounce" @click="scrollToTop">
        <span class="font-mono text-sm">BACK TO TOP</span>
        <el-icon class="text-2xl"><ArrowUp /></el-icon>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import HeroSection from './components/HeroSection.vue'
import FeaturesSection from './components/FeaturesSection.vue'
import PopularSkills from './components/PopularSkills.vue'
import { ArrowDown, ArrowUp } from '@element-plus/icons-vue'

const scrollToSection = (sectionId: string) => {
  const el = document.getElementById(sectionId)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' })
  }
}

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}
</script>
