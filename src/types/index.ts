export interface Skill {
  id: string
  name: string
  description: string
  version: string
  author: string
  license?: string
  githubUrl?: string
  sourceType: 'local' | 'github'
  tags: string[]
  downloadCount: number
  rating: number
  lastUpdated: string
  tools: Tool[]
  filePath?: string
  repository?: string
  readme?: string
  files?: FileNode[]
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
