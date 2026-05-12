<template>
  <div class="space-y-4">
    <div
      v-for="skill in skills"
      :key="skill.id"
      class="skill-card rounded-2xl p-6 flex items-center gap-6 cursor-pointer transition-all"
      @click="handleClick(skill)"
    >
      <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--neon-cyan)] to-[var(--neon-purple)] flex items-center justify-center text-white text-2xl font-black font-mono flex-shrink-0 shadow-lg">
        {{ skill.name.charAt(0).toUpperCase() }}
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-3 mb-2">
          <h3 class="font-semibold text-lg truncate text-[var(--text-light)] font-mono">{{ skill.name }}</h3>
          <span class="text-[var(--neon-yellow)] text-xs font-mono uppercase">
            [{{ getSourceLabel(skill.source.type) }}]
          </span>
          <span class="text-[var(--neon-yellow)] font-mono text-sm font-bold">v{{ skill.version }}</span>
        </div>
        <p class="text-[var(--text-muted)] truncate mb-3">{{ skill.description }}</p>
        <div class="flex flex-wrap gap-2">
          <span v-for="tag in skill.tags" :key="tag" class="px-3 py-1 bg-[var(--neon-purple)]/20 border border-[var(--neon-purple)]/30 text-[var(--neon-purple)] rounded-full text-xs font-mono">
            #{{ tag }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import type { Skill } from '@/types'

interface Props {
  skills: Skill[]
}

const props = defineProps<Props>()
const router = useRouter()

const handleClick = (skill: Skill) => {
  router.push(`/skills/${skill.id}`)
}

const getSourceLabel = (type: string) => {
  const labels: Record<string, string> = {
    local: '本地',
    zip: 'ZIP',
    github: 'GitHub',
    skillmd: 'MD'
  }
  return labels[type] || '本地'
}
</script>
