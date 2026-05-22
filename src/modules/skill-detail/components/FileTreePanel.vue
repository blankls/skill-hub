<template>
  <div class="h-full min-h-0 flex flex-col rounded-xl overflow-hidden border border-[var(--neon-cyan)]/20" style="background: var(--dark-card)">
    <div class="flex-shrink-0 px-3 py-2.5 border-b flex items-center gap-1.5 flex-wrap" style="border-color: rgba(0,245,255,0.15)">
      <span class="font-semibold text-sm" style="color: var(--text-light)">
        📁 文件树 · {{ activeFileCount }}
      </span>
      <div class="flex-1"></div>
      <template v-if="isAdmin">
        <el-popover
          v-model:visible="filePopoverVisible"
          :width="260"
          placement="bottom"
          trigger="click"
        >
          <template #reference>
            <button
              class="toolbar-btn text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1"
              style="color: var(--neon-cyan)"
              @click="openPopover('file')"
            >
              <el-icon :size="14"><Plus /></el-icon> 文件
            </button>
          </template>
          <div class="flex flex-col gap-2">
            <span class="text-xs" style="color: var(--text-muted)">新建路径：{{ newItemParentPath || '根目录' }}</span>
            <el-input
              v-model="newItemName"
              placeholder="index.ts"
              size="small"
              @keyup.enter="handleCreateItem('file')"
            />
            <div class="flex justify-end gap-2">
              <el-button size="small" @click="filePopoverVisible = false">取消</el-button>
              <el-button size="small" type="primary" @click="handleCreateItem('file')" :disabled="!newItemName.trim()">创建</el-button>
            </div>
          </div>
        </el-popover>
        <el-popover
          v-model:visible="folderPopoverVisible"
          :width="260"
          placement="bottom"
          trigger="click"
        >
          <template #reference>
            <button
              class="toolbar-btn text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1"
              style="color: var(--neon-purple)"
              @click="openPopover('folder')"
            >
              <el-icon :size="14"><Plus /></el-icon> 文件夹
            </button>
          </template>
          <div class="flex flex-col gap-2">
            <span class="text-xs" style="color: var(--text-muted)">新建路径：{{ newItemParentPath || '根目录' }}</span>
            <el-input
              v-model="newItemName"
              placeholder="components"
              size="small"
              @keyup.enter="handleCreateItem('folder')"
            />
            <div class="flex justify-end gap-2">
              <el-button size="small" @click="folderPopoverVisible = false">取消</el-button>
              <el-button size="small" type="primary" @click="handleCreateItem('folder')" :disabled="!newItemName.trim()">创建</el-button>
            </div>
          </div>
        </el-popover>
        <button
          class="toolbar-btn text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1"
          style="color: var(--neon-yellow)"
          @click="triggerImport"
        >
          <el-icon :size="14"><Upload /></el-icon> 导入
        </button>
        <input
          ref="fileInputRef"
          type="file"
          multiple
          class="hidden"
          @change="handleImport"
        />
        <button
          v-if="selectedNodePath"
          class="toolbar-btn text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1"
          style="color: #ef4444"
          @click="handleDelete"
        >
          <el-icon :size="14"><Delete /></el-icon> 删除
        </button>
      </template>
    </div>
    <div class="flex-1 min-h-0 overflow-y-auto custom-scroll p-2">
      <el-tree
        ref="treeRef"
        :data="treeData"
        :props="{ label: 'label', children: 'children' }"
        node-key="id"
        default-expand-all
        highlight-current
        :expand-on-click-node="false"
        :draggable="isAdmin"
        :allow-drop="handleAllowDrop"
        :allow-drag="handleAllowDrag"
        @node-click="handleNodeClick"
        @node-drop="handleNodeDrop"
      >
        <template #default="{ data }">
          <span class="tree-node-content flex items-center gap-1.5" :class="{ 'is-selected': data.id === selectedNodePath }">
            <span class="tree-icon text-xs flex-shrink-0">{{ getFileIcon(data) }}</span>
            <span class="tree-label text-sm truncate">{{ data.label }}</span>
          </span>
        </template>
      </el-tree>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus, Delete, Upload } from '@element-plus/icons-vue'
import type { SkillFile } from '@/types'

interface TreeNode {
  id: string
  label: string
  children?: TreeNode[]
  _type: 'file' | 'folder'
  _file?: SkillFile
}

interface Props {
  files: SkillFile[]
  isAdmin: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  select: [path: string]
  'files-update': [files: SkillFile[]]
}>()

const treeRef = ref()
const selectedNodePath = ref<string | null>(null)
const emptyFolders = ref<Set<string>>(new Set())
const filePopoverVisible = ref(false)
const folderPopoverVisible = ref(false)
const newItemName = ref('')
const fileInputRef = ref<HTMLInputElement | null>(null)

const activeFileCount = computed(() => props.files.length)

const newItemParentPath = computed(() => {
  if (!selectedNodePath.value) return ''
  const node = findNode(treeData.value, selectedNodePath.value)
  if (!node) return ''
  if (node._type === 'folder') return selectedNodePath.value
  const parts = selectedNodePath.value.split('/')
  parts.pop()
  return parts.join('/')
})

const fileIcons: Record<string, string> = {
  '.ts': '🔷',
  '.vue': '💚',
  '.md': '📝',
  '.json': '📋',
  '.js': '🟨',
  '.css': '🎨',
  '.html': '🧡',
  '.yaml': '⚙️',
  '.yml': '⚙️',
  '.py': '🐍',
}

function getFileIcon(data: TreeNode): string {
  if (data._type === 'folder') return '📁'
  if (data._type === 'file') {
    const name = data.label
    for (const [ext, icon] of Object.entries(fileIcons)) {
      if (name.endsWith(ext)) return icon
    }
    return '📄'
  }
  return '📄'
}

function buildTreeData(files: SkillFile[]): TreeNode[] {
  const root: Record<string, { _children: Record<string, any>; _file?: SkillFile; _type?: string }> = {}

  files.forEach(file => {
    const parts = file.path.split('/')
    let current = root
    parts.forEach((part, i) => {
      const isLast = i === parts.length - 1
      if (!current[part]) {
        current[part] = { _children: {} }
      }
      if (isLast) {
        current[part]._file = file
        current[part]._type = 'file'
      } else {
        current[part]._type = 'folder'
      }
      current = current[part]._children
    })
  })

  emptyFolders.value.forEach(folderPath => {
    const parts = folderPath.split('/').filter(Boolean)
    if (parts.length === 0) return
    let current = root
    parts.forEach((part, i) => {
      if (!current[part]) {
        current[part] = { _children: {} }
      }
      current[part]._type = 'folder'
      current = current[part]._children
    })
  })

  return convertToArray(root, '')
}

function convertToArray(obj: Record<string, any>, parentPath: string): TreeNode[] {
  const entries = Object.entries(obj)

  entries.sort((a, b) => {
    const aIsFolder = a[1]._type === 'folder'
    const bIsFolder = b[1]._type === 'folder'
    if (aIsFolder !== bIsFolder) return aIsFolder ? -1 : 1
    return a[0].localeCompare(b[0])
  })

  return entries.map(([key, val]) => {
    const fullPath = parentPath ? `${parentPath}/${key}` : key
    const node: TreeNode = {
      id: fullPath,
      label: key,
      _type: val._type || 'folder',
      _file: val._file,
    }

    const childKeys = Object.keys(val._children)
    if (childKeys.length > 0) {
      node.children = convertToArray(val._children, fullPath)
    }

    return node
  })
}

function findNode(nodes: TreeNode[], path: string): TreeNode | null {
  for (const node of nodes) {
    if (node.id === path) return node
    if (node.children) {
      const found = findNode(node.children, path)
      if (found) return found
    }
  }
  return null
}

const treeData = computed(() => buildTreeData(props.files))

function handleNodeClick(data: TreeNode) {
  selectedNodePath.value = data.id
  if (data._type === 'file') {
    emit('select', data.id)
  }
}

function openPopover(type: 'file' | 'folder') {
  newItemName.value = ''
  if (type === 'file') {
    filePopoverVisible.value = true
    folderPopoverVisible.value = false
  } else {
    folderPopoverVisible.value = true
    filePopoverVisible.value = false
  }
}

function handleCreateItem(type: 'file' | 'folder') {
  const name = newItemName.value.trim()
  if (!name) return

  const parentPath = newItemParentPath.value
  const fullPath = parentPath ? `${parentPath}/${name}` : name

  if (type === 'file') {
    const exists = props.files.some(f => f.path === fullPath)
    if (!exists) {
      const newFile: SkillFile = {
        path: fullPath,
        name,
        content: '',
        language: detectLanguage(name),
      }
      const newFiles = [...props.files, newFile]
      emit('files-update', newFiles)
      filePopoverVisible.value = false
      setTimeout(() => {
        selectedNodePath.value = fullPath
        emit('select', fullPath)
      }, 0)
    }
  } else {
    const exists = props.files.some(f => f.path === fullPath || f.path.startsWith(fullPath + '/'))
    if (!exists) {
      const newSet = new Set(emptyFolders.value)
      newSet.add(fullPath)
      emptyFolders.value = newSet
    }
    folderPopoverVisible.value = false
    selectedNodePath.value = fullPath
  }

  newItemName.value = ''
}

function detectLanguage(filename: string): string | undefined {
  const ext = filename.split('.').pop()?.toLowerCase()
  const langMap: Record<string, string> = {
    ts: 'typescript',
    js: 'javascript',
    vue: 'html',
    md: 'markdown',
    json: 'json',
    css: 'css',
    html: 'html',
    yaml: 'yaml',
    yml: 'yaml',
    py: 'python',
  }
  return ext ? langMap[ext] : undefined
}

function handleDelete() {
  if (!selectedNodePath.value) return

  const pathToDelete = selectedNodePath.value
  const node = findNode(treeData.value, pathToDelete)

  if (!node) return

  if (node._type === 'folder') {
    const newFiles = props.files.filter(
      f => f.path !== pathToDelete && !f.path.startsWith(pathToDelete + '/')
    )
    emit('files-update', newFiles)
  } else {
    const newFiles = props.files.filter(f => f.path !== pathToDelete)
    emit('files-update', newFiles)
  }

  selectedNodePath.value = null
}

function triggerImport() {
  fileInputRef.value?.click()
}

async function handleImport(event: Event) {
  const input = event.target as HTMLInputElement
  if (!input.files?.length) return

  const parentPath = newItemParentPath.value
  const newFiles: SkillFile[] = []

  for (const file of Array.from(input.files)) {
    const content = await file.text()
    const fullPath = parentPath ? `${parentPath}/${file.name}` : file.name
    newFiles.push({
      path: fullPath,
      name: file.name,
      content,
      language: detectLanguage(file.name),
    })
  }

  const existingPaths = new Set(props.files.map(f => f.path))
  const merged = [...props.files]
  for (const f of newFiles) {
    if (existingPaths.has(f.path)) {
      const idx = merged.findIndex(m => m.path === f.path)
      if (idx !== -1) merged[idx] = f
    } else {
      merged.push(f)
    }
  }

  emit('files-update', merged)
  input.value = ''
}

function handleAllowDrop(_draggingNode: any, dropNode: any, type: string): boolean {
  if (type === 'inner') {
    return dropNode.data._type === 'folder'
  }
  return true
}

function handleAllowDrag(_draggingNode: any): boolean {
  return true
}

function handleNodeDrop(draggingNode: any, dropNode: any, dropType: string) {
  const draggedData = draggingNode.data as TreeNode
  const oldPath = draggedData.id
  const name = draggedData.label

  let newPath: string

  if (!dropNode) {
    newPath = name
  } else if (dropType === 'inner') {
    newPath = `${dropNode.data.id}/${name}`
  } else {
    const dropParts = dropNode.data.id.split('/')
    dropParts.pop()
    const parentPath = dropParts.join('/')
    newPath = parentPath ? `${parentPath}/${name}` : name
  }

  if (newPath === oldPath) return

  if (draggedData._type === 'folder') {
    const updatedFiles = props.files.map(f => {
      if (f.path === oldPath) {
        return { ...f, path: newPath, name: newPath.split('/').pop() || '' }
      }
      if (f.path.startsWith(oldPath + '/')) {
        const suffix = f.path.substring(oldPath.length)
        const updatedPath = newPath + suffix
        return { ...f, path: updatedPath, name: updatedPath.split('/').pop() || '' }
      }
      return f
    })

    const newEmpty = new Set<string>()
    emptyFolders.value.forEach(p => {
      if (p === oldPath) {
        newEmpty.add(newPath)
      } else if (p.startsWith(oldPath + '/')) {
        newEmpty.add(newPath + p.substring(oldPath.length))
      } else {
        newEmpty.add(p)
      }
    })
    emptyFolders.value = newEmpty

    emit('files-update', updatedFiles)
    setTimeout(() => {
      selectedNodePath.value = newPath
    }, 0)
  } else {
    const updatedFiles = props.files.map(f => {
      if (f.path === oldPath) {
        return { ...f, path: newPath, name: newPath.split('/').pop() || '' }
      }
      return f
    })
    emit('files-update', updatedFiles)
    setTimeout(() => {
      selectedNodePath.value = newPath
    }, 0)
  }
}
</script>

<style scoped>
.custom-scroll::-webkit-scrollbar {
  width: 5px;
}
.custom-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scroll::-webkit-scrollbar-thumb {
  background: rgba(14, 165, 233, 0.2);
  border-radius: 3px;
}
.custom-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(14, 165, 233, 0.4);
}

.toolbar-btn {
  background: rgba(14, 165, 233, 0.06);
  border: 1px solid rgba(0, 245, 255, 0.15);
  transition: all 0.2s ease;
}
.toolbar-btn:hover {
  background: rgba(14, 165, 233, 0.12);
  border-color: var(--neon-cyan);
  box-shadow: 0 0 8px rgba(0, 245, 255, 0.15);
}

:deep(.el-tree) {
  background: transparent;
  color: var(--text-muted);
}

:deep(.el-tree-node__content) {
  padding: 4px 8px;
  border-radius: 6px;
  transition: all 0.15s ease;
}

:deep(.el-tree-node__content:hover) {
  background: rgba(14, 165, 233, 0.08);
}

:deep(.el-tree-node.is-current > .el-tree-node__content) {
  background: rgba(14, 165, 233, 0.12);
}

:deep(.el-tree-node__content .tree-node-content.is-selected) {
  color: var(--neon-cyan);
}

:deep(.el-tree-node__expand-icon) {
  color: var(--text-muted);
  font-size: 12px;
}

:deep(.el-tree-node__expand-icon:hover) {
  color: var(--neon-cyan);
}

:deep(.el-tree-node__expand-icon.is-leaf) {
  color: transparent;
  cursor: default;
}

:deep(.el-tree--highlight-current .el-tree-node.is-current > .el-tree-node__content) {
  background: rgba(14, 165, 233, 0.12);
}

.tree-node-content {
  user-select: none;
}

.tree-icon {
  line-height: 1;
}

.tree-label {
  line-height: 1.5;
}
</style>