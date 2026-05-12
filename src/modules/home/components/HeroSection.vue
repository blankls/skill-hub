<template>
  <section class="relative min-h-screen flex items-center justify-center overflow-hidden">
    <div class="absolute inset-0 gradient-bg animate-gradient-x"></div>
    
    <div class="absolute inset-0 overflow-hidden">
      <div v-for="i in 20" :key="i" class="absolute rounded-full"
           :class="themeStore.isDark ? 'bg-white/5' : 'bg-black/5'"
           :style="{
             width: Math.random() * 300 + 50 + 'px',
             height: Math.random() * 300 + 50 + 'px',
             left: Math.random() * 100 + '%',
             top: Math.random() * 100 + '%',
             animation: `float ${Math.random() * 10 + 5}s ease-in-out infinite`,
             animationDelay: Math.random() * 5 + 's'
           }"></div>
    </div>

    <div class="relative z-10 w-full max-w-3xl px-6 text-center">
      <h1 class="text-5xl md:text-7xl font-extrabold text-white mb-6 drop-shadow-lg">
        Skill Hub
      </h1>
      <p class="text-xl md:text-2xl text-white/90 mb-12">
        发现、分享、管理你的 AI 技能
      </p>

      <div class="relative group">
        <div class="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
        <div class="relative flex items-center bg-white rounded-full shadow-2xl p-2">
          <el-input
            v-model="searchQuery"
            size="large"
            placeholder="搜索技能，例如：代码生成、翻译、写作..."
            class="flex-1"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon class="text-gray-400"><Search /></el-icon>
            </template>
          </el-input>
          <el-button type="primary" size="large" round class="ml-2" @click="handleSearch">
            搜索
          </el-button>
        </div>
      </div>

      <div class="mt-10 flex flex-wrap justify-center gap-3">
        <router-link v-for="tag in popularTags" :key="tag" :to="`/skills?tag=${tag}`"
          class="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur text-white rounded-full transition hover:scale-105">
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
import { useThemeStore } from '@/stores/themeStore'

const themeStore = useThemeStore()
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
