export interface GitHubRepoMeta {
  name: string
  full_name: string
  description: string
  html_url: string
  stargazers_count: number
  forks_count: number
  default_branch: string
}

export interface GitHubFile {
  name: string
  path: string
  type: 'file' | 'dir'
  download_url?: string
}

export async function fetchGitHubRepo(repoUrl: string): Promise<GitHubRepoMeta> {
  const match = repoUrl.match(/github\.com[/:]([^/]+)\/([^/.]+)/)
  if (!match) throw new Error('Invalid GitHub URL')
  const [, owner, repo] = match

  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`)
  if (!response.ok) throw new Error('Failed to fetch repo')
  return await response.json()
}

export async function fetchGitHubRepoFiles(repoUrl: string, path: string = '', branch?: string): Promise<GitHubFile[]> {
  const match = repoUrl.match(/github\.com[/:]([^/]+)\/([^/.]+)/)
  if (!match) throw new Error('Invalid GitHub URL')
  const [, owner, repo] = match

  const ref = branch || (await fetchGitHubRepo(repoUrl)).default_branch
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${ref}`)
  if (!response.ok) throw new Error('Failed to fetch files')
  return await response.json()
}

export async function fetchGitHubFileContent(repoUrl: string, filePath: string, branch?: string): Promise<string> {
  const match = repoUrl.match(/github\.com[/:]([^/]+)\/([^/.]+)/)
  if (!match) throw new Error('Invalid GitHub URL')
  const [, owner, repo] = match

  const ref = branch || (await fetchGitHubRepo(repoUrl)).default_branch
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${ref}`)
  if (!response.ok) throw new Error('Failed to fetch file')
  const data = await response.json()
  return atob(data.content)
}
