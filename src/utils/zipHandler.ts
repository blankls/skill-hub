import JSZip from 'jszip'
import type { Skill } from '@/types'

export async function exportSkillToZip(skill: Skill): Promise<Blob> {
  const zip = new JSZip()
  
  const metadata = {
    name: skill.name,
    version: skill.version,
    author: skill.author,
    description: skill.description,
    tags: skill.tags,
    source: skill.source,
    tools: skill.tools
  }
  
  zip.file('skill.json', JSON.stringify(metadata, null, 2))
  
  if (skill.files && skill.files.length > 0) {
    skill.files.forEach(file => {
      zip.file(file.path, file.content)
    })
  } else {
    zip.file('README.md', generateEmptySkillReadme(skill))
  }
  
  return zip.generateAsync({ type: 'blob' })
}

function generateEmptySkillReadme(skill: Skill): string {
  return `# ${skill.name}

## 描述
${skill.description || '暂无描述'}

## 版本
${skill.version || '1.0.0'}

## 作者
${skill.author || '未知'}

## 标签
${skill.tags?.length ? skill.tags.map(tag => `- ${tag}`).join('\n') : '- 暂无标签'}

---

> 此技能暂无源代码文件。
> 你可以通过编辑功能添加相关文件。
`
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
