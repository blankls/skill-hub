<template>
  <button
    v-if="!isAdmin"
    @click="$emit('like')"
    :disabled="likeDisabled"
    class="sidebar-btn action-btn w-12 h-12 xl:w-14 xl:h-14 rounded-xl flex items-center justify-center transition-all duration-200 group relative"
    :class="[likeDisabled ? 'opacity-40 cursor-not-allowed' : (liking ? 'bg-orange-500/15 border-orange-500/30 hover:scale-115' : 'hover:bg-[var(--neon-cyan)]/10 hover:scale-115 border-[rgba(14,165,233,0.15)]')]"
    style="border-width: 1px; border-style: solid"
    :title="likeDisabled ? '请稍候...' : (liking ? '已点赞' : '点赞')"
  >
    <span class="text-xl xl:text-2xl">{{ liking ? '❤️' : '🤍' }}</span>
    <span
      class="absolute right-full mr-2 px-2 py-1 rounded-md text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
      style="background: var(--dark-card); color: var(--text-light); border: 1px solid rgba(14,165,233,0.2)"
    >{{ liking ? '取消点赞' : '点赞' }}</span>
  </button>
  <button
    v-if="isGitHubSkill && isAdmin"
    @click="$emit('sync')"
    :disabled="syncing"
    class="sidebar-btn action-btn w-12 h-12 xl:w-14 xl:h-14 rounded-xl flex items-center justify-center transition-all duration-200 hover:bg-[var(--neon-cyan)]/10 hover:scale-115 group relative border border-[rgba(14,165,233,0.15)]"
    :class="{ 'opacity-50': syncing }"
    title="同步"
  >
    <span class="text-xl xl:text-2xl">{{ syncing ? '🔄' : '🔁' }}</span>
    <span
      class="absolute right-full mr-2 px-2 py-1 rounded-md text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
      style="background: var(--dark-card); color: var(--text-light); border: 1px solid rgba(14,165,233,0.2)"
    >同步</span>
  </button>
  <button
    v-if="isAdmin"
    @click="$emit('edit')"
    class="sidebar-btn action-btn w-12 h-12 xl:w-14 xl:h-14 rounded-xl flex items-center justify-center transition-all duration-200 hover:bg-[var(--neon-cyan)]/10 hover:scale-115 group relative border border-[rgba(14,165,233,0.15)]"
    title="编辑"
  >
    <span class="text-xl xl:text-2xl">✏️</span>
    <span
      class="absolute right-full mr-2 px-2 py-1 rounded-md text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
      style="background: var(--dark-card); color: var(--text-light); border: 1px solid rgba(14,165,233,0.2)"
    >编辑</span>
  </button>
  <ZipExportBtn :skill="skill" class="w-12 h-12 xl:w-14 xl:h-14" />
  <button
    v-if="isAdmin"
    @click="$emit('delete')"
    class="sidebar-btn action-btn w-12 h-12 xl:w-14 xl:h-14 rounded-xl flex items-center justify-center transition-all duration-200 hover:bg-red-500/10 hover:scale-115 group relative border border-[rgba(14,165,233,0.15)]"
    title="删除"
  >
    <span class="text-xl xl:text-2xl">🗑️</span>
    <span
      class="absolute right-full mr-2 px-2 py-1 rounded-md text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
      style="background: var(--dark-card); color: var(--text-light); border: 1px solid rgba(14,165,233,0.2)"
    >删除</span>
  </button>
</template>

<script setup lang="ts">
import type { Skill } from '@/types'
import ZipExportBtn from '@/components/features/ZipExportBtn.vue'

defineProps<{
  skill: Skill
  isAdmin: boolean
  isGitHubSkill: boolean
  liking: boolean
  likeDisabled: boolean
  syncing: boolean
}>()

defineEmits<{
  like: []
  sync: []
  edit: []
  delete: []
}>()
</script>
