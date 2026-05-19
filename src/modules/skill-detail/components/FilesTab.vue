<template>
  <div class="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
    <div class="col-span-1 md:col-span-1">
      <div class="rounded-xl p-4 border border-[var(--neon-cyan)]/20 max-h-[40vh] md:max-h-none overflow-y-auto" style="background: var(--dark-card)">
        <h3 class="font-semibold mb-4" style="color: var(--text-light)">
          📁 文件树 · {{ skill.files.length }}
        </h3>
        <div v-if="skill.files && skill.files.length > 0">
          <div class="space-y-0.5">
            <template v-for="node in tree" :key="node._key">
              <!-- 所有节点都需要检查可见性 -->
              <template v-if="isNodeVisible(node)">
                <!-- 文件夹节点 -->
                <div
                  v-if="node._isFolder"
                  @click="toggleFolder(node._key)"
                  class="tree-item cursor-pointer transition-colors text-sm flex items-center gap-1.5"
                  :style="{ paddingLeft: (node._depth * 16 + 8) + 'px', color: 'var(--text-muted)' }"
                >
                  <span class="text-xs transition-transform duration-200" :style="{ transform: expandedFolders.includes(node._key) ? 'rotate(90deg)' : 'rotate(0deg)' }">▶</span>
                  <span class="mr-0.5">{{ expandedFolders.includes(node._key) ? '📂' : '📁' }}</span>
                  <span class="hover:text-[var(--neon-cyan)] transition-colors">{{ node.name }}</span>
                </div>
                <!-- 文件节点 -->
                <div
                  v-else
                  @click="selectFile(node)"
                  class="tree-item cursor-pointer transition-colors text-sm flex items-center gap-1.5"
                  :style="{ paddingLeft: (node._depth * 16 + 24) + 'px', color: selectedPath === node.path ? 'var(--neon-cyan)' : 'var(--text-muted)' }"
                >
                  <span class="mr-0.5">📄</span>
                  <span class="hover:text-[var(--neon-cyan)] transition-colors">{{ node.name }}</span>
                </div>
              </template>
            </template>
          </div>
        </div>
        <div v-else class="text-center py-10" style="color: var(--text-muted)">
          暂无文件
        </div>
      </div>
    </div>
    <div class="col-span-1 md:col-span-3">
      <div v-if="selectedFile" class="rounded-xl overflow-hidden border border-[var(--neon-purple)]/20" style="background: var(--dark-card)">
        <div class="px-4 py-2.5 border-b" style="border-color: rgba(168,85,247,0.15); background: rgba(14,165,233,0.05); display: flex; align-items: center; gap: 8px;">
          <span style="color: var(--neon-cyan)">📄</span>
          <span class="font-mono text-sm" style="color: var(--text-light)">{{ selectedFile.path }}</span>
          <span class="ml-auto text-xs rounded px-2 py-0.5 font-mono" :style="{ color: 'var(--neon-cyan)', background: 'rgba(14,165,233,0.1)' }">{{ selectedFile.language || 'text' }}</span>
        </div>
        <pre class="p-4 overflow-auto m-0 text-sm leading-relaxed custom-scroll" style="color: var(--text-light); background: var(--dark-bg); max-height: 65vh" v-html="highlightedContent"></pre>
      </div>
      <div v-else class="rounded-xl p-8 border border-[var(--neon-cyan)]/15 text-center" style="background: var(--dark-card); color: var(--text-muted)">
        <div class="text-4xl mb-3">📂</div>
        <p>请从左侧选择一个文件查看</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css'
import type { Skill, SkillFile } from '@/types'

interface Props {
  skill: Skill
}

interface TreeNode {
  path: string
  name: string
  _isFolder: boolean
  _depth: number
  _key: string
  _children?: TreeNode[]
  _file?: SkillFile
}

const props = defineProps<Props>()
const selectedPath = ref<string | null>(null)
const expandedFolders = ref<string[]>([])

function buildTree(files: SkillFile[]): TreeNode[] {
  const root: Record<string, any> = {}

  for (const file of files) {
    const parts = file.path.split('/')
    let current = root
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      const isLast = i === parts.length - 1
      const fullPath = parts.slice(0, i + 1).join('/')

      if (!current[part]) {
        current[part] = {
          name: part,
          path: fullPath,
          _depth: i,
          _key: fullPath,
          _isFolder: !isLast,
          _children: isLast ? undefined : {},
          _file: isLast ? file : undefined
        }
      }
      if (!isLast) {
        current = current[part]._children
      }
    }
  }

  function flatten(obj: Record<string, any>): TreeNode[] {
    const result: TreeNode[] = []
    const keys = Object.keys(obj).sort()
    // 先处理文件夹，再处理文件，确保层级正确
    const folders = keys.filter(k => obj[k]._isFolder)
    const filesOnly = keys.filter(k => !obj[k]._isFolder)
    
    for (const key of folders) {
      result.push(obj[key])
      if (obj[key]._children) {
        result.push(...flatten(obj[key]._children))
      }
    }
    for (const key of filesOnly) {
      result.push(obj[key])
    }
    return result
  }

  return flatten(root)
}

const tree = computed(() => buildTree(props.skill.files))

// 构建嵌套的树形结构用于递归查找子文件夹
const folderTree = computed(() => {
  const root: Record<string, any> = {}
  for (const file of props.skill.files) {
    const parts = file.path.split('/')
    let current = root
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      const isLast = i === parts.length - 1
      const fullPath = parts.slice(0, i + 1).join('/')
      
      if (!isLast) {
        if (!current[part]) {
          current[part] = { children: {} }
        }
        current = current[part].children
      }
    }
  }
  return root
})

const selectedFile = computed(() => {
  if (!selectedPath.value) return null
  return props.skill.files.find(f => f.path === selectedPath.value) || null
})

const highlightedContent = computed(() => {
  if (!selectedFile.value) return ''
  const lang = selectedFile.value.language || 'text'
  try {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(selectedFile.value.content, { language: lang }).value
    }
  } catch (__) {}
  return hljs.highlightAuto(selectedFile.value.content).value
})

// 递归收集所有子文件夹路径
function collectChildFolders(folderObj: Record<string, any>, parentPath: string, result: string[]) {
  for (const key of Object.keys(folderObj)) {
    const childPath = parentPath ? `${parentPath}/${key}` : key
    result.push(childPath)
    if (folderObj[key].children) {
      collectChildFolders(folderObj[key].children, childPath, result)
    }
  }
}

function toggleFolder(key: string) {
  const index = expandedFolders.value.indexOf(key)
  if (index > -1) {
    // 收起时：递归移除所有子文件夹
    const childFolders: string[] = []
    
    // 在 folderTree 中找到当前节点并收集子文件夹
    const parts = key.split('/')
    let current = folderTree.value
    let found = true
    for (let i = 0; i < parts.length; i++) {
      if (current[parts[i]]) {
        if (i < parts.length - 1) {
          current = current[parts[i]].children
        } else {
          // 找到了目标节点，收集子文件夹
          collectChildFolders(current[parts[i]].children, key, childFolders)
        }
      } else {
        found = false
        break
      }
    }
    
    // 移除当前文件夹和所有子文件夹
    const toRemove = new Set([key, ...childFolders])
    expandedFolders.value = expandedFolders.value.filter(path => !toRemove.has(path))
  } else {
    // 展开时：只添加当前文件夹
    expandedFolders.value.push(key)
  }
}

function isNodeVisible(node: TreeNode): boolean {
  // 根节点总是可见
  if (node._depth === 0) return true
  // 检查所有父文件夹是否都展开
  const parts = node.path.split('/')
  parts.pop() // 移除当前节点
  for (let i = parts.length; i > 0; i--) {
    const parentKey = parts.slice(0, i).join('/')
    if (!expandedFolders.value.includes(parentKey)) {
      return false
    }
  }
  return true
}

function selectFile(node: TreeNode) {
  if (!node._isFolder) {
    selectedPath.value = node.path
  }
}
</script>

<style scoped>
.custom-scroll::-webkit-scrollbar { width: 5px }
.custom-scroll::-webkit-scrollbar-track { background: transparent }
.custom-scroll::-webkit-scrollbar-thumb { background: rgba(14, 165, 233, 0.2); border-radius: 3px }
.custom-scroll::-webkit-scrollbar-thumb:hover { background: rgba(14, 165, 233, 0.4) }

.tree-item {
  padding: 4px 8px;
  border-radius: 6px;
  display: flex;
}
.tree-item:hover {
  background: rgba(14, 165, 233, 0.08);
}
</style>
