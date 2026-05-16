# Skill Hub 风格优化设计文档

## 📋 概述

本次优化将把 Skill Hub 从过于花哨的赛博朋克风格调整为「清新实用 + 赛博朋克轻量版」风格，平衡科技感与可读性。

## 🎯 设计原则

1. **清新实用优先** - 大量留白，清晰的视觉层次
2. **赛博朋克保留但克制** - 霓虹色作为点缀，不刺眼
3. **鼠标交互增强** - 3D 粒子跟随鼠标，自然流畅

---

## 🌈 颜色系统（更新）

### 主色调（降低饱和度，更柔和）

```css
--neon-cyan: #0ea5e9;      /* 柔和青 */
--neon-pink: #ec4899;      /* 柔和粉 */
--neon-purple: #8b5cf6;    /* 柔和紫 */
--neon-yellow: #f59e0b;    /* 柔和黄 */
```

### 背景色

```css
--dark-bg: #0f172a;        /* 深蓝灰背景 */
--dark-card: #1e293b;      /* 卡片背景 */
--light-bg: #f8fafc;       /* 亮色模式背景 */
--light-card: #ffffff;     /* 亮色模式卡片 */
```

### 文本色

```css
--text-light: #f8fafc;     /* 主要文本 */
--text-muted: #94a3b8;     /* 次要文本 */
```

---

## 🏠 首页 HeroSection 动效设计

### 3D 粒子漂浮系统

**技术方案：** Canvas + 3D 坐标变换

**特性：**
- 20-30 个粒子，不同大小（5-15px）
- 模拟 3D 深度，有远近感
- 粒子跟随鼠标移动，有重力和弹性
- 粒子之间有柔和连线（距离 < 150px 显示）
- 粒子颜色：白色、青色、粉色随机

**性能：** 60fps，使用 requestAnimationFrame

---

## 🧩 组件简化设计

### SkillCard

**简化内容：**
- 顶部彩色渐变条：保留但变细（2px）、变淡
- 悬浮效果：去掉发光，改为轻微上移（2px）+ 阴影
- 操作按钮：保持，默认隐藏，悬停显示
- 字体：主要内容使用 sans-serif，标签保留 mono

**保持内容：**
- 头像圆形渐变
- 标签 # 前缀
- 版本号 + 作者信息

### 按钮

**简化：**
- 渐变保留，但减少发光
- 悬停：轻微缩放 + 边框变亮

### 输入框

**简化：**
- 去掉外发光效果
- 边框更细，更柔和

---

## 📝 字体系统更新

```css
--font-mono: 'SF Mono', 'Consolas', monospace;  /* 代码感字体 */
--font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;  /* 主要字体 */
```

**使用规则：**
- 正文、标题 → font-sans
- 代码、标签、版本号 → font-mono

---

## 🎬 动画规范

**统一：**
- 过渡时间：0.2s ease（更快，更利落）
- 悬停动画：轻微上移（2px）+ 阴影
- 加载动画：简洁旋转

---

## 📦 改动范围

**核心文件：**
1. `src/style.css` - 更新颜色变量和全局样式
2. `src/modules/home/components/HeroSection.vue` - 全新 3D 粒子动效
3. `src/components/ui/SkillCard.vue` - 简化卡片设计
4. `src/modules/home/components/FeaturesSection.vue` - 更新样式
5. `src/modules/home/components/PopularSkills.vue` - 更新样式
