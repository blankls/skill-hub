export interface SkillFile {
  path: string
  name: string
  content: string
  language?: string
}

export interface SkillSource {
  type: 'local' | 'zip' | 'github' | 'skillmd'
  origin?: string // 文件路径或 GitHub URL
  lastSync?: Date
}

export interface Skill {
  id: string
  name: string
  description: string
  version: string
  author: string
  tags: string[]
  source: SkillSource
  files: SkillFile[]
  tools?: Tool[]
  createdAt: Date
  updatedAt: Date
}

export interface Tool {
  name: string
  description: string
  parameters: Parameter[]
  example?: string
}

export interface Parameter {
  name: string
  type: string
  required: boolean
  description: string
}

export interface FileNode {
  name: string
  type: 'file' | 'folder'
  path: string
  children?: FileNode[]
  content?: string
  language?: string
}

export interface ThemeState {
  isDark: boolean
}
