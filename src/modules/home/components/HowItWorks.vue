<template>
  <section ref="sectionRef" class="py-16 md:py-24 bg-[var(--dark-bg)]">
    <div class="max-w-[100rem] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12">
      <div :class="['text-center mb-10 md:mb-16 transition-all duration-700 ease-out', isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8']">
        <h2 class="text-2xl md:text-4xl 2xl:text-5xl font-bold mb-3 md:mb-4 text-[var(--text-light)]">使用流程</h2>
        <p class="text-sm md:text-lg 2xl:text-xl text-[var(--text-muted)] max-w-2xl mx-auto">
          三步轻松上手，开启 AI Skill 之旅
        </p>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 2xl:gap-10 relative">
        <div v-for="(step, index) in steps" :key="step.title" :class="['step-card relative p-6 md:p-8 2xl:p-10 rounded-2xl text-center transition-all duration-700 ease-out',
          revealedItems.has(index) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8']"
          :style="{ '--delay': `${index * 150}ms`, transitionDelay: `${index * 150}ms` }">
          <div class="step-number w-14 h-14 md:w-16 md:h-16 2xl:w-18 2xl:h-18 rounded-full flex items-center justify-center text-white text-xl md:text-2xl 2xl:text-3xl font-black mx-auto mb-5 md:mb-6"
               :style="{ background: `linear-gradient(135deg, ${step.color})` }">
            {{ index + 1 }}
          </div>
          <h3 class="text-lg md:text-xl 2xl:text-2xl font-semibold mb-3 text-[var(--text-light)]">{{ step.title }}</h3>
          <p class="text-sm md:text-base 2xl:text-lg text-[var(--text-muted)] leading-relaxed">{{ step.description }}</p>
        </div>
        <div class="hidden md:block absolute top-1/2 left-0 right-0 h-px opacity-20 pointer-events-none" style="top: 8rem; background: linear-gradient(90deg, transparent, var(--neon-cyan), var(--neon-purple), transparent);" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const sectionRef = ref<HTMLElement | null>(null)
const isRevealed = ref(false)
const revealedItems = ref<Set<number>>(new Set())

const steps = [
  {
    title: '发现 Skill',
    description: '浏览平台收录的数百个高质量 AI Skills，按分类和标签快速筛选，找到你需要的工具。',
    color: '#00f5ff, #06b6d4'
  },
  {
    title: '一键导入',
    description: '从 GitHub 或本地 ZIP 一键导入 Skill，自动解析配置文件和工具列表，无需手动配置。',
    color: '#8b5cf6, #7c3aed'
  },
  {
    title: '立即使用',
    description: '在 AI 编程助手中加载 Skill，立即享受智能提示、代码生成、文件管理等功能。',
    color: '#f59e0b, #ea580c'
  }
]

let sectionObserver: IntersectionObserver | null = null
let itemsObserver: IntersectionObserver | null = null

onMounted(() => {
  if (!sectionRef.value) return
  sectionObserver = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        isRevealed.value = true
        sectionObserver?.unobserve(sectionRef.value!)
      }
    },
    { threshold: 0.1 }
  )
  sectionObserver.observe(sectionRef.value)

  const cards = sectionRef.value.querySelectorAll('.step-card')
  itemsObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const idx = Array.from(cards).indexOf(entry.target as Element)
          if (idx >= 0) {
            revealedItems.value = new Set([...revealedItems.value, idx])
          }
          itemsObserver?.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.2 }
  )
  cards.forEach((card) => itemsObserver?.observe(card))
})

onUnmounted(() => {
  sectionObserver?.disconnect()
  itemsObserver?.disconnect()
})
</script>

<style scoped>
.step-card {
  background: var(--dark-card);
  border: 1px solid rgba(168, 85, 247, 0.1);
}

.step-card:hover {
  border-color: rgba(168, 85, 247, 0.3);
  box-shadow: 0 8px 32px rgba(14, 165, 233, 0.08);
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.step-number {
  box-shadow: 0 4px 20px rgba(168, 85, 247, 0.3);
}
</style>