import type { Skill } from '../types'
import { v4 as uuidv4 } from 'uuid'

export const mockSkills: Skill[] = [
  {
    id: 'skill-1',
    name: 'Web Search Agent',
    description: '一个智能 Web 搜索代理，可以帮助你搜索最新的信息和资料。',
    version: '1.2.0',
    author: 'OpenAI',
    tags: ['search', 'web', 'ai'],
    source: { type: 'local' },
    files: [
      { path: 'main.py', name: 'main.py', language: 'python', content: `from search import search

def search_agent(query):
    results = search(query)
    return results
` },
      { path: 'requirements.txt', name: 'requirements.txt', language: 'text', content: `requests>=2.31.0
beautifulsoup4>=4.12.0
` }
    ],
    tools: [
      {
        name: 'web_search',
        description: '执行 Web 搜索并返回结果',
        parameters: [
          { name: 'query', type: 'string', required: true, description: '搜索关键词' },
          { name: 'num_results', type: 'number', required: false, description: '返回结果数量' }
        ],
        example: 'web_search(query="最新 AI 新闻", num_results=5)'
      }
    ],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: 'skill-2',
    name: 'Code Refactor',
    description: '代码重构工具，自动优化代码结构和风格。',
    version: '2.0.1',
    author: 'Team Dev',
    tags: ['code', 'refactor', 'dev'],
    source: { type: 'local' },
    files: [],
    tools: [
      {
        name: 'refactor_code',
        description: '重构代码',
        parameters: [
          { name: 'code', type: 'string', required: true, description: '待重构的代码' }
        ]
      }
    ],
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10')
  },
  {
    id: 'skill-3',
    name: 'Data Analyzer',
    description: '数据分析助手，提供图表和统计功能。',
    version: '1.5.0',
    author: 'Data Team',
    tags: ['data', 'analysis', 'charts'],
    source: { type: 'local' },
    files: [],
    tools: [
      {
        name: 'analyze_csv',
        description: '分析 CSV 数据',
        parameters: [
          { name: 'file_path', type: 'string', required: true, description: 'CSV 文件路径' }
        ]
      }
    ],
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-08')
  },
  {
    id: 'skill-4',
    name: 'Image Generator',
    description: 'AI 图像生成工具，支持多种风格。',
    version: '3.0.0',
    author: 'Art Team',
    tags: ['image', 'ai', 'art'],
    source: { type: 'local' },
    files: [],
    tools: [
      {
        name: 'generate_image',
        description: '生成图像',
        parameters: [
          { name: 'prompt', type: 'string', required: true, description: '图像描述' },
          { name: 'style', type: 'string', required: false, description: '艺术风格' }
        ]
      }
    ],
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-05')
  }
]
