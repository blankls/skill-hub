# Skill Hub 2.0 完整 PRD 文档

> **版本：** v2.0.0  
> **状态：** 已完成  
> **最后更新：** 2026-05-17

---

## 1. 项目概述

### 1.1 项目目标
构建一个现代化的 AI 技能仓库管理平台，提供技能的浏览、导入、编辑、导出等功能，支持本地文件和 GitHub 源，采用美观的赛博朋克风格深色主题。

### 1.2 核心功能
- 🏠 **首页展示**：英雄区、功能特性、热门技能展示
- 📚 **技能列表**：支持列表/网格视图、搜索、筛选、排序
- 🔍 **技能详情**：概览、指导文件、代码文件展示
- ⬆️ **技能导入**：支持 Markdown 文件、ZIP 包、GitHub 仓库导入
- ⬇️ **技能导出**：ZIP 包导出功能
- 🔒 **管理页面**：密码保护的管理功能
- 🔄 **GitHub 同步**：延迟加载、本地缓存、后台同步

### 1.3 技术栈
| 技术 | 版本 | 用途 |
|------|------|------|
| Vue | 3.4+ | 前端框架 |
| Vite | 5.0+ | 构建工具 |
| TypeScript | 5.3+ | 类型系统 |
| Element Plus | 2.5+ | UI 组件库 |
| Tailwind CSS | 3.4+ | 样式工具 |
| Pinia | 2.1+ | 状态管理 |
| Vue Router | 4.2+ | 路由管理 |
| JSZip | 3.10+ | ZIP 处理 |
| Highlight.js | 11.9+ | 代码高亮 |
| Markdown-it | 14.0+ | Markdown 渲染 |
| Express.js | 最新 | 后端存储服务 |

---

## 2. 系统架构

### 2.1 文件结构
```
skill-hub/
├── .claude/skills/           # 自定义 Claude 技能
├── .docs/                    # 项目文档
├── .data/skills/             # 本地技能数据存储
├── docs/superpowers/         # Superpowers 工作流文档
│   ├── plans/                # 计划文档
│   └── specs/                # 规范文档
├── src/
│   ├── components/           # 通用组件
│   │   ├── features/         # 功能组件
│   │   ├── layout/           # 布局组件
│   │   └── ui/               # UI 基础组件
│   ├── modules/              # 页面模块
│   │   ├── admin/            # 管理页
│   │   ├── home/             # 首页
│   │   ├── skill-detail/     # 详情页
│   │   └── skill-list/       # 列表页
│   ├── stores/               # Pinia 状态管理
│   ├── types/                # TypeScript 类型定义
│   └── utils/                # 工具函数
├── server.js                 # Express 后端服务
└── 配置文件...
```

### 2.2 核心模块说明

| 模块 | 文件 | 功能 |
|------|------|------|
| 技能存储 | `src/utils/db.ts` | 与 Express 后端通信，持久化技能数据 |
| GitHub 客户端 | `src/utils/githubClient.ts` | GitHub API 集成，支持仓库/分支/文件获取 |
| 技能解析 | `src/utils/skillParser.ts` | SKILL.md 解析、YAML frontmatter 处理 |
| ZIP 处理 | `src/utils/zipHandler.ts` | ZIP 导入导出 |
| 技能状态 | `src/stores/skillStore.ts` | 技能 CRUD、同步管理 |
| 主题状态 | `src/stores/themeStore.ts` | 深色/浅色主题切换 |

---

## 3. 功能实现详情

### 3.1 技能详情页优化（最新更新）

#### 3.1.1 布局设计
- **响应式布局**：移动端垂直排列，桌面端左右分布
- **左侧区域**：
  - 返回按钮独立一行
  - 技能标题 + 元信息（来源、版本、作者）
  - 描述文本（支持展开/收起 + Tooltip）
- **右侧按钮组**：
  - 所有按钮在同一行，自动换行
  - 按钮顺序：同步 → 编辑 → 下载 → 删除

#### 3.1.2 文件树组件
- **层级修复**：同级文件和文件夹正确排序，文件夹优先
- **控制按钮**：底部添加"全部展开/收起"按钮
- **文件可见性**：根据父文件夹状态正确显示隐藏
- **视觉优化**：圆角、悬停效果一致

### 3.2 GitHub 同步策略

#### 3.2.1 延迟加载模式
1. **导入阶段**：仅获取基础信息 + README.md
2. **详情访问**：后台触发完整同步，不阻塞 UI
3. **本地优先**：优先显示缓存内容，同步完成后更新

#### 3.2.2 同步流程
```
用户访问详情页
    ↓
显示本地缓存内容（若有）
    ↓
后台发起 GitHub API 请求
    ↓
检查仓库更新时间
    ↓
有更新 → 获取完整内容 → 保存本地
无更新 → 保持本地数据
```

#### 3.2.3 数据结构
```typescript
interface GithubMeta {
  full_name: string          // garrytan/gstack
  branch: string             // main
  repoUrl: string            // https://github.com/...
  subfolderUrl: string       // 子文件夹 URL
  repoOwner: string          // garrytan
  repoName: string           // gstack
  subfolderPath: string      // qa
  description?: string
  stars?: number
  forks?: number
  watchers?: number
  language?: string
  license?: string
  topics?: string[]
  createdAt?: string
  updatedAt?: string
}

interface SkillSource {
  type: 'local' | 'github' | 'zip' | 'skillmd'
  origin?: string
  githubMeta?: GithubMeta
  isContentCached?: boolean  // 是否已完整加载
  lastRemoteUpdate?: string  // 最后同步时间
}
```

### 3.3 SKILL.md 解析

#### 3.3.1 YAML frontmatter 支持
```markdown
---
name: QA 技能
description: |
  这是一个多行
  描述示例
version: 1.0.0
author: Claude
tags: [qa, testing]
---

## 使用说明

...
```

#### 3.3.2 解析功能
- ✅ 支持多行 `|` 和折叠 `>` 样式的描述
- ✅ 标签解析（支持数组格式）
- ✅ 版本、作者等元信息提取
- ✅ Markdown 内容渲染

### 3.4 文本省略与提示

#### 3.4.1 功能实现
| 场景 | 限制 | 交互 |
|------|------|------|
| 技能列表描述 | 2 行 | Tooltip 显示完整 |
| 技能详情描述 | 3 行 | Tooltip + 展开/收起按钮 |
| GitHub 仓库描述 | 2 行 | Tooltip 显示完整 |
| 技能标题 | 1 行 | Truncate 省略 |

#### 3.4.2 实现方式
```css
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.line-clamp-3 {
  -webkit-line-clamp: 3;
}
```

### 3.5 管理页面安全

#### 3.5.1 密码验证
- 使用 Element Plus `ElMessageBox.prompt` 替代浏览器 prompt
- 支持在 iframe 环境中正常工作
- 密码输入框类型为 password

#### 3.5.2 权限控制
- 仅 `/admin` 路由下显示编辑/删除按钮
- 列表中显示管理员操作按钮
- 删除操作带确认对话框

### 3.6 Express 后端存储

#### 3.6.1 API 端点
| 方法 | 路径 | 功能 |
|------|------|------|
| GET | `/api/skills` | 获取所有技能 |
| GET | `/api/skills/:id` | 获取单个技能 |
| POST | `/api/skills` | 创建新技能 |
| PUT | `/api/skills/:id` | 更新技能 |
| DELETE | `/api/skills/:id` | 删除技能 |

#### 3.6.2 数据持久化
- 技能保存为独立 JSON 文件
- 存储路径：`data/skills/{skillId}.json`
- 文件读写使用 fs 模块

---

## 4. 样式与主题

### 4.1 设计语言 - 赛博朋克风格

#### 4.1.1 色彩系统
```css
:root {
  --dark-bg: #0f172a
  --dark-card: #1e293b
  --neon-cyan: #06b6d4
  --neon-purple: #a855f7
  --neon-yellow: #fbbf24
  --text-light: #f8fafc
  --text-muted: #94a3b8
}
```

#### 4.1.2 视觉特征
- 🌟 **霓虹渐变按钮**：cyan → purple 渐变
- 💎 **玻璃态卡片**：半透明背景 + 边框
- ✨ **悬停效果**：霓虹边框 + 缩放动画
- 📝 **代码高亮**：GitHub Dark 主题
- 📱 **响应式**：从手机到桌面完整适配

### 4.2 全局样式统一
- ✅ 移除了不一致的字体样式
- ✅ 统一使用项目主题色
- ✅ 规范了按钮、卡片等组件的视觉效果

---

## 5. 已修复问题清单

| 问题 | 状态 | 修复方案 |
|------|------|----------|
| IndexedDB 结构化克隆错误 | ✅ 已修复 | 迁移到 Express 后端存储 |
| 浏览器 prompt 在 iframe 中报错 | ✅ 已修复 | 使用 ElMessageBox.prompt |
| SKILL.md 多行描述解析失败 | ✅ 已修复 | 支持 | 和 > 样式的 YAML 多行值 |
| GitHub 导入时加载过慢 | ✅ 已修复 | 延迟加载 + 后台同步策略 |
| 文件树层级显示错误 | ✅ 已修复 | 文件夹优先排序 + 可见性控制 |
| 描述文本过长无省略 | ✅ 已修复 | line-clamp + Tooltip |
| 详情页按钮布局混乱 | ✅ 已修复 | 响应式左右布局 |
| 导入弹窗字体不一致 | ✅ 已修复 | 统一样式 |

---

## 6. 核心文件清单

### 页面组件
1. [HomePage.vue](file:///e:/IT/project/vue/skill-hub/src/modules/home/HomePage.vue) - 首页
2. [SkillListPage.vue](file:///e:/IT/project/vue/skill-hub/src/modules/skill-list/SkillListPage.vue) - 技能列表页
3. [SkillDetailPage.vue](file:///e:/IT/project/vue/skill-hub/src/modules/skill-detail/SkillDetailPage.vue) - 技能详情页
4. [AdminPage.vue](file:///e:/IT/project/vue/skill-hub/src/modules/admin/AdminPage.vue) - 管理页面

### 功能组件
1. [SkillImportModal.vue](file:///e:/IT/project/vue/skill-hub/src/components/features/SkillImportModal.vue) - 技能导入弹窗
2. [SkillEditor.vue](file:///e:/IT/project/vue/skill-hub/src/components/features/SkillEditor.vue) - 技能编辑器
3. [ZipExportBtn.vue](file:///e:/IT/project/vue/skill-hub/src/components/features/ZipExportBtn.vue) - ZIP 导出按钮

### 详情页标签页
1. [OverviewTab.vue](file:///e:/IT/project/vue/skill-hub/src/modules/skill-detail/components/OverviewTab.vue) - 概览
2. [GuideTab.vue](file:///e:/IT/project/vue/skill-hub/src/modules/skill-detail/components/GuideTab.vue) - 指导
3. [FilesTab.vue](file:///e:/IT/project/vue/skill-hub/src/modules/skill-detail/components/FilesTab.vue) - 文件

### 核心工具
1. [skillParser.ts](file:///e:/IT/project/vue/skill-hub/src/utils/skillParser.ts) - 技能解析
2. [githubClient.ts](file:///e:/IT/project/vue/skill-hub/src/utils/githubClient.ts) - GitHub 客户端
3. [db.ts](file:///e:/IT/project/vue/skill-hub/src/utils/db.ts) - 数据库接口
4. [skillStore.ts](file:///e:/IT/project/vue/skill-hub/src/stores/skillStore.ts) - 技能状态管理

---

## 7. 测试与验证

### 7.1 功能测试
- ✅ 本地文件导入导出
- ✅ ZIP 包导入导出
- ✅ GitHub 仓库导入
- ✅ GitHub 子文件夹导入
- ✅ 技能搜索和筛选
- ✅ 技能编辑和删除
- ✅ 主题切换
- ✅ 响应式布局

### 7.2 浏览器兼容性
- ✅ Chrome 最新
- ✅ Firefox 最新
- ✅ Safari 最新
- ✅ Edge 最新

---

## 8. 后续优化建议

### 8.1 功能增强
- [ ] 技能收藏和标签管理
- [ ] 技能评分和评论
- [ ] 批量导入导出
- [ ] 技能版本历史
- [ ] 支持更多 Git 平台（GitLab、Gitee）

### 8.2 性能优化
- [ ] 技能列表虚拟滚动
- [ ] 图片懒加载
- [ ] Markdown 渲染缓存
- [ ] API 请求防抖/节流

### 8.3 用户体验
- [ ] 操作引导和新手教程
- [ ] 快捷键支持
- [ ] 拖拽排序
- [ ] 暗色/亮色主题动画

---

## 9. 总结

Skill Hub 2.0 是一个功能完整、设计现代的 AI 技能仓库平台。通过迭代开发和问题修复，我们成功实现了：

1. ✅ **完整的 CRUD 功能** - 技能的创建、读取、更新、删除
2. ✅ **多种导入方式** - Markdown、ZIP、GitHub 源支持
3. ✅ **美观的 UI 设计** - 赛博朋克深色主题，响应式布局
4. ✅ **强大的 GitHub 集成** - 延迟加载、本地缓存、智能同步
5. ✅ **良好的代码质量** - TypeScript 类型、模块化架构、组件复用

项目已达到生产可用状态，建议进一步根据用户反馈进行优化和功能增强！

---
**文档结束** 🎉
