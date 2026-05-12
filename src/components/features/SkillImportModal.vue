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
          <div class="border border-[var(--neon-cyan)]/30 rounded-xl overflow-hidden bg-[var(--dark-bg)]">
            <textarea
              v-model="mdContent"
              class="w-full h-96 p-4 font-mono text-sm resize-none bg-transparent outline-none text-[var(--text-light)] placeholder-[var(--text-muted)]"
              :placeholder="templatePlaceholder"
            ></textarea>
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
import { fetchGitHubRepo } from '@/utils/githubClient'
import type { Skill } from '@/types'
import { UploadFilled } from '@element-plus/icons-vue'

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
const githubLoading = ref(false)
const importing = ref(false)

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
  } catch (e) {
    alert('获取仓库信息失败，请检查URL')
  } finally {
    githubLoading.value = false
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
        files: [
          {
            path: 'README.md',
            name: 'README.md',
            content: `# ${githubMeta.value.name}\n\n${githubMeta.value.description || ''}`,
            language: 'markdown'
          }
        ],
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

function reset() {
  activeTab.value = 'zip'
  zipPreview.value = null
  mdContent.value = ''
  githubUrl.value = ''
  githubMeta.value = null
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
</style>
