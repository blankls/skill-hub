<template>
  <div class="skill-card-compact group rounded-xl md:rounded-2xl overflow-hidden cursor-pointer" @click="handleClick">
    <div class="p-3 sm:p-4 md:p-6 2xl:p-8 relative">
      <div class="flex items-start gap-2 md:gap-3 mb-2 md:mb-4">
        <div class="w-8 sm:w-10 md:w-14 md:h-14 2xl:w-16 2xl:h-16 rounded-lg md:rounded-xl flex items-center justify-center text-white text-sm md:text-2xl 2xl:text-3xl font-black font-mono shadow-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0"
             :style="{ background: `linear-gradient(to bottom right, ${skill.iconColor || 'var(--neon-cyan),var(--neon-purple)'})` }"
        >
          {{ skill.name.charAt(0).toUpperCase() }}
        </div>
        <div class="flex-1 min-w-0">
          <h3 class="text-sm md:text-xl 2xl:text-2xl font-bold mb-1 md:mb-2 text-[var(--text-light)] group-hover:text-[var(--neon-cyan)] transition-colors line-clamp-1">
            {{ skill.name }}
          </h3>
          <span class="text-[var(--neon-yellow)] text-[10px] md:text-xs 2xl:text-sm font-mono uppercase tracking-wider">
            [{{ getSourceLabel(skill.source.type) }}]
          </span>
        </div>
      </div>

      <p class="text-[11px] sm:text-xs md:text-sm 2xl:text-base text-[var(--text-muted)] mb-2 md:mb-3 line-clamp-2 leading-relaxed">
        {{ skill.description }}
      </p>

      <div class="flex flex-wrap gap-1 md:gap-2 mb-2 md:mb-3">
        <span v-for="tag in displayedTags" :key="tag" class="px-1.5 md:px-3 py-0.5 md:py-1 bg-[var(--neon-purple)]/20 border border-[var(--neon-purple)]/30 text-[var(--neon-purple)] rounded-full text-[10px] md:text-xs 2xl:text-sm font-mono">
          #{{ tag }}
        </span>
        <span v-if="skill.tags.length > 2" class="text-[var(--text-muted)] text-[10px] md:text-xs">
          +{{ skill.tags.length - 2 }}
        </span>
      </div>

      <div class="flex items-center justify-between pt-2 md:pt-3 border-t border-[var(--neon-cyan)]/10 text-[10px] md:text-xs 2xl:text-sm">
        <div class="flex items-center gap-1 md:gap-2">
          <span class="flex items-center gap-0.5 md:gap-1 text-orange-400 font-mono font-semibold">
            🔥 {{ skill.likes || 0 }}
          </span>
          <span class="text-[var(--neon-yellow)] font-mono font-semibold">
            v{{ skill.version }}
          </span>
          <span class="text-[var(--text-muted)] font-mono flex items-center gap-0.5 md:gap-1">
            <el-icon class="text-[8px] md:text-xs"><Document /></el-icon>
            {{ skill.files.length }}
          </span>
        </div>
        <span class="text-[var(--text-muted)] font-mono">
          {{ formatDate(skill.updatedAt) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { Document } from '@element-plus/icons-vue'
import type { Skill } from '@/types'

interface Props {
  skill: Skill
}

const props = defineProps<Props>()
const router = useRouter()

const displayedTags = computed(() => {
  return props.skill.tags.slice(0, 2)
})

const handleClick = () => {
  router.push(`/skills/${props.skill.id}`)
}

const formatDate = (date: Date | string) => {
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) return '今天'
  if (days === 1) return '昨天'
  if (days < 7) return `${days}天前`
  if (days < 30) return `${Math.floor(days / 7)}周前`
  return `${Math.floor(days / 30)}月前`
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

<style scoped>
.skill-card-compact {
  background-color: var(--dark-card);
  border: 1px solid rgba(0, 245, 255, 0.1);
  transition: all 0.2s ease;
}

.skill-card-compact:hover {
  border-color: rgba(0, 245, 255, 0.3);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
