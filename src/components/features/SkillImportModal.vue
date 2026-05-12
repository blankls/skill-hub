<template>
  <el-dialog v-model="visible" title="导入技能" width="800px" @close="reset">
    <el-tabs v-model="activeTab">
      <el-tab-pane label="ZIP 文件" name="zip">
        <el-upload
          drag
          accept=".zip"
          :auto-upload="false"
          :on-change="handleZipChange"
          :show-file-list="false"
        >
          <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
          <div class="el-upload__text">拖拽 ZIP 文件到这里，或 <em>点击选择</em></div>
        </el-upload>

        <div v-if="zipPreview" class="mt-4 space-y-4">
          <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded">
            <h4 class="font-semibold text-lg">{{ zipPreview.name }}</h4>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">{{ zipPreview.description }}</p>
            <div class="mt-2 flex gap-2">
              <el-tag v-for="tag in zipPreview.tags" :key="tag">{{ tag }}</el-tag>
            </div>
          </div>

          <div class="p-4 border rounded">
            <h5 class="font-semibold mb-2">文件列表</h5>
            <div class="max-h-40 overflow-y-auto">
              <div v-for="file in zipPreview.files" :key="file.path" class="text-sm py-1 flex items-center gap-2">
                <span class="text-gray-400">📄</span>
                <span>{{ file.path }}</span>
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <el-tab-pane label="编写 SKILL.md" name="md">
        <div class="space-y-2">
          <div class="flex gap-2">
            <el-button size="small" @click="insertTemplate">插入模板</el-button>
          </div>
          <div class="border rounded overflow-hidden">
            <textarea
              v-model="mdContent"
              class="w-full h-80 p-4 font-mono text-sm"
              placeholder="# 技能名称...

## 描述
..."
            ></textarea>
          </div>
        </div>
      </el-tab-pane>

      <el-tab-pane label="GitHub 仓库" name="github">
        <div class="space-y-3">
          <el-input v-model="githubUrl" placeholder="粘贴 GitHub 仓库链接，例如 https://github.com/user/repo" />
          <el-button :loading="githubLoading" @click="fetchGitHub">获取仓库信息</el-button>

          <div v-if="githubMeta" class="p-4 border rounded">
            <h4 class="font-semibold text-lg">{{ githubMeta.full_name }}</h4>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">{{ githubMeta.description }}</p>
            <div class="mt-2 flex gap-4 text-sm text-gray-500">
              <span>⭐ {{ githubMeta.stargazers_count }}</span>
              <span>🍴 {{ githubMeta.forks_count }}</span>
              <span>👁️ {{ githubMeta.subscribers_count }}</span>
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="importing" :disabled="!canImport" @click="doImport">
        导入
      </el-button>
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

简要描述这个技能的功能。

## 版本

1.0.0

## 作者

你的名字

## 标签

- 标签1
- 标签2

## 文件

在此列出相关文件或描述功能。
`

function insertTemplate() {
  mdContent.value = TEMPLATE
}

async function handleZipChange(file: any) {
  try {
    zipPreview.value = await parseSkillFromZip(file.raw)
  } catch (e) {
    console.error('解析 ZIP 失败:', e)
    alert('解析 ZIP 文件失败，请检查格式')
  }
}

async function fetchGitHub() {
  if (!githubUrl.value) return
  githubLoading.value = true
  try {
    githubMeta.value = await fetchGitHubRepo(githubUrl.value)
  } catch (e) {
    alert('获取仓库信息失败，请检查链接')
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
        description: githubMeta.value.description || 'GitHub 仓库技能',
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
