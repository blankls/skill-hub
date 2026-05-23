<template>
  <el-dialog v-model="visible" width="800px" :close-on-click-modal="false" destroy-on-close class="skill-creation-dialog">
    <template #header>
      <div class="flex items-center gap-3">
        <span class="text-2xl">🚀</span>
        <div>
          <h2 class="text-lg font-bold text-[var(--text-light)]">{{ step === 1 ? '选择模板' : '编辑 Skill' }}</h2>
          <p class="text-xs text-[var(--text-muted)] mt-0.5">{{ step === 1 ? '选择一个模板开始创建，或从空白开始' : '完善 Skill 信息，然后导出为 ZIP 文件' }}</p>
        </div>
      </div>
    </template>

    <div v-if="step === 1" class="py-2">
      <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div
          v-for="tpl in templates"
          :key="tpl.id"
          class="template-card relative p-4 md:p-5 rounded-xl cursor-pointer transition-all duration-300 group"
          :style="{
            background: 'var(--dark-card)',
            border: `1px solid ${tpl.borderColor}`
          }"
          @click="selectTemplate(tpl)"
        >
          <div class="text-3xl mb-2">{{ tpl.icon }}</div>
          <h3 class="text-sm md:text-base font-semibold text-[var(--text-light)] mb-1">{{ tpl.name }}</h3>
          <p class="text-xs text-[var(--text-muted)] leading-relaxed">{{ tpl.desc }}</p>
          <div
            class="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            :style="{ background: `${tpl.bgColor}`, border: `1px solid ${tpl.borderColor}` }"
          />
        </div>
      </div>
      <div class="mt-6 text-center">
        <el-button
          text
          class="text-[var(--text-muted)] hover:text-[var(--neon-cyan)]"
          @click="selectTemplate(blankTemplate)"
        >
          ✨ 跳过模板，从空白开始创建
        </el-button>
      </div>
    </div>

    <div v-else-if="step === 2" class="py-2">
      <el-form :model="form" label-width="70px" class="mb-4">
        <el-form-item label="名称" required>
          <el-input v-model="form.name" placeholder="输入 Skill 名称" maxlength="50" show-word-limit />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="描述这个 Skill 的功能和用途" maxlength="300" show-word-limit />
        </el-form-item>
        <div class="grid grid-cols-2 gap-4">
          <el-form-item label="版本">
            <el-input v-model="form.version" placeholder="1.0.0" />
          </el-form-item>
          <el-form-item label="作者">
            <el-input v-model="form.author" placeholder="你的名字" />
          </el-form-item>
        </div>
        <el-form-item label="标签">
          <el-select
            v-model="form.tags"
            multiple
            filterable
            allow-create
            default-first-option
            :max-collapse-tags="3"
            collapse-tags
            collapse-tags-tooltip
            placeholder="输入标签后回车添加"
          >
            <el-option v-for="tag in suggestedTags" :key="tag" :label="tag" :value="tag" />
          </el-select>
        </el-form-item>
      </el-form>

      <div class="mb-4">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-semibold text-[var(--text-light)]">📂 文件管理</span>
          <el-button size="small" text class="text-[var(--neon-cyan)]" @click="addFile">
            + 添加文件
          </el-button>
        </div>
        <div v-if="form.files.length === 0" class="text-center py-6 text-xs text-[var(--text-muted)] rounded-lg border border-dashed" style="border-color: rgba(0,245,255,0.15)">
          暂无文件，点击"添加文件"开始
        </div>
        <div v-else class="space-y-2 max-h-64 overflow-y-auto custom-scroll">
          <div
            v-for="(file, idx) in form.files"
            :key="idx"
            class="flex items-start gap-3 p-3 rounded-lg transition-all"
            style="background: var(--dark-card); border: 1px solid rgba(0,245,255,0.1)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" class="flex-shrink-0 mt-0.5" :style="{ color: 'var(--neon-cyan)' }">
              <path d="M4 3l1 10h6l1-10H4Z" fill="currentColor" opacity="0.15"/>
              <path d="M3.5 2L5 14h6l1.5-12H3.5Zm1.17 1h6.66L10.17 13H5.83L4.67 3Z" fill="currentColor" opacity="0.3"/>
            </svg>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1.5">
                <el-input
                  v-model="file.path"
                  size="small"
                  placeholder="文件路径，如 src/index.ts"
                  class="flex-1"
                />
                <el-button size="small" text class="text-red-400 hover:text-red-300" @click="removeFile(idx)">
                  ✕
                </el-button>
              </div>
              <el-input
                v-model="file.content"
                type="textarea"
                :rows="4"
                size="small"
                placeholder="输入文件内容…"
                class="font-mono text-xs"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="flex items-center justify-between pt-4 border-t" style="border-color: rgba(0,245,255,0.1)">
        <el-button text class="text-[var(--text-muted)]" @click="step = 1">← 返回选择模板</el-button>
        <div class="flex items-center gap-3">
          <span v-if="form.name.trim()" class="text-xs text-[var(--text-muted)]">
            导出文件: <span class="text-[var(--neon-cyan)] font-mono">{{ sanitizeFileName(form.name) }}.zip</span>
          </span>
          <el-button
            type="primary"
            size="large"
            :disabled="!form.name.trim()"
            class="bg-gradient-to-r from-[var(--neon-cyan)] to-[var(--neon-purple)] border-none text-white font-bold"
            @click="handleExport"
          >
            📦 导出 ZIP
          </el-button>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { exportSkillToZip, downloadBlob } from '@/utils/zipHandler'
import { ElMessage } from 'element-plus'
import type { Skill } from '@/types'

const visible = defineModel<boolean>('visible', { required: true })
const step = ref(1)

interface Template {
  id: string
  name: string
  icon: string
  desc: string
  borderColor: string
  bgColor: string
  tags: string[]
  files: { path: string; content: string }[]
}

const templates: Template[] = [
  {
    id: 'code-generator',
    name: '代码生成器',
    icon: '⚡',
    desc: '生成各类代码片段、函数、组件，支持多语言',
    borderColor: 'rgba(243,244,70,0.3)',
    bgColor: 'rgba(243,244,70,0.05)',
    tags: ['代码生成', '多语言'],
    files: [
      {
        path: 'skill.md',
        content: `# 代码生成器

一个通用的代码生成 Skill，支持多种编程语言。

## 功能

- 根据需求描述生成代码
- 支持 Python、JavaScript、TypeScript、Go 等
- 生成单元测试
- 代码重构建议

## 使用方法

直接描述你的需求，例如："生成一个快速排序函数"`
      },
      {
        path: 'src/generator.py',
        content: `def quick_sort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quick_sort(left) + middle + quick_sort(right)`
      }
    ]
  },
  {
    id: 'knowledge',
    name: '知识助手',
    icon: '📚',
    desc: '提供领域知识查询、术语解释、最佳实践指导',
    borderColor: 'rgba(14,165,233,0.3)',
    bgColor: 'rgba(14,165,233,0.05)',
    tags: ['知识库', '文档', '问答'],
    files: [
      {
        path: 'skill.md',
        content: `# 知识助手

一个领域知识查询 Skill，帮助用户快速获取专业知识。

## 功能

- 技术术语解释
- 最佳实践推荐
- 代码规范指导
- 架构设计建议

## 使用方法

提出你的技术问题，例如："什么是依赖注入？"、"React 性能优化有哪些方法？"`
      },
      {
        path: 'knowledge/patterns.md',
        content: `# 设计模式速查

## 创建型模式
- 单例模式
- 工厂模式
- 建造者模式

## 结构型模式
- 适配器模式
- 装饰器模式
- 代理模式

## 行为型模式
- 观察者模式
- 策略模式
- 命令模式`
      }
    ]
  },
  {
    id: 'data-analysis',
    name: '数据分析',
    icon: '📊',
    desc: '数据处理、可视化、统计分析，支持多种数据格式',
    borderColor: 'rgba(16,185,129,0.3)',
    bgColor: 'rgba(16,185,129,0.05)',
    tags: ['数据', '可视化', '分析'],
    files: [
      {
        path: 'skill.md',
        content: `# 数据分析 Skill

一个数据处理和分析 Skill，支持 CSV、JSON、Excel 等格式。

## 功能

- 数据清洗和预处理
- 统计分析和聚合
- 数据可视化
- 报告生成

## 使用方法

上传你的数据文件，描述分析需求，例如："分析销售趋势并生成图表"`
      },
      {
        path: 'src/analyze.py',
        content: `import pandas as pd
import matplotlib.pyplot as plt

def analyze_data(filepath: str):
    df = pd.read_csv(filepath)
    print(f"数据形状: {df.shape}")
    print(f"列信息:\\n{df.dtypes}")
    print(f"基本统计:\\n{df.describe()}")
    return df

def plot_distribution(df, column: str):
    plt.figure(figsize=(10, 6))
    df[column].hist(bins=30)
    plt.title(f'{column} 分布图')
    plt.xlabel(column)
    plt.ylabel('频率')
    plt.show()`
      }
    ]
  },
  {
    id: 'file-manager',
    name: '文件管理',
    icon: '📁',
    desc: '文件批量处理、格式转换、搜索替换等操作',
    borderColor: 'rgba(168,85,247,0.3)',
    bgColor: 'rgba(168,85,247,0.05)',
    tags: ['文件', '批处理', '工具'],
    files: [
      {
        path: 'skill.md',
        content: `# 文件管理 Skill

一个文件批量处理 Skill，支持重命名、格式转换、内容替换。

## 功能

- 批量重命名文件
- 文件格式转换
- 文本搜索和替换
- 文件内容统计

## 使用方法

指定目录和操作类型，例如："将 ./docs 下所有 .txt 转换为 .md"`
      },
      {
        path: 'src/file_utils.py',
        content: `import os
import glob

def batch_rename(directory: str, old_ext: str, new_ext: str):
    count = 0
    for filepath in glob.glob(os.path.join(directory, f'*.{old_ext}')):
        new_path = filepath.rsplit('.', 1)[0] + f'.{new_ext}'
        os.rename(filepath, new_path)
        count += 1
    return count

def search_files(directory: str, pattern: str):
    results = []
    for root, _, files in os.walk(directory):
        for f in files:
            if pattern.lower() in f.lower():
                results.append(os.path.join(root, f))
    return results`
      }
    ]
  },
  {
    id: 'api-wrapper',
    name: 'API 封装',
    icon: '🔌',
    desc: 'RESTful API 调用封装、请求管理、响应处理',
    borderColor: 'rgba(245,158,11,0.3)',
    bgColor: 'rgba(245,158,11,0.05)',
    tags: ['API', 'HTTP', '网络'],
    files: [
      {
        path: 'skill.md',
        content: `# API 封装 Skill

一个 HTTP API 调用封装 Skill，支持 RESTful 请求和数据解析。

## 功能

- GET / POST / PUT / DELETE 请求封装
- 请求重试和超时处理
- 响应数据解析和转换
- 请求日志记录

## 使用方法

提供 API 文档地址或描述接口，例如："封装一个获取天气数据的 API 调用"`
      },
      {
        path: 'src/api_client.ts',
        content: `interface RequestConfig {
  baseURL: string
  timeout?: number
  headers?: Record<string, string>
}

class ApiClient {
  private config: RequestConfig

  constructor(config: RequestConfig) {
    this.config = { timeout: 5000, ...config }
  }

  async get<T>(path: string): Promise<T> {
    const res = await fetch(this.config.baseURL + path, {
      headers: this.config.headers,
      signal: AbortSignal.timeout(this.config.timeout!)
    })
    return res.json()
  }

  async post<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(this.config.baseURL + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...this.config.headers },
      body: JSON.stringify(body)
    })
    return res.json()
  }
}`
      }
    ]
  }
]

const blankTemplate: Template = {
  id: 'blank',
  name: '空白模板',
  icon: '📄',
  desc: '从零开始创建，完全自定义',
  borderColor: 'rgba(255,255,255,0.15)',
  bgColor: 'rgba(255,255,255,0.03)',
  tags: [],
  files: [
    {
      path: 'skill.md',
      content: `# 技能名称

简要描述这个 Skill 的功能和用途。

## 功能

- 功能点 1
- 功能点 2
- 功能点 3

## 使用方法

描述如何触发和使用这个 Skill。`
    }
  ]
}

const suggestedTags = [
  '代码生成', '知识库', '数据分析', '文件管理', 'API',
  '前端', '后端', 'DevOps', '测试', '工具',
  'Python', 'JavaScript', 'TypeScript', 'Go', 'Rust'
]

interface SkillForm {
  name: string
  description: string
  version: string
  author: string
  tags: string[]
  files: { path: string; content: string }[]
}

const form = reactive<SkillForm>({
  name: '',
  description: '',
  version: '1.0.0',
  author: '',
  tags: [],
  files: []
})

function selectTemplate(tpl: Template) {
  form.name = tpl.id === 'blank' ? '' : tpl.name
  form.description = ''
  form.version = '1.0.0'
  form.author = ''
  form.tags = [...tpl.tags]
  form.files = tpl.files.map(f => ({ ...f }))
  step.value = 2
}

function addFile() {
  form.files.push({ path: '', content: '' })
}

function removeFile(idx: number) {
  form.files.splice(idx, 1)
}

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9\u4e00-\u9fa5_-]/g, '_').slice(0, 40) || 'skill'
}

function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return 'skill_' + Math.random().toString(36).substr(2, 16)
}

function handleExport() {
  if (!form.name.trim()) {
    ElMessage.warning('请输入 Skill 名称')
    return
  }

  const now = new Date()
  const skill: Skill = {
    id: generateId(),
    name: form.name.trim(),
    description: form.description.trim(),
    version: form.version.trim() || '1.0.0',
    author: form.author.trim(),
    tags: form.tags,
    source: { type: 'local' },
    files: form.files
      .filter(f => f.path.trim())
      .map(f => ({
        path: f.path.trim(),
        name: f.path.split('/').pop() || f.path,
        content: f.content,
        language: f.path.split('.').pop()?.toLowerCase()
      })),
    createdAt: now,
    updatedAt: now
  }

  exportSkillToZip(skill).then(blob => {
    downloadBlob(blob, `${sanitizeFileName(skill.name)}.zip`)
    ElMessage.success('Skill 导出成功！')
  }).catch(() => {
    ElMessage.error('导出失败，请重试')
  })
}
</script>

<style scoped>
.template-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(14, 165, 233, 0.1);
}

.custom-scroll::-webkit-scrollbar {
  width: 4px;
}

.custom-scroll::-webkit-scrollbar-thumb {
  background: rgba(14, 165, 233, 0.3);
  border-radius: 2px;
}
</style>
