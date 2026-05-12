<template>
  <div class="snap-y snap-mandatory overflow-y-scroll h-screen scroll-smooth">
    <!-- Page 1: Hero -->
    <section class="snap-start h-screen w-full relative">
      <HeroSection />
      <div class="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[var(--text-muted)] cursor-pointer animate-bounce" @click="scrollToPage(1)">
        <span class="font-mono text-sm">SCROLL</span>
        <el-icon class="text-2xl"><ArrowDown /></el-icon>
      </div>
    </section>

    <!-- Page 2: Features -->
    <section class="snap-start h-screen w-full flex items-center" id="features">
      <FeaturesSection />
      <div class="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[var(--text-muted)] cursor-pointer animate-bounce" @click="scrollToPage(2)">
        <span class="font-mono text-sm">SCROLL</span>
        <el-icon class="text-2xl"><ArrowDown /></el-icon>
      </div>
    </section>

    <!-- Page 3: Popular Skills -->
    <section class="snap-start h-screen w-full flex items-center" id="skills">
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

const scrollToPage = (pageIndex: number) => {
  const sectionHeight = window.innerHeight
  window.scrollTo({
    top: sectionHeight * (pageIndex + 1),
    behavior: 'smooth'
  })
}

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}
</script>
