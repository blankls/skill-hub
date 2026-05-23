<template>
  <section ref="sectionRef" class="relative py-16 md:py-24 overflow-hidden" style="background: linear-gradient(135deg, var(--dark-bg) 0%, rgba(14,165,233,0.05) 50%, rgba(168,85,247,0.05) 100%);">
    <div class="absolute inset-0 opacity-5">
      <svg class="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="dots" width="30" height="30" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.5" fill="var(--neon-cyan)"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots)" />
      </svg>
    </div>
    <div class="relative z-10 max-w-[100rem] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12">
      <div :class="['transition-all duration-700 ease-out', isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8']">
        <div class="grid grid-cols-3 gap-4 md:gap-8 2xl:gap-12">
          <div v-for="(stat, i) in stats" :key="stat.label" class="text-center">
            <div class="text-3xl md:text-5xl 2xl:text-6xl font-black mb-2 md:mb-3" :style="{ background: `linear-gradient(135deg, ${stat.color})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }">
              <span ref="countRefs">{{ animatedValues[i] }}</span>
              <span v-if="stat.suffix" class="text-xl md:text-2xl 2xl:text-3xl">{{ stat.suffix }}</span>
            </div>
            <div class="text-xs md:text-sm 2xl:text-base text-[var(--text-muted)] font-medium tracking-wide">{{ stat.label }}</div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useSkillStore } from '@/stores/skillStore'

const skillStore = useSkillStore()
const sectionRef = ref<HTMLElement | null>(null)
const isRevealed = ref(false)
const animatedValues = ref([0, 0, 0])

const skillCount = computed(() => skillStore.skills.length)
const toolCount = computed(() => {
  let total = 0
  for (const skill of skillStore.skills) {
    total += (skill.tools || []).length
  }
  return total
})
const totalDownloads = computed(() => {
  let total = 0
  for (const skill of skillStore.skills) {
    total += (skill.likes || 0)
  }
  return total
})

const stats = computed(() => [
  { label: 'Skills 收录', value: skillCount.value, color: '#00f5ff, #06b6d4', suffix: '+' },
  { label: 'Tools 工具', value: toolCount.value, color: '#a855f7, #7c3aed', suffix: '+' },
  { label: '累计点赞', value: totalDownloads.value, color: '#f59e0b, #ea580c', suffix: '' }
])

function animateNumber(index: number, target: number) {
  const duration = 1500
  const startTime = performance.now()
  function step(currentTime: number) {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    const eased = 1 - Math.pow(1 - progress, 3)
    animatedValues.value[index] = Math.round(target * eased)
    if (progress < 1) {
      requestAnimationFrame(step)
    }
  }
  requestAnimationFrame(step)
}

let observer: IntersectionObserver | null = null

onMounted(async () => {
  if (skillStore.skills.length === 0) {
    await skillStore.loadSkills()
  }
  if (!sectionRef.value) return
  observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        isRevealed.value = true
        const targets = [skillCount.value, toolCount.value, totalDownloads.value]
        targets.forEach((target, i) => {
          setTimeout(() => animateNumber(i, target), i * 200)
        })
        observer?.unobserve(sectionRef.value!)
      }
    },
    { threshold: 0.3 }
  )
  observer.observe(sectionRef.value)
})

onUnmounted(() => {
  observer?.disconnect()
})
</script>