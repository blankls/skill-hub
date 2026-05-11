<template>
  <section class="relative overflow-hidden py-20">
    <div class="absolute inset-0 gradient-bg animate-gradient-x opacity-10"></div>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
      <div class="text-center">
        <h1 class="text-5xl md:text-6xl font-bold mb-6">
          <span class="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 via-purple-600 to-teal-500">
            发现和管理 AI Skills
          </span>
        </h1>
        <p class="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
          一个集中展示与管理个人/团队 AI Skills 的可视化平台，
          快速浏览、搜索和使用你需要的技能。
        </p>
        <div class="flex items-center justify-center gap-4">
          <el-button type="primary" size="large" @click="goToSkills">
            浏览技能库
          </el-button>
          <el-button size="large" @click="scrollToFeatures">
            了解更多
          </el-button>
        </div>
      </div>
      <div class="mt-16 flex justify-center">
        <div class="relative w-full max-w-4xl animate-float">
          <div class="bg-white dark:bg-dark-card rounded-2xl shadow-2xl border border-gray-200 dark:border-dark-border overflow-hidden">
            <div class="flex items-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-dark-border">
              <div class="w-3 h-3 rounded-full bg-red-500"></div>
              <div class="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div class="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <div class="p-6">
              <div class="grid grid-cols-3 gap-4">
                <div class="h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl"></div>
                <div class="h-32 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl"></div>
                <div class="h-32 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goToSkills = () => {
  router.push('/skills')
}

const scrollToFeatures = () => {
  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
}
</script>
