<template>
  <el-dialog
    v-model="visible"
    :title="title"
    width="900px"
    @close="reset"
    class="skill-import-dialog"
    :close-on-click-modal="false"
  >
    <el-tabs v-model="activeTab" class="cyber-tabs">
      <!-- ZIP File Import -->
      <el-tab-pane label="[ZIP文件]" name="zip">
        <div class="p-4">
          <el-upload
            drag
            accept=".zip"
            :auto-upload="false"
            :on-change="handleZipChange"
            :show-file-list="false"
            class="cyber-uploader"
          >
            <div class="flex flex-col items-center py-8">
              <el-icon class="text-6xl mb-4 text-[var(--neon-cyan)] animate-pulse">
                <UploadFilled />
              </el-icon>
              <div class="text-lg font-mono text-[var(--text-light)]">
                > 拖拽ZIP文件到这里
              </div>
              <div class="text-sm text-[var(--text-muted)] mt-2 font-mono">
                或者点击选择
              </div>
            </div>
          </el-upload>

          <!-- ZIP Preview -->
          <div v-if="zipPreview" class="mt-6 space-y-4">
            <div class="p-6 bg-[var(--dark-card)] border border-[var(--neon-cyan)]/30 rounded-xl">
              <div class="flex items-center gap-3 mb-4">
                <span class="text-2xl">📦</span>
                <h4 class="font-bold text-xl text-[var(--text-light)] font-mono">{{ zipPreview.name }}</h4>
              </div>
              <p class="text-[var(--text-muted)] mb-4">{{ zipPreview.description }}</p>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="tag in zipPreview.tags"
                  :key="tag"
                  class="px-3 py-1 bg-[var(--neon-purple)]/20 border border-[var(--neon-purple)]/30 text-[var(--neon-purple)] rounded-full text-xs font-mono"
                >
                  #{{ tag }}
                </span>
              </div>
            </div>

            <!-- File List -->
            <div class="p-4 bg-[var(--dark-card)] border border-[var(--neon-cyan)]/20 rounded-xl">
              <h5 class="font-bold mb-4 text-[var(--text-light)] font-mono flex items-center gap-2">
                <span>📋</span> 文件列表: {{ zipPreview.files.length }} 个文件
              </h5>
              <div class="max-h-48 overflow-y-auto space-y-1">
                <div
                  v-for="file in zipPreview.files"
                  :key="file.path"
                  class="flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--neon-cyan)]/10"
                >
                  <span class="text-[var(--neon-yellow)]">📄</span>
                  <span class="font-mono text-sm text-[var(--text-muted)]">{{ file.path }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- SKILL.md Editor -->
      <el-tab-pane label="[编辑SKILL.md]" name="md">
        <div class="p-4">
          <div class="flex justify-between items-center mb-4">
            <span class="text-[var(--text-muted)] font-mono text-sm">> 使用Markdown创建技能</span>
            <el-button
              size="small"
              @click="insertTemplate"
              class="bg-[var(--dark-card)] border border-[var(--neon-yellow)]/50 hover:border-[var(--neon-yellow)] text-[var(--text-light)] font-mono"
            >
              插入模板
            </el-button>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="border border-[var(--neon-cyan)]/30 rounded-xl overflow-hidden bg-[var(--dark-bg)]">
              <div class="px-4 py-2 border-b border-[var(--neon-cyan)]/20 text-[var(--text-muted)] font-mono text-xs">
                📝 编辑
              </div>
              <textarea
                v-model="mdContent"
                class="w-full h-96 p-4 font-mono text-sm resize-none bg-transparent outline-none text-[var(--text-light)] placeholder-[var(--text-muted)]"
                :placeholder="templatePlaceholder"
              ></textarea>
            </div>
            <div class="border border-[var(--neon-purple)]/30 rounded-xl overflow-hidden bg-[var(--dark-bg)]">
              <div class="px-4 py-2 border-b border-[var(--neon-purple)]/20 text-[var(--text-muted)] font-mono text-xs">
                👀 预览
              </div>
              <div class="p-4 h-96 overflow-auto text-[var(--text-light)]" v-html="renderedMarkdown"></div>
            </div>
          </div>
          <!-- 实时提取的信息 -->
          <div v-if="mdPreview" class="mt-4 p-4 bg-[var(--dark-card)] border border-[var(--neon-cyan)]/30 rounded-xl">
            <h4 class="font-bold mb-3 text-[var(--text-light)] font-mono flex items-center gap-2">
              <span>📋</span> 提取的信息
            </h4>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span class="text-[var(--neon-cyan)] font-mono">名称:</span>
                <span class="text-[var(--text-light)] font-mono ml-2">{{ mdPreview.name || '-' }}</span>
              </div>
              <div>
                <span class="text-[var(--neon-purple)] font-mono">版本:</span>
                <span class="text-[var(--text-light)] font-mono ml-2">{{ mdPreview.version || '-' }}</span>
              </div>
              <div>
                <span class="text-[var(--neon-yellow)] font-mono">作者:</span>
                <span class="text-[var(--text-light)] font-mono ml-2">{{ mdPreview.author || '-' }}</span>
              </div>
            </div>
            <div v-if="mdPreview.tags.length > 0" class="mt-3">
              <span class="text-[var(--text-muted)] font-mono text-xs mr-2">标签:</span>
              <span v-for="tag in mdPreview.tags" :key="tag" class="px-2 py-1 bg-[var(--neon-purple)]/20 border border-[var(--neon-purple)]/30 text-[var(--neon-purple)] rounded-full text-xs font-mono mr-2">
                #{{ tag }}
              </span>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- GitHub Import -->
      <el-tab-pane label="[GitHub仓库]" name="github">
        <div class="p-4">
          <div class="space-y-4">
            <div>
              <label class="block text-[var(--text-muted)] font-mono text-sm mb-2">> 仓库地址</label>
              <el-input
                v-model="githubUrl"
                placeholder="https://github.com/username/repository"
                class="font-mono"
              />
            </div>
            <el-button
              :loading="githubLoading"
              @click="fetchGitHub"
              class="bg-gradient-to-r from-[var(--neon-cyan)] to-[var(--neon-purple)] border-none text-white font-bold font-mono"
            >
              获取仓库
            </el-button>

            <!-- GitHub Preview -->
            <div v-if="githubMeta" class="p-6 bg-[var(--dark-card)] border border-[var(--neon-purple)]/30 rounded-xl">
              <div class="flex items-center gap-3 mb-4">
                <span class="text-2xl">🚀</span>
                <h4 class="font-bold text-xl text-[var(--text-light)] font-mono">{{ githubMeta.full_name }}</h4>
              </div>
              <p class="text-[var(--text-muted)] mb-4">{{ githubMeta.description }}</p>
              
              <!-- 分支选择 -->
              <div class="mb-4">
                <label class="block text-[var(--text-muted)] font-mono text-sm mb-2">> 分支</label>
                <div class="flex items-center gap-3">
                  <el-select
                    v-model="githubSelectedBranch"
                    placeholder="选择分支"
                    style="min-width: 200px; --el-select-bg-color: var(--dark-bg); --el-select-border-color: rgba(0, 245, 255, 0.3);"
                  >
                    <el-option :key="githubMeta.default_branch" :label="githubMeta.default_branch" :value="githubMeta.default_branch" />
                  </el-select>
                  <el-button
                    :loading="githubFilesLoading"
                    size="small"
                    @click="loadGitHubFiles"
                    class="bg-[var(--dark-card)] border border-[var(--neon-yellow)]/50 hover:border-[var(--neon-yellow)] text-[var(--text-light)] font-mono"
                  >
                    刷新文件
                  </el-button>
                </div>
              </div>
              
              <div class="flex items-center gap-6 text-sm text-[var(--text-muted)]">
                <span class="flex items-center gap-2">
                  <span class="text-yellow-400">⭐</span>
                  <span class="font-mono">{{ githubMeta.stargazers_count }}</span>
                </span>
                <span class="flex items-center gap-2">
                  <span class="text-green-400">🍴</span>
                  <span class="font-mono">{{ githubMeta.forks_count }}</span>
                </span>
                <span class="flex items-center gap-2">
                  <span class="text-blue-400">👁️</span>
                  <span class="font-mono">{{ githubMeta.subscribers_count }}</span>
                </span>
              </div>
              
              <!-- 文件列表预览 -->
              <div v-if="githubFiles.length > 0" class="mt-4">
                <h5 class="font-bold mb-3 text-[var(--text-light)] font-mono flex items-center gap-2">
                  <span>📁</span> 文件列表 (最多导入10个)
                </h5>
                <div class="max-h-40 overflow-y-auto space-y-2">
                  <div v-for="file in githubFiles" :key="file.path" class="px-3 py-2 bg-[var(--dark-bg)] border border-[var(--neon-cyan)]/20 rounded-lg text-sm text-[var(--text-light)] font-mono flex items-center gap-2">
                    <span>📄</span>
                    <span class="truncate flex-1">{{ file.name }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>

    <template #footer>
      <div class="flex justify-end gap-3">
        <el-button @click="visible = false" class="bg-[var(--dark-card)] border border-gray-600 text-[var(--text-light)] font-mono">
          取消
        </el-button>
        <el-button
          type="primary"
          :loading="importing"
          :disabled="!canImport"
          class="bg-gradient-to-r from-[var(--neon-cyan)] to-[var(--neon-purple)] border-none text-white font-bold font-mono"
          @click="doImport"
        >
          导入技能
        </el-button>
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
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'

// 初始化 markdown-it 渲染器
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

const title = computed(() => '> 导入新技能')

const templatePlaceholder = `# 技能名称
## 描述
在此描述你的技能...
## 版本
1.0.0
## 作者
你的名字
## 标签
- 标签1
- 标签2
## 文件
文件描述...`

const activeTab = ref('zip')
const zipPreview = ref<Skill | null>(null)
const mdContent = ref('')
const githubUrl = ref('')
const githubMeta = ref<any>(null)
const githubFiles = ref<any[]>([])
const githubSelectedBranch = ref('')
const githubLoading = ref(false)
const githubFilesLoading = ref(false)
const importing = ref(false)

// Markdown 渲染和预览
const renderedMarkdown = computed(() => {
  if (!mdContent.value.trim()) return '<span class="text-[var(--text-muted)]">暂无内容</span>'
  return md.render(mdContent.value)
})

// 实时提取的信息预览
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
    } else if (description === '' && line.trim() && !line.startsWith('#')) {
      description += line + '\n'
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

async function handleZipChange(file: any) {
  try {
    zipPreview.value = await parseSkillFromZip(file.raw, file.name)
  } catch (e) {
    console.error('ZIP Parsing Error:', e)
    alert('解析ZIP文件失败！\n\n支持的格式：\n- 包含 skill.json\n- 包含 SKILL.md\n- 或包含任意文件（将从文件名推断技能名）\n\n请检查文件格式后重试。')
  }
}

async function fetchGitHub() {
  if (!githubUrl.value) return
  githubLoading.value = true
  try {
    githubMeta.value = await fetchGitHubRepo(githubUrl.value)
    githubSelectedBranch.value = githubMeta.value.default_branch
    // 自动加载文件列表
    await loadGitHubFiles()
  } catch (e) {
    alert('获取仓库信息失败，请检查URL')
  } finally {
    githubLoading.value = false
  }
}

async function loadGitHubFiles() {
  if (!githubMeta.value || !githubUrl.value) return
  githubFilesLoading.value = true
  try {
    const files = await fetchGitHubRepoFiles(githubUrl.value, '', githubSelectedBranch.value)
    // 只保留文件，过滤目录，只取前20个文件
    githubFiles.value = files
      .filter((f: any) => f.type === 'file')
      .slice(0, 20)
  } catch (e) {
    console.error('Failed to fetch GitHub files:', e)
  } finally {
    githubFilesLoading.value = false
  }
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
      // 拉取真正的文件内容
      const files: SkillFile[] = []
      
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
      
      skill = {
        id: crypto.randomUUID(),
        name: githubMeta.value.name,
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
      throw new Error('No valid input')
    }
    await skillStore.addSkill(skill)
    emit('imported')
    visible.value = false
  } finally {
    importing.value = false
  }
}

function getLanguageFromFilename(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || ''
  const map: Record<string, string> = {
    ts: 'typescript',
    tsx: 'typescript',
    js: 'javascript',
    jsx: 'javascript',
    py: 'python',
    java: 'java',
    cpp: 'cpp',
    c: 'c',
    go: 'go',
    rs: 'rust',
    rb: 'ruby',
    php: 'php',
    html: 'html',
    css: 'css',
    md: 'markdown',
    json: 'json',
    yml: 'yaml',
    yaml: 'yaml'
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
  githubSelectedBranch.value = ''
}
</script>

<style scoped>
/* Dialog Override */
.skill-import-dialog :deep(.el-dialog) {
  background-color: var(--dark-bg) !important;
  border: 1px solid rgba(0, 245, 255, 0.2) !important;
}

.skill-import-dialog :deep(.el-dialog__header) {
  border-bottom: 1px solid rgba(0, 245, 255, 0.2) !important;
}

.skill-import-dialog :deep(.el-dialog__title) {
  color: var(--neon-cyan) !important;
  font-family: 'Courier New', monospace !important;
  font-weight: bold !important;
}

.skill-import-dialog :deep(.el-dialog__footer) {
  border-top: 1px solid rgba(0, 245, 255, 0.2) !important;
}

/* Tabs Override */
.cyber-tabs :deep(.el-tabs__header) {
  border-color: rgba(0, 245, 255, 0.2) !important;
  margin: 0 !important;
}

.cyber-tabs :deep(.el-tabs__item) {
  color: var(--text-muted) !important;
  font-family: 'Courier New', monospace !important;
  font-size: 14px !important;
}

.cyber-tabs :deep(.el-tabs__item.is-active) {
  color: var(--neon-cyan) !important;
}

.cyber-tabs :deep(.el-tabs__active-bar) {
  background-color: var(--neon-cyan) !important;
}

/* Uploader Override */
.cyber-uploader :deep(.el-upload-dragger) {
  background-color: var(--dark-card) !important;
  border: 2px dashed rgba(0, 245, 255, 0.3) !important;
  transition: all 0.3s ease !important;
}

.cyber-uploader :deep(.el-upload-dragger:hover) {
  border-color: var(--neon-cyan) !important;
  box-shadow: 0 0 20px rgba(0, 245, 255, 0.2) !important;
}

/* Input Override */
.cyber-tabs :deep(.el-input__wrapper) {
  background-color: var(--dark-card) !important;
  border-color: rgba(0, 245, 255, 0.3) !important;
  box-shadow: none !important;
}

.cyber-tabs :deep(.el-input__inner) {
  color: var(--text-light) !important;
  font-family: 'Courier New', monospace !important;
}

/* Markdown Preview Styles */
.skill-import-dialog :deep(.hljs) {
  background-color: var(--dark-bg) !important;
}

.skill-import-dialog :deep(pre) {
  background-color: var(--dark-card) !important;
  padding: 12px !important;
  border-radius: 6px !important;
  overflow-x: auto !important;
  border: 1px solid rgba(0, 245, 255, 0.2) !important;
}

.skill-import-dialog :deep(code) {
  font-family: 'Courier New', monospace !important;
  font-size: 13px !important;
}

.skill-import-dialog :deep(h1),
.skill-import-dialog :deep(h2),
.skill-import-dialog :deep(h3),
.skill-import-dialog :deep(h4) {
  color: var(--neon-cyan) !important;
  font-family: 'Courier New', monospace !important;
  margin-top: 16px !important;
  margin-bottom: 8px !important;
}

.skill-import-dialog :deep(p) {
  color: var(--text-light) !important;
  line-height: 1.6 !important;
  margin-bottom: 8px !important;
}

.skill-import-dialog :deep(ul),
.skill-import-dialog :deep(ol) {
  color: var(--text-light) !important;
  padding-left: 20px !important;
  margin-bottom: 8px !important;
}

.skill-import-dialog :deep(li) {
  color: var(--text-light) !important;
  margin-bottom: 4px !important;
}
</style>
