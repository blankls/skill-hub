import JSZip from 'jszip'
import type { Skill, SkillFile, SkillSource } from '@/types'
import { v4 as uuidv4 } from 'uuid'

export async function parseSkillFromZip(zipBlob: Blob, zipFileName?: string): Promise<Skill> {
  const zip = await JSZip.loadAsync(zipBlob)
  const files: SkillFile[] = []
  let skillData: Partial<Skill> = {}
  let inferredName: string | null = null
  let inferredDescription: string | null = null

  // 优先找 SKILL.md 和 skill.json
  const skillJson = zip.file('skill.json')
  const skillMd = zip.file('SKILL.md') || zip.file('skill.md')

  if (skillJson) {
    const content = await skillJson.async('string')
    skillData = JSON.parse(content)
  }

  // 收集文件并推断技能信息
  for (const [path, file] of Object.entries(zip.files)) {
    if (!file.dir) {
      const content = await file.async('string')
      files.push({
        path,
        name: path.split('/').pop() || path,
        content,
        language: getLanguageFromFilename(path)
      })

      // 如果还没有推断到技能名，尝试从文件名推断
      if (!inferredName && !path.includes('/')) {
        const baseName = path.split('.').slice(0, -1).join('.')
        if (baseName) {
          inferredName = baseName
        }
      }

      // 如果是 markdown 文件，尝试从内容提取信息
      if (path.toLowerCase() === 'readme.md' && !inferredDescription) {
        try {
          const firstLines = content.split('\n')
          for (const line of firstLines.slice(0, 50)) {
            if (line.startsWith('# ') && !skillData.name) {
              inferredName = line.substring(2).trim()
            } else if (!inferredDescription && line.trim() && !line.startsWith('#')) {
              inferredDescription += line + '\n'
            } else if (inferredDescription && line.startsWith('## ')) {
              break
            }
          }
        } catch {
          // 忽略解析错误
        }
      }
    }
  }

  // 确定最终的技能名
  let finalName = skillData.name || inferredName || (zipFileName ? zipFileName.replace(/\.zip$/i, '') : null) || '未命名技能'
  let finalDescription = skillData.description || inferredDescription || ''

  return {
    id: uuidv4(),
    name: finalName,
    description: finalDescription,
    version: skillData.version || '1.0.0',
    author: skillData.author || '匿名',
    tags: skillData.tags || [],
    source: { type: 'zip' },
    files,
    tools: skillData.tools || [],
    createdAt: new Date(),
    updatedAt: new Date()
  }
}

export async function parseSkillFromMarkdown(content: string, fileName: string = 'SKILL.md'): Promise<Skill> {
  const lines = content.split('\n')
  let name = '未命名技能'
  let description = ''
  let version = '1.0.0'
  let author = '匿名'
  let tags: string[] = []
  
  let currentSection = ''
  
  for (const line of lines) {
    if (line.startsWith('# ')) {
      name = line.substring(2).trim()
    } else if (line.startsWith('## ')) {
      currentSection = line.substring(3).trim().toLowerCase()
    } else if (currentSection) {
      const trimmedLine = line.trim()
      if (trimmedLine) {
        if (currentSection.includes('描述') || currentSection.includes('description')) {
          description += line + '\n'
        } else if (currentSection.includes('版本') || currentSection.includes('version')) {
          const match = trimmedLine.match(/(\d+\.\d+\.\d+)/)
          if (match) version = match[1]
        } else if (currentSection.includes('作者') || currentSection.includes('author')) {
          author = trimmedLine
        } else if (currentSection.includes('标签') || currentSection.includes('tags')) {
          if (trimmedLine.startsWith('- ')) {
            tags.push(trimmedLine.substring(2).trim())
          } else if (trimmedLine.includes(',')) {
            tags.push(...trimmedLine.split(',').map(t => t.trim()))
          }
        }
      }
    } else if (description === '' && trimmedLine) {
      description += line + '\n'
    }
  }

  return {
    id: uuidv4(),
    name,
    description: description.trim(),
    version,
    author,
    tags: tags.length > 0 ? tags : [],
    source: { type: 'skillmd', origin: fileName },
    files: [{
      path: fileName,
      name: fileName,
      content,
      language: 'markdown'
    }],
    createdAt: new Date(),
    updatedAt: new Date()
  }
}

function getLanguageFromFilename(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || ''
  const map: Record<string, string> = {
    ts: 'typescript', tsx: 'typescript',
    js: 'javascript', jsx: 'javascript',
    py: 'python',
    md: 'markdown',
    json: 'json',
    css: 'css', html: 'html'
  }
  return map[ext] || 'text'
}
