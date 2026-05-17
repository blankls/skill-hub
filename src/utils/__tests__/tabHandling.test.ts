
import JSZip from 'jszip'
import { parseSkillFromZip } from '../skillParser'
import { exportSkillToZip } from '../zipHandler'
import { v4 as uuidv4 } from 'uuid'

describe('Tab Character Handling', () => {
  it('should preserve tabs during import-export cycle', async () => {
    // Step 1: Create a test skill with tab characters
    const testSkill = {
      id: uuidv4(),
      name: 'Tab Test Skill',
      description: 'Test skill with tab characters',
      version: '1.0.0',
      author: 'Test',
      tags: ['test', 'tabs'],
      source: { type: 'local' },
      files: [
        {
          path: 'test.ts',
          name: 'test.ts',
          language: 'typescript',
          content: '// Test with tabs\nfunction test() {\n\tconsole.log("Hello");\n\treturn 42;\n}'
        },
        {
          path: 'data.txt',
          name: 'data.txt',
          language: 'text',
          content: 'Column1\tColumn2\tColumn3\nValue1\tValue2\tValue3'
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // Step 2: Export to ZIP
    const zipBlob = await exportSkillToZip(testSkill)

    // Step 3: Parse back from ZIP
    const parsedSkill = await parseSkillFromZip(zipBlob, 'test.zip')

    // Step 4: Verify tabs are preserved
    const testTsFile = parsedSkill.files.find(f => f.path === 'test.ts')
    const dataTxtFile = parsedSkill.files.find(f => f.path === 'data.txt')

    expect(testTsFile).toBeDefined()
    expect(testTsFile?.content).toContain('\tconsole.log')
    expect(testTsFile?.content).toContain('\treturn 42')

    expect(dataTxtFile).toBeDefined()
    expect(dataTxtFile?.content).toContain('Column1\tColumn2')
    expect(dataTxtFile?.content).toContain('Value1\tValue2')
  })

  it('should handle mixed whitespace correctly', async () => {
    const zip = new JSZip()
    zip.file('mixed.ts', `// Mixed whitespace
function mix() {
    // 4 spaces
\t// 1 tab
  \t// 2 spaces + tab
    \t// 4 spaces + tab
}`)

    const zipBlob = await zip.generateAsync({ type: 'blob' })
    const skill = await parseSkillFromZip(zipBlob, 'mixed.zip')

    const file = skill.files.find(f => f.path === 'mixed.ts')
    expect(file).toBeDefined()
    expect(file?.content).toContain('    // 4 spaces')
    expect(file?.content).toContain('\t// 1 tab')
  })
})
