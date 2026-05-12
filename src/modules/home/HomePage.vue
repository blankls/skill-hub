<template>
  <div class="snap-y snap-mandatory h-screen overflow-y-auto">
    <HeroSection />
    <FeaturesSection />
    <PopularSkills />
  </div>
</template>

<script setup lang="ts">
import HeroSection from './components/HeroSection.vue'
import FeaturesSection from './components/FeaturesSection.vue'
import PopularSkills from './components/PopularSkills.vue'
</script>

<style>
/* Custom scrollbar for homepage */
.snap-y::-webkit-scrollbar {
  width: 10px;
}

.snap-y::-webkit-scrollbar-track {
  background: var(--dark-bg);
}

.snap-y::-webkit-scrollbar-thumb {
  background: var(--neon-cyan);
  border-radius: 5px;
}

.snap-y::-webkit-scrollbar-thumb:hover {
  background: var(--neon-purple);
}
</style>
