# 代码风格规范

## Vue 组件

### 结构顺序
```vue
<template>
  <!-- 模板 -->
</template>

<script setup lang="ts">
// 1. 导入
// 2. Props / Emits
// 3. Composables / Stores
// 4. 响应式状态
// 5. 计算属性
// 6. 方法
// 7. 生命周期钩子
</script>

<style scoped>
/* 组件样式 */
</style>
```

### 命名
- 组件文件：PascalCase（`SkillCard.vue`, `AppHeader.vue`）
- 页面组件：PascalCase + Page 后缀（`HomePage.vue`, `SkillListPage.vue`）
- 组合式函数：camelCase + use 前缀（`useSmartSidebar.ts`）
- Store 文件：camelCase + Store 后缀（`skillStore.ts`）
- 工具函数：camelCase（`skillParser.ts`, `githubClient.ts`）

### Props 定义
- 使用 TypeScript 泛型语法：`defineProps<{ title: string }>()`
- 可选 props 使用 `?` 标记

### 事件
- 使用 `defineEmits<{ (e: 'update', value: string): void }>()` 语法

## TypeScript

### 类型定义
- 接口统一在 `src/types/index.ts` 定义
- 使用 `interface` 而非 `type`（对象结构）
- 导出使用 named export

### 路径别名
- `@/` 映射到 `src/`，所有导入使用别名

## Tailwind CSS

### 类名顺序
1. 布局（display, position）
2. 间距（margin, padding）
3. 尺寸（width, height）
4. 颜色（text, bg, border）
5. 排版（font, text）
6. 效果（opacity, shadow, transition）

### 设计 Token
- 赛博朋克风格：霓虹青 `#00f5ff`、霓虹粉 `#ff006e`、霓虹紫 `#8338ec`、霓虹黄 `#ffbe0b`
- 卡片：毛玻璃效果 + 霓虹边框 + 悬停发光
- 暗色模式：`dark:` 前缀

## 通用规则

- 不写注释解释代码做什么，只在 why 非显而易见时写注释
- 不引入未使用的导入
- 不要为了"未来可能"的场景添加抽象
- 三个相似行优于过早抽象
