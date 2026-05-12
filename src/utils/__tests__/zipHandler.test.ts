import { describe, it, expect, vi } from 'vitest'
import { exportSkillToZip, downloadBlob } from '../zipHandler'
import { mockSkills } from '../mockData'
import JSZip from 'jszip'

vi.mock('jszip')
const JSZipMock = vi.mocked(JSZip)

describe('zipHandler', () => {
  it('should export skill to zip', async () => {
    const skill = mockSkills[0]
    const zipInstance = {
      file: vi.fn(),
      generateAsync: vi.fn().mockResolvedValue(new Blob(['zip content']))
    }
    JSZipMock.mockImplementation(() => zipInstance as any)
    
    const result = await exportSkillToZip(skill)
    
    expect(zipInstance.file).toHaveBeenCalledWith('skill.json', expect.any(String))
    expect(result).toBeInstanceOf(Blob)
  })

  it('should add README if present', async () => {
    const skill = mockSkills[0]
    const zipInstance = {
      file: vi.fn(),
      generateAsync: vi.fn().mockResolvedValue(new Blob())
    }
    JSZipMock.mockImplementation(() => zipInstance as any)
    
    await exportSkillToZip(skill)
    
    expect(zipInstance.file).toHaveBeenCalledWith('README.md', expect.any(String))
  })

  it('should simulate download', () => {
    const blob = new Blob(['test'])
    const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('test-url')
    const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
    const clickSpy = vi.fn()
    
    vi.spyOn(document, 'createElement').mockReturnValue({
      href: '',
      download: '',
      click: clickSpy
    } as any)
    
    downloadBlob(blob, 'test.zip')
    
    expect(createObjectURLSpy).toHaveBeenCalled()
    expect(clickSpy).toHaveBeenCalled()
    expect(revokeObjectURLSpy).toHaveBeenCalled()
  })
})
