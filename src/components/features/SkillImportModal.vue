<template>
  <el-dialog
    v-model="visible"
    width="960px"
    @close="reset"
    :close-on-click-modal="false"
    class="create-skill-dialog"
    destroy-on-close
  >
    <template #header>
      <div class="flex items-center gap-3">
        <span class="text-2xl">✨</span>
        <div>
          <h2 class="text-lg font-bold text-[var(--text-light)]">添加技能</h2>
          <p class="text-xs text-[var(--text-muted)] mt-0.5">通过 ZIP 文件、Markdown 或 GitHub 仓库添加新技能</p>
        </div>
      </div>
    </template>

    <el-tabs v-model="activeTab" class="cyber-tabs">
      <!-- ==================== ZIP 文件导入 ==================== -->
      <el-tab-pane name="zip">
        <template #label>
          <span class="flex items-center gap-2">
            <span class="text-base">📦</span>
            <span>ZIP 文件</span>
          </span>
        </template>
        <div class="tab-content">
          <div v-if="!zipPreview" class="space-y-4">
            <el-upload
              drag
              accept=".zip"
              :auto-upload="false"
              :on-change="handleZipChange"
              :show-file-list="false"
              class="cyber-uploader"
            >
              <div class="flex flex-col items-center py-10">
                <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--neon-cyan)]/20 to-[var(--neon-purple)]/20 border border-[var(--neon-cyan)]/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <el-icon class="text-3xl text-[var(--neon-cyan)]"><UploadFilled /></el-icon>
                </div>
                <div class="text-base text-[var(--text-light)] font-bold">
                  拖拽 ZIP 文件到这里
                </div>
                <div class="text-sm text-[var(--text-muted)] mt-2">
                  或点击选择文件
                </div>
                <div class="mt-4 px-4 py-2 bg-[var(--neon-cyan)]/5 border border-dashed border-[var(--neon-cyan)]/30 rounded-lg">
                  <span class="text-xs text-[var(--text-muted)]">支持包含 skill.json / SKILL.md 的 ZIP 文件</span>
                </div>
              </div>
            </el-upload>
          </div>

          <div v-else class="space-y-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2 text-[var(--neon-cyan)] text-sm">
                <span>✅</span> 文件已解析
              </div>
              <button @click="resetZip" class="text-xs text-[var(--text-muted)] hover:text-[var(--neon-yellow)] transition-colors">
                重新选择 ⟳
              </button>
            </div>

            <div class="p-5 bg-[var(--dark-card)] border border-[var(--neon-cyan)]/30 rounded-xl">
              <div class="flex items-start gap-4">
                <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--neon-cyan)] to-[var(--neon-purple)] flex items-center justify-center text-white text-xl font-black shrink-0">
                  {{ zipPreview.name.charAt(0).toUpperCase() }}
                </div>
                <div class="flex-1 min-w-0">
                  <h4 class="font-bold text-lg text-[var(--text-light)] truncate">{{ zipPreview.name }}</h4>
                  <p class="text-sm text-[var(--text-muted)] mt-1 line-clamp-2">{{ zipPreview.description }}</p>
                  <div class="flex flex-wrap gap-1.5 mt-3">
                    <span v-for="tag in zipPreview.tags" :key="tag"
                      class="px-2.5 py-0.5 bg-[var(--neon-purple)]/15 border border-[var(--neon-purple)]/30 text-[var(--neon-purple)] rounded-full text-xs font-mono">
                      #{{ tag }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div class="p-4 bg-[var(--dark-card)] border border-[var(--neon-cyan)]/20 rounded-xl">
              <div class="flex items-center gap-2 mb-3">
                <span class="text-sm">📋</span>
                <span class="font-bold text-sm text-[var(--text-light)]">文件列表 · {{ zipPreview.files.length }} 个文件</span>
              </div>
              <div class="max-h-52 overflow-y-auto space-y-1 custom-scroll">
                <div v-for="file in zipPreview.files" :key="file.path"
                  class="flex items-center gap-3 p-2.5 rounded-lg hover:bg-[var(--neon-cyan)]/8 transition-colors group">
                  <span class="text-sm">📄</span>
                  <span class="font-mono text-sm text-[var(--text-muted)] flex-1 truncate group-hover:text-[var(--text-light)] transition-colors">{{ file.path }}</span>
                  <span class="text-xs text-[var(--text-muted)] font-mono opacity-0 group-hover:opacity-100 transition-opacity">{{ formatBytes(file.content.length) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- ==================== SKILL.md 编辑器 ==================== -->
      <el-tab-pane name="md">
        <template #label>
          <span class="flex items-center gap-2">
            <span class="text-base">📝</span>
            <span>Markdown</span>
          </span>
        </template>
        <div class="tab-content">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2">
              <div class="w-2 h-2 rounded-full"
                :class="mdContent.trim() ? 'bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.5)]' : 'bg-gray-500'" />
              <span class="text-xs text-[var(--text-muted)]">
                {{ mdContent.trim() ? '正在编辑' : '等待输入' }}
              </span>
            </div>
            <button
              @click="insertTemplate"
              class="px-3 py-1.5 bg-[var(--dark-card)] border border-[var(--neon-yellow)]/40 hover:border-[var(--neon-yellow)] text-[var(--text-light)] text-xs rounded-lg transition-all hover:shadow-[0_0_10px_rgba(234,179,8,0.2)]">
              📋 插入模板
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="border border-[var(--neon-cyan)]/30 rounded-xl overflow-hidden bg-[var(--dark-bg)]">
              <div class="px-4 py-2.5 border-b border-[var(--neon-cyan)]/20 bg-[var(--dark-card)] flex items-center gap-2">
                <span class="w-1.5 h-1.5 rounded-full bg-[var(--neon-cyan)]" />
                <span class="text-xs text-[var(--neon-cyan)] font-bold">编辑</span>
              </div>
              <textarea
                v-model="mdContent"
                class="w-full p-4 font-mono text-sm resize-none bg-transparent outline-none text-[var(--text-light)] placeholder-[var(--text-muted)] leading-relaxed"
                :placeholder="templatePlaceholder"
                rows="18"
              ></textarea>
            </div>
            <div class="border border-[var(--neon-purple)]/30 rounded-xl overflow-hidden bg-[var(--dark-bg)]">
              <div class="px-4 py-2.5 border-b border-[var(--neon-purple)]/20 bg-[var(--dark-card)] flex items-center gap-2">
                <span class="w-1.5 h-1.5 rounded-full bg-[var(--neon-purple)]" />
                <span class="text-xs text-[var(--neon-purple)] font-bold">预览</span>
              </div>
              <div class="p-4 overflow-auto text-[var(--text-light)] markdown-body custom-scroll" style="height: 460px" v-html="renderedMarkdown"></div>
            </div>
          </div>

          <div v-if="mdPreview" class="mt-4 p-5 bg-[var(--dark-card)] border border-[var(--neon-cyan)]/30 rounded-xl">
            <div class="flex items-center gap-2 mb-4">
              <span class="text-sm">🔍</span>
              <span class="font-bold text-sm text-[var(--text-light)]">解析结果</span>
              <span v-if="mdPreview.name" class="ml-auto px-2 py-0.5 bg-green-500/20 border border-green-500/30 text-green-400 text-xs rounded-full">有效</span>
              <span v-else class="ml-auto px-2 py-0.5 bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 text-xs rounded-full">缺少名称</span>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div class="space-y-1">
                <span class="text-xs text-[var(--text-muted)]">名称</span>
                <div class="text-[var(--neon-cyan)] font-mono font-bold">{{ mdPreview.name || '—' }}</div>
              </div>
              <div class="space-y-1">
                <span class="text-xs text-[var(--text-muted)]">版本</span>
                <div class="text-[var(--text-light)] font-mono">{{ mdPreview.version || '—' }}</div>
              </div>
              <div class="space-y-1">
                <span class="text-xs text-[var(--text-muted)]">作者</span>
                <div class="text-[var(--text-light)] font-mono">{{ mdPreview.author || '—' }}</div>
              </div>
            </div>
            <div v-if="mdPreview.tags.length > 0" class="mt-4 pt-3 border-t border-[var(--neon-cyan)]/10">
              <span class="text-xs text-[var(--text-muted)] mr-2">标签</span>
              <span v-for="tag in mdPreview.tags" :key="tag"
                class="inline-block px-2 py-0.5 bg-[var(--neon-purple)]/15 border border-[var(--neon-purple)]/30 text-[var(--neon-purple)] rounded-full text-xs font-mono mr-1.5 mb-1">
                #{{ tag }}
              </span>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- ==================== GitHub 仓库导入 ==================== -->
      <el-tab-pane name="github">
        <template #label>
          <span class="flex items-center gap-2">
            <span class="text-base">🚀</span>
            <span>GitHub</span>
          </span>
        </template>
        <div class="tab-content">
          <div v-if="!githubMeta" class="space-y-4">
            <div class="p-5 bg-[var(--dark-card)] border border-[var(--neon-purple)]/20 rounded-xl">
              <label class="block text-xs text-[var(--text-muted)] mb-3 font-bold">🔗 仓库地址</label>
              <div class="flex gap-3">
                <el-input
                  v-model="githubUrl"
                  placeholder="https://github.com/username/repository"
                  class="font-mono flex-1"
                  size="large"
                  @keyup.enter="fetchGitHub"
                />
                <el-button
                  :loading="githubLoading"
                  @click="fetchGitHub"
                  type="primary"
                  size="large"
                  class="!px-6 !bg-gradient-to-r !from-[var(--neon-cyan)] !to-[var(--neon-purple)] !border-none !text-white !font-bold">
                >
                  {{ githubLoading ? '获取中...' : '获取仓库' }}
                </el-button>
              </div>
              <div class="mt-3 text-xs text-[var(--text-muted)] flex items-center gap-1">
                <span>💡</span> 输入 GitHub 仓库完整 URL，例如 github.com/username/repo
              </div>
            </div>
          </div>

          <div v-else class="space-y-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2 text-[var(--neon-purple)] text-sm">
                <span>✅</span> 仓库已连接
              </div>
              <button @click="resetGitHub"
                class="text-xs text-[var(--text-muted)] hover:text-[var(--neon-yellow)] transition-colors">
                切换仓库 ⟳
              </button>
            </div>

            <div class="p-5 bg-[var(--dark-card)] border border-[var(--neon-purple)]/30 rounded-xl">
              <div class="flex items-start gap-4">
                <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--neon-purple)] to-purple-700 flex items-center justify-center text-white text-lg shrink-0">
                  🚀
                </div>
                <div class="flex-1 min-w-0">
                  <h4 class="font-bold text-lg text-[var(--text-light)] truncate">{{ githubMeta.full_name }}</h4>
                  <p class="text-sm text-[var(--text-muted)] mt-1.5 line-clamp-2">{{ githubMeta.description || '无描述' }}</p>
                  <div class="flex items-center gap-5 mt-3 text-xs">
                    <span class="flex items-center gap-1.5 text-[var(--text-muted)]">
                      <span class="text-yellow-400">⭐</span> {{ githubMeta.stargazers_count }}
                    </span>
                    <span class="flex items-center gap-1.5 text-[var(--text-muted)]">
                      <span class="text-green-400">🍴</span> {{ githubMeta.forks_count }}
                    </span>
                    <span class="flex items-center gap-1.5 text-[var(--text-muted)]">
                      <span class="text-blue-400">👁</span> {{ githubMeta.subscribers_count }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-4 flex-wrap">
              <div class="flex items-center gap-2">
                <span class="text-xs text-[var(--text-muted)]">分支</span>
                <el-select v-model="githubSelectedBranch" size="small" style="width: 160px">
                  <el-option :key="githubMeta.default_branch" :label="githubMeta.default_branch" :value="githubMeta.default_branch" />
                </el-select>
              </div>
              <button
                :disabled="githubFilesLoading"
                @click="loadGitHubFiles"
                class="px-3 py-1.5 bg-[var(--dark-card)] border border-[var(--neon-yellow)]/40 hover:border-[var(--neon-yellow)] text-[var(--text-light)] text-xs rounded-lg transition-all disabled:opacity-50">
                {{ githubFilesLoading ? '加载中...' : '🔄 刷新文件' }}
              </button>
            </div>

            <div v-if="githubSelectedPath || githubFolders.length > 0" class="flex items-center gap-2">
              <span class="text-xs text-[var(--text-muted)]">路径</span>
              <span class="text-sm text-[var(--neon-cyan)] font-mono font-bold">
                /{{ githubSelectedPath || '' }}
              </span>
              <button v-if="githubSelectedPath" @click="goBack"
                class="text-xs text-[var(--neon-yellow)] hover:text-[var(--neon-cyan)] transition-colors ml-1">
                ← 上级
              </button>
            </div>

            <div v-if="githubFolders.length > 0" class="p-4 bg-[var(--dark-card)] border border-[var(--neon-yellow)]/20 rounded-xl">
              <div class="flex items-center gap-2 mb-3">
                <span class="text-sm">📂</span>
                <span class="font-bold text-sm text-[var(--text-light)]">文件夹 · {{ githubFolders.length }}</span>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div v-for="folder in githubFolders" :key="folder.path"
                  @click="navigateToFolder(folder.path)"
                  class="flex items-center gap-2.5 p-3 bg-[var(--dark-bg)] border border-[var(--neon-yellow)]/20 hover:border-[var(--neon-yellow)] hover:bg-[var(--neon-yellow)]/8 rounded-lg cursor-pointer transition-all group">
                  <span class="text-lg group-hover:scale-110 transition-transform">📁</span>
                  <span class="text-sm text-[var(--text-light)] truncate flex-1 group-hover:text-[var(--neon-yellow)] transition-colors">{{ folder.name }}</span>
                  <span class="text-xs text-[var(--neon-yellow)] opacity-0 group-hover:opacity-100 transition-opacity">进入 →</span>
                </div>
              </div>
            </div>

            <div class="p-4 bg-[var(--dark-card)] border border-[var(--neon-cyan)]/20 rounded-xl">
              <div class="flex items-center gap-2 mb-3">
                <span class="text-sm">📄</span>
                <span class="font-bold text-sm text-[var(--text-light)]">
                  文件列表 · {{ githubFiles.length > 20 ? '20+' : githubFiles.length }}
                </span>
              </div>
              <div v-if="githubFiles.length > 0" class="max-h-52 overflow-y-auto space-y-1 custom-scroll">
                <div v-for="file in githubFiles" :key="file.path"
                  class="flex items-center gap-3 p-2.5 rounded-lg hover:bg-[var(--neon-cyan)]/8 transition-colors group">
                  <span class="text-sm">📄</span>
                  <span class="font-mono text-sm text-[var(--text-muted)] flex-1 truncate group-hover:text-[var(--text-light)] transition-colors">{{ file.name }}</span>
                </div>
              </div>
              <div v-else class="text-center py-6 text-sm text-[var(--text-muted)]">
                当前目录下没有文件
              </div>
            </div>

            <div class="p-3 bg-[var(--neon-cyan)]/5 border border-[var(--neon-cyan)]/20 rounded-lg">
              <span class="text-xs text-[var(--text-muted)]">
                💡 点击文件夹进入子目录，导入时将导入当前目录下的所有文件（最多 15 个）
              </span>
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>

    <template #footer>
      <div class="flex justify-between items-center">
        <span class="text-xs text-[var(--text-muted)]">
          {{ statusText }}
        </span>
        <div class="flex gap-3">
          <el-button @click="visible = false" size="large"
            class="!bg-[var(--dark-card)] !border !border-gray-600 !text-[var(--text-light)]">
            取消
          </el-button>
          <el-button type="primary" size="large" :loading="importing" :disabled="!canImport" @click="doImport"
            class="!px-8 !bg-gradient-to-r !from-[var(--neon-cyan)] !to-[var(--neon-purple)] !border-none !text-white !font-bold !font-mono">
            {{ importing ? '添加中...' : '✦ 添加技能' }}
          </el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSkillStore } from '@/stores/skillStore'
import { parseSkillFromZip, parseSkillFromMarkdown } from '@/utils/skillParser'
import { fetchGitHubRepo, fetchGitHubRepoFiles, fetchGitHubFileContent } from '@/utils/githubClient'
import type { Skill, SkillFile } from '@/types'
import { UploadFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'

const md = MarkdownIt({
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang }).value
      } catch (__) {}
    }
    return ''
  }
})

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'imported'): void
}>()

const skillStore = useSkillStore()
const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
})

const activeTab = ref('zip')
const zipPreview = ref<Skill | null>(null)
const mdContent = ref('')
const githubUrl = ref('')
const githubMeta = ref<any>(null)
const githubFiles = ref<any[]>([])
const githubFolders = ref<any[]>([])
const githubSelectedPath = ref('')
const githubSelectedBranch = ref('')
const githubLoading = ref(false)
const githubFilesLoading = ref(false)
const importing = ref(false)

const templatePlaceholder = `# 技能名称

## 描述

简要描述你的技能功能。

## 版本

1.0.0

## 作者

你的名字

## 标签

- 效率
- 自动化

## 文件

在此列出相关文件或描述功能。`

const statusText = computed(() => {
  if (importing.value) return '正在添加技能...'
  if (activeTab.value === 'zip') return zipPreview.value ? `已解析: ${zipPreview.value.name}` : '等待 ZIP 文件'
  if (activeTab.value === 'md') return mdContent.value.trim() ? `已输入 ${mdContent.value.length} 个字符` : '等待编辑 Markdown'
  if (activeTab.value === 'github') return githubMeta.value ? `已连接: ${githubMeta.value.full_name}` : '等待 GitHub 仓库'
  return ''
})

const renderedMarkdown = computed(() => {
  if (!mdContent.value.trim()) return '<span class="text-[var(--text-muted)] text-sm">预览将显示在这里...</span>'
  return md.render(mdContent.value)
})

const mdPreview = computed(() => {
  if (!mdContent.value.trim()) return null
  const lines = mdContent.value.split('\n')
  let name = ''
  let description = ''
  let version = ''
  let author = ''
  let tags: string[] = []
  let currentSection = ''

  for (const line of lines) {
    if (line.startsWith('# ')) {
      name = line.substring(2).trim()
    } else if (line.startsWith('## ')) {
      currentSection = line.substring(3).trim().toLowerCase()
    } else if (currentSection) {
      const trimmedLine = line.trim()
      if (trimmedLine) {
        if (currentSection.includes('描述') || currentSection.includes('description')) {
          description += line + '\n'
        } else if (currentSection.includes('版本') || currentSection.includes('version')) {
          const match = trimmedLine.match(/(\d+\.\d+\.\d+)/)
          if (match) version = match[1]
        } else if (currentSection.includes('作者') || currentSection.includes('author')) {
          author = trimmedLine
        } else if (currentSection.includes('标签') || currentSection.includes('tags')) {
          if (trimmedLine.startsWith('- ')) {
            tags.push(trimmedLine.substring(2).trim())
          } else if (trimmedLine.includes(',')) {
            tags.push(...trimmedLine.split(',').map(t => t.trim()))
          }
        }
      }
    }
  }

  return { name, description: description.trim(), version, author, tags }
})

const canImport = computed(() => {
  if (activeTab.value === 'zip') return !!zipPreview.value
  if (activeTab.value === 'md') return !!mdContent.value.trim()
  if (activeTab.value === 'github') return !!githubMeta.value
  return false
})

const TEMPLATE = `# 技能名称

## 描述

简要描述你的技能功能。

## 版本

1.0.0

## 作者

你的名字

## 标签

- 效率
- 自动化

## 文件

在此列出相关文件或描述功能。
`

function insertTemplate() {
  mdContent.value = TEMPLATE
}

function resetZip() {
  zipPreview.value = null
}

function resetGitHub() {
  githubMeta.value = null
  githubFiles.value = []
  githubFolders.value = []
  githubSelectedPath.value = ''
  githubSelectedBranch.value = ''
  githubUrl.value = ''
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

async function handleZipChange(file: any) {
  try {
    zipPreview.value = await parseSkillFromZip(file.raw, file.name)
    ElMessage.success(`成功解析 ZIP 文件: ${zipPreview.value.name}`)
  } catch (e) {
    console.error('ZIP Parsing Error:', e)
    ElMessage.error('解析 ZIP 文件失败，请检查文件格式')
  }
}

async function fetchGitHub() {
  if (!githubUrl.value) {
    ElMessage.warning('请输入 GitHub 仓库地址')
    return
  }
  githubLoading.value = true
  try {
    githubMeta.value = await fetchGitHubRepo(githubUrl.value)
    githubSelectedBranch.value = githubMeta.value.default_branch
    await loadGitHubFiles()
    ElMessage.success(`成功获取仓库: ${githubMeta.value.full_name}`)
  } catch (e) {
    ElMessage.error('获取仓库信息失败，请检查 URL 是否正确')
  } finally {
    githubLoading.value = false
  }
}

async function loadGitHubFiles(path: string = '') {
  if (!githubMeta.value || !githubUrl.value) return
  githubFilesLoading.value = true
  try {
    const allFiles = await fetchGitHubRepoFiles(githubUrl.value, path, githubSelectedBranch.value)
    githubFiles.value = allFiles.filter((f: any) => f.type === 'file').slice(0, 20)
    githubFolders.value = allFiles.filter((f: any) => f.type === 'dir')
  } catch (e) {
    console.error('Failed to fetch GitHub files:', e)
    ElMessage.error('获取文件列表失败')
  } finally {
    githubFilesLoading.value = false
  }
}

async function navigateToFolder(path: string) {
  githubSelectedPath.value = path
  await loadGitHubFiles(path)
}

function goBack() {
  if (!githubSelectedPath.value) return
  const parts = githubSelectedPath.value.split('/')
  parts.pop()
  const newPath = parts.join('/')
  githubSelectedPath.value = newPath
  loadGitHubFiles(newPath)
}

async function doImport() {
  importing.value = true
  try {
    let skill: Skill
    if (activeTab.value === 'zip' && zipPreview.value) {
      skill = zipPreview.value
    } else if (activeTab.value === 'md') {
      skill = await parseSkillFromMarkdown(mdContent.value)
    } else if (activeTab.value === 'github' && githubMeta.value) {
      const files: SkillFile[] = []

      if (githubSelectedPath.value) {
        const selectedFiles = await fetchGitHubRepoFiles(githubUrl.value, githubSelectedPath.value, githubSelectedBranch.value)
        const targetFiles = selectedFiles.filter((f: any) => f.type === 'file').slice(0, 15)

        for (const file of targetFiles) {
          try {
            const content = await fetchGitHubFileContent(githubUrl.value, file.path, githubSelectedBranch.value)
            files.push({
              path: file.path,
              name: file.name,
              content,
              language: getLanguageFromFilename(file.name)
            })
          } catch (e) {
            console.error(`Failed to fetch ${file.path}:`, e)
          }
        }
      } else {
        for (const file of githubFiles.value.slice(0, 10)) {
          try {
            const content = await fetchGitHubFileContent(githubUrl.value, file.path, githubSelectedBranch.value)
            files.push({
              path: file.path,
              name: file.name,
              content,
              language: getLanguageFromFilename(file.name)
            })
          } catch (e) {
            console.error(`Failed to fetch ${file.path}:`, e)
          }
        }
      }

      const skillName = githubSelectedPath.value
        ? githubSelectedPath.value.split('/').pop() || githubMeta.value.name
        : githubMeta.value.name

      skill = {
        id: crypto.randomUUID(),
        name: skillName,
        description: githubMeta.value.description || 'GitHub Repository Skill',
        version: '1.0.0',
        author: githubMeta.value.full_name.split('/')[0],
        tags: ['github', 'imported'],
        source: {
          type: 'github',
          origin: githubMeta.value.html_url,
          lastSync: new Date()
        },
        files,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    } else {
      throw new Error('请先提供有效的技能数据')
    }

    await skillStore.addSkill(skill)
    ElMessage.success(`技能「${skill.name}」添加成功！`)
    emit('imported')
    visible.value = false
  } catch (e) {
    console.error('添加失败:', e)
    ElMessage.error(`添加失败: ${e instanceof Error ? e.message : '未知错误'}`)
  } finally {
    importing.value = false
  }
}

function getLanguageFromFilename(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || ''
  const map: Record<string, string> = {
    ts: 'typescript', tsx: 'typescript', js: 'javascript', jsx: 'javascript',
    py: 'python', java: 'java', cpp: 'cpp', c: 'c', go: 'go', rs: 'rust',
    rb: 'ruby', php: 'php', html: 'html', css: 'css', md: 'markdown',
    json: 'json', yml: 'yaml', yaml: 'yaml', vue: 'html', svelte: 'html'
  }
  return map[ext] || 'text'
}

function reset() {
  activeTab.value = 'zip'
  zipPreview.value = null
  mdContent.value = ''
  githubUrl.value = ''
  githubMeta.value = null
  githubFiles.value = []
  githubFolders.value = []
  githubSelectedPath.value = ''
  githubSelectedBranch.value = ''
}
</script>

<style scoped>
.create-skill-dialog :deep(.el-dialog) {
  background-color: var(--dark-bg) !important;
  border: 1px solid rgba(0, 245, 255, 0.15) !important;
  border-radius: 16px !important;
  overflow: hidden;
}

.create-skill-dialog :deep(.el-dialog__header) {
  background-color: var(--dark-card) !important;
  border-bottom: 1px solid rgba(0, 245, 255, 0.15) !important;
  padding: 20px 24px !important;
  margin: 0 !important;
}

.create-skill-dialog :deep(.el-dialog__body) {
  padding: 0 !important;
}

.create-skill-dialog :deep(.el-dialog__footer) {
  background-color: var(--dark-card) !important;
  border-top: 1px solid rgba(0, 245, 255, 0.15) !important;
  padding: 16px 24px !important;
}

.cyber-tabs :deep(.el-tabs__header) {
  margin: 0 !important;
  padding: 0 24px !important;
  background-color: var(--dark-bg) !important;
  border-bottom: 1px solid rgba(0, 245, 255, 0.15) !important;
}

.cyber-tabs :deep(.el-tabs__nav-wrap::after) {
  display: none;
}

.cyber-tabs :deep(.el-tabs__item) {
  color: var(--text-muted) !important;
  font-size: 14px !important;
  height: 48px !important;
  line-height: 48px !important;
  padding: 0 20px !important;
  border-bottom: 2px solid transparent !important;
  transition: all 0.2s ease !important;
}

.cyber-tabs :deep(.el-tabs__item:hover) {
  color: var(--neon-cyan) !important;
}

.cyber-tabs :deep(.el-tabs__item.is-active) {
  color: var(--neon-cyan) !important;
  border-bottom-color: var(--neon-cyan) !important;
}

.cyber-tabs :deep(.el-tabs__active-bar) {
  display: none !important;
}

.tab-content {
  padding: 24px;
  min-height: 400px;
}

.cyber-uploader :deep(.el-upload-dragger) {
  background-color: var(--dark-card) !important;
  border: 2px dashed rgba(0, 245, 255, 0.25) !important;
  border-radius: 16px !important;
  transition: all 0.3s ease !important;
}

.cyber-uploader :deep(.el-upload-dragger:hover) {
  border-color: var(--neon-cyan) !important;
  box-shadow: 0 0 30px rgba(0, 245, 255, 0.15) !important;
  background-color: rgba(0, 245, 255, 0.03) !important;
}

.cyber-tabs :deep(.el-input__wrapper) {
  background-color: var(--dark-card) !important;
  border-color: rgba(0, 245, 255, 0.3) !important;
  box-shadow: none !important;
  border-radius: 10px !important;
}

.cyber-tabs :deep(.el-input__inner) {
  color: var(--text-light) !important;
}

.cyber-tabs :deep(.el-select .el-input__wrapper) {
  background-color: var(--dark-card) !important;
  border-color: rgba(0, 245, 255, 0.3) !important;
}

.custom-scroll::-webkit-scrollbar {
  width: 4px;
}

.custom-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scroll::-webkit-scrollbar-thumb {
  background: rgba(0, 245, 255, 0.2);
  border-radius: 2px;
}

.custom-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 245, 255, 0.4);
}

.markdown-body :deep(h1),
.markdown-body :deep(h2),
.markdown-body :deep(h3) {
  color: var(--neon-cyan) !important;
  font-family: 'Courier New', monospace !important;
  margin-top: 16px !important;
  margin-bottom: 8px !important;
}

.markdown-body :deep(h1) { font-size: 22px !important; }
.markdown-body :deep(h2) { font-size: 18px !important; }
.markdown-body :deep(h3) { font-size: 15px !important; }

.markdown-body :deep(p) {
  color: var(--text-light) !important;
  line-height: 1.7 !important;
  margin-bottom: 8px !important;
  font-size: 14px !important;
}

.markdown-body :deep(ul),
.markdown-body :deep(ol) {
  color: var(--text-light) !important;
  padding-left: 20px !important;
  margin-bottom: 8px !important;
}

.markdown-body :deep(li) {
  color: var(--text-light) !important;
  margin-bottom: 4px !important;
  font-size: 14px !important;
}

.markdown-body :deep(strong) {
  color: var(--neon-yellow) !important;
}

.markdown-body :deep(code) {
  font-family: 'Courier New', monospace !important;
  font-size: 13px !important;
  background-color: rgba(0, 245, 255, 0.1) !important;
  padding: 2px 6px !important;
  border-radius: 4px !important;
  color: var(--neon-cyan) !important;
}

.markdown-body :deep(pre) {
  background-color: var(--dark-card) !important;
  padding: 12px !important;
  border-radius: 8px !important;
  overflow-x: auto !important;
  border: 1px solid rgba(0, 245, 255, 0.2) !important;
}

.markdown-body :deep(.hljs) {
  background-color: transparent !important;
}
</style>
