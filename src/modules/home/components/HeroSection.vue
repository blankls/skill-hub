<template>
  <section class="relative min-h-screen flex items-center justify-center overflow-hidden">
    <div class="absolute inset-0 gradient-bg"></div>
    
    <!-- Animated Grid Lines -->
    <div class="absolute inset-0 opacity-20">
      <svg class="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--neon-cyan)" stroke-width="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </div>
    
    <!-- Floating Orbs -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div v-for="i in 12" :key="i" class="absolute rounded-full"
           :style="{
             width: (i % 3 === 0 ? 100 : 60) + 'px',
             height: (i % 3 === 0 ? 100 : 60) + 'px',
             left: `${(i * 8) % 100}%`,
             top: `${(i * 12) % 100}%`,
             background: `radial-gradient(circle, ${i % 2 === 0 ? 'rgba(0, 245, 255, 0.3)' : 'rgba(255, 0, 110, 0.3)'} 0%, transparent 70%)`,
             animation: `float ${5 + (i % 5)}s ease-in-out infinite`,
             animationDelay: `${i * 0.3}s`,
             filter: 'blur(10px)'
           }"></div>
    </div>

    <!-- Main Content -->
    <div class="relative z-10 w-full max-w-3xl px-6 text-center">
      <!-- Logo Text -->
      <h1 class="text-6xl md:text-8xl font-black mb-6 tracking-tight glitch-effect neon-text" style="font-family: 'Courier New', monospace;">
        技能中心
        <span class="block text-lg md:text-2xl text-[var(--neon-yellow)] mt-2 font-normal">
          // AI 技能管理器 v2.0
        </span>
      </h1>
      
      <p class="text-xl md:text-2xl text-[var(--text-muted)] mb-10 max-w-2xl mx-auto leading-relaxed">
        发现 · 分享 · 管理你的 AI 技能
      </p>

      <!-- Search Area -->
      <div class="relative mb-12">
        <div class="absolute -inset-1 bg-gradient-to-r from-[var(--neon-cyan)] to-[var(--neon-pink)] rounded-full blur opacity-70"></div>
        <div class="relative flex items-center bg-[var(--dark-card)] border border-[var(--neon-cyan)]/30 rounded-full p-3 shadow-2xl">
          <el-input
            v-model="searchQuery"
            size="large"
            placeholder="> 搜索技能... (例如：代码生成)"
            class="flex-1 bg-transparent no-input-border"
            :class="{ 'no-input-border': true }"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon class="text-[var(--neon-cyan)]"><Search /></el-icon>
            </template>
          </el-input>
          <el-button type="primary" size="large" round class="ml-3 bg-gradient-to-r from-[var(--neon-cyan)] to-[var(--neon-purple)] border-none text-white font-bold shadow-lg hover:shadow-[0_0_20px_rgba(0,245,255,0.5)]" @click="handleSearch">
            开始搜索
          </el-button>
        </div>
      </div>

      <!-- Popular Tags -->
      <div class="flex flex-wrap justify-center gap-3">
        <router-link v-for="tag in popularTags" :key="tag" :to="`/skills?tag=${tag}`"
          class="px-5 py-2 bg-[var(--dark-card)] hover:bg-[var(--neon-cyan)]/20 border border-[var(--neon-cyan)]/30 hover:border-[var(--neon-cyan)] text-[var(--text-light)] rounded-full transition-all duration-300 font-mono text-sm hover:shadow-[0_0_15px_rgba(0,245,255,0.3)]">
          #{{ tag }}
        </router-link>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Search } from '@element-plus/icons-vue'

const router = useRouter()
const searchQuery = ref('')
const popularTags = ['代码生成', '翻译', '写作', '数据分析', '创意', '编程', '学习']

function handleSearch() {
  if (searchQuery.value.trim()) {
    router.push({ path: '/skills', query: { q: searchQuery.value } })
  } else {
    router.push('/skills')
  }
}
</script>

<style scoped>
.no-input-border :deep(.el-input__wrapper) {
  box-shadow: none !important;
  border: none !important;
  background-color: transparent !important;
}

.no-input-border :deep(.el-input__inner) {
  background-color: transparent !important;
}

.no-input-border :deep(.el-input__wrapper:hover),
.no-input-border :deep(.el-input__wrapper.is-focus) {
  box-shadow: none !important;
}
</style>
