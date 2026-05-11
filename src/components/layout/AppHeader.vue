<template>
  <header class="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-dark-bg/80 border-b border-gray-200 dark:border-dark-border">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <div class="flex items-center gap-8">
          <router-link to="/" class="flex items-center gap-2">
            <div class="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
              <span class="text-white font-bold text-xl">S</span>
            </div>
            <span class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-purple-600">
              Skill Hub
            </span>
          </router-link>
          <nav class="hidden md:flex gap-6">
            <router-link to="/" class="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-500 font-medium">
              首页
            </router-link>
            <router-link to="/skills" class="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-500 font-medium">
              技能库
            </router-link>
          </nav>
        </div>
        <div class="flex items-center gap-4">
          <SearchBox />
          <ThemeToggle />
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import SearchBox from '@/components/features/SearchBox.vue'
import ThemeToggle from '@/components/features/ThemeToggle.vue'
</script>
