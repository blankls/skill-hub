export interface SkillFile {
  path: string
  name: string
  content: string
  language?: string
}

export interface GithubMeta {
  full_name: string
  description: string
  html_url: string
  repoUrl: string
  subfolderUrl: string
  branch: string
  stars: number
  forks: number
  watchers: number
  language: string
  license: string
  topics: string[]
  createdAt: string
  updatedAt: string
  // GitHub 源的额外静态信息
  repoOwner: string
  repoName: string
  subfolderPath?: string
}

export interface SkillSource {
  type: 'local' | 'zip' | 'github' | 'skillmd'
  origin?: string
  lastSync?: Date
  lastRemoteUpdate?: Date
  githubMeta?: GithubMeta
  isContentCached?: boolean
}

export interface Skill {
  id: string
  name: string
  description: string
  version: string
  author: string
  tags: string[]
  group?: string
  source: SkillSource
  files: SkillFile[]
  tools?: Tool[]
  likes?: number
  iconColor?: string
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

export interface SkillGroup {
  id: string
  name: string
  description: string
  readme?: string
  iconColor?: string
  skillIds: string[]
  likes?: number
  createdAt: Date
  updatedAt: Date
}
