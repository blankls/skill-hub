<template>
  <section id="features" class="py-20 bg-[var(--dark-bg)]">
    <div class="max-w-[95rem] mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-16">
        <h2 class="text-4xl font-bold mb-4 text-[var(--text-light)]">平台特性</h2>
        <p class="text-lg text-[var(--text-muted)] max-w-2xl mx-auto">
          强大的功能，助你高效管理 AI Skills
        </p>
      </div>
      <div class="grid md:grid-cols-3 gap-8">
        <div v-for="feature in features" :key="feature.title" class="skill-card p-8 rounded-2xl">
          <div class="w-16 h-16 rounded-xl bg-gradient-to-br from-[var(--neon-cyan)] to-[var(--neon-purple)] flex items-center justify-center text-white text-3xl mb-6">
            <el-icon><component :is="feature.icon" /></el-icon>
          </div>
          <h3 class="text-2xl font-semibold mb-3 text-[var(--text-light)]">{{ feature.title }}</h3>
          <p class="text-[var(--text-muted)]">{{ feature.description }}</p>
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
