<template>
  <div class="h-full min-h-0 flex flex-col rounded-xl overflow-hidden border border-[var(--neon-cyan)]/20" style="background: var(--dark-card)">
    <div class="flex-shrink-0 px-3 py-2.5 border-b flex items-center gap-1.5" style="border-color: rgba(0,245,255,0.15)">
      <span class="font-semibold text-sm" style="color: var(--text-light)">
        📁 文件树 · {{ activeFileCount }}
      </span>
    </div>
    <div class="flex-1 min-h-0 overflow-y-auto custom-scroll p-2">
      <el-tree
        ref="treeRef"
        :data="treeData"
        :props="{ label: 'label', children: 'children' }"
        node-key="id"
        :default-expanded-keys="expandedKeys"
        highlight-current
        :expand-on-click-node="true"
        :draggable="isAdmin"
        :allow-drop="handleAllowDrop"
        :allow-drag="handleAllowDrag"
        @node-click="handleNodeClick"
        @node-expand="onNodeExpand"
        @node-collapse="onNodeCollapse"
        @node-drop="handleNodeDrop"
        @node-contextmenu="handleContextMenu"
      >
        <template #default="{ data }">
          <span class="tree-node-content flex items-center gap-1.5" :class="{ 'is-selected': data.id === selectedNodePath }">
            <span class="tree-icon flex-shrink-0"><FileIcon :filename="data.label" :type="data._type" :size="16" /></span>
            <span class="tree-label text-sm truncate">{{ data.label }}</span>
          </span>
        </template>
      </el-tree>
    </div>

    <teleport to="body">
      <transition name="ctx-fade">
        <div
          v-if="ctxMenu.visible && isAdmin"
          class="ctx-menu"
          :style="{ left: ctxMenu.x + 'px', top: ctxMenu.y + 'px' }"
          @click="ctxMenu.visible = false"
          @contextmenu.prevent="ctxMenu.visible = false"
        >
          <div class="ctx-item" @click="ctxAction('new-file')">
            <span class="ctx-icon">📄</span> 新建文件
          </div>
          <div class="ctx-item" @click="ctxAction('new-folder')">
            <span class="ctx-icon">📁</span> 新建文件夹
          </div>
          <div class="ctx-item" @click="ctxAction('import')">
            <span class="ctx-icon">📥</span> 导入文件
          </div>
          <div v-if="ctxMenu.nodePath" class="ctx-divider"></div>
          <div v-if="ctxMenu.nodePath" class="ctx-item ctx-danger" @click="ctxAction('delete')">
            <span class="ctx-icon">🗑️</span> 删除
          </div>
        </div>
      </transition>
    </teleport>

    <el-dialog
      v-model="createDialogVisible"
      :title="createDialogType === 'file' ? '新建文件' : '新建文件夹'"
      width="360px"
      :append-to-body="true"
      class="create-dialog"
    >
      <div class="flex flex-col gap-3">
        <span class="text-xs" style="color: var(--text-muted)">路径：{{ createDialogParent || '根目录' }}</span>
        <el-input
          v-model="createDialogName"
          :placeholder="createDialogType === 'file' ? 'index.ts' : 'components'"
          @keyup.enter="confirmCreate"
        />
      </div>
      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmCreate" :disabled="!createDialogName.trim()">创建</el-button>
      </template>
    </el-dialog>

    <input
      ref="fileInputRef"
      type="file"
      multiple
      class="hidden"
      @change="handleImport"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, reactive } from 'vue'
import type { SkillFile } from '@/types'
import FileIcon from '@/components/ui/FileIcon.vue'

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
const fileInputRef = ref<HTMLInputElement | null>(null)

const createDialogVisible = ref(false)
const createDialogType = ref<'file' | 'folder'>('file')
const createDialogName = ref('')
const createDialogParent = ref('')
const expandedKeys = ref<string[]>([])

const ctxMenu = reactive({
  visible: false,
  x: 0,
  y: 0,
  nodePath: '' as string,
  nodeType: '' as 'file' | 'folder' | '',
})

const activeFileCount = computed(() => props.files.length)

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
    parts.forEach((part) => {
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

function onNodeExpand(data: TreeNode) {
  if (!expandedKeys.value.includes(data.id)) {
    expandedKeys.value = [...expandedKeys.value, data.id]
  }
}

function onNodeCollapse(data: TreeNode) {
  const keysToRemove = new Set<string>()
  keysToRemove.add(data.id)
  if (data.children) {
    collectChildKeys(data.children, keysToRemove)
  }
  expandedKeys.value = expandedKeys.value.filter(k => !keysToRemove.has(k))
}

function collectChildKeys(nodes: TreeNode[], keys: Set<string>) {
  for (const node of nodes) {
    keys.add(node.id)
    if (node.children) collectChildKeys(node.children, keys)
  }
}

function handleContextMenu(event: MouseEvent, data: TreeNode) {
  event.preventDefault()
  event.stopPropagation()
  selectedNodePath.value = data.id
  ctxMenu.visible = true
  ctxMenu.x = event.clientX
  ctxMenu.y = event.clientY
  ctxMenu.nodePath = data.id
  ctxMenu.nodeType = data._type
}

function closeCtxMenu() {
  ctxMenu.visible = false
}

function ctxAction(action: string) {
  closeCtxMenu()
  const node = ctxMenu.nodePath ? findNode(treeData.value, ctxMenu.nodePath) : null
  const parentPath = node
    ? (node._type === 'folder' ? node.id : node.id.split('/').slice(0, -1).join('/'))
    : ''

  switch (action) {
    case 'new-file':
      createDialogType.value = 'file'
      createDialogName.value = ''
      createDialogParent.value = parentPath
      createDialogVisible.value = true
      break
    case 'new-folder':
      createDialogType.value = 'folder'
      createDialogName.value = ''
      createDialogParent.value = parentPath
      createDialogVisible.value = true
      break
    case 'import':
      createDialogParent.value = parentPath
      triggerImport()
      break
    case 'delete':
      handleDelete(ctxMenu.nodePath)
      break
  }
}

function confirmCreate() {
  const name = createDialogName.value.trim()
  if (!name) return

  const parentPath = createDialogParent.value
  const fullPath = parentPath ? `${parentPath}/${name}` : name

  if (createDialogType.value === 'file') {
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
      createDialogVisible.value = false
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
    createDialogVisible.value = false
    selectedNodePath.value = fullPath
  }

  createDialogName.value = ''
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

function handleDelete(pathToDelete: string) {
  if (!pathToDelete) return

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

  const parentPath = createDialogParent.value
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

function onGlobalClick() {
  if (ctxMenu.visible) closeCtxMenu()
}

onMounted(() => document.addEventListener('click', onGlobalClick))
onUnmounted(() => document.removeEventListener('click', onGlobalClick))
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

.ctx-menu {
  position: fixed;
  z-index: 9999;
  min-width: 160px;
  padding: 4px 0;
  border-radius: 8px;
  border: 1px solid rgba(0, 245, 255, 0.2);
  background: var(--dark-card);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5), 0 0 12px rgba(0, 245, 255, 0.08);
}

.ctx-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  font-size: 13px;
  color: var(--text-light);
  cursor: pointer;
  transition: background 0.15s;
}

.ctx-item:hover {
  background: rgba(0, 245, 255, 0.1);
  color: var(--neon-cyan);
}

.ctx-item.ctx-danger:hover {
  background: rgba(239, 68, 68, 0.12);
  color: #ef4444;
}

.ctx-icon {
  font-size: 14px;
  width: 18px;
  text-align: center;
}

.ctx-divider {
  height: 1px;
  margin: 4px 8px;
  background: rgba(0, 245, 255, 0.12);
}

.ctx-fade-enter-active,
.ctx-fade-leave-active {
  transition: opacity 0.15s ease;
}
.ctx-fade-enter-from,
.ctx-fade-leave-to {
  opacity: 0;
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
</style>