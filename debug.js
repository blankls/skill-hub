
import JSZip from 'jszip'
import { parseSkillFromZip } from './src/utils/skillParser.js'

async function test() {
  console.log('=== Testing frontmatter name ===')
  const zip1 = new JSZip()
  zip1.file('folder-name/SKILL.md', `---
name: Frontmatter Name
description: Test description
---
# Test
`)
  const blob1 = await zip1.generateAsync({ type: 'blob' })
  const skill1 = await parseSkillFromZip(blob1, 'zip-filename.zip')
  console.log('Result 1:', skill1.name)
  console.log('Expected: Frontmatter Name')

  console.log('\n=== Testing folder name ===')
  const zip2 = new JSZip()
  zip2.file('my-awesome-skill/SKILL.md', `---
description: Test description
---
# Test
`)
  const blob2 = await zip2.generateAsync({ type: 'blob' })
  const skill2 = await parseSkillFromZip(blob2, 'test-zip-file.zip')
  console.log('Result 2:', skill2.name)
  console.log('Expected: my-awesome-skill')
}

test().catch(console.error)
