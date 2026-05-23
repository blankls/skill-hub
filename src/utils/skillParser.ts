import JSZip from 'jszip'
import type { Skill, SkillFile } from '@/types'
import { v4 as uuidv4 } from 'uuid'

/**
 * 解转义字符串，处理可能存在的转义字符（如 \\n → \n, \\t → \t, \\r → \r, \\\\ → \\, \\" → \" 等）
 */
function unescapeString(str: string): string {
  // 如果包含字面量的 \n，进行解转义
  if (str.includes('\\n') || str.includes('\\t') || str.includes('\\r') || str.includes('\\\\') || str.includes('\\"')) {
    try {
      // 尝试使用 JSON.parse 来解转义（最安全的方法）
      // 需要先把字符串用引号包裹起来，模拟 JSON 字符串
      return JSON.parse(`"${str.replace(/"/g, '\\"')}"`)
    } catch {
      // 如果 JSON.parse 失败，手动处理常见的转义序列
      return str
        .replace(/\\n/g, '\n')
        .replace(/\\t/g, '\t')
        .replace(/\\r/g, '\r')
        .replace(/\\\\/g, '\\')
        .replace(/\\"/g, '"')
        .replace(/\\'/g, "'")
    }
  }
  return str
}

export async function parseSkillFromZip(zipBlob: Blob, zipFileName?: string): Promise<Skill> {
  const zip = await JSZip.loadAsync(zipBlob)
  const files: SkillFile[] = []
  let skillData: Partial<Skill> = {}
  let inferredName: string | null = null
  let inferredDescription: string | null = null
  let skillMdDescription: string | null = null
  let skillMdName: string | null = null
  let skillMdTags: string[] = []
  let skillMdVersion: string | null = null
  let skillMdAuthor: string | null = null
  // let skillMdTools: string[] = [] // 预留：后续解析 tools 字段

  // 优先找 SKILL.md 和 skill.json（支持任意目录）
  let skillJsonPath: string | null = null
  let skillMdPath: string | null = null
  let readmePath: string | null = null
  let folderNameFromSkillMd: string | null = null
  
  for (const [path, file] of Object.entries(zip.files)) {
    if (!file.dir) {
      const lowerPath = path.toLowerCase()
      // 找 skill.json（根目录优先？）
      if (lowerPath === 'skill.json' && !skillJsonPath) {
        skillJsonPath = path
      }
      // 找 SKILL.md：任何路径下的 SKILL.md 都可以，但我们取第一个！
      else if (lowerPath.endsWith('/skill.md') || lowerPath === 'skill.md') {
        if (!skillMdPath) {
          skillMdPath = path
          // 提取文件夹名称逻辑：
          // 1. 如果在根目录（没有 /），使用 zip 文件名
          // 2. 如果有文件夹，使用文件夹名作为技能名
          if (!path.includes('/')) {
            if (zipFileName) {
              folderNameFromSkillMd = zipFileName.replace(/\.zip$/i, '')
            }
          } else {
            // 有文件夹，取第一个目录名
            folderNameFromSkillMd = path.split('/')[0]
          }
        }
      }
      // 找 README.md
      else if (lowerPath.endsWith('/readme.md') || lowerPath === 'readme.md') {
        if (!readmePath) {
          readmePath = path
        }
      }
    }
  }

  // 1. 解析 skill.json（优先级最高）
  if (skillJsonPath) {
    try {
      const skillJsonFile = zip.file(skillJsonPath)
      if (skillJsonFile) {
        let content = await skillJsonFile.async('string')
        content = unescapeString(content)
        skillData = JSON.parse(content)
      }
    } catch {
      // 忽略解析错误
    }
  }

  // 2. 解析 SKILL.md（优先级次高）
  if (skillMdPath) {
    try {
      const skillMdFile = zip.file(skillMdPath)
      if (skillMdFile) {
        let content = await skillMdFile.async('string')
        content = unescapeString(content)
        const lines = content.split('\n')
        let hasFrontmatter = false

        // a) 先尝试解析 YAML frontmatter - 简单版
        if (lines[0]?.trim() === '---') {
          hasFrontmatter = true
          // 提取 frontmatter 部分
          let endIndex = -1
          for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim() === '---') {
              endIndex = i
              break
            }
          }
          
          if (endIndex > 0) {
            const frontmatterLines = lines.slice(1, endIndex)
            let currentKey: string | null = null
            let valueBuffer: string[] = []
            
            const applyValue = () => {
              if (currentKey && valueBuffer.length > 0) {
                const value = valueBuffer.join('\n').trim()
                if (value) {
                  switch (currentKey) {
                    case 'description':
                      skillMdDescription = value
                      break
                    case 'name':
                      skillMdName = value
                      break
                    case 'version':
                      skillMdVersion = value
                      break
                    case 'author':
                      skillMdAuthor = value
                      break
                    case 'tags':
                      skillMdTags = value.split(',').map(t => t.trim()).filter(Boolean)
                      break
                    case 'tools':
                      // skillMdTools = value.split(',').map(t => t.trim()).filter(Boolean) // 预留
                      break
                  }
                }
              }
            }
            
            for (const line of frontmatterLines) {
              // 检查是不是新的 key
              const keyMatch = line.match(/^(\w[\w-]*)\s*:\s*(.*)$/)
              if (keyMatch) {
                applyValue()
                currentKey = keyMatch[1].toLowerCase()
                let rest = keyMatch[2].trim()
                
                if (rest === '|' || rest === '>' || rest === '') {
                  // 多行，继续收集
                  valueBuffer = []
                } else {
                  // 单行值
                  rest = rest.replace(/^['"]|['"]$/g, '')
                  valueBuffer = [rest]
                }
              } else if (currentKey) {
                // 继续收集值
                valueBuffer.push(line)
              }
            }
            
            // 应用最后一个值
            applyValue()
          }
        }

        // b) 从 markdown 正文补充信息（注意提取 name 的逻辑！）
        let inDesc = false
        let inTags = false
        const descLines: string[] = []
        const tempTags: string[] = []
        
        for (const line of lines) {
          // 从 H1 标题提取名称（只有没有 frontmatter 时才提取！有 frontmatter 时留空给文件夹名使用！）
          if (!skillMdName && !hasFrontmatter && line.startsWith('# ')) {
            skillMdName = line.substring(2).trim()
          }
          // 从 ## 描述 提取描述
          else if (line.startsWith('## ') && (line.toLowerCase().includes('描述') || line.toLowerCase().includes('description'))) {
            inDesc = true
            inTags = false
            continue
          }
          // 从 ## 标签 提取标签
          else if (line.startsWith('## ') && (line.toLowerCase().includes('标签') || line.toLowerCase().includes('tags'))) {
            inDesc = false
            inTags = true
            continue
          }
          // 遇到新的 ## 标题停止
          else if (line.startsWith('## ')) {
            inDesc = false
            inTags = false
          }
          // 收集内容
          else if (inDesc) {
            descLines.push(line)
          }
          else if (inTags) {
            if (line.trim().startsWith('- ')) {
              tempTags.push(line.trim().substring(2).trim())
            }
          }
        }
        
        if (descLines.length > 0 && !skillMdDescription) {
          skillMdDescription = descLines.join('\n').trim()
        }
        if (tempTags.length > 0 && skillMdTags.length === 0) {
          skillMdTags = tempTags
        }
      }
    } catch {
      // 忽略解析错误
    }
  }

  // 3. 收集所有文件，并从 README.md 提取兜底信息
  for (const [path, file] of Object.entries(zip.files)) {
    if (!file.dir) {
      let content = await file.async('string')
      content = unescapeString(content)
      files.push({
        path,
        name: path.split('/').pop() || path,
        content,
        language: getLanguageFromFilename(path)
      })

      // 从 README.md 标题推断名称（如果还没有）
      // 不要从任意文件名推断，优先使用zip文件名

      // 从 README.md 提取（兜底）
      if (path.toLowerCase() === 'readme.md' && !inferredDescription && !skillMdDescription) {
        try {
          const firstLines = content.split('\n')
          const descLines: string[] = []
          for (const line of firstLines.slice(0, 50)) {
            if (line.startsWith('# ') && !skillData.name && !skillMdName && !inferredName) {
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

  // 合并所有来源的信息（优先级：skill.json > SKILL.md > SKILL.md所在文件夹 > README.md > ZIP文件名）
  const finalName = skillData.name || skillMdName || folderNameFromSkillMd || inferredName || (zipFileName ? zipFileName.replace(/\.zip$/i, '') : null) || '未命名技能'
  const finalDescription = skillData.description || skillMdDescription || inferredDescription || ''
  const finalTags = skillData.tags && skillData.tags.length > 0 
    ? skillData.tags 
    : skillMdTags.length > 0 
      ? skillMdTags 
      : []
  const finalTools = skillData.tools && skillData.tools.length > 0 
    ? skillData.tools 
    : undefined
  const finalVersion = skillData.version || skillMdVersion || '1.0.0'
  const finalAuthor = skillData.author || skillMdAuthor || '匿名'

  return {
    id: uuidv4(),
    name: finalName,
    description: finalDescription,
    version: finalVersion,
    author: finalAuthor,
    tags: finalTags,
    source: { type: 'zip' },
    files,
    tools: finalTools,
    createdAt: new Date(),
    updatedAt: new Date()
  }
}

export async function parseSkillFromMarkdown(content: string, fileName: string = 'SKILL.md'): Promise<Skill> {
  content = unescapeString(content)
  const lines = content.split('\n')
  let name = '未命名技能'
  let description = ''
  let version = '1.0.0'
  let author = '匿名'
  let tags: string[] = []
  // tools 字段比较复杂，这里我们先不处理，留给 skill.json 或其他源
  let tools: undefined

  // 1) 先解析 YAML frontmatter - 简化版
  let frontmatterParsed = false
  if (lines[0]?.trim() === '---') {
    let endIndex = -1
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === '---') {
        endIndex = i
        break
      }
    }
    
    if (endIndex > 0) {
      frontmatterParsed = true
      const frontmatterLines = lines.slice(1, endIndex)
      let currentKey: string | null = null
      let valueBuffer: string[] = []
      
      const applyValue = () => {
        if (currentKey && valueBuffer.length > 0) {
          const value = valueBuffer.join('\n').trim()
          if (value) {
            switch (currentKey) {
              case 'name':
                name = value
                break
              case 'description':
                description = value
                break
              case 'version':
                version = value
                break
              case 'author':
                author = value
                break
              case 'tags':
                tags = value.split(',').map(t => t.trim()).filter(Boolean)
                break
            }
          }
        }
      }
      
      for (const line of frontmatterLines) {
        // 检查是不是新的 key
        const keyMatch = line.match(/^(\w[\w-]*)\s*:\s*(.*)$/)
        if (keyMatch) {
          applyValue()
          currentKey = keyMatch[1].toLowerCase()
          let rest = keyMatch[2].trim()
          
          if (rest === '|' || rest === '>' || rest === '') {
            // 多行，继续收集
            valueBuffer = []
          } else {
            // 单行值
            rest = rest.replace(/^['"]|['"]$/g, '')
            valueBuffer = [rest]
          }
        } else if (currentKey) {
          // 继续收集值
          valueBuffer.push(line)
        }
      }
      
      // 应用最后一个值
      applyValue()
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
        if ((currentSection.includes('描述') || currentSection.includes('description')) && !description) {
          description += line + '\n'
        } else if ((currentSection.includes('版本') || currentSection.includes('version')) && version === '1.0.0') {
          const match = trimmedLine.match(/(\d+\.\d+\.\d+)/)
          if (match) version = match[1]
        } else if ((currentSection.includes('作者') || currentSection.includes('author')) && author === '匿名') {
          author = trimmedLine
        } else if (currentSection.includes('标签') || currentSection.includes('tags')) {
          if (trimmedLine.startsWith('- ')) {
            const tag = trimmedLine.substring(2).trim()
            if (!tags.includes(tag)) tags.push(tag)
          } else if (trimmedLine.includes(',')) {
            const newTags = trimmedLine.split(',').map(t => t.trim()).filter(Boolean)
            for (const tag of newTags) {
              if (!tags.includes(tag)) tags.push(tag)
            }
          }
        }
      }
    } else if (!description && line.trim() && !line.startsWith('#')) {
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
    tools,
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
