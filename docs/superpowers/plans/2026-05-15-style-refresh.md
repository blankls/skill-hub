# Skill Hub 风格优化 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 更新 Skill Hub 的视觉风格为「清新实用 + 赛博朋克轻量版」，包括颜色、组件、3D 粒子动效。

**Architecture:** 渐进式修改现有文件，保持 Git 可回滚，每个任务独立可测试。

**Tech Stack:** Vue 3, Tailwind CSS, Canvas, TypeScript

---

## 📁 文件结构

| 任务 | 文件 | 操作 |
|------|------|------|
| 1 | src/style.css | 修改颜色变量和全局样式 |
| 2 | src/modules/home/components/HeroSection.vue | 重写为 3D 粒子系统 |
| 3 | src/components/ui/SkillCard.vue | 简化卡片设计 |
| 4 | src/modules/home/components/FeaturesSection.vue | 更新样式 |
| 5 | src/modules/home/components/PopularSkills.vue | 更新样式 |

---

## 🎯 任务列表

### Task 1: 更新全局颜色和样式系统

**Files:**
- Modify: `src/style.css`

- [ ] **Step 1: 更新颜色变量**
  ```css
  :root {
    --neon-cyan: #0ea5e9;
    --neon-pink: #ec4899;
    --neon-purple: #8b5cf6;
    --neon-yellow: #f59e0b;
    --dark-bg: #0f172a;
    --dark-card: #1e293b;
    --text-light: #f8fafc;
    --text-muted: #94a3b8;
  }
  ```

- [ ] **Step 2: 更新字体设置**
  ```css
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }
  ```

- [ ] **Step 3: 简化全局动画**
  ```css
  * {
    transition: all 0.2s ease;
  }
  ```

- [ ] **Step 4: 保存并验证 Vite 无错误**

- [ ] **Step 5: Git 提交**
  ```bash
  git add src/style.css
  git commit -m "style: 更新全局颜色和字体系统"
  ```

---

### Task 2: 重写 HeroSection 为 3D 粒子系统

**Files:**
- Modify: `src/modules/home/components/HeroSection.vue`

- [ ] **Step 1: 替换为 3D 粒子 Canvas 实现**
  - 保留现有 template 结构，添加 Canvas
  - 实现 3D 坐标变换
  - 粒子跟随鼠标交互

  ```vue
  <template>
    <section class="relative min-h-screen flex items-center justify-center overflow-hidden">
      <canvas ref="canvas" class="absolute inset-0 w-full h-full" />
      <!-- 保留原有内容，简化样式 -->
      <div class="relative z-10 w-full max-w-[95rem] px-6 text-center">
        <!-- 标题、搜索框、标签 -->
      </div>
    </section>
  </template>
  ```

- [ ] **Step 2: 实现 3D 粒子逻辑**
  - 25 个粒子
  - 鼠标跟随和重力效果
  - 粒子连线

- [ ] **Step 3: 测试页面加载和交互**

- [ ] **Step 4: Git 提交**
  ```bash
  git add src/modules/home/components/HeroSection.vue
  git commit -m "feat: 重写 HeroSection 为 3D 粒子交互系统"
  ```

---

### Task 3: 简化 SkillCard 组件设计

**Files:**
- Modify: `src/components/ui/SkillCard.vue`

- [ ] **Step 1: 简化顶部渐变条**
  ```css
  .skill-card::before {
    height: 2px;
    opacity: 0.6;
  }
  ```

- [ ] **Step 2: 简化悬停效果**
  ```css
  .skill-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  ```

- [ ] **Step 3: 更新字体为 sans-serif（除标签）**

- [ ] **Step 4: 验证卡片在列表页正常显示**

- [ ] **Step 5: Git 提交**
  ```bash
  git add src/components/ui/SkillCard.vue
  git commit -m "style: 简化 SkillCard 设计"
  ```

---

### Task 4: 更新 FeaturesSection 样式

**Files:**
- Modify: `src/modules/home/components/FeaturesSection.vue`

- [ ] **Step 1: 简化卡片样式，与新风格一致**

- [ ] **Step 2: 验证在首页正常显示**

- [ ] **Step 3: Git 提交**
  ```bash
  git add src/modules/home/components/FeaturesSection.vue
  git commit -m "style: 更新 FeaturesSection 样式"
  ```

---

### Task 5: 更新 PopularSkills 样式

**Files:**
- Modify: `src/modules/home/components/PopularSkills.vue`

- [ ] **Step 1: 简化样式，与新风格一致**

- [ ] **Step 2: 验证在首页正常显示**

- [ ] **Step 3: Git 提交**
  ```bash
  git add src/modules/home/components/PopularSkills.vue
  git commit -m "style: 更新 PopularSkills 样式"
  ```
