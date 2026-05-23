<template>
  <section id="features" class="py-12 md:py-20 bg-[var(--dark-bg)]">
    <div class="max-w-[100rem] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12">
      <div class="text-center mb-8 md:mb-16">
        <h2 class="text-2xl md:text-4xl 2xl:text-5xl font-bold mb-3 md:mb-4 text-[var(--text-light)]">平台特性</h2>
        <p class="text-sm md:text-lg 2xl:text-xl text-[var(--text-muted)] max-w-2xl mx-auto">
          强大的功能，助你高效发现与分享 AI Skills
        </p>
      </div>
      <div ref="gridRef" class="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 2xl:gap-8">
        <div
          v-for="(feature, index) in features"
          :key="feature.title"
          class="feature-card relative p-3 md:p-6 2xl:p-8 rounded-xl md:rounded-2xl overflow-hidden"
          :class="{ 'is-visible': visibleCards.has(index) }"
          :style="{ '--delay': `${index * 100}ms` }"
        >
          <div class="feature-border"></div>
          <div class="feature-icon-wrap w-10 h-10 md:w-14 md:h-14 2xl:w-16 2xl:h-16 rounded-lg md:rounded-xl bg-gradient-to-br from-[var(--neon-cyan)] to-[var(--neon-purple)] flex items-center justify-center text-white text-lg md:text-2xl 2xl:text-3xl mb-3 md:mb-5 2xl:mb-6">
            <el-icon><component :is="feature.icon" /></el-icon>
          </div>
          <h3 class="text-sm md:text-xl 2xl:text-2xl font-semibold mb-1.5 md:mb-2.5 text-[var(--text-light)]">{{ feature.title }}</h3>
          <p class="text-xs md:text-sm 2xl:text-base text-[var(--text-muted)] leading-relaxed">{{ feature.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { markRaw, ref, onMounted, onUnmounted } from 'vue'
import { Search, Folder, Download, Link } from '@element-plus/icons-vue'

const features = [
  {
    icon: markRaw(Search),
    title: '智能搜索',
    description: '关键词 + 标签双维度筛选，毫秒级定位目标 Skill'
  },
  {
    icon: markRaw(Link),
    title: 'GitHub 同步',
    description: '一键导入 GitHub 仓库 Skill，自动同步最新版本'
  },
  {
    icon: markRaw(Folder),
    title: '文件浏览',
    description: '内置代码查看器，语法高亮、Markdown 渲染、图片预览'
  },
  {
    icon: markRaw(Download),
    title: 'ZIP 导出',
    description: '一键打包导出 Skill，离线分享即开即用'
  }
]

const gridRef = ref<HTMLElement | null>(null)
const visibleCards = ref<Set<number>>(new Set())

let observer: IntersectionObserver | null = null

onMounted(() => {
  if (!gridRef.value) return
  const cards = gridRef.value.querySelectorAll('.feature-card')
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target as HTMLElement
          const cardIndex = Array.from(cards).indexOf(el)
          if (cardIndex >= 0) {
            visibleCards.value = new Set([...visibleCards.value, cardIndex])
          }
          observer?.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.15 }
  )
  cards.forEach((card) => observer?.observe(card))
})

onUnmounted(() => {
  observer?.disconnect()
})
</script>

<style scoped>
.feature-card {
  background: var(--dark-card);
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 0.6s ease, transform 0.6s ease, box-shadow 0.3s ease;
  transition-delay: var(--delay, 0ms);
}

.feature-card.is-visible {
  opacity: 1;
  transform: translateY(0);
}

.feature-card:hover {
  box-shadow: 0 8px 32px rgba(14, 165, 233, 0.08), 0 0 0 1px rgba(14, 165, 233, 0.12);
}

.feature-card:hover .feature-icon-wrap {
  transform: scale(1.08);
}

.feature-card:hover .feature-border {
  opacity: 1;
}

.feature-border {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1px;
  opacity: 0.4;
  transition: opacity 0.3s ease;
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  background: linear-gradient(135deg, var(--neon-cyan), var(--neon-purple), var(--neon-cyan));
  background-size: 200% 200%;
  animation: borderShift 4s ease infinite;
  pointer-events: none;
}

.feature-icon-wrap {
  transition: transform 0.3s ease;
}

@keyframes borderShift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}
</style>
