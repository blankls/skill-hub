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
              const descLines: string[] = []
              for (const line of firstLines.slice(0, 50)) {
                if (line.startsWith('# ') && !skillData.name) {
                  inferredName = line.substring(2).trim()
                } else if (line.trim() && !line.startsWith('#')) {
                  descLines.push(line)
                } else if (descLines.length > 0 && line.startsWith('## ')) {
                  break
                }
              }
              if (descLines.length > 0) {
                inferredDescription = descLines.join('\n')
              }
            } catch {
              // 忽略解析错误
            }
          }
    }
  }

  // 尝试从 SKILL.md 提取描述（优先级高）
  let skillMdDescription: string | null = null
  if (skillMd) {
    try {
      const content = await skillMd.async('string')
      const lines = content.split('\n')

      // 1) 先尝试解析 YAML frontmatter (--- ... ---)
      if (lines[0]?.trim() === '---') {
        let currentKey: string | null = null
        let multiLineValue: string[] = []
        let isMultiLine = false
        
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i]
          if (line.trim() === '---') {
            // 保存最后一个多行值
            if (currentKey && multiLineValue.length > 0) {
              const value = multiLineValue.join('\n').trim()
              if (currentKey === 'description' && value) {
                skillMdDescription = value
              }
              if (currentKey === 'name' && value && !skillData.name && !inferredName) {
                inferredName = value
              }
            }
            break
          }
          
          // 检查是否是新的键值对
          const keyMatch = line.match(/^(\w[\w-]*)\s*:\s*(.*)$/)
          if (keyMatch) {
            // 先保存之前的多行值
            if (currentKey && multiLineValue.length > 0) {
              const value = multiLineValue.join('\n').trim()
              if (currentKey === 'description' && value) {
                skillMdDescription = value
              }
              if (currentKey === 'name' && value && !skillData.name && !inferredName) {
                inferredName = value
              }
            }
            
            currentKey = keyMatch[1].toLowerCase()
            let value = keyMatch[2].trim()
            
            // 检查是否是多行标记（| 或 >）
            if (value === '|' || value === '>') {
              isMultiLine = true
              multiLineValue = []
            } else {
              // 单行值
              isMultiLine = false
              multiLineValue = []
              value = value.replace(/^['"]|['"]$/g, '')
              if (currentKey === 'description' && value) {
                skillMdDescription = value
              }
              if (currentKey === 'name' && value && !skillData.name && !inferredName) {
                inferredName = value
              }
            }
          } else if (isMultiLine && currentKey && (line.startsWith('  ') || line.startsWith('\t') || line.trim() === '')) {
            // 多行值的一部分
            multiLineValue.push(line.trimEnd())
          }
        }
      }

      // 2) 如果 frontmatter 没拿到 description，尝试从 ## 描述 段落提取
      if (!skillMdDescription) {
        let inDesc = false
        const descLines: string[] = []
        for (const line of lines) {
          if (line.startsWith('## ') && (line.toLowerCase().includes('描述') || line.toLowerCase().includes('description'))) {
            inDesc = true
            continue
          }
          if (inDesc) {
            if (line.startsWith('## ')) break
            if (line.trim()) descLines.push(line.trim())
          }
        }
        if (descLines.length > 0) {
          skillMdDescription = descLines.join('\n')
        }
      }

      for (const line of lines) {
        if (line.startsWith('# ') && !skillData.name && !inferredName) {
          inferredName = line.substring(2).trim()
          break
        }
      }
    } catch {
      // 忽略解析错误
    }
  }

  const finalName = skillData.name || inferredName || (zipFileName ? zipFileName.replace(/\.zip$/i, '') : null) || '未命名技能'
  const finalDescription = skillData.description || skillMdDescription || inferredDescription || ''

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

  // 1) 先解析 YAML frontmatter
  let frontmatterParsed = false
  if (lines[0]?.trim() === '---') {
    let currentKey: string | null = null
    let multiLineValue: string[] = []
    let isMultiLine = false
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]
      if (line.trim() === '---') {
        frontmatterParsed = true
        // 保存最后一个多行值
        if (currentKey && multiLineValue.length > 0) {
          const value = multiLineValue.join('\n').trim()
          if (currentKey === 'name' && value) name = value
          if (currentKey === 'description' && value) description = value
          if (currentKey === 'version' && value) version = value
          if (currentKey === 'author' && value) author = value
          if (currentKey === 'tags' && value) tags = value.split(',').map((t: string) => t.trim())
        }
        break
      }
      
      // 检查是否是新的键值对
      const keyMatch = line.match(/^(\w[\w-]*)\s*:\s*(.*)$/)
      if (keyMatch) {
        // 先保存之前的多行值
        if (currentKey && multiLineValue.length > 0) {
          const value = multiLineValue.join('\n').trim()
          if (currentKey === 'name' && value) name = value
          if (currentKey === 'description' && value) description = value
          if (currentKey === 'version' && value) version = value
          if (currentKey === 'author' && value) author = value
          if (currentKey === 'tags' && value) tags = value.split(',').map((t: string) => t.trim())
        }
        
        currentKey = keyMatch[1].toLowerCase()
        let value = keyMatch[2].trim()
        
        // 检查是否是多行标记（| 或 >）
        if (value === '|' || value === '>') {
          isMultiLine = true
          multiLineValue = []
        } else {
          // 单行值
          isMultiLine = false
          multiLineValue = []
          value = value.replace(/^['"]|['"]$/g, '')
          if (currentKey === 'name' && value) name = value
          if (currentKey === 'description' && value) description = value
          if (currentKey === 'version' && value) version = value
          if (currentKey === 'author' && value) author = value
          if (currentKey === 'tags' && value) tags = value.split(',').map((t: string) => t.trim())
        }
      } else if (isMultiLine && currentKey && (line.startsWith('  ') || line.startsWith('\t') || line.trim() === '')) {
        // 多行值的一部分
        multiLineValue.push(line.trimEnd())
      }
    }
  }

  // 2) 回退到 markdown 标题解析
  let currentSection = ''
  const startIndex = frontmatterParsed ? lines.findIndex((l, i) => i > 0 && l.trim() === '---') + 1 : 0
  
  for (const line of lines.slice(startIndex)) {
    if (line.startsWith('# ') && name === '未命名技能') {
      name = line.substring(2).trim()
    } else if (line.startsWith('## ')) {
      currentSection = line.substring(3).trim().toLowerCase()
    } else if (currentSection) {
      const trimmedLine = line.trim()
      if (trimmedLine) {
        if (currentSection.includes('描述') || currentSection.includes('description')) {
          if (!description) description += line + '\n'
        } else if (currentSection.includes('版本') || currentSection.includes('version')) {
          const match = trimmedLine.match(/(\d+\.\d+\.\d+)/)
          if (match) version = match[1]
        } else if (currentSection.includes('作者') || currentSection.includes('author')) {
          if (author === '匿名') author = trimmedLine
        } else if (currentSection.includes('标签') || currentSection.includes('tags')) {
          if (trimmedLine.startsWith('- ')) {
            tags.push(trimmedLine.substring(2).trim())
          } else if (trimmedLine.includes(',')) {
            tags.push(...trimmedLine.split(',').map(t => t.trim()))
          }
        }
      }
    } else if (!description && line.trim()) {
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
