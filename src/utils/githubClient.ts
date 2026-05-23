import type { GithubMeta, Skill, SkillFile } from '@/types'
import { parseSkillFromMarkdown } from '@/utils/skillParser'

// ==================== 配置 ====================
const CONFIG = {
  CONCURRENT_REQUESTS: parseInt(import.meta.env.VITE_GITHUB_CONCURRENT_REQUESTS || '3'),
  MAX_RETRIES: parseInt(import.meta.env.VITE_GITHUB_MAX_RETRIES || '3'),
  RATE_LIMIT_DELAY: parseInt(import.meta.env.VITE_GITHUB_RATE_LIMIT_DELAY || '1000'),
  MAX_FILES: 50,
  MAX_FILE_SIZE: 500 * 1024, // 500KB
}

// ==================== 类型定义 ====================
export interface GitHubRepoMeta {
  name: string
  full_name: string
  description: string
  html_url: string
  stargazers_count: number
  forks_count: number
  subscribers_count: number
  language: string
  license: { spdx_id: string; name: string } | null
  topics: string[]
  default_branch: string
  created_at: string
  updated_at: string
  pushed_at: string
}

export interface GitHubFile {
  name: string
  path: string
  type: 'file' | 'dir'
  download_url?: string
  size?: number
  sha?: string
}

export interface GitHubTreeItem {
  path: string
  fullPath: string
  mode: string
  type: 'blob' | 'tree'
  sha: string
  size?: number
}

export interface GitHubTreeResponse {
  sha: string
  tree: GitHubTreeItem[]
  truncated: boolean
}

export interface GitHubSourceConfig {
  repoOwner: string
  repoName: string
  branch: string
  subfolderPath?: string
}

export interface FileShaMap {
  [filePath: string]: string
}

export interface SyncProgress {
  stage: 'checking' | 'listing' | 'downloading' | 'complete'
  current: number
  total: number
  message?: string
}

// ==================== 内部状态管理 ====================
const requestQueue = new Map<string, Promise<any>>()
const lastRequestTimes = new Map<string, number>()

// ==================== 仓库级缓存 ====================
// 同一仓库的多个技能共享这些缓存，大幅减少 API 调用
interface RepoCacheEntry {
  repoMeta: GitHubRepoMeta
  fullTree: GitHubTreeItem[]
  fetchedAt: number
}
const repoCache = new Map<string, RepoCacheEntry>()
const REPO_CACHE_TTL = 5 * 60 * 1000 // 5 分钟内复用缓存

// ==================== 核心工具函数 ====================

export function parseGitHubUrl(repoUrl: string): { owner: string; repo: string } {
  // 支持多种 GitHub URL 格式:
  // - https://github.com/owner/repo
  // - https://github.com/owner/repo.git
  // - git@github.com:owner/repo.git
  // - github.com/owner/repo
  const cleanUrl = repoUrl.trim()
  const match = cleanUrl.match(
    /(?:github\.com[/:]|^github\.com\/)([^/#?]+)\/([^/#?.]+)(?:\.git|\/|$)/i
  )
  if (!match) {
    throw new Error('无效的 GitHub URL，请输入类似 github.com/username/repository 的地址')
  }
  const owner = match[1]
  let repo = match[2]
  // 移除可能的 .git 后缀
  if (repo.endsWith('.git')) {
    repo = repo.slice(0, -4)
  }
  return { owner, repo }
}

// 节流与去重的 fetch
async function throttledFetch(url: string, options?: RequestInit): Promise<Response> {
  const now = Date.now()
  const lastTime = lastRequestTimes.get(url) || 0
  
  if (now - lastTime < CONFIG.RATE_LIMIT_DELAY) {
    await new Promise(r => setTimeout(r, CONFIG.RATE_LIMIT_DELAY - (now - lastTime)))
  }
  
  const cacheKey = `${url}::${JSON.stringify(options || {})}`
  const existing = requestQueue.get(cacheKey)
  if (existing) return existing
  
  const promise = fetch(url, options).finally(() => {
    requestQueue.delete(cacheKey)
    lastRequestTimes.set(url, Date.now())
  })
  requestQueue.set(cacheKey, promise)
  return promise
}

// 指数退避重试
async function fetchWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries = CONFIG.MAX_RETRIES,
  baseDelay = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (e) {
      if (i === maxRetries - 1) throw e
      const delay = baseDelay * Math.pow(2, i)
      console.warn(`Request failed, retrying in ${delay}ms (${i + 1}/${maxRetries})`)
      await new Promise(r => setTimeout(r, delay))
    }
  }
  throw new Error('Max retries exceeded')
}

// ==================== GitHub API 封装 ====================

export async function fetchGitHubRepo(repoUrl: string): Promise<GitHubRepoMeta> {
  const { owner, repo } = parseGitHubUrl(repoUrl)
  return fetchWithRetry(async () => {
    const url = `https://api.github.com/repos/${owner}/${repo}`
    const response = await throttledFetch(url)
    
    if (!response.ok) {
      let errorMsg = `获取仓库失败 (${response.status})`
      try {
        const errorData = await response.json()
        if (errorData.message) {
          errorMsg += `: ${errorData.message}`
        }
      } catch {
        // 忽略解析错误
      }
      if (response.status === 404) {
        errorMsg = '仓库不存在，请检查 URL 是否正确'
      } else if (response.status === 403) {
        errorMsg = 'API 访问受限，请稍后再试'
      }
      throw new Error(errorMsg)
    }
    
    return await response.json()
  })
}

// 获取完整文件树（含 SHA，比 Contents API 快 10x+）
export async function fetchRepoFileTree(
  repoUrl: string,
  branch: string,
  subfolderPath?: string
): Promise<GitHubTreeItem[]> {
  const { owner, repo } = parseGitHubUrl(repoUrl)
  return fetchWithRetry(async () => {
    const url = `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`
    const response = await throttledFetch(url)
    if (!response.ok) throw new Error('Failed to fetch file tree')
    const data: GitHubTreeResponse = await response.json()
    
    let items = data.tree.filter(item => item.type === 'blob')
    
    if (subfolderPath) {
      const prefix = subfolderPath.endsWith('/') ? subfolderPath : subfolderPath + '/'
      const folderName = subfolderPath.split('/').pop() || subfolderPath
      items = items.filter(item => item.path.startsWith(prefix))
        .map(item => ({
          ...item,
          fullPath: item.path,
          path: folderName ? `${folderName}/${item.path.substring(prefix.length)}` : item.path.substring(prefix.length)
        }))
    } else {
      items = items.map(item => ({
        ...item,
        fullPath: item.path
      }))
    }
    
    return items
  })
}

export async function fetchGitHubFileContent(
  repoUrl: string,
  filePath: string,
  branch: string
): Promise<string> {
  const { owner, repo } = parseGitHubUrl(repoUrl)
  return fetchWithRetry(async () => {
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`
    const response = await throttledFetch(url)
    if (!response.ok) throw new Error(`Failed to fetch file: ${filePath}`)
    const data = await response.json()
    
    if (data.download_url && !data.content) {
      const downloadResponse = await throttledFetch(data.download_url)
      return await downloadResponse.text()
    }
    
    if (data.content) {
      return atob(data.content)
    }
    
    throw new Error('No content available')
  })
}

export function toGithubMeta(repo: GitHubRepoMeta, branch?: string, subfolderPath?: string): GithubMeta {
  const subfolderUrl = subfolderPath
    ? `${repo.html_url}/tree/${branch || repo.default_branch}/${subfolderPath}`
    : repo.html_url
  const { owner, repo: repoName } = parseGitHubUrl(repo.html_url)

  return {
    full_name: repo.full_name,
    description: repo.description || '',
    html_url: repo.html_url,
    repoUrl: repo.html_url,
    subfolderUrl,
    branch: branch || repo.default_branch,
    stars: repo.stargazers_count || 0,
    forks: repo.forks_count || 0,
    watchers: repo.subscribers_count || 0,
    language: repo.language || '',
    license: repo.license?.spdx_id || repo.license?.name || '',
    topics: repo.topics || [],
    createdAt: repo.created_at || '',
    updatedAt: repo.updated_at || '',
    repoOwner: owner,
    repoName: repoName,
    subfolderPath: subfolderPath
  }
}

// ==================== 文件工具 ====================

function getLanguageFromFilename(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || ''
  const map: Record<string, string> = {
    ts: 'typescript', tsx: 'typescript', js: 'javascript', jsx: 'javascript',
    py: 'python', java: 'java', cpp: 'cpp', c: 'c', go: 'go', rs: 'rust',
    rb: 'ruby', php: 'php', html: 'html', css: 'css', md: 'markdown',
    json: 'json', yml: 'yaml', yaml: 'yaml', vue: 'html', svelte: 'html'
  }
  return map[ext] || 'text'
}

// 构建本地文件 SHA 映射（预留，后续增量同步使用）
// function buildLocalShaMap(files: SkillFile[]): FileShaMap {
//   const map: FileShaMap = {}
//   for (const file of files) {
//     map[file.path] = (file as any).sha || ''
//   }
//   return map
// }

// ==================== 并发控制下载 ====================

async function fetchFilesWithConcurrency(
  repoUrl: string,
  branch: string,
  files: GitHubTreeItem[],
  onProgress?: (current: number, total: number) => void,
  _existingFiles?: SkillFile[]
): Promise<SkillFile[]> {
  const results: SkillFile[] = []
  let index = 0
  let downloaded = 0
  let skipped = 0
  const concurrency = CONFIG.CONCURRENT_REQUESTS
  
  async function worker() {
    while (index < files.length && results.length < CONFIG.MAX_FILES) {
      const file = files[index++]
      
      // 过滤过大文件
      if (file.size && file.size > CONFIG.MAX_FILE_SIZE) {
        skipped++
        continue
      }
      
      try {
        // 下载文件（使用完整的 GitHub 路径）
        const content = await fetchGitHubFileContent(repoUrl, file.fullPath, branch)
        results.push({
          path: file.path,
          name: file.path.split('/').pop() || file.path,
          content,
          language: getLanguageFromFilename(file.path),
        })
        downloaded++
        onProgress?.(downloaded + skipped, files.length)
      } catch (e) {
        console.warn(`Failed to fetch ${file.path}:`, e)
      }
    }
  }
  
  const workers = Array(concurrency).fill(0).map(worker)
  await Promise.all(workers)
  
  console.log(`Download complete: ${downloaded} downloaded, ${skipped} skipped`)
  return results
}

// ==================== 主同步函数 ====================

export async function fetchFullSkillFromGitHub(
  repoUrl: string,
  branch: string,
  subfolderPath?: string,
  existingId?: string,
  existingFiles?: SkillFile[],
  onProgress?: (progress: SyncProgress) => void
): Promise<Skill> {
  console.log('Starting fetchFullSkillFromGitHub:', { repoUrl, branch, subfolderPath, existingId })
  
  // 阶段 1: 获取仓库元数据
  onProgress?.({ stage: 'checking', current: 0, total: 0 })
  const repoMeta = await fetchGitHubRepo(repoUrl)
  const meta = toGithubMeta(repoMeta, branch, subfolderPath)
  
  // 阶段 2: 获取文件树（快速获取 SHA）
  onProgress?.({ stage: 'listing', current: 0, total: 0 })
  let files: SkillFile[] = []
  
  try {
    const tree = await fetchRepoFileTree(repoUrl, branch, subfolderPath)
    onProgress?.({ stage: 'downloading', current: 0, total: Math.min(tree.length, CONFIG.MAX_FILES) })
    
    // 使用 Trees API 的 SHA 信息进行下载
    files = await fetchFilesWithConcurrency(
      repoUrl,
      branch,
      tree,
      (current, total) => onProgress?.({ stage: 'downloading', current, total }),
      existingFiles
    )
  } catch (e) {
    console.error('Tree API failed, falling back to Contents API:', e)
    // 降级到原来的方式
    const folderName = subfolderPath ? subfolderPath.split('/').pop() || '' : ''
    files = await fetchAllFilesRecursiveFallback(
      repoUrl, 
      subfolderPath || '', 
      branch, 
      CONFIG.MAX_FILES,
      subfolderPath || '',
      folderName
    )
  }
  
  // 阶段 3: 解析技能信息
  onProgress?.({ stage: 'complete', current: 1, total: 1 })
  let skillName = subfolderPath 
    ? `${repoMeta.name}/${subfolderPath}`
    : repoMeta.name
  let description = repoMeta.description || 'GitHub Repository Skill'
  let version = '1.0.0'
  let author = meta.repoOwner
  let tags: string[] = ['github']
  
  if (meta.language) tags.push(meta.language.toLowerCase())
  tags.push(...meta.topics.slice(0, 5))
  
  const skillMdFile = files.find(f => f.name.toLowerCase() === 'skill.md')
  const readmeFile = files.find(f => f.name.toLowerCase() === 'readme.md')
  
  if (skillMdFile) {
    try {
      const parsedSkill = await parseSkillFromMarkdown(skillMdFile.content, skillMdFile.name)
      skillName = parsedSkill.name || skillName
      description = parsedSkill.description || description
      version = parsedSkill.version || version
      author = parsedSkill.author || author
      if (parsedSkill.tags.length > 0) {
        tags = Array.from(new Set([...tags, ...parsedSkill.tags]))
      }
    } catch (e) {
      console.warn('Failed to parse SKILL.md:', e)
    }
  } else if (readmeFile) {
    try {
      const descLines: string[] = []
      for (const line of readmeFile.content.split('\n').slice(1, 20)) {
        if (line.startsWith('# ')) continue
        if (line.startsWith('## ')) break
        if (line.trim() && !line.startsWith('![') && !line.startsWith('<')) {
          descLines.push(line.trim())
        }
      }
      if (descLines.length > 0) {
        description = descLines.join(' ').slice(0, 200)
      }
    } catch (e) {
      console.warn('Failed to parse README.md:', e)
    }
  }
  
  const result: Skill = {
    id: existingId || crypto.randomUUID(),
    name: skillName,
    description,
    version,
    author,
    tags,
    source: {
      type: 'github',
      origin: repoUrl,
      lastSync: new Date(),
      lastRemoteUpdate: new Date(repoMeta.pushed_at),
      githubMeta: meta,
      isContentCached: files.length > 0,
      // 保存文件 SHA 以便下次比对
      fileShas: Object.fromEntries(files.map(f => [f.path, (f as any).sha || '']))
    },
    files,
    createdAt: new Date(),
    updatedAt: new Date()
  }
  
  console.log('Successfully fetched skill from GitHub:', result)
  return result
}

// ==================== 仓库缓存管理 ====================

function buildCacheKey(repoUrl: string, branch: string): string {
  return `${repoUrl}#${branch}`
}

async function getRepoCache(repoUrl: string, branch: string): Promise<RepoCacheEntry> {
  const key = buildCacheKey(repoUrl, branch)
  const cache = repoCache.get(key)
  
  if (cache) {
    const age = Date.now() - cache.fetchedAt
    if (age < REPO_CACHE_TTL) {
      return cache
    }
    // TTL 已过，需要重新验证（检查 push 时间）
    try {
      const latestMeta = await fetchGitHubRepo(repoUrl)
      if (latestMeta.pushed_at === cache.repoMeta.pushed_at) {
        // 仓库没变化，更新 fetchedAt 并继续使用缓存
        cache.fetchedAt = Date.now()
        return cache
      }
    } catch {
      // 验证失败，降级使用旧缓存
      return cache
    }
  }
  
  // 无缓存或已过期 → 重新拉取
  const [repoMeta, fullTree] = await Promise.all([
    fetchGitHubRepo(repoUrl),
    fetchRepoFileTree(repoUrl, branch)
  ])
  
  const entry: RepoCacheEntry = {
    repoMeta,
    fullTree,
    fetchedAt: Date.now()
  }
  repoCache.set(key, entry)
  return entry
}

// ==================== 同仓多技能批量同步 ====================

/**
 * 高效同步同一个仓库下的多个技能
 * - 仓库元数据和文件树只拉取一次
 * - 按 subfolderPath 过滤各自文件
 * - 支持进度回调
 */
export async function fetchSkillsFromSameRepo(
  repoUrl: string,
  branch: string,
  skillConfigs: Array<{
    id: string
    name: string
    subfolderPath?: string
    existingFiles?: SkillFile[]
    force?: boolean
  }>,
  onSkillProgress?: (skillId: string, progress: SyncProgress) => void,
  onRepoProgress?: (current: number, total: number) => void
): Promise<Skill[]> {
  const total = skillConfigs.length
  let completed = 0
  
  console.log(`Syncing ${total} skill(s) from same repo: ${repoUrl}`)
  
  // 阶段 1: 获取仓库元数据和完整文件树（仅一次）
  onRepoProgress?.(0, total)
  let repoMeta: GitHubRepoMeta
  let fullTree: GitHubTreeItem[]
  
  try {
    const cache = await getRepoCache(repoUrl, branch)
    repoMeta = cache.repoMeta
    fullTree = cache.fullTree
  } catch {
    // 直接拉取
    [repoMeta, fullTree] = await Promise.all([
      fetchGitHubRepo(repoUrl),
      fetchRepoFileTree(repoUrl, branch)
    ])
  }
  
  const meta = toGithubMeta(repoMeta, branch)
  
  // 阶段 2: 并行处理每个技能
  const results: Skill[] = []
  
  for (const config of skillConfigs) {
    const skillId = config.id
    onSkillProgress?.(skillId, { stage: 'checking', current: 0, total: 0 })
    
    // 检查是否需要更新（非强制模式）
    if (!config.force) {
      // 预留：后续可基于 push 时间做精细判断
      // const lastRemoteUpdate = new Date(repoMeta.pushed_at)
      // const now = Date.now()
      // 如果 push 时间没变，说明仓库没更新
      // 注意：这里不逐个 skill 判断，统一用仓库 push 时间
      if (repoMeta.pushed_at) {
        onSkillProgress?.(skillId, { stage: 'checking', current: 0, total: 0 })
        // 留给 skillStore 层做更精细的判断
      }
    }
    
    // 从完整树中过滤出该技能的文件
    let skillFiles: GitHubTreeItem[] = []
    if (config.subfolderPath) {
      const prefix = config.subfolderPath.endsWith('/') ? config.subfolderPath : config.subfolderPath + '/'
      const folderName = config.subfolderPath.split('/').pop() || config.subfolderPath
      skillFiles = fullTree
        .filter(item => item.path.startsWith(prefix))
        .map(item => ({
          ...item,
          fullPath: item.path,
          path: folderName ? `${folderName}/${item.path.substring(prefix.length)}` : item.path.substring(prefix.length)
        }))
    } else {
      skillFiles = fullTree.map(item => ({
        ...item,
        fullPath: item.path
      }))
    }
    
    // 阶段 3: 下载文件
    const totalFiles = Math.min(skillFiles.length, CONFIG.MAX_FILES)
    onSkillProgress?.(skillId, { stage: 'downloading', current: 0, total: totalFiles })
    
    let files: SkillFile[]
    try {
      files = await fetchFilesWithConcurrency(
        repoUrl,
        branch,
        skillFiles,
        (current, total) => {
          onSkillProgress?.(skillId, { stage: 'downloading', current, total })
        },
        config.existingFiles
      )
    } catch (e) {
      console.error(`Failed to download files for ${config.name}:`, e)
      files = []
    }
    
    // 阶段 4: 构建 Skill 对象
    onSkillProgress?.(skillId, { stage: 'complete', current: 1, total: 1 })
    
    let skillName = config.subfolderPath
      ? `${repoMeta.name}/${config.subfolderPath}`
      : repoMeta.name
    let description = repoMeta.description || 'GitHub Repository Skill'
    let version = '1.0.0'
    let author = meta.repoOwner
    let tags: string[] = ['github']
    
    if (meta.language) tags.push(meta.language.toLowerCase())
    tags.push(...meta.topics.slice(0, 5))
    
    const skillMdFile = files.find(f => f.name.toLowerCase() === 'skill.md')
    const readmeFile = files.find(f => f.name.toLowerCase() === 'readme.md')
    
    if (skillMdFile) {
      try {
        const parsedSkill = await parseSkillFromMarkdown(skillMdFile.content, skillMdFile.name)
        skillName = parsedSkill.name || skillName
        description = parsedSkill.description || description
        version = parsedSkill.version || version
        author = parsedSkill.author || author
        if (parsedSkill.tags.length > 0) {
          tags = Array.from(new Set([...tags, ...parsedSkill.tags]))
        }
      } catch (e) {
        console.warn('Failed to parse SKILL.md:', e)
      }
    } else if (readmeFile) {
      try {
        const descLines: string[] = []
        for (const line of readmeFile.content.split('\n').slice(1, 20)) {
          if (line.startsWith('# ')) continue
          if (line.startsWith('## ')) break
          if (line.trim() && !line.startsWith('![') && !line.startsWith('<')) {
            descLines.push(line.trim())
          }
        }
        if (descLines.length > 0) {
          description = descLines.join(' ').slice(0, 200)
        }
      } catch (e) {
        console.warn('Failed to parse README.md:', e)
      }
    }
    
    const result: Skill = {
      id: config.id || crypto.randomUUID(),
      name: skillName,
      description,
      version,
      author,
      tags,
      source: {
        type: 'github',
        origin: repoUrl,
        lastSync: new Date(),
        lastRemoteUpdate: new Date(repoMeta.pushed_at),
        githubMeta: {
          ...meta,
          subfolderPath: config.subfolderPath
        },
        isContentCached: files.length > 0,
        fileShas: Object.fromEntries(files.map(f => [f.path, (f as any).sha || '']))
      },
      files,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    results.push(result)
    completed++
    onRepoProgress?.(completed, total)
  }
  
  return results
}

/**
 * 清除仓库缓存（用于强制刷新）
 */
export function clearRepoCache(repoUrl?: string) {
  if (repoUrl) {
    for (const [key] of repoCache) {
      if (key.startsWith(repoUrl)) {
        repoCache.delete(key)
      }
    }
  } else {
    repoCache.clear()
  }
}

// ==================== 降级方案（旧方式） ====================

async function fetchAllFilesRecursiveFallback(
  repoUrl: string, 
  basePath: string = '', 
  branch: string,
  maxFiles: number = CONFIG.MAX_FILES,
  originalBasePath: string = '',
  folderName: string = ''
): Promise<SkillFile[]> {
  const files: SkillFile[] = []
  
  try {
    const items = await fetchGitHubRepoFiles(repoUrl, basePath, branch)
    console.log(`Found ${items.length} items in path "${basePath}"`)
    
    for (const item of items) {
      if (files.length >= maxFiles) {
        console.log('Reached max file limit')
        break
      }
      
      if (item.type === 'file' && item.size && item.size < CONFIG.MAX_FILE_SIZE) {
        try {
          const content = await fetchGitHubFileContent(repoUrl, item.path, branch)
          // 构建保存路径
          const actualBasePath = originalBasePath || basePath
          const relativePath = actualBasePath 
            ? item.path.substring(actualBasePath.length + 1) || item.path
            : item.path
          const savePath = folderName 
            ? `${folderName}/${relativePath}`
            : relativePath
          
          files.push({
            path: savePath,
            name: item.name,
            content,
            language: getLanguageFromFilename(item.name)
          })
        } catch (e) {
          console.warn(`Failed to fetch ${item.path}:`, e)
        }
      } else if (item.type === 'dir') {
        console.log(`Entering subdirectory: ${item.path}`)
        const childFiles = await fetchAllFilesRecursiveFallback(
          repoUrl, 
          item.path, 
          branch, 
          maxFiles - files.length, 
          originalBasePath || basePath,
          folderName
        )
        files.push(...childFiles)
      }
    }
  } catch (e) {
    console.error(`Error fetching files from path "${basePath}":`, e)
  }
  
  return files
}

// 保持兼容性
export async function fetchGitHubRepoFiles(repoUrl: string, path: string = '', branch?: string): Promise<GitHubFile[]> {
  const { owner, repo } = parseGitHubUrl(repoUrl)
  const ref = branch || (await fetchGitHubRepo(repoUrl)).default_branch
  
  const url = path 
    ? `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${ref}`
    : `https://api.github.com/repos/${owner}/${repo}/contents?ref=${ref}`
  
  const response = await throttledFetch(url)
  if (!response.ok) {
    let errorMsg = `获取文件列表失败 (${response.status})`
    try {
      const errorData = await response.json()
      if (errorData.message) {
        errorMsg += `: ${errorData.message}`
      }
    } catch {
      // 尝试解析 JSON 失败，尝试读取文本
      try {
        const errorText = await response.text()
        if (errorText) {
          errorMsg += `: ${errorText.substring(0, 100)}`
        }
      } catch {
        // 忽略
      }
    }
    if (response.status === 404) {
      errorMsg = '路径不存在，请检查是否正确'
    }
    throw new Error(errorMsg)
  }
  const data = await response.json()
  
  if (!Array.isArray(data)) {
    return [data]
  }
  return data
}
