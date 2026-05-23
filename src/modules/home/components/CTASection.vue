<template>
  <section ref="sectionRef" class="relative py-20 md:py-32 overflow-hidden">
    <div class="absolute inset-0" style="background: linear-gradient(135deg, rgba(14,165,233,0.1) 0%, rgba(168,85,247,0.1) 50%, rgba(14,165,233,0.05) 100%);" />
    <div class="absolute inset-0" style="background: var(--dark-bg);" />
    <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full blur-[120px] opacity-10 pointer-events-none" style="background: var(--neon-cyan);" />
    <div class="relative z-10 max-w-[100rem] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 text-center">
      <div :class="['transition-all duration-700 ease-out', isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8']">
        <h2 class="text-2xl md:text-4xl 2xl:text-5xl font-bold mb-4 md:mb-6 text-[var(--text-light)]">
          准备好创建你的第一个 <span :style="{ background: 'linear-gradient(135deg, var(--neon-cyan), var(--neon-purple))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }">Skill</span> 了吗？
        </h2>
        <p class="text-sm md:text-lg 2xl:text-xl text-[var(--text-muted)] max-w-xl mx-auto mb-8 md:mb-10">
          加入数千名开发者，分享你的 AI 技能，让更多人受益于你的创造力。
        </p>
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button class="px-8 py-3.5 md:px-10 md:py-4 rounded-full text-white font-bold text-base md:text-lg 2xl:text-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
               :style="{ background: 'linear-gradient(135deg, var(--neon-cyan), var(--neon-purple))' }"
               @click="showModal = true">
            立即创建你的第一个 Skill
          </button>
          <a href="#features" class="px-8 py-3.5 md:px-10 md:py-4 rounded-full font-bold text-base md:text-lg 2xl:text-xl border transition-all duration-300 hover:-translate-y-0.5"
               :style="{ borderColor: 'var(--neon-purple)', color: 'var(--neon-purple)', background: 'transparent' }">
            了解平台特性
          </a>
        </div>
      </div>
    </div>
    <SkillCreationModal v-model:visible="showModal" />
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import SkillCreationModal from '@/components/features/SkillCreationModal.vue'

const sectionRef = ref<HTMLElement | null>(null)
const isRevealed = ref(false)
const showModal = ref(false)

let observer: IntersectionObserver | null = null

onMounted(() => {
  if (!sectionRef.value) return
  observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        isRevealed.value = true
        observer?.unobserve(sectionRef.value!)
      }
    },
    { threshold: 0.2 }
  )
  observer.observe(sectionRef.value)
})

onUnmounted(() => {
  observer?.disconnect()
})
</script>