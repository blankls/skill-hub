import JSZip from 'jszip'
import type { Skill } from '@/types'

export async function exportSkillToZip(skill: Skill): Promise<Blob> {
  const zip = new JSZip()
  
  const metadata = {
    name: skill.name,
    version: skill.version,
    author: skill.author,
    description: skill.description,
    sourceType: skill.sourceType,
    tags: skill.tags,
    githubUrl: skill.githubUrl,
    tools: skill.tools
  }
  
  zip.file('skill.json', JSON.stringify(metadata, null, 2))
  
  if (skill.readme) {
    zip.file('README.md', skill.readme)
  }
  
  if (skill.files) {
    const addFilesToZip = (files: any[], parentPath = '') => {
      files.forEach(file => {
        const filePath = parentPath ? `${parentPath}/${file.name}` : file.name
        if (file.type === 'folder' && file.children) {
          addFilesToZip(file.children, filePath)
        } else if (file.content) {
          zip.file(filePath, file.content)
        }
      })
    }
    addFilesToZip(skill.files)
  }
  
  return zip.generateAsync({ type: 'blob' })
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
