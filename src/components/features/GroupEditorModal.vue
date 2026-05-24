<template>
  <el-dialog
    v-model="visible"
    width="800px"
    :close-on-click-modal="false"
    class="group-editor-dialog"
    destroy-on-close
  >
    <template #header>
      <div class="flex items-center gap-3">
        <span class="text-2xl">{{ group ? '📂' : '✨' }}</span>
        <div>
          <h2 class="text-lg font-bold text-[var(--text-light)]">{{ group ? '编辑分组' : '新建分组' }}</h2>
          <p class="text-xs text-[var(--text-muted)] mt-0.5">
            {{ group ? '修改分组信息和关联技能' : '导入 MD 文件自动生成分组，支持 ZIP/GitHub 批量导入技能' }}
          </p>
        </div>
      </div>
    </template>

    <div class="editor-content">
      <div class="space-y-5">
        <!-- ==================== MD 编辑器（主界面） ==================== -->
        <div class="p-5 bg-[var(--dark-card)] border border-[var(--neon-cyan)]/20 rounded-xl">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2">
              <span class="w-1.5 h-1.5 rounded-full" :class="form.readme.trim() ? 'bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.5)]' : 'bg-gray-500'" />
              <span class="text-xs" :class="form.readme.trim() ? 'text-[var(--neon-cyan)]' : 'text-[var(--text-muted)]'">
                {{ form.readme.trim() ? '正在编辑 · ' + mdFileName : '导入 MD 文件以自动生成分组' }}
              </span>
            </div>
            <div class="flex items-center gap-2">
              <label class="md-import-label">
                <input type="file" accept=".md,.markdown,.txt" @change="handleMdImport" class="hidden" />
                <span class="px-3 py-1.5 bg-[var(--dark-card)] border border-[var(--neon-cyan)]/40 hover:border-[var(--neon-cyan)] text-[var(--text-light)] text-xs rounded-lg transition-all cursor-pointer hover:shadow-[0_0_10px_rgba(0,245,255,0.2)]">
                  📂 导入文件
                </span>
              </label>
              <button v-if="form.readme.trim()"
                @click="clearReadme"
                class="px-3 py-1.5 bg-[var(--dark-card)] border border-red-500/40 hover:border-red-400 text-red-400 text-xs rounded-lg transition-all">
                ✕ 清除
              </button>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="border border-[var(--neon-cyan)]/30 rounded-xl overflow-hidden bg-[var(--dark-bg)]">
              <div class="px-4 py-2.5 border-b border-[var(--neon-cyan)]/20 bg-[var(--dark-card)] flex items-center gap-2">
                <span class="w-1.5 h-1.5 rounded-full bg-[var(--neon-cyan)]" />
                <span class="text-xs text-[var(--neon-cyan)] font-bold">编辑</span>
                <span class="text-xs text-[var(--text-muted)] ml-auto">{{ mdLineCount }} 行</span>
              </div>
              <textarea
                v-model="form.readme"
                class="w-full p-4 font-mono text-sm resize-none bg-transparent outline-none text-[var(--text-light)] placeholder-[var(--text-muted)] leading-relaxed"
                :placeholder="mdPlaceholder"
                rows="14"
                @input="onReadmeInput"
              ></textarea>
            </div>
            <div class="border border-[var(--neon-purple)]/30 rounded-xl overflow-hidden bg-[var(--dark-bg)]">
              <div class="px-4 py-2.5 border-b border-[var(--neon-purple)]/20 bg-[var(--dark-card)] flex items-center gap-2">
                <span class="w-1.5 h-1.5 rounded-full bg-[var(--neon-purple)]" />
                <span class="text-xs text-[var(--neon-purple)] font-bold">预览</span>
              </div>
              <div v-if="form.readme.trim()" class="p-4 overflow-y-auto text-[var(--text-light)] markdown-preview custom-scroll" style="max-height: 328px" v-html="renderMd(form.readme)"></div>
              <div v-else class="p-4 flex items-center justify-center text-[var(--text-muted)] opacity-50" style="height: 328px">
                <span class="text-sm">预览内容将显示在这里</span>
              </div>
            </div>
          </div>
        </div>

        <!-- ==================== 基础信息 ==================== -->
        <div class="p-5 bg-[var(--dark-card)] border border-[var(--neon-purple)]/20 rounded-xl">
          <div class="flex items-center gap-2 mb-4">
            <span class="w-1.5 h-1.5 rounded-full" :class="form.name.trim() ? 'bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.5)]' : 'bg-[var(--neon-purple)]'" />
            <span class="text-xs text-[var(--neon-purple)] font-bold">基础信息</span>
            <span class="text-xs text-[var(--text-muted)] ml-auto">从 MD 自动提取</span>
          </div>
          <div class="space-y-4">
            <div>
              <label class="block text-xs text-[var(--text-muted)] mb-2 font-bold">名称</label>
              <el-input v-model="form.name" placeholder="name: 自动提取，或手动输入" class="cyber-input" />
            </div>
            <div>
              <label class="block text-xs text-[var(--text-muted)] mb-2 font-bold">描述</label>
              <el-input v-model="form.description" type="textarea" :rows="2" placeholder="description: 自动提取，或手动输入" class="cyber-input" />
            </div>
          </div>
        </div>

        <!-- ==================== 关联技能 ==================== -->
        <div class="p-5 bg-[var(--dark-card)] border border-[var(--neon-yellow)]/20 rounded-xl">
          <div class="flex items-center gap-2 mb-4">
            <span class="w-1.5 h-1.5 rounded-full bg-[var(--neon-yellow)]" />
            <span class="text-xs text-[var(--neon-yellow)] font-bold">关联技能</span>
            <span class="text-xs text-[var(--text-muted)] ml-auto">已选 {{ form.skillIds.length }} 个</span>
          </div>
          <el-select
            v-model="form.skillIds"
            multiple
            filterable
            placeholder="搜索并选择要加入分组的技能"
            value-key="value"
            class="cyber-select"
          >
            <el-option
              v-for="s in availableSkills"
              :key="s.id"
              :label="s.name"
              :value="s.id"
            >
              <div class="flex items-center justify-between w-full">
                <span>{{ s.name }}</span>
                <span v-if="s.group && s.group !== form.name" class="text-xs ml-2 px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20">从「{{ s.group }}」移入</span>
              </div>
            </el-option>
          </el-select>

          <div class="mt-5 pt-4 border-t border-[var(--neon-yellow)]/10">
            <div class="flex items-center gap-2 mb-3">
              <span class="w-1.5 h-1.5 rounded-full bg-[var(--neon-cyan)]" />
              <span class="text-xs text-[var(--text-muted)] font-bold">批量导入技能</span>
            </div>
            <div class="flex gap-3">
              <label class="import-btn">
                <input type="file" accept=".zip" @change="handleZipImport" class="hidden" />
                <span class="px-4 py-2 bg-[var(--dark-bg)] border border-[var(--neon-cyan)]/40 hover:border-[var(--neon-cyan)] text-[var(--text-light)] text-xs rounded-lg transition-all cursor-pointer hover:shadow-[0_0_10px_rgba(0,245,255,0.2)] flex items-center gap-2">
                  <span>📦</span> ZIP 导入
                </span>
              </label>
              <button
                @click="toggleGithubPanel"
                class="px-4 py-2 bg-[var(--dark-bg)] border border-[var(--neon-purple)]/40 hover:border-[var(--neon-purple)] text-[var(--text-light)] text-xs rounded-lg transition-all hover:shadow-[0_0_10px_rgba(168,85,247,0.2)] flex items-center gap-2">
                <span>🚀</span> GitHub 导入
              </button>
              <span v-if="importingZip" class="flex items-center gap-1.5 text-xs text-[var(--neon-cyan)]">
                <el-icon class="animate-spin"><Loading /></el-icon>
                解析中...
              </span>
            </div>

            <div v-if="showGithubPanel" class="mt-4 p-4 bg-[var(--dark-bg)] border border-[var(--neon-purple)]/20 rounded-xl">
              <label class="block text-xs text-[var(--text-muted)] mb-3 font-bold">🔗 GitHub 仓库地址</label>
              <div class="flex gap-3">
                <el-input
                  v-model="githubUrl"
                  placeholder="https://github.com/username/repository"
                  class="font-mono flex-1"
                  size="large"
                  @keyup.enter="fetchGithubSkills"
                />
                <el-button
                  :loading="githubLoading"
                  @click="fetchGithubSkills"
                  type="primary"
                  size="large"
                  class="!px-6 !bg-gradient-to-r !from-[var(--neon-cyan)] !to-[var(--neon-purple)] !border-none !text-white !font-bold">
                  {{ githubLoading ? '获取中...' : '获取仓库' }}
                </el-button>
              </div>
              <div v-if="githubErrorMessage" class="mt-2 text-xs text-red-400">{{ githubErrorMessage }}</div>
              <div v-if="githubSkills.length > 0" class="mt-3">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-xs text-[var(--neon-purple)] font-bold">解析到 {{ githubSkills.length }} 个技能</span>
                  <button @click="importAllGithubSkills" :disabled="githubImporting"
                    class="px-3 py-1.5 bg-gradient-to-r from-[var(--neon-cyan)] to-[var(--neon-purple)] text-white text-xs font-bold rounded-lg transition-all hover:shadow-[0_0_10px_rgba(0,245,255,0.3)] disabled:opacity-50">
                    {{ githubImporting ? '导入中...' : '全部导入' }}
                  </button>
                </div>
                <div class="max-h-48 overflow-y-auto space-y-1.5">
                  <div v-for="s in githubSkills" :key="s.name"
                    class="flex items-center justify-between px-3 py-2 rounded-lg bg-[var(--dark-card)] border border-[var(--neon-purple)]/10">
                    <div class="flex items-center gap-2">
                      <div class="w-7 h-7 rounded-lg bg-gradient-to-br from-[var(--neon-purple)] to-[var(--neon-cyan)] flex items-center justify-center text-white text-xs font-black">
                        {{ s.name.charAt(0).toUpperCase() }}
                      </div>
                      <span class="text-sm text-[var(--text-light)]">{{ s.name }}</span>
                    </div>
                    <span v-if="s.tags && s.tags.length" class="text-xs text-[var(--neon-purple)] font-mono">{{ s.tags.slice(0, 3).join(', ') }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-between items-center">
        <span class="text-xs text-[var(--text-muted)]">
          {{ form.skillIds.length > 0 ? `已选择 ${form.skillIds.length} 个技能` : '未选择技能' }}
        </span>
        <div class="flex gap-3">
          <el-button @click="visible = false" size="large"
            class="!bg-[var(--dark-card)] !border !border-gray-600 !text-[var(--text-light)]">
            取消
          </el-button>
          <el-button type="primary" size="large" :disabled="!form.name.trim()" @click="save"
            class="!px-8 !bg-gradient-to-r !from-[var(--neon-purple)] !to-[var(--neon-cyan)] !border-none !text-white !font-bold !font-mono">
            {{ group ? '✦ 保存分组' : '✦ 创建分组' }}
          </el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import MarkdownIt from 'markdown-it'
import { Loading } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useSkillStore } from '@/stores/skillStore'
import { parseSkillFromZip } from '@/utils/skillParser'
import { fetchGitHubRepo, fetchFullSkillFromGitHub } from '@/utils/githubClient'
import type { SkillGroup, Skill } from '@/types'

const md = new MarkdownIt({ html: false, linkify: true, breaks: true })

function renderMd(text: string): string {
  return md.render(text)
}

const skillStore = useSkillStore()

const props = defineProps<{
  modelValue: boolean
  group?: SkillGroup
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'save', group: SkillGroup): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
})

const showGithubPanel = ref(false)
const githubUrl = ref('')
const githubLoading = ref(false)
const githubImporting = ref(false)
const githubErrorMessage = ref('')
const githubSkills = ref<Skill[]>([])
const importingZip = ref(false)
const mdFileName = ref('')
const mdManualEdited = ref(false)

const form = ref({
  name: '',
  description: '',
  readme: '',
  skillIds: [] as string[]
})

const mdPlaceholder = `name: 分组名称
description: 分组描述
## 简介
在此编写详细介绍...

## 技能列表
- 技能A：描述
- 技能B：描述`

const mdLineCount = computed(() => {
  if (!form.value.readme.trim()) return 0
  return form.value.readme.split('\n').length
})

const availableSkills = computed(() => {
  return [...skillStore.skills].sort((a, b) => a.name.localeCompare(b.name))
})

function extractMdMeta(content: string): { title: string; desc: string } {
  const result = { title: '', desc: '' }
  const lines = content.split('\n')

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    if (!result.title) {
      const nameMatch = trimmed.match(/^name:\s*(.+)/i)
      if (nameMatch) {
        result.title = nameMatch[1].trim()
      }
    }

    if (!result.desc) {
      const descMatch = trimmed.match(/^description:\s*(.+)/i)
      if (descMatch) {
        result.desc = descMatch[1].trim()
      }
    }

    if (result.title && result.desc) break
  }

  return result
}

function syncMetaFromReadme() {
  if (mdManualEdited.value) return
  const meta = extractMdMeta(form.value.readme)
  if (meta.title && !form.value.name.trim()) {
    form.value.name = meta.title
  } else if (meta.title) {
    form.value.name = meta.title
  }
  if (meta.desc && !form.value.description.trim()) {
    form.value.description = meta.desc
  } else if (meta.desc) {
    form.value.description = meta.desc
  }
}

function onReadmeInput() {
  setTimeout(syncMetaFromReadme, 0)
}

function handleMdImport(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  mdFileName.value = file.name
  const reader = new FileReader()
  reader.onload = (ev) => {
    const content = ev.target?.result as string || ''
    form.value.readme = content
    mdManualEdited.value = false
    syncMetaFromReadme()
    ElMessage.success(`已导入 ${file.name}，自动提取名称与描述`)
  }
  reader.readAsText(file)
  ;(e.target as HTMLInputElement).value = ''
}

function clearReadme() {
  form.value.readme = ''
  mdFileName.value = ''
  mdManualEdited.value = false
}

async function handleZipImport(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  importingZip.value = true
  try {
    const skill = await parseSkillFromZip(file, file.name)
    skill.group = form.value.name || '待定'
    await skillStore.addSkill(skill)
    if (!form.value.skillIds.includes(skill.id)) {
      form.value.skillIds.push(skill.id)
    }
    ElMessage.success(`已导入技能「${skill.name}」`)
  } catch (err) {
    console.error('ZIP parse error:', err)
    ElMessage.error('ZIP 解析失败，请检查文件格式')
  } finally {
    importingZip.value = false
    ;(e.target as HTMLInputElement).value = ''
  }
}

function toggleGithubPanel() {
  showGithubPanel.value = !showGithubPanel.value
}

async function fetchGithubSkills() {
  if (!githubUrl.value) {
    ElMessage.warning('请输入 GitHub 仓库地址')
    return
  }
  githubLoading.value = true
  githubErrorMessage.value = ''
  githubSkills.value = []
  try {
    const repo = await fetchGitHubRepo(githubUrl.value)
    const skill = await fetchFullSkillFromGitHub(githubUrl.value, repo.default_branch)
    githubSkills.value = [skill]
    ElMessage.success(`成功获取仓库: ${repo.full_name}`)
  } catch (err) {
    console.error('GitHub fetch error:', err)
    githubErrorMessage.value = err instanceof Error ? err.message : '获取仓库失败'
  } finally {
    githubLoading.value = false
  }
}

async function importAllGithubSkills() {
  githubImporting.value = true
  try {
    for (const skill of githubSkills.value) {
      skill.group = form.value.name || '待定'
      await skillStore.addSkill(skill)
      if (!form.value.skillIds.includes(skill.id)) {
        form.value.skillIds.push(skill.id)
      }
    }
    ElMessage.success(`已导入 ${githubSkills.value.length} 个技能`)
    githubSkills.value = []
  } catch (err) {
    ElMessage.error('导入失败')
  } finally {
    githubImporting.value = false
  }
}

watch(() => props.modelValue, (open) => {
  if (open) {
    showGithubPanel.value = false
    githubUrl.value = ''
    githubSkills.value = []
    githubErrorMessage.value = ''
    mdFileName.value = ''
    mdManualEdited.value = false
    if (props.group) {
      form.value = {
        name: props.group.name,
        description: props.group.description,
        readme: props.group.readme || '',
        skillIds: [...(props.group.skillIds || [])]
      }
      if (props.group.readme) {
        mdFileName.value = props.group.name + '.md'
      }
    } else {
      form.value = {
        name: '',
        description: '',
        readme: '',
        skillIds: []
      }
    }
  }
})

function save() {
  const id = props.group?.id || crypto.randomUUID()
  const now = new Date()
  const result: SkillGroup = {
    id,
    name: form.value.name,
    description: form.value.description,
    readme: form.value.readme || undefined,
    iconColor: props.group?.iconColor,
    skillIds: form.value.skillIds,
    createdAt: props.group?.createdAt || now,
    updatedAt: now
  }
  emit('save', result)
  visible.value = false
}
</script>

<style scoped>
.group-editor-dialog :deep(.el-dialog) {
  background-color: var(--dark-bg) !important;
  border: 1px solid rgba(0, 245, 255, 0.15) !important;
  border-radius: 16px !important;
  overflow: hidden;
  display: flex !important;
  flex-direction: column !important;
  max-height: 85vh !important;
}

.group-editor-dialog :deep(.el-dialog__header) {
  background-color: var(--dark-card) !important;
  border-bottom: 1px solid rgba(0, 245, 255, 0.15) !important;
  padding: 20px 24px !important;
  margin: 0 !important;
  flex-shrink: 0 !important;
}

.group-editor-dialog :deep(.el-dialog__body) {
  padding: 0 !important;
  flex: 1 !important;
  min-height: 0 !important;
}

.group-editor-dialog :deep(.el-dialog__footer) {
  background-color: var(--dark-card) !important;
  border-top: 1px solid rgba(0, 245, 255, 0.15) !important;
  padding: 16px 24px !important;
  flex-shrink: 0 !important;
}

.editor-content {
  padding: 24px;
  max-height: 65vh;
  overflow-y: auto;
}

.editor-content::-webkit-scrollbar {
  width: 5px;
}

.editor-content::-webkit-scrollbar-track {
  background: transparent;
}

.editor-content::-webkit-scrollbar-thumb {
  background: rgba(0, 245, 255, 0.15);
  border-radius: 3px;
}

.editor-content::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 245, 255, 0.35);
}

.cyber-input :deep(.el-input__wrapper) {
  background-color: var(--dark-bg) !important;
  border-color: rgba(0, 245, 255, 0.3) !important;
  box-shadow: none !important;
  border-radius: 10px !important;
}

.cyber-input :deep(.el-input__inner) {
  color: var(--text-light) !important;
}

.cyber-input :deep(.el-textarea__inner) {
  background-color: var(--dark-bg) !important;
  border-color: rgba(0, 245, 255, 0.3) !important;
  box-shadow: none !important;
  border-radius: 10px !important;
  color: var(--text-light) !important;
}

.cyber-select :deep(.el-input__wrapper) {
  background-color: var(--dark-bg) !important;
  border-color: rgba(0, 245, 255, 0.3) !important;
  box-shadow: none !important;
  border-radius: 10px !important;
}

.cyber-select :deep(.el-input__inner) {
  color: var(--text-light) !important;
}

.md-import-label {
  display: inline-flex;
  cursor: pointer;
}

.import-btn {
  display: inline-flex;
  cursor: pointer;
}

.markdown-preview {
  font-size: 0.8125rem;
  line-height: 1.7;
  color: var(--text-muted);
}

.markdown-preview :deep(h1),
.markdown-preview :deep(h2),
.markdown-preview :deep(h3) {
  color: var(--text-light);
  margin: 0.75rem 0 0.375rem;
  font-weight: 600;
}

.markdown-preview :deep(h1) { font-size: 1.125rem; }
.markdown-preview :deep(h2) { font-size: 1rem; }
.markdown-preview :deep(h3) { font-size: 0.875rem; }

.markdown-preview :deep(p) { margin: 0.375rem 0; }

.markdown-preview :deep(code) {
  background: rgba(14, 165, 233, 0.1);
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-family: monospace;
  font-size: 0.75rem;
  color: var(--neon-cyan);
}

.markdown-preview :deep(pre) {
  background: rgba(0, 0, 0, 0.3);
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin: 0.5rem 0;
}

.markdown-preview :deep(pre code) {
  background: none;
  padding: 0;
  color: var(--text-muted);
}

.markdown-preview :deep(ul),
.markdown-preview :deep(ol) {
  padding-left: 1.25rem;
  margin: 0.375rem 0;
}

.markdown-preview :deep(a) {
  color: var(--neon-cyan);
  text-decoration: underline;
}

.markdown-preview :deep(blockquote) {
  border-left: 3px solid var(--neon-cyan);
  padding-left: 0.75rem;
  margin: 0.5rem 0;
  color: var(--text-muted);
}

.markdown-preview :deep(table) {
  border-collapse: collapse;
  margin: 0.5rem 0;
  width: 100%;
}

.markdown-preview :deep(th),
.markdown-preview :deep(td) {
  border: 1px solid rgba(14, 165, 233, 0.2);
  padding: 6px 10px;
  text-align: left;
}

.markdown-preview :deep(th) {
  background: rgba(14, 165, 233, 0.1);
  color: var(--neon-cyan);
  font-weight: 600;
}
</style>