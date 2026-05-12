<template>
  <div class="group skill-card rounded-2xl overflow-hidden cursor-pointer" @click="handleClick">
    <div class="p-6">
      <div class="flex items-start justify-between mb-4">
      <div class="flex items-center gap-3">
        <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--neon-cyan)] to-[var(--neon-purple)] flex items-center justify-center text-white text-2xl font-black font-mono shadow-lg">
          {{ skill.name.charAt(0).toUpperCase() }}
        </div>
        <div>
          <span class="text-[var(--neon-yellow)] text-xs font-mono uppercase tracking-wider">
            [{{ getSourceLabel(skill.source.type) }}]
          </span>
        </div>
      </div>
      </div>
      
      <h3 class="text-xl font-bold mb-3 text-[var(--text-light)] group-hover:text-[var(--neon-cyan)] transition-colors font-mono">
        {{ skill.name }}
      </h3>
      
      <p class="text-[var(--text-muted)] text-sm mb-5 line-clamp-2">
        {{ skill.description }}
      </p>
      
      <div class="flex flex-wrap gap-2 mb-5">
        <span v-for="tag in skill.tags" :key="tag" class="px-3 py-1 bg-[var(--neon-purple)]/20 border border-[var(--neon-purple)]/30 text-[var(--neon-purple)] rounded-full text-xs font-mono">
          #{{ tag }}
        </span>
      </div>
      
      <div class="flex items-center justify-between pt-4 border-t border-[var(--neon-cyan)]/10">
        <span class="text-[var(--neon-yellow)] font-mono text-sm font-semibold">
        v{{ skill.version }}
        </span>
        <span class="text-[var(--text-muted)] text-xs font-mono">
          {{ formatDate(skill.updatedAt) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import type { Skill } from '@/types'

interface Props {
  skill: Skill
}

const props = defineProps<Props>()
const router = useRouter()

const handleClick = () => {
  router.push(`/skills/${props.skill.id}`)
}

const getSourceLabel = (type: string) => {
  const labels: Record<string, string> = {
    local: 'LOCAL',
    zip: 'ZIP',
    github: 'GITHUB',
    skillmd: 'MD'
  }
  return labels[type] || 'LOCAL'
}

const formatDate = (date: Date | string) => {
  const d = new Date(date)
  return d.toLocaleDateString('zh-CN')
}
</script>
