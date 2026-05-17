
import JSZip from 'jszip'
import { parseSkillFromZip } from './src/utils/skillParser'
import { exportSkillToZip } from './src/utils/zipHandler'
import { mockSkills } from './src/utils/mockData'

async function testZipImport() {
  console.log('=== 开始测试 ZIP 导入功能 ===\n')
  
  // 测试1: 导出然后导入 mockSkills[0]
  console.log('测试1: 导出然后导入完整技能 (包含 skill.json)')
  const skill = mockSkills[0]
  try {
    const zipBlob = await exportSkillToZip(skill)
    const parsedSkill = await parseSkillFromZip(zipBlob, skill.name + '.zip')
    
    console.log('✓ 导出/导入成功')
    console.log(`  - 名称: ${parsedSkill.name}`)
    console.log(`  - 描述: ${parsedSkill.description.substring(0, 30)}...`)
    console.log(`  - 版本: ${parsedSkill.version}`)
    console.log(`  - 文件数: ${parsedSkill.files.length}`)
    console.log()
  } catch (error) {
    console.error('✗ 测试1失败:', error)
  }
  
  // 测试2: 创建只有 SKILL.md 的 zip (单行 frontmatter)
  console.log('测试2: 只有 SKILL.md (单行 frontmatter)')
  try {
    const zip1 = new JSZip()
    const skillMdSingleLine = `---
name: Test Skill Single
description: This is a test skill with single line frontmatter
version: 1.0.0
author: Test Author
tags: test, example
---

# Test Skill

This is a test skill content.
`
    zip1.file('SKILL.md', skillMdSingleLine)
    const zipBlob1 = await zip1.generateAsync({ type: 'blob' })
    const parsed1 = await parseSkillFromZip(zipBlob1, 'test-single.zip')
    
    console.log('✓ 单行 frontmatter 解析成功')
    console.log(`  - 名称: ${parsed1.name}`)
    console.log(`  - 描述: ${parsed1.description}`)
    console.log(`  - 版本: ${parsed1.version}`)
    console.log(`  - 标签: ${parsed1.tags.join(', ')}`)
    console.log()
  } catch (error) {
    console.error('✗ 测试2失败:', error)
  }
  
  // 测试3: 创建只有 SKILL.md 的 zip (多行 frontmatter with |)
  console.log('测试3: 只有 SKILL.md (多行 frontmatter with |)')
  try {
    const zip2 = new JSZip()
    const skillMdMultiLine = `---
name: Test Skill Multi
description: |
  This is a multi-line description
  with several lines of text
  that should all be captured properly
version: 2.0.0
author: Multi Author
tags: multi, test, example
---

# Test Multi-Line Skill

This is the content of the multi-line skill.
`
    zip2.file('SKILL.md', skillMdMultiLine)
    const zipBlob2 = await zip2.generateAsync({ type: 'blob' })
    const parsed2 = await parseSkillFromZip(zipBlob2, 'test-multi.zip')
    
    console.log('✓ 多行 frontmatter 解析成功')
    console.log(`  - 名称: ${parsed2.name}`)
    console.log(`  - 描述: ${parsed2.description.substring(0, 50)}...`)
    console.log(`  - 完整描述行数: ${parsed2.description.split('\n').length}`)
    console.log(`  - 版本: ${parsed2.version}`)
    console.log()
  } catch (error) {
    console.error('✗ 测试3失败:', error)
  }
  
  // 测试4: 使用实际项目中的 SKILL.md
  console.log('测试4: 使用实际项目中的 brainstorming SKILL.md')
  try {
    const zip3 = new JSZip()
    const fs = require('fs')
    const path = require('path')
    const skillPath = path.join(__dirname, '.claude/skills/superpowers-workflow/skills/brainstorming/SKILL.md')
    
    if (fs.existsSync(skillPath)) {
      const skillContent = fs.readFileSync(skillPath, 'utf-8')
      zip3.file('SKILL.md', skillContent)
      
      const zipBlob3 = await zip3.generateAsync({ type: 'blob' })
      const parsed3 = await parseSkillFromZip(zipBlob3, 'brainstorming.zip')
      
      console.log('✓ 实际 SKILL.md 解析成功')
      console.log(`  - 名称: ${parsed3.name}`)
      console.log(`  - 描述: ${parsed3.description.substring(0, 50)}...`)
      console.log()
    } else {
      console.log('⚠ 找不到 SKILL.md 文件，跳过此测试')
    }
  } catch (error) {
    console.error('✗ 测试4失败:', error)
  }
  
  // 测试5: 只有 README.md 的情况
  console.log('测试5: 只有 README.md')
  try {
    const zip5 = new JSZip()
    const readmeContent = `# Readme Only Skill

This is a skill that only has a README.md file,
no skill.json or SKILL.md.
`
    zip5.file('README.md', readmeContent)
    const zipBlob5 = await zip5.generateAsync({ type: 'blob' })
    const parsed5 = await parseSkillFromZip(zipBlob5, 'readme-only.zip')
    
    console.log('✓ 只有 README.md 解析成功')
    console.log(`  - 名称: ${parsed5.name}`)
    console.log(`  - 描述: ${parsed5.description.substring(0, 50)}...`)
    console.log()
  } catch (error) {
    console.error('✗ 测试5失败:', error)
  }
  
  console.log('=== 测试完成 ===')
}

testZipImport().catch(console.error)

