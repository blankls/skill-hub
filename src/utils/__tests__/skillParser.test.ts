import { describe, it, expect } from 'vitest'
import JSZip from 'jszip'
import { parseSkillFromZip, parseSkillFromMarkdown } from '../skillParser'

describe('skillParser', () => {
  describe('parseSkillFromMarkdown', () => {
    it('should parse markdown with single-line frontmatter', async () => {
      const md = `---
name: Test Skill
description: This is a test skill
version: 1.0.0
author: Test Author
tags: test, example
---

# Test Skill

This is a test skill.
`
      const skill = await parseSkillFromMarkdown(md, 'test.md')
      expect(skill.name).toBe('Test Skill')
      expect(skill.description).toBe('This is a test skill')
      expect(skill.version).toBe('1.0.0')
      expect(skill.author).toBe('Test Author')
      expect(skill.tags).toEqual(['test', 'example'])
    })

    it('should parse the actual skill-creator frontmatter from user example', async () => {
      const md = `---
name: skill-creator
description: Create new skills, modify and improve existing skills, and measure skill performance. Use when users want to create a skill from scratch, edit, or optimize an existing skill, run evals to test a skill, benchmark skill performance with variance analysis, or optimize a skill's description for better triggering accuracy.
---

# Skill Creator

A skill for creating new skills and iteratively improving them.
`
      const skill = await parseSkillFromMarkdown(md, 'test.md')
      expect(skill.name).toBe('skill-creator')
      expect(skill.description).toBe('Create new skills, modify and improve existing skills, and measure skill performance. Use when users want to create a skill from scratch, edit, or optimize an existing skill, run evals to test a skill, benchmark skill performance with variance analysis, or optimize a skill\'s description for better triggering accuracy.')
    })

    it('should unescape escaped strings (\\n becomes real newline)', async () => {
      // 模拟用户看到的问题：内容中是字面量的 \\n
      const md = '---\\nname: skill-creator\\ndescription: Create new skills\\n---\\n\\n# Skill Creator\\n\\nA skill...'
      const skill = await parseSkillFromMarkdown(md, 'test.md')
      expect(skill.name).toBe('skill-creator')
      expect(skill.description).toBe('Create new skills')
      expect(skill.files[0].content).toContain('# Skill Creator')
      expect(skill.files[0].content).toContain('\n') // 检查是否有真正的换行符
    })

    it('should parse markdown with multi-line frontmatter using |', async () => {
      const md = `---
name: Multi-line Skill
description: |
  This is a multi-line description
  with several lines of text
  that should all be captured properly
version: 2.0.0
author: Multi Author
tags: multi, test
---

# Multi-line Skill

Test content.
`
      const skill = await parseSkillFromMarkdown(md, 'test.md')
      expect(skill.name).toBe('Multi-line Skill')
      expect(skill.description).toContain('This is a multi-line description')
      expect(skill.description).toContain('with several lines of text')
      expect(skill.version).toBe('2.0.0')
    })

    it('should fall back to markdown headers when frontmatter is missing', async () => {
      const md = `# Fallback Skill

## 描述
This is a fallback description.

## 版本
1.0.0

## 作者
Fallback Author

## 标签
- tag1
- tag2
`
      const skill = await parseSkillFromMarkdown(md, 'test.md')
      expect(skill.name).toBe('Fallback Skill')
      expect(skill.description).toBe('This is a fallback description.')
      expect(skill.version).toBe('1.0.0')
      expect(skill.author).toBe('Fallback Author')
      expect(skill.tags).toEqual(['tag1', 'tag2'])
    })
  })

  describe('parseSkillFromZip', () => {
    it('should parse zip with skill.json', async () => {
      const zip = new JSZip()
      zip.file('skill.json', JSON.stringify({
        name: 'JSON Skill',
        description: 'Skill from JSON',
        version: '1.0.0',
        author: 'JSON Author',
        tags: ['json', 'test'],
        tools: []
      }))
      const blob = await zip.generateAsync({ type: 'blob' })
      
      const skill = await parseSkillFromZip(blob, 'json-skill.zip')
      expect(skill.name).toBe('JSON Skill')
      expect(skill.description).toBe('Skill from JSON')
      expect(skill.version).toBe('1.0.0')
      expect(skill.author).toBe('JSON Author')
      expect(skill.tags).toEqual(['json', 'test'])
    })

    it('should use folder name from SKILL.md when it\'s in a subfolder', async () => {
      const zip = new JSZip()
      zip.file('my-awesome-skill/SKILL.md', `---
name: 
description: Test description
---
# Test
`)
      const blob = await zip.generateAsync({ type: 'blob' })
      
      const skill = await parseSkillFromZip(blob, 'test-zip-file.zip')
      expect(skill.name).toBe('my-awesome-skill')
    })

    it('should use zip filename when SKILL.md is in root directory', async () => {
      const zip = new JSZip()
      zip.file('SKILL.md', `---
name: 
description: Test description
---
# Test
`)
      const blob = await zip.generateAsync({ type: 'blob' })
      
      const skill = await parseSkillFromZip(blob, 'my-skill-package.zip')
      expect(skill.name).toBe('my-skill-package')
    })

    it('should prioritize SKILL.md frontmatter name over folder name', async () => {
      const zip = new JSZip()
      zip.file('folder-name/SKILL.md', `---
name: Frontmatter Name
description: Test description
---
# Test
`)
      const blob = await zip.generateAsync({ type: 'blob' })
      
      const skill = await parseSkillFromZip(blob, 'zip-filename.zip')
      expect(skill.name).toBe('Frontmatter Name')
    })

    it('should parse zip with SKILL.md single-line frontmatter', async () => {
      const zip = new JSZip()
      zip.file('SKILL.md', `---
name: SKILL.md Skill
description: Skill from SKILL.md
version: 1.0.0
author: SKILL.md Author
tags: markdown, test
---

# Skill

Content.
`)
      const blob = await zip.generateAsync({ type: 'blob' })
      
      const skill = await parseSkillFromZip(blob, 'skillmd-skill.zip')
      expect(skill.name).toBe('SKILL.md Skill')
      expect(skill.description).toBe('Skill from SKILL.md')
      expect(skill.version).toBe('1.0.0')
      expect(skill.author).toBe('SKILL.md Author')
      expect(skill.tags).toEqual(['markdown', 'test'])
    })

    it('should parse zip with SKILL.md multi-line frontmatter', async () => {
      const zip = new JSZip()
      zip.file('SKILL.md', `---
name: Multi-line ZIP Skill
description: |
  This is a multi-line description
  that should work in ZIP files
  too!
version: 2.0.0
author: Multi Author
tags: zip, multi-line
---

# Test

Content.
`)
      const blob = await zip.generateAsync({ type: 'blob' })
      
      const skill = await parseSkillFromZip(blob, 'multi-skill.zip')
      expect(skill.name).toBe('Multi-line ZIP Skill')
      expect(skill.description).toContain('This is a multi-line description')
      expect(skill.description).toContain('that should work in ZIP files')
      expect(skill.version).toBe('2.0.0')
    })

    it('should parse zip with README.md as fallback', async () => {
      const zip = new JSZip()
      zip.file('README.md', `# README Skill

This is a skill from README.
`)
      const blob = await zip.generateAsync({ type: 'blob' })
      
      const skill = await parseSkillFromZip(blob, 'readme-skill.zip')
      expect(skill.name).toBe('README Skill')
      expect(skill.description).toContain('This is a skill from README')
    })

    it('should parse zip with files in subdirectories', async () => {
      const zip = new JSZip()
      zip.file('SKILL.md', `---
name: Subdir Skill
description: Skill with files in subdirs
version: 1.0.0
---

# Skill

Content.
`)
      zip.file('src/main.py', 'print("hello")')
      zip.file('src/utils.py', 'def util(): pass')
      
      const blob = await zip.generateAsync({ type: 'blob' })
      const skill = await parseSkillFromZip(blob, 'subdir-skill.zip')
      
      expect(skill.name).toBe('Subdir Skill')
      expect(skill.files.length).toBe(3)
    })

    it('should use zip filename as name when no other name available', async () => {
      const zip = new JSZip()
      zip.file('somefile.txt', 'content')
      
      const blob = await zip.generateAsync({ type: 'blob' })
      const skill = await parseSkillFromZip(blob, 'my-awesome-skill.zip')
      
      expect(skill.name).toBe('my-awesome-skill')
    })
  })
})
