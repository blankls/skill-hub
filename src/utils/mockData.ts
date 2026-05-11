import type { Skill } from '../types'

export const mockSkills: Skill[] = [
  {
    id: 'skill-1',
    name: 'Web Search Agent',
    description: '一个智能 Web 搜索代理，可以帮助你搜索最新的信息和资料。',
    version: '1.2.0',
    author: 'OpenAI',
    license: 'MIT',
    githubUrl: 'https://github.com/example/web-search-agent',
    sourceType: 'github',
    tags: ['search', 'web', 'ai'],
    downloadCount: 15420,
    rating: 4.8,
    lastUpdated: '2024-01-15',
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
    repository: 'example/web-search-agent',
    readme: '# Web Search Agent\n\n这是一个智能 Web 搜索代理...',
    files: [
      {
        name: 'search-agent',
        type: 'folder',
        path: 'search-agent',
        children: [
          {
            name: 'main.py',
            type: 'file',
            path: 'search-agent/main.py',
            language: 'python',
            content: `from search import search

def search_agent(query):
    results = search(query)
    return results
`
          },
          {
            name: 'requirements.txt',
            type: 'file',
            path: 'search-agent/requirements.txt',
            language: 'text',
            content: `requests>=2.31.0
beautifulsoup4>=4.12.0
`
          }
        ]
      }
    ]
  },
  {
    id: 'skill-2',
    name: 'Code Refactor',
    description: '代码重构工具，自动优化代码结构和风格。',
    version: '2.0.1',
    author: 'Team Dev',
    license: 'Apache-2.0',
    sourceType: 'local',
    tags: ['code', 'refactor', 'dev'],
    downloadCount: 8932,
    rating: 4.6,
    lastUpdated: '2024-01-10',
    tools: [
      {
        name: 'refactor_code',
        description: '重构代码',
        parameters: [
          { name: 'code', type: 'string', required: true, description: '待重构的代码' }
        ]
      }
    ],
    filePath: '~/skills/code-refactor'
  },
  {
    id: 'skill-3',
    name: 'Data Analyzer',
    description: '数据分析助手，提供图表和统计功能。',
    version: '1.5.0',
    author: 'Data Team',
    githubUrl: 'https://github.com/example/data-analyzer',
    sourceType: 'github',
    tags: ['data', 'analysis', 'charts'],
    downloadCount: 6540,
    rating: 4.9,
    lastUpdated: '2024-01-08',
    tools: [
      {
        name: 'analyze_csv',
        description: '分析 CSV 数据',
        parameters: [
          { name: 'file_path', type: 'string', required: true, description: 'CSV 文件路径' }
        ]
      }
    ],
    repository: 'example/data-analyzer'
  },
  {
    id: 'skill-4',
    name: 'Image Generator',
    description: 'AI 图像生成工具，支持多种风格。',
    version: '3.0.0',
    author: 'Art Team',
    sourceType: 'local',
    tags: ['image', 'ai', 'art'],
    downloadCount: 12890,
    rating: 4.7,
    lastUpdated: '2024-01-05',
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
    filePath: '~/skills/image-generator'
  }
]
