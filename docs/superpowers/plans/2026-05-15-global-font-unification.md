# Global Font Unification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Unify the global font style for a more consistent and clean aesthetic across the entire Skill Hub application.

**Architecture:** Incremental file updates to remove excessive monospace font usage, apply consistent font families according to our design guidelines, and ensure visual consistency.

**Tech Stack:** Vue 3, Tailwind CSS, CSS Variables

---

## 📋 Font Usage Guidelines

| Element Type | Font Family | Purpose |
|--------------|-------------|---------|
| Body text, headings, buttons | `font-sans` (system sans-serif) | Primary readability |
| Code blocks, tags, version numbers | `font-mono` (monospace) | Technical content distinction |
| Logos/branding | Keep existing monospace for character | Brand recognition |

---

## 📁 Files to Modify

1. `src/style.css` - Add CSS custom properties for font families
2. `src/components/layout/AppHeader.vue` - Simplify logo/nav fonts
3. `src/modules/home/components/HeroSection.vue` - Clean up title fonts
4. `src/components/ui/SkillCard.vue` - Update card text styles
5. `src/modules/skill-list/SkillListPage.vue` - Simplify loading text
6. `src/modules/skill-list/components/SkillToolbar.vue`
7. `src/modules/skill-list/components/SkillListView.vue`
8. `src/modules/skill-detail/SkillDetailPage.vue`
9. `src/modules/skill-detail/components/FilesTab.vue`
10. `src/components/features/ThemeToggle.vue`
11. `src/components/features/SkillImportModal.vue`

---

## 🎯 Tasks

### Task 1: Update Global Style CSS

**Files:**
- Modify: `src/style.css`

- [ ] **Step 1: Add font family CSS variables**

```css
:root {
  /* ... existing variables ... */
  --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-mono: 'SF Mono', 'Consolas', 'Courier New', monospace;
}

.dark {
  /* ... existing variables ... */
  --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-mono: 'SF Mono', 'Consolas', 'Courier New', monospace;
}
```

- [ ] **Step 2: Update body and code-block styles**

```css
body {
  /* ... existing styles ... */
  font-family: var(--font-sans);
}

.code-block {
  font-family: var(--font-mono);
  /* ... existing styles ... */
}
```

- [ ] **Step 3: Commit**

```bash
git add src/style.css
git commit -m "style: add font family CSS custom properties"
```

---

### Task 2: Simplify AppHeader Fonts

**Files:**
- Modify: `src/components/layout/AppHeader.vue`

- [ ] **Step 1: Update navigation links font**

```vue
<nav class="hidden md:flex gap-6">
  <!-- Remove font-mono from links -->
  <router-link to="/" class="text-[var(--text-muted)] hover:text-[var(--neon-cyan)] font-medium hover:border-b-2 hover:border-[var(--neon-cyan)] pb-1 transition-all">
    Home
  </router-link>
  <router-link to="/skills" class="text-[var(--text-muted)] hover:text-[var(--neon-cyan)] font-medium hover:border-b-2 hover:border-[var(--neon-cyan)] pb-1 transition-all">
    Skills
  </router-link>
</nav>
```

- [ ] **Step 2: Update logo text** (keep monospace for "S" and "SKILL HUB" branding)

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/AppHeader.vue
git commit -m "style: simplify AppHeader fonts"
```

---

### Task 3: Update SkillListPage Fonts

**Files:**
- Modify: `src/modules/skill-list/SkillListPage.vue`

- [ ] **Step 1: Simplify loading text and empty state**

```vue
<div v-if="skillStore.loading" class="text-center py-20">
  <el-icon class="text-5xl text-[var(--neon-cyan)] animate-spin"><Loading /></el-icon>
  <p class="mt-6 text-[var(--text-muted)] text-lg">加载技能中...</p>
</div>

<!-- Empty state title will also be simplified in EmptyState component -->
```

- [ ] **Step 2: Commit**

```bash
git add src/modules/skill-list/SkillListPage.vue
git commit -m "style: simplify SkillListPage fonts"
```

---

### Task 4: Update Remaining Components (Batch)

**Files:**
- Modify: `src/modules/home/components/HeroSection.vue`
- Modify: `src/components/ui/SkillCard.vue`
- Modify: `src/modules/skill-list/components/SkillToolbar.vue`
- Modify: `src/modules/skill-list/components/SkillListView.vue`
- Modify: `src/modules/skill-detail/SkillDetailPage.vue`
- Modify: `src/modules/skill-detail/components/FilesTab.vue`
- Modify: `src/components/features/ThemeToggle.vue`
- Modify: `src/components/features/SkillImportModal.vue`
- Modify: `src/components/ui/EmptyState.vue`

- [ ] **Step 1: For each file, remove excessive `font-mono` classes from non-code/non-tag text**
- [ ] **Step 2: Keep monospace for tags, version numbers, and code-related content only**
- [ ] **Step 3: Test for consistent appearance**

- [ ] **Step 4: Commit all changes**

```bash
git add \
  src/modules/home/components/HeroSection.vue \
  src/components/ui/SkillCard.vue \
  src/modules/skill-list/components/SkillToolbar.vue \
  src/modules/skill-list/components/SkillListView.vue \
  src/modules/skill-detail/SkillDetailPage.vue \
  src/modules/skill-detail/components/FilesTab.vue \
  src/components/features/ThemeToggle.vue \
  src/components/features/SkillImportModal.vue \
  src/components/ui/EmptyState.vue
git commit -m "style: unify fonts across all components"
```

---

## 📊 Summary

This plan:
1. Establishes consistent font custom properties in global CSS
2. Removes excessive monospace usage for general text
3. Maintains monospace for appropriate content (tags, code, version numbers)
4. Creates a clean, consistent aesthetic throughout the app
