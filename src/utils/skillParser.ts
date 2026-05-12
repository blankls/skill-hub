import JSZip from 'jszip'
import type { Skill, SkillFile, SkillSource } from '@/types'
import { v4 as uuidv4 } from 'uuid'

export async function parseSkillFromZip(zipBlob: Blob): Promise<Skill> {
  const zip = await JSZip.loadAsync(zipBlob)
  const files: SkillFile[] = []
  let skillData: Partial<Skill> = {}

  const skillJson = zip.file('skill.json')
  const skillMd = zip.file('SKILL.md')

  if (skillJson) {
    const content = await skillJson.async('string')
    skillData = JSON.parse(content)
  }

  for (const [path, file] of Object.entries(zip.files)) {
    if (!file.dir) {
      const content = await file.async('string')
      files.push({
        path,
        name: path.split('/').pop() || path,
        content,
        language: getLanguageFromFilename(path)
      })
    }
  }

  return {
    id: uuidv4(),
    name: skillData.name || '未命名技能',
    description: skillData.description || '',
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
  let inDescription = false

  for (const line of lines) {
    if (line.startsWith('# ')) {
      name = line.substring(2).trim()
      inDescription = true
    } else if (inDescription && line.trim() && !line.startsWith('## ')) {
      description += line + '\n'
    } else if (line.startsWith('## ')) {
      inDescription = false
    }
  }

  return {
    id: uuidv4(),
    name,
    description: description.trim(),
    version: '1.0.0',
    author: '匿名',
    tags: [],
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
