<template>
  <section id="features" class="py-20 bg-gray-50 dark:bg-gray-900/50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-16">
        <h2 class="text-3xl font-bold mb-4">平台特性</h2>
        <p class="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          强大的功能，助你高效管理 AI Skills
        </p>
      </div>
      <div class="grid md:grid-cols-3 gap-8">
        <div v-for="feature in features" :key="feature.title" class="bg-white dark:bg-dark-card p-8 rounded-2xl border border-gray-200 dark:border-dark-border hover:shadow-lg transition-shadow">
          <div class="w-14 h-14 rounded-xl gradient-bg flex items-center justify-center text-white text-2xl mb-6">
            <el-icon><component :is="feature.icon" /></el-icon>
          </div>
          <h3 class="text-xl font-semibold mb-3">{{ feature.title }}</h3>
          <p class="text-gray-600 dark:text-gray-400">{{ feature.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Search, Folder, Download, Github, MagicStick, Monitor } from '@element-plus/icons-vue'

const features = ref([
  {
    icon: Search,
    title: '智能搜索',
    description: '快速找到你需要的 Skill，支持关键词、标签筛选'
  },
  {
    icon: Folder,
    title: '双重来源',
    description: '支持本地 Skill 和 GitHub 热门 Skill 两种来源'
  },
  {
    icon: Download,
    title: '一键导出',
    description: '支持 ZIP 格式导出，方便分享和迁移'
  },
  {
    icon: Github,
    title: 'GitHub 集成',
    description: '直接跳转原始仓库，查看完整源代码'
  },
  {
    icon: MagicStick,
    title: '工具详情',
    description: '详细展示每个工具的参数、示例和使用方法'
  },
  {
    icon: Monitor,
    title: '主题切换',
    description: '支持深色/浅色主题，保护你的眼睛'
  }
])
</script>
