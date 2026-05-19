<template>
  <div class="bg-white dark:bg-dark-card rounded-2xl p-4 md:p-8 border border-gray-200 dark:border-dark-border">
    <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
      <div class="flex items-start gap-3 md:gap-6">
        <div class="w-14 h-14 md:w-20 md:h-20 rounded-2xl gradient-bg flex items-center justify-center text-white text-xl md:text-3xl font-bold flex-shrink-0">
          {{ skill.name.charAt(0).toUpperCase() }}
        </div>
        <div>
          <div class="flex items-center gap-2 md:gap-4 mb-2 flex-wrap">
            <h1 class="text-xl md:text-3xl font-bold">{{ skill.name }}</h1>
            <el-tag :type="skill.sourceType === 'github' ? 'primary' : 'success'">
              {{ skill.sourceType === 'github' ? 'GitHub' : '本地' }}
            </el-tag>
            <span class="text-gray-500">v{{ skill.version }}</span>
          </div>
          <p class="text-gray-600 dark:text-gray-400 mb-3 md:mb-4">{{ skill.description }}</p>
          <div class="flex flex-wrap items-center gap-3 md:gap-6 text-sm text-gray-500">
            <span class="flex items-center gap-1">
              <el-icon><User /></el-icon>
              {{ skill.author }}
            </span>
            <span class="flex items-center gap-1">
              <el-icon><Star /></el-icon>
              {{ skill.rating }} 评分
            </span>
            <span class="flex items-center gap-1">
              <el-icon><Download /></el-icon>
              {{ formatDownloads(skill.downloadCount) }} 下载
            </span>
            <span class="flex items-center gap-1">
              <el-icon><Clock /></el-icon>
              更新于 {{ skill.lastUpdated }}
            </span>
          </div>
        </div>
      </div>
      <div class="flex flex-row md:flex-col gap-3">
        <ZipExportBtn :skill="skill" />
        <el-button v-if="skill.githubUrl" type="success" :icon="Link" @click="openGithub">
          GitHub 仓库
        </el-button>
      </div>
    </div>
    <div class="mt-6 flex flex-wrap gap-2">
      <el-tag v-for="tag in skill.tags" :key="tag" size="large" effect="plain">
        {{ tag }}
      </el-tag>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Link, User, Star, Download, Clock } from '@element-plus/icons-vue'
import ZipExportBtn from '@/components/features/ZipExportBtn.vue'
import type { Skill } from '@/types'

interface Props {
  skill: Skill
}

const props = defineProps<Props>()

const openGithub = () => {
  if (props.skill.githubUrl) {
    window.open(props.skill.githubUrl, '_blank')
  }
}

const formatDownloads = (num: number): string => {
  if (num >= 10000) return `${(num / 10000).toFixed(1)}万`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`
  return String(num)
}
</script>
