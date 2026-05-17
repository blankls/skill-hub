import type { GithubMeta, Skill, SkillFile } from '@/types'
import { parseSkillFromMarkdown } from '@/utils/skillParser'

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

export interface GitHubSourceConfig {
  repoOwner: string
  repoName: string
  branch: string
  subfolderPath?: string
}

export async function fetchGitHubRepo(repoUrl: string): Promise<GitHubRepoMeta> {
  const match = repoUrl.match(/github\.com[/:]([^/]+)\/([^/.]+)/)
  if (!match) throw new Error('Invalid GitHub URL')
  const [, owner, repo] = match

  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`)
  if (!response.ok) throw new Error('Failed to fetch repo')
  return await response.json()
}

export function parseGitHubUrl(repoUrl: string): { owner: string; repo: string } {
  const match = repoUrl.match(/github\.com[/:]([^/]+)\/([^/.]+)/)
  if (!match) throw new Error('Invalid GitHub URL')
  return { owner: match[1], repo: match[2] }
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

export async function fetchGitHubRepoFiles(repoUrl: string, path: string = '', branch?: string): Promise<GitHubFile[]> {
  const { owner, repo } = parseGitHubUrl(repoUrl)
  const ref = branch || (await fetchGitHubRepo(repoUrl)).default_branch
  
  // 不要双重编码，直接拼接路径
  const url = path 
    ? `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${ref}`
    : `https://api.github.com/repos/${owner}/${repo}/contents?ref=${ref}`
  
  console.log('Fetching GitHub files from:', url)
  
  const response = await fetch(url)
  if (!response.ok) {
    const errorText = await response.text()
    console.error('GitHub API error:', response.status, errorText)
    throw new Error(`Failed to fetch files: ${response.status} - ${errorText}`)
  }
  const data = await response.json()
  
  // 如果返回的不是数组（可能是单个文件），包装成数组
  if (!Array.isArray(data)) {
    return [data]
  }
  return data
}

export async function fetchGitHubFileContent(repoUrl: string, filePath: string, branch?: string): Promise<string> {
  const { owner, repo } = parseGitHubUrl(repoUrl)
  const ref = branch || (await fetchGitHubRepo(repoUrl)).default_branch
  
  // 不要双重编码，直接拼接路径
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${ref}`
  
  console.log('Fetching GitHub file content from:', url)
  
  const response = await fetch(url)
  if (!response.ok) {
    const errorText = await response.text()
    console.error('GitHub API file fetch error:', response.status, errorText)
    throw new Error(`Failed to fetch file: ${response.status} - ${errorText}`)
  }
  const data = await response.json()
  
  // 如果是大文件，使用 download_url
  if (data.download_url && !data.content) {
    const downloadResponse = await fetch(data.download_url)
    return await downloadResponse.text()
  }
  
  // 处理 content 可能不存在的情况
  if (data.content) {
    return atob(data.content)
  }
  
  throw new Error('No content available')
}

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

async function fetchAllFilesRecursive(
  repoUrl: string, 
  path: string = '', 
  branch: string,
  maxFiles: number = 50
): Promise<SkillFile[]> {
  const files: SkillFile[] = []
  
  try {
    const items = await fetchGitHubRepoFiles(repoUrl, path, branch)
    console.log(`Found ${items.length} items in path "${path}"`)
    
    for (const item of items) {
      if (files.length >= maxFiles) {
        console.log('Reached max file limit')
        break
      }
      
      if (item.type === 'file' && item.size && item.size < 500 * 1024) { // 小于 500KB
        try {
          const content = await fetchGitHubFileContent(repoUrl, item.path, branch)
          files.push({
            path: item.path,
            name: item.name,
            content,
            language: getLanguageFromFilename(item.name)
          })
          console.log(`Fetched file: ${item.path} (${item.size} bytes)`)
        } catch (e) {
          console.warn(`Failed to fetch ${item.path}:`, e)
        }
      } else if (item.type === 'dir') {
        // 递归获取子目录文件，但有数量限制
        console.log(`Entering subdirectory: ${item.path}`)
        const childFiles = await fetchAllFilesRecursive(repoUrl, item.path, branch, maxFiles - files.length)
        files.push(...childFiles)
      }
    }
  } catch (e) {
    console.error(`Error fetching files from path "${path}":`, e)
    // 即使出错也返回已获取的文件
  }
  
  console.log(`Total files fetched: ${files.length}`)
  return files
}

export async function fetchFullSkillFromGitHub(
  repoUrl: string,
  branch: string,
  subfolderPath?: string,
  existingId?: string
): Promise<Skill> {
  console.log('Starting fetchFullSkillFromGitHub called with:', { repoUrl, branch, subfolderPath, existingId })
  
  const repoMeta = await fetchGitHubRepo(repoUrl)
  const meta = toGithubMeta(repoMeta, branch, subfolderPath)
  
  // 获取所有文件
  let files: SkillFile[] = []
  try {
    files = await fetchAllFilesRecursive(
      repoUrl, 
      subfolderPath || '', 
      branch,
      50
    )
  } catch (e) {
    console.error('Error fetching all files:', e)
    // 即使获取文件失败，我们继续返回基础技能数据
  }
  
  // 尝试从 SKILL.md 或 README.md 提取技能信息
  let skillName = subfolderPath 
    ? subfolderPath.split('/').pop() || repoMeta.name
    : repoMeta.name
  let description = repoMeta.description || 'GitHub Repository Skill'
  let version = '1.0.0'
  let author = meta.repoOwner
  let tags: string[] = ['github']
  
  if (meta.language) tags.push(meta.language.toLowerCase())
  tags.push(...meta.topics.slice(0, 5))
  
  // 查找 SKILL.md 或 README.md
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
    // 从 README 提取描述
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
  
  const result = {
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
      isContentCached: files.length > 0 // 只要有文件就算缓存了
    },
    files,
    createdAt: new Date(),
    updatedAt: new Date()
  }
  
  console.log('Successfully fetched skill from GitHub:', result)
  return result
}
