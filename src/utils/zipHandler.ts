import JSZip from 'jszip'
import type { Skill } from '@/types'

export async function exportSkillToZip(skill: Skill): Promise<Blob> {
  const zip = new JSZip()

  if (skill.files && skill.files.length > 0) {
    skill.files.forEach(file => {
      zip.file(file.path, file.content)
    })
  }

  return zip.generateAsync({ type: 'blob' })
}

export async function exportGroupToZip(groupName: string, skills: Skill[]): Promise<Blob> {
  const zip = new JSZip()

  for (const skill of skills) {
    const folder = zip.folder(skill.name)
    if (skill.files && skill.files.length > 0) {
      for (const file of skill.files) {
        folder.file(file.name, file.content)
      }
    }
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
