<template>
  <div class="min-h-screen bg-[var(--dark-bg)]">
    <SkillToolbar />

    <div class="flex">
      <FilterSidebar
        v-if="skillStore.skills.length > 0"
        :mobileOpen="mobileDrawerOpen"
        @close="closeMobileDrawer"
      />

      <div class="flex-1 min-w-0 p-6">
        <div v-if="skillStore.loading" class="text-center py-20">
          <el-icon class="text-5xl text-[var(--neon-cyan)] animate-spin"><Loading /></el-icon>
          <p class="mt-6 text-[var(--text-muted)] text-lg">加载技能中...</p>
        </div>
        <div v-else-if="skillStore.filteredSkills.length === 0">
          <EmptyState
            title="技能仓库为空"
            description="技能库中暂无技能，等待管理员添加技能"
          >
            <template #icon>
              <span class="text-7xl">💻</span>
            </template>
          </EmptyState>
        </div>
        <div v-else class="max-w-[80rem] mx-auto">
          <SkillGridView v-if="skillStore.viewMode === 'grid'" :skills="skillStore.filteredSkills" :showAdminActions="false" />
          <SkillListView v-else :skills="skillStore.filteredSkills" :showAdminActions="false" />
        </div>
      </div>
    </div>

    <button
      v-if="skillStore.skills.length > 0"
      @click="openMobileDrawer"
      class="mobile-filter-fab"
      aria-label="筛选"
    >
      <el-icon class="text-xl"><Filter /></el-icon>
      <span v-if="activeFilterCount > 0" class="mobile-filter-badge">{{ activeFilterCount }}</span>
    </button>

    <Transition name="overlay">
      <div v-if="mobileDrawerOpen" class="mobile-drawer-overlay" @click="closeMobileDrawer"></div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useSkillStore } from '@/stores/skillStore'
import { Loading, Filter } from '@element-plus/icons-vue'
import SkillToolbar from './components/SkillToolbar.vue'
import SkillGridView from './components/SkillGridView.vue'
import SkillListView from './components/SkillListView.vue'
import FilterSidebar from './components/FilterSidebar.vue'
import EmptyState from '@/components/ui/EmptyState.vue'

const route = useRoute()
const skillStore = useSkillStore()

const mobileDrawerOpen = ref(false)

const activeFilterCount = computed(() => {
    let count = 0
    if (skillStore.selectedTags.length > 0) count += skillStore.selectedTags.length
    if (skillStore.minLikes > 0) count += 1
    if (skillStore.searchQuery !== '') count += 1
    if (skillStore.selectedSources.length < 2) count += 1
    return count
})

function openMobileDrawer() {
    mobileDrawerOpen.value = true
    document.body.style.overflow = 'hidden'
}

function closeMobileDrawer() {
    mobileDrawerOpen.value = false
    document.body.style.overflow = ''
}

function applyUrlFilters() {
    if (route.query.q) {
        skillStore.setSearchQuery(route.query.q as string)
    }
    if (route.query.tag) {
        const tag = route.query.tag as string
        if (!skillStore.selectedTags.includes(tag)) {
            skillStore.toggleSelectedTag(tag)
        }
    }
}

onMounted(() => {
    applyUrlFilters()
})

onUnmounted(() => {
    document.body.style.overflow = ''
})

watch(() => route.query.tag, (newTag) => {
    if (newTag) {
        const tag = newTag as string
        if (!skillStore.selectedTags.includes(tag)) {
            skillStore.setSelectedTags([tag])
        }
    }
})

watch(() => route.query.q, (newQ) => {
    if (newQ) {
        skillStore.setSearchQuery(newQ as string)
    }
})
</script>

<style scoped>
.mobile-filter-fab {
    display: none;
}

.mobile-drawer-overlay {
    display: none;
}

@media (max-width: 768px) {
    :deep(aside) {
        display: none !important;
    }

    .flex-1.min-w-0.p-6 {
        padding: 1rem !important;
    }

    .py-20 {
        padding-top: 3rem !important;
        padding-bottom: 3rem !important;
    }

    .text-5xl {
        font-size: 2rem !important;
    }

    .mobile-filter-fab {
        display: flex;
        position: fixed;
        bottom: 1.5rem;
        right: 1.5rem;
        z-index: 40;
        width: 3.5rem;
        height: 3.5rem;
        align-items: center;
        justify-content: center;
        border-radius: 9999px;
        background: linear-gradient(135deg, var(--neon-cyan), var(--neon-purple));
        color: #fff;
        box-shadow: 0 4px 20px rgba(0, 255, 255, 0.3);
        border: none;
        cursor: pointer;
        transition: transform 0.2s, box-shadow 0.2s;
    }

    .mobile-filter-fab:active {
        transform: scale(0.92);
    }

    .mobile-filter-badge {
        position: absolute;
        top: -4px;
        right: -4px;
        min-width: 1.25rem;
        height: 1.25rem;
        padding: 0 0.35rem;
        border-radius: 9999px;
        background: #ef4444;
        color: #fff;
        font-size: 0.7rem;
        font-weight: 700;
        line-height: 1.25rem;
        text-align: center;
        box-shadow: 0 2px 6px rgba(239, 68, 68, 0.5);
    }

    .mobile-drawer-overlay {
        display: block;
        position: fixed;
        inset: 0;
        z-index: 45;
        background: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(2px);
    }
}

.overlay-enter-active {
    transition: opacity 0.25s ease;
}

.overlay-leave-active {
    transition: opacity 0.2s ease;
}

.overlay-enter-from,
.overlay-leave-to {
    opacity: 0;
}
</style>
