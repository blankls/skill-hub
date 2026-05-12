<template>
  <el-dialog v-model="visible" title="导入技能" width="600px" @close="reset">
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
        <div v-if="zipPreview" class="mt-4 p-4 bg-gray-50 rounded">
          <h4 class="font-semibold">{{ zipPreview.name }}</h4>
          <p class="text-sm text-gray-600">{{ zipPreview.description }}</p>
        </div>
      </el-tab-pane>

      <el-tab-pane label="SKILL.md" name="md">
        <el-input
          v-model="mdContent"
          type="textarea"
          :rows="15"
          placeholder="粘贴或编写 SKILL.md 内容..."
        />
      </el-tab-pane>

      <el-tab-pane label="GitHub 仓库" name="github">
        <el-input v-model="githubUrl" placeholder="粘贴 GitHub 仓库链接..." />
        <el-button class="mt-2" :loading="githubLoading" @click="fetchGitHub">获取元数据</el-button>
        <div v-if="githubMeta" class="mt-4 p-4 bg-gray-50 rounded">
          <h4 class="font-semibold">{{ githubMeta.full_name }}</h4>
          <p class="text-sm text-gray-600">{{ githubMeta.description }}</p>
          <p class="text-xs text-gray-500 mt-2">⭐ {{ githubMeta.stargazers_count }} | 🍴 {{ githubMeta.forks_count }}</p>
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

async function handleZipChange(file: any) {
  try {
    zipPreview.value = await parseSkillFromZip(file.raw)
  } catch (e) {
    console.error('解析 ZIP 失败:', e)
  }
}

async function fetchGitHub() {
  if (!githubUrl.value) return
  githubLoading.value = true
  try {
    githubMeta.value = await fetchGitHubRepo(githubUrl.value)
  } catch (e) {
    alert('获取仓库信息失败')
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
        description: githubMeta.value.description,
        version: '1.0.0',
        author: githubMeta.value.full_name.split('/')[0],
        tags: ['github'],
        source: { type: 'github', origin: githubMeta.value.html_url },
        files: [],
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
