import { describe, it, expect } from 'vitest'
import { parseSkillFromZip, parseSkillFromMarkdown } from '../skillParser'
import JSZip from 'jszip'

describe('skillParser', () => {
  describe('parseSkillFromMarkdown', () => {
    it('should parse a basic skill from markdown', async () => {
      const markdown = `# Test Skill
## Description
This is a test skill
## Version
1.0.0
## Author
Test User
## Tags
- demo
- test
`
      
      const skill = await parseSkillFromMarkdown(markdown)
      
      expect(skill.name).toBe('Test Skill')
      expect(skill.description).toBe('This is a test skill')
      expect(skill.version).toBe('1.0.0')
      expect(skill.author).toBe('Test User')
      expect(skill.tags).toEqual(['demo', 'test'])
    })
    
    it('should handle missing sections gracefully', async () => {
      const markdown = `# Minimal Skill
Simple description
`
      
      const skill = await parseSkillFromMarkdown(markdown)
      
      expect(skill.name).toBe('Minimal Skill')
      expect(skill.version).toBe('1.0.0')
      expect(skill.author).toBe('匿名')
    })
    
    it('should include the markdown file in files', async () => {
      const markdown = `# File Test
Test content
`
      
      const skill = await parseSkillFromMarkdown(markdown)
      
      expect(skill.files.length).toBe(1)
      expect(skill.files[0].name).toBe('SKILL.md')
    })
  })
  
  describe('parseSkillFromZip', () => {
    it('should parse a zip with skill.json', async () => {
      const zip = new JSZip()
      zip.file('skill.json', JSON.stringify({
        name: 'Zip Skill',
        description: 'From zip file',
        version: '2.0.0',
        author: 'Zip User',
        tags: ['zip']
      }))
      zip.file('README.md', 'Readme content')
      
      const blob = await zip.generateAsync({ type: 'blob' })
      const skill = await parseSkillFromZip(blob, 'test.zip')
      
      expect(skill.name).toBe('Zip Skill')
      expect(skill.description).toBe('From zip file')
      expect(skill.files.length).toBeGreaterThan(0)
    })
    
    it('should parse a zip with SKILL.md', async () => {
      const zip = new JSZip()
      zip.file('SKILL.md', `# From MD Skill
## Description
Test from markdown in zip
## Version
3.0.0
## Author
MD User
## Tags
- md
- zip
`)
      zip.file('index.js', 'console.log("test")')
      
      const blob = await zip.generateAsync({ type: 'blob' })
      const skill = await parseSkillFromZip(blob, 'md-skill.zip')
      
      expect(skill.name).toBe('From MD Skill')
      expect(skill.files.length).toBe(2)
    })
    
    it('should infer name from zip filename if no metadata', async () => {
      const zip = new JSZip()
      zip.file('main.py', 'print("hello")')
      
      const blob = await zip.generateAsync({ type: 'blob' })
      const skill = await parseSkillFromZip(blob, 'my-test-skill.zip')
      
      expect(skill.name).toBe('my-test-skill')
    })
  })
})
