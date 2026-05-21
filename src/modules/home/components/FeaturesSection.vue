<template>
  <section id="features" class="py-12 md:py-20 bg-[var(--dark-bg)]">
    <div class="max-w-[100rem] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12">
      <div class="text-center mb-8 md:mb-16">
        <h2 class="text-2xl md:text-4xl 2xl:text-5xl font-bold mb-3 md:mb-4 text-[var(--text-light)]">平台特性</h2>
        <p class="text-sm md:text-lg 2xl:text-xl text-[var(--text-muted)] max-w-2xl mx-auto">
          强大的功能，助你高效管理 AI Skills
        </p>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-8 2xl:gap-10">
        <div v-for="feature in features" :key="feature.title" class="skill-card p-3 md:p-8 2xl:p-10 rounded-xl md:rounded-2xl">
          <div class="w-10 h-10 md:w-16 md:h-16 2xl:w-20 2xl:h-20 rounded-lg md:rounded-xl bg-gradient-to-br from-[var(--neon-cyan)] to-[var(--neon-purple)] flex items-center justify-center text-white text-xl md:text-3xl 2xl:text-4xl mb-3 md:mb-6 2xl:mb-8">
            <el-icon><component :is="feature.icon" /></el-icon>
          </div>
          <h3 class="text-base md:text-2xl 2xl:text-3xl font-semibold mb-2 md:mb-3 text-[var(--text-light)]">{{ feature.title }}</h3>
          <p class="text-xs md:text-base 2xl:text-lg text-[var(--text-muted)] leading-relaxed">{{ feature.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { markRaw } from 'vue'
import { Search, Folder, Download, Link, MagicStick, Monitor } from '@element-plus/icons-vue'

const features = [
  {
    icon: markRaw(Search),
    title: '智能搜索',
    description: '快速找到你需要的 Skill，支持关键词、标签筛选'
  },
  {
    icon: markRaw(Folder),
    title: '双重来源',
    description: '支持本地 Skill 和 GitHub 热门 Skill 两种来源'
  },
  {
    icon: markRaw(Download),
    title: '一键导出',
    description: '支持 ZIP 格式导出，方便分享和迁移'
  },
  {
    icon: markRaw(Link),
    title: 'GitHub 集成',
    description: '直接跳转原始仓库，查看完整源代码'
  },
  {
    icon: markRaw(MagicStick),
    title: '工具详情',
    description: '详细展示每个工具的参数、示例和使用方法'
  },
  {
    icon: markRaw(Monitor),
    title: '主题切换',
    description: '支持深色/浅色主题，保护你的眼睛'
  }
]
</script>
