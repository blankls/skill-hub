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
            <el-tag :type="skill.source?.type === 'github' ? 'primary' : 'success'">
              {{ skill.source?.type === 'github' ? 'GitHub' : '本地' }}
            </el-tag>
            <span class="text-gray-500">v{{ skill.version }}</span>
          </div>
          <p class="text-gray-600 dark:text-gray-400 mb-3 md:mb-4">{{ skill.description }}</p>
          <div class="flex flex-wrap items-center gap-3 md:gap-6 text-sm text-gray-500">
            <span v-if="skill.author" class="flex items-center gap-1">
              <el-icon><User /></el-icon>
              {{ skill.author }}
            </span>
            <button
              @click="handleLike"
              class="flex items-center gap-1 cursor-pointer transition-all duration-300 hover:scale-110"
              :class="liking ? 'text-orange-500' : 'text-gray-500 hover:text-orange-400'"
            >
              🔥 {{ skill.likes || 0 }} 热度
            </button>
            <span class="flex items-center gap-1">
              <el-icon><Clock /></el-icon>
              更新于 {{ formatDate(skill.updatedAt) }}
            </span>
          </div>
        </div>
      </div>
      <div class="flex flex-row md:flex-col gap-3">
        <button
          @click="handleLike"
          class="px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 flex items-center gap-2"
          :class="liking
            ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
            : 'bg-gradient-to-r from-orange-500/10 to-red-500/10 text-orange-400 border border-orange-500/30 hover:from-orange-500/20 hover:to-red-500/20 hover:border-orange-500/50'"
        >
          🔥 {{ liking ? '已点赞' : '点赞' }}
        </button>
        <ZipExportBtn :skill="skill" />
        <el-button v-if="skill.source?.githubMeta?.html_url" type="success" :icon="Link" @click="openGithub">
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
import { ref } from 'vue'
import { Link, User, Clock } from '@element-plus/icons-vue'
import ZipExportBtn from '@/components/features/ZipExportBtn.vue'
import { useSkillStore } from '@/stores/skillStore'
import type { Skill } from '@/types'

interface Props {
  skill: Skill
}

const props = defineProps<Props>()
const skillStore = useSkillStore()
const liking = ref(false)

const openGithub = () => {
  if (props.skill.source?.githubMeta?.html_url) {
    window.open(props.skill.source.githubMeta.html_url, '_blank')
  }
}

const formatDate = (date: Date | string) => {
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return '今天'
  if (days === 1) return '昨天'
  if (days < 7) return `${days} 天前`
  if (days < 30) return `${Math.floor(days / 7)} 周前`
  return d.toLocaleDateString('zh-CN')
}

const handleLike = async () => {
  if (liking.value) return
  liking.value = true
  await skillStore.toggleLike(props.skill.id)
  setTimeout(() => { liking.value = false }, 1500)
}
</script>
