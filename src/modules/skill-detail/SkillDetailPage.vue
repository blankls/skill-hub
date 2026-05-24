<template>
  <div class="h-full bg-[var(--dark-bg)] overflow-hidden relative">
    <div v-if="loading" class="flex items-center justify-center py-20">
      <el-icon class="text-4xl text-[var(--neon-cyan)] animate-spin"><Loading /></el-icon>
      <p class="ml-4 text-[var(--text-muted)]">加载技能中...</p>
    </div>

    <template v-else-if="skill">
      <!-- 手机端顶部工具栏 -->
      <div class="lg:hidden fixed top-20 left-0 right-0 z-40 bg-[var(--dark-card)] border-b border-[rgba(0,245,255,0.15)] px-4 py-3">
        <div class="flex items-center gap-3">
          <button
            @click="router.back()"
            class="w-9 h-9 rounded-lg flex items-center justify-center transition-all flex-shrink-0"
            style="color: var(--text-muted); border: 1px solid rgba(0,245,255,0.15)"
          >
            <el-icon :size="16"><ArrowLeft /></el-icon>
          </button>
          <div class="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-black font-mono flex-shrink-0"
               :style="{ background: `linear-gradient(to bottom right, ${skill.iconColor || 'var(--neon-cyan),var(--neon-purple)'})` }"
          >
            {{ skill.name.charAt(0).toUpperCase() }}
          </div>
          <button
            v-for="nav in navItems"
            :key="nav.id"
            @click="openOverlay(nav.id)"
            class="w-9 h-9 rounded-lg flex items-center justify-center transition-all flex-shrink-0"
            :class="activeOverlay === nav.id ? 'bg-[var(--neon-cyan)]/15' : 'hover:bg-white/5'"
          >
            <span class="text-base">{{ nav.icon }}</span>
          </button>
          <div class="flex-1"></div>
          <button v-if="!isFromAdmin" @click="handleLike" :disabled="likeDisabled" :title="likeDisabled ? '请稍候...' : (liking ? '取消点赞' : '点赞')" class="w-9 h-9 rounded-lg flex items-center justify-center transition-all flex-shrink-0" :class="[likeDisabled ? 'opacity-40 cursor-not-allowed' : (liking ? 'bg-orange-500/15' : 'hover:bg-white/5')]">
            <span class="text-base">{{ liking ? '❤️' : '🤍' }}</span>
          </button>
          <button v-if="isGitHubSkill && isFromAdmin" @click="handleSync" :disabled="syncing" class="w-9 h-9 rounded-lg flex items-center justify-center transition-all hover:bg-white/5 flex-shrink-0">
            <span class="text-base">{{ syncing ? '🔄' : '🔁' }}</span>
          </button>
          <button v-if="isFromAdmin" @click="showEditor = true" class="w-9 h-9 rounded-lg flex items-center justify-center transition-all hover:bg-white/5 flex-shrink-0">
            <span class="text-base">✏️</span>
          </button>
          <ZipExportBtn :skill="skill" class="flex-shrink-0" />
          <button v-if="isFromAdmin" @click="handleDelete" class="w-9 h-9 rounded-lg flex items-center justify-center transition-all hover:bg-red-500/10 flex-shrink-0">
            <span class="text-base">🗑️</span>
          </button>
        </div>
      </div>

      <!-- 桌面端侧边栏 -->
      <DetailSidebar
        :nav-items="navItems"
        top-offset="5rem"
        @back="router.back()"
        @navigate="openOverlay"
      >
        <template #right-actions>
          <DetailActions
            :skill="skill"
            :is-admin="isFromAdmin"
            :is-git-hub-skill="isGitHubSkill"
            :liking="liking"
            :like-disabled="likeDisabled"
            :syncing="syncing"
            @like="handleLike"
            @sync="handleSync"
            @edit="showEditor = true"
            @delete="handleDelete"
          />
        </template>
      </DetailSidebar>

      <!-- 主内容区 - 占满全宽 -->
      <div class="h-full overflow-y-auto scrollbar-auto">
        <div class="mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-12 py-6 sm:py-8 lg:py-10 2xl:py-14 pt-24 lg:pt-12 max-w-[100rem]">
        <div class="rounded-xl overflow-hidden border border-[var(--neon-cyan)]/30 mb-6" style="background: var(--dark-card)">
          <div class="px-6 py-4 border-b border-[var(--neon-cyan)]/15 flex items-center gap-3" style="background: rgba(0,245,255,0.05)">
            <div class="w-10 h-10 sm:w-12 sm:h-12 2xl:w-14 2xl:h-14 rounded-xl flex items-center justify-center text-white text-lg sm:text-xl 2xl:text-2xl font-black font-mono shadow-lg"
                 :style="{ background: `linear-gradient(to bottom right, ${skill.iconColor || 'var(--neon-cyan),var(--neon-purple)'})` }"
            >
              {{ skill.name.charAt(0).toUpperCase() }}
            </div>
            <span class="font-semibold text-xl sm:text-2xl 2xl:text-3xl" style="color: var(--text-light)">{{ skill.name }}</span>
            <span class="ml-auto text-[var(--neon-yellow)] font-mono text-base 2xl:text-lg font-semibold">v{{ skill.version }}</span>
          </div>
          <div class="p-6">
            <div class="flex flex-wrap items-center gap-3 text-sm mb-4">
              <span class="px-3 py-1.5 rounded-full bg-[var(--neon-yellow)]/10 text-[var(--neon-yellow)] border border-[var(--neon-yellow)]/30 text-xs 2xl:text-sm font-mono uppercase tracking-wider">
                {{ getSourceLabel(skill.source.type) }}
              </span>
              <span v-if="skill.group" class="px-3 py-1.5 rounded-full bg-[var(--neon-cyan)]/10 text-[var(--neon-cyan)] border border-[var(--neon-cyan)]/30 text-xs 2xl:text-sm font-mono">
                {{ skill.group }}
              </span>
              <span v-if="skill.author" class="flex items-center gap-1.5 text-sm 2xl:text-base" style="color: var(--text-muted)">
                <span>👤</span>
                <span>{{ skill.author }}</span>
              </span>
              <span v-if="!isFromAdmin" class="flex items-center gap-1.5 text-sm 2xl:text-base" style="color: var(--text-muted)">
                <span class="text-orange-400">🔥</span>
                <span class="font-mono font-bold" style="color: var(--text-light)">{{ skill.likes || 0 }}</span>
              </span>
            </div>
            <p class="text-base 2xl:text-lg leading-relaxed" style="color: var(--text-muted)">{{ skill.description }}</p>
          </div>
        </div>

        <!-- GitHub 同步状态提示 -->
        <div v-if="isGitHubSkill && !skill.source.isContentCached" class="mb-6 p-4 bg-[var(--neon-yellow)]/10 border border-[var(--neon-yellow)]/30 rounded-xl">
          <p class="text-[var(--neon-yellow)] text-sm">
            <el-icon class="mr-1"><InfoFilled /></el-icon>
            此技能内容尚未完全加载，正在从 GitHub 获取完整内容...
          </p>
        </div>
        <div v-if="syncing && skill.source.isContentCached" class="mb-6 p-4 bg-[var(--neon-cyan)]/10 border border-[var(--neon-cyan)]/30 rounded-xl">
          <p class="text-[var(--neon-cyan)] text-sm flex items-center gap-2">
            <el-icon class="animate-spin"><Loading /></el-icon>
            正在从 GitHub 同步最新内容...
          </p>
        </div>

        <!-- GitHub 仓库信息 -->
        <div v-if="githubMeta" class="rounded-xl overflow-hidden border border-[var(--neon-purple)]/30 mb-6" style="background: var(--dark-card)">
          <div class="px-6 py-4 border-b border-[var(--neon-purple)]/15 flex items-center gap-2" style="background: rgba(168,85,247,0.05)">
            <span class="text-xl">🚀</span>
            <span class="font-semibold text-base 2xl:text-lg" style="color: var(--neon-purple)">GitHub 仓库</span>
          </div>
          <div class="p-6">
            <div class="flex items-start justify-between flex-wrap gap-4">
              <div class="min-w-0">
                <a :href="githubMeta.subfolderUrl || githubMeta.repoUrl" target="_blank" class="text-xl 2xl:text-2xl font-bold hover:underline transition-colors truncate block" style="color: var(--neon-cyan)">
                  {{ githubMeta.full_name + (hasSubfolder ? '/' + subfolderRelative : '') }}
                </a>
                <el-tooltip placement="top" :disabled="!isGithubDescriptionLong">
                  <template #content>
                    <div class="max-w-lg whitespace-pre-line">{{ githubMeta.description }}</div>
                  </template>
                  <p
                    v-if="githubMeta.description"
                    class="text-sm 2xl:text-base mt-1.5 leading-relaxed max-w-2xl cursor-pointer hover:text-[var(--neon-cyan)]"
                    :class="{ 'line-clamp-2': isGithubDescriptionLong }"
                  >
                    {{ githubMeta.description }}
                  </p>
                </el-tooltip>
              </div>
              <div class="flex items-center gap-4 text-base 2xl:text-lg shrink-0 flex-wrap">
                <a :href="githubMeta.repoUrl" target="_blank" class="flex items-center gap-1.5 hover:opacity-80 transition-opacity" style="color: var(--text-muted)">
                  <span class="text-base">🏠</span>
                  <span class="font-mono text-xs" style="color: var(--neon-cyan)">{{ githubMeta.repoUrl.split('/').slice(-2).join('/') }}</span>
                  <span class="text-[10px]" style="color: var(--text-muted)">↗</span>
                </a>
                <div class="flex items-center gap-1.5" style="color: var(--text-muted)">
                  <span>🌿</span>
                  <span class="font-mono px-1.5 py-0.5 text-xs rounded" style="background: rgba(0,245,255,0.08); color: var(--neon-cyan)">{{ githubMeta.branch }}</span>
                </div>
                <div class="flex items-center gap-1.5" style="color: var(--text-muted)">
                  <span class="text-yellow-400 text-base">⭐</span>
                  <span class="font-mono font-bold" style="color: var(--text-light)">{{ formatNumber(githubMeta.stars) }}</span>
                </div>
                <div class="flex items-center gap-1.5" style="color: var(--text-muted)">
                  <span class="text-green-400 text-base">⑂</span>
                  <span class="font-mono font-bold" style="color: var(--text-light)">{{ formatNumber(githubMeta.forks) }}</span>
                </div>
                <div class="flex items-center gap-1.5" style="color: var(--text-muted)">
                  <span class="text-blue-400 text-base">👁</span>
                  <span class="font-mono font-bold" style="color: var(--text-light)">{{ formatNumber(githubMeta.watchers) }}</span>
                </div>
              </div>
            </div>

            <div class="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t 2xl:text-base" style="border-color: rgba(168,85,247,0.1)">
              <div v-if="githubMeta.language" class="flex items-center gap-1.5 text-xs 2xl:text-sm">
                <span class="w-2.5 h-2.5 rounded-full" :style="{ background: languageColor(githubMeta.language) }"></span>
                <span style="color: var(--text-muted)">{{ githubMeta.language }}</span>
              </div>
              <div v-if="githubMeta.license" class="flex items-center gap-1.5 text-xs">
                <span style="color: var(--text-muted)">📜</span>
                <span class="font-mono px-2 py-0.5 rounded" style="color: var(--neon-yellow); background: rgba(234,179,8,0.1); border: 1px solid rgba(234,179,8,0.2)">{{ githubMeta.license }}</span>
              </div>
              <div class="flex items-center gap-1.5 text-xs" style="color: var(--text-muted)">
                <span>📅</span>
                <span>{{ formatDate(githubMeta.createdAt) }} 创建</span>
              </div>
              <div class="flex items-center gap-1.5 text-xs" style="color: var(--text-muted)">
                <span>🔄</span>
                <span>{{ formatDate(githubMeta.updatedAt) }} 更新</span>
              </div>
            </div>

            <div v-if="githubMeta.topics.length > 0" class="flex flex-wrap gap-1.5 mt-3 pt-3 border-t" style="border-color: rgba(168,85,247,0.1)">
              <span v-for="topic in githubMeta.topics" :key="topic"
                class="px-2.5 py-0.5 rounded-full text-xs transition-colors"
                style="color: var(--neon-cyan); background: rgba(0,245,255,0.08); border: 1px solid rgba(0,245,255,0.15)">
                {{ topic }}
              </span>
            </div>
          </div>
        </div>
        </div>
      </div>

      <!-- 全屏覆盖层 -->
      <OverviewOverlay v-model="showOverview" :skill="skill" @open="activeOverlay = 'overview'" @close="activeOverlay = ''" @navigate="handleOverlayNavigate">
        <template #right-actions>
          <DetailActions
            :skill="skill"
            :is-admin="isFromAdmin"
            :is-git-hub-skill="isGitHubSkill"
            :liking="liking"
            :like-disabled="likeDisabled"
            :syncing="syncing"
            @like="handleLike"
            @sync="handleSync"
            @edit="showEditor = true"
            @delete="handleDelete"
          />
        </template>
      </OverviewOverlay>
      <GuideOverlay v-model="showGuide" :skill="skill" @open="activeOverlay = 'guide'" @close="activeOverlay = ''" @navigate="handleOverlayNavigate">
        <template #right-actions>
          <DetailActions
            :skill="skill"
            :is-admin="isFromAdmin"
            :is-git-hub-skill="isGitHubSkill"
            :liking="liking"
            :like-disabled="likeDisabled"
            :syncing="syncing"
            @like="handleLike"
            @sync="handleSync"
            @edit="showEditor = true"
            @delete="handleDelete"
          />
        </template>
      </GuideOverlay>
      <FileBrowserOverlay v-model="showFileBrowser" :skill="skill" :is-admin="isFromAdmin" @files-update="handleFilesUpdate" />

      <!-- 编辑器 -->
      <SkillEditor v-model="showEditor" :skill="skill" @save="handleSave" />
    </template>

    <div v-else class="text-center py-20">
      <h2 class="text-2xl font-bold mb-4 text-[var(--text-light)]">未找到技能</h2>
      <router-link to="/skills">
        <el-button type="primary" class="bg-gradient-to-r from-[var(--neon-cyan)] to-[var(--neon-purple)] border-none text-white font-bold">
          返回技能库
        </el-button>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, defineAsyncComponent } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Loading, ArrowLeft, InfoFilled } from '@element-plus/icons-vue'
import { useSkillStore } from '@/stores/skillStore'
import { useAuthStore } from '@/stores/authStore'
import type { GithubMeta, SkillFile } from '@/types'
const SkillEditor = defineAsyncComponent(() => import('@/components/features/SkillEditor.vue'))
import DetailActions from '@/components/features/DetailActions.vue'
import ZipExportBtn from '@/components/features/ZipExportBtn.vue'
import { getLikedSkills, saveLikedSkill, removeLikedSkill } from '@/utils/likedStorage'
import DetailSidebar from '@/components/features/DetailSidebar.vue'
import OverviewOverlay from './components/OverviewOverlay.vue'
import GuideOverlay from './components/GuideOverlay.vue'
import FileBrowserOverlay from './components/FileBrowserOverlay.vue'
import { getSourceLabel } from '@/utils/labels'

const route = useRoute()
const router = useRouter()
const skillStore = useSkillStore()
const authStore = useAuthStore()
const loading = ref(true)
const syncing = ref(false)
const showEditor = ref(false)
const showOverview = ref(false)
const showGuide = ref(false)
const showFileBrowser = ref(false)
const liking = ref(false)
const likeDisabled = ref(false)
const activeOverlay = ref('')

const skill = computed(() => {
  return skillStore.skills.find(sk => sk.id === route.params.id) || null
})

watch(skill, (s) => {
  if (s) {
    liking.value = getLikedSkills().has(s.id)
  }
}, { immediate: true })

const isGitHubSkill = computed(() => {
  return skill.value?.source.type === 'github'
})

const isFromAdmin = computed(() => {
  return route.path.startsWith('/admin') && authStore.isAuthenticated
})

const navItems = computed(() => {
  return [
    { id: 'overview', icon: '📄', label: '简介' },
    { id: 'guide', icon: '📘', label: '指导' },
    { id: 'files', icon: '📂', label: '文件' },
  ]
})

const githubMeta = computed<GithubMeta | null>(() => {
  return skill.value?.source?.githubMeta || null
})

const isGithubDescriptionLong = computed(() => {
  return (githubMeta.value?.description?.length || 0) > 100
})

const hasSubfolder = computed(() => {
  if (!githubMeta.value) return false
  return githubMeta.value.subfolderUrl !== githubMeta.value.repoUrl
})

const subfolderRelative = computed(() => {
  if (!githubMeta.value) return ''
  return githubMeta.value.subfolderUrl
    .replace(githubMeta.value.repoUrl + '/tree/' + githubMeta.value.branch + '/', '')
})

function formatNumber(n: number): string {
  if (n >= 100000) return (n / 1000).toFixed(0) + 'k'
  if (n >= 10000) return (n / 1000).toFixed(1) + 'k'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k'
  return n.toString()
}

function formatDate(d: string): string {
  if (!d) return ''
  const date = new Date(d)
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

function languageColor(lang: string): string {
  const colors: Record<string, string> = {
    TypeScript: '#3178c6',
    JavaScript: '#f1e05a',
    Python: '#3572a5',
    Go: '#00add8',
    Rust: '#dea584',
    Java: '#b07219',
    Ruby: '#701516',
    C: '#555555',
    'C++': '#f34b7d',
    HTML: '#e34c26',
    CSS: '#563d7c',
    Shell: '#89e051',
    Vue: '#41b883',
    Svelte: '#ff3e00',
    Lua: '#000080',
    Swift: '#f05138',
    Kotlin: '#a97bff',
    Dart: '#00b4ab',
    PHP: '#4f5d95'
  }
  return colors[lang] || '#8b8b8b'
}

function openOverlay(id: string) {
  if (id === 'overview') showOverview.value = true
  else if (id === 'guide') showGuide.value = true
  else if (id === 'files') showFileBrowser.value = true
  activeOverlay.value = id
}

function handleOverlayNavigate(id: string) {
  showOverview.value = false
  showGuide.value = false
  showFileBrowser.value = false
  activeOverlay.value = ''
  openOverlay(id)
}

const handleLike = async () => {
  if (!skill.value || likeDisabled.value) return
  likeDisabled.value = true
  try {
    if (liking.value) {
      await skillStore.toggleLike(skill.value.id, true)
      liking.value = false
      removeLikedSkill(skill.value.id)
    } else {
      await skillStore.toggleLike(skill.value.id, false)
      liking.value = true
      saveLikedSkill(skill.value.id)
    }
  } catch {
    // API 失败，不修改本地状态
  } finally {
    likeDisabled.value = false
  }
}

async function handleSync() {
  if (!skill.value || !isFromAdmin.value) return
  syncing.value = true
  try {
    await skillStore.syncGitHubSkill(skill.value.id, true)
    ElMessage.success('同步成功')
  } catch (e) {
    ElMessage.error('同步失败')
  } finally {
    syncing.value = false
  }
}

async function handleSave(updatedSkill: any) {
  if (!isFromAdmin.value) return
  await skillStore.updateSkill(updatedSkill)
  ElMessage.success('技能更新成功')
}

async function handleDelete() {
  if (!isFromAdmin.value) return
  try {
    await ElMessageBox.confirm('确定要删除这个技能吗？', '确认删除', {
      type: 'warning'
    })
    if (skill.value) {
      await skillStore.deleteSkill(skill.value.id)
      ElMessage.success('技能删除成功')
      router.push('/admin')
    }
  } catch (e) {
  }
}

async function handleFilesUpdate(files: SkillFile[]) {
  if (!skill.value || !isFromAdmin.value) return
  await skillStore.updateSkill({ ...skill.value, files })
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    if (showFileBrowser.value) showFileBrowser.value = false
    else if (showGuide.value) showGuide.value = false
    else if (showOverview.value) showOverview.value = false
  }
}

watch(showOverview, (v) => { if (!v) activeOverlay.value = '' })
watch(showGuide, (v) => { if (!v) activeOverlay.value = '' })
watch(showFileBrowser, (v) => { if (!v) activeOverlay.value = '' })

onMounted(async () => {
  if (skillStore.skills.length === 0) {
    await skillStore.loadSkills()
  }
  loading.value = false
  document.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown)
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.sidebar-btn {
  transform-origin: center;
}

.sidebar-btn:hover {
  box-shadow: 0 0 12px rgba(14, 165, 233, 0.2), 0 0 4px rgba(14, 165, 233, 0.1);
}

.sidebar-btn:active {
  transform: scale(0.95);
  box-shadow: none;
}
</style>
