---
alwaysApply: true
---
# Skill Hub 项目开发规则

## 📋 项目概览

- **设计风格**：赛博朋克/黑客美学（霓虹色 + 等宽字体 + 毛玻璃）
- **技术栈**：Vue 3 + Vite + TypeScript + Tailwind CSS + Element Plus + Pinia
- **架构**：modules（页面模块）+ components（通用组件）+ stores（状态管理）

---

## 📁 目录结构

```
src/
├── modules/              # 页面模块
│   ├── home/            # 首页
│   ├── skill-list/      # 技能列表
│   └── skill-detail/    # 技能详情
├── components/           # 通用组件
│   ├── features/        # 功能组件
│   ├── layout/          # 布局组件
│   └── ui/              # UI组件
├── stores/              # Pinia stores
│   ├── skillStore.ts    # 技能数据
│   └── themeStore.ts    # 主题
├── utils/               # 工具函数
├── types/               # 类型定义
└── router.ts            # 路由
```

---

## 🎨 设计规范

### 颜色系统
```css
--neon-cyan: #00f5ff;    /* 主要强调色 */
--neon-pink: #ff006e;    /* 警告/危险 */
--neon-purple: #8338ec;  /* 次要强调 */
--neon-yellow: #ffbe0b;  /* 信息/提示 */
--dark-bg: #0a0e27;      /* 背景 */
--dark-card: #141b3a;    /* 卡片背景 */
```

### 组件设计
- **按钮**：霓虹渐变 + 悬停发光 + `font-mono` + 方括号（如 `[导入]`）
- **卡片**：`skill-card` 类 + 毛玻璃 + 霓虹边框 + 悬停上移
- **输入框**：深色背景 + 霓虹边框
- **标签**：圆角胶囊 + `#` 前缀
- **容器宽度**：`max-w-[95rem] mx-auto`

---

## 📝 代码规范

### Vue 组件
```vue
<template></template>
<script setup lang="ts">
// 1. 导入
// 2. Props/Emits
// 3. 响应式数据
// 4. 计算属性
// 5. 方法
</script>
<style scoped></style>
```

### 命名约定
- 组件：PascalCase（`SkillCard.vue`）
- 函数/变量：camelCase
- Store：camelCase + Store（`skillStore`）
- 接口/类型：PascalCase

---

## 🗂️ 状态管理

### skillStore（技能数据）
```typescript
- skills: Skill[]           // 技能列表
- searchQuery: string        // 搜索词
- selectedTag: string        // 筛选标签
- viewMode: 'grid' | 'list'  // 视图模式
- filteredSkills: Skill[]    // 筛选结果
- loadSkills()               // 加载技能
- addSkill(skill)            // 添加技能
- deleteSkill(id)            // 删除技能
```

### themeStore（主题）
```typescript
- isDark: boolean            // 是否暗色模式
```

---

## 🛣️ 路由

| 路径 | 名称 | 组件 |
|------|------|------|
| `/` | home | HomePage |
| `/skills` | skills | SkillListPage |
| `/skills/:id` | skill-detail | SkillDetailPage |

---

## 🎯 常用命令

```bash
npm run dev          # 启动开发服务器
npm run build        # 构建
npm run test         # 测试
```

---

## 📚 快速参考

### 常用导入
```typescript
import { useSkillStore } from '@/stores/skillStore'
import { useThemeStore } from '@/stores/themeStore'
import type { Skill } from '@/types'
import { Search, Upload, Grid, List } from '@element-plus/icons-vue'
```

### 常用 CSS 类
```html
<div class="max-w-[95rem] mx-auto">            <!-- 容器 -->
<div class="skill-card">                       <!-- 卡片 -->
<div class="bg-gradient-to-r from-[var(--neon-cyan)] to-[var(--neon-purple)]">  <!-- 渐变 -->
<span class="font-mono">                       <!-- 等宽字体 -->
```

---

## ⚠️ 重要提醒

1. **保持**赛博朋克设计风格一致
2. **优先**复用现有组件
3. **遵循**`DESIGN.md`中的设计规范
4. **内容宽度**统一用 `max-w-[95rem]`
