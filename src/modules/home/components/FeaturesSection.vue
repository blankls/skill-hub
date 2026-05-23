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
  },
  {
    icon: markRaw(MagicStick),
    title: '在线编辑',
    description: '管理员模式下直接编辑文件内容，实时保存生效'
  },
  {
    icon: markRaw(Monitor),
    title: '安全管控',
    description: 'Session Token 认证 + 限流防护，管理操作安全可靠'
  }
]
</script>
