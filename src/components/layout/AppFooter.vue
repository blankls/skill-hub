<template>
  <footer class="bg-[var(--dark-card)] border-t border-[var(--neon-cyan)]/10">
    <div class="max-w-[100rem] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 py-10 md:py-14">
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-10">
        <!-- Brand -->
        <div>
          <div class="flex items-center gap-2 mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" class="w-7 h-7">
              <defs>
                <linearGradient id="footerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#00f5ff" />
                  <stop offset="100%" style="stop-color:#a855f7" />
                </linearGradient>
              </defs>
              <circle cx="50" cy="50" r="35" fill="none" stroke="url(#footerGrad)" stroke-width="3"/>
              <circle cx="50" cy="50" r="28" fill="none" stroke="url(#footerGrad)" stroke-width="2" opacity="0.7"/>
              <circle cx="50" cy="50" r="20" fill="none" stroke="url(#footerGrad)" stroke-width="2" opacity="0.5"/>
              <path d="M50 30 L50 70 M30 50 L70 50 M36 36 L64 64 M64 36 L36 64" stroke="url(#footerGrad)" stroke-width="3" stroke-linecap="round"/>
              <circle cx="50" cy="50" r="8" fill="url(#footerGrad)"/>
            </svg>
            <span class="text-lg font-black text-[var(--text-light)]">SKILL<span class="text-[var(--neon-cyan)]">HUB</span></span>
          </div>
          <p class="text-sm text-[var(--text-muted)] leading-relaxed max-w-xs">
            AI Skills 管理与分享平台，让每一次 AI 编程体验都更加高效。
          </p>
        </div>

        <!-- Quick Links -->
        <div>
          <h4 class="text-sm font-semibold text-[var(--text-light)] mb-4 tracking-wide uppercase">快速链接</h4>
          <div class="space-y-2.5">
            <router-link to="/" class="block text-sm text-[var(--text-muted)] hover:text-[var(--neon-cyan)] transition-colors duration-200">首页</router-link>
            <router-link to="/skills" class="block text-sm text-[var(--text-muted)] hover:text-[var(--neon-cyan)] transition-colors duration-200">技能列表</router-link>
            <router-link to="/admin" class="block text-sm text-[var(--text-muted)] hover:text-[var(--neon-cyan)] transition-colors duration-200">管理后台</router-link>
          </div>
        </div>

        <!-- Community -->
        <div>
          <h4 class="text-sm font-semibold text-[var(--text-light)] mb-4 tracking-wide uppercase">社区与反馈</h4>
          <div class="space-y-2.5">
            <a :href="githubRepoUrl" target="_blank" rel="noopener noreferrer" class="flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--neon-cyan)] transition-colors duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              GitHub
            </a>
            <a :href="githubIssuesUrl" target="_blank" rel="noopener noreferrer" class="flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--neon-cyan)] transition-colors duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              意见反馈
            </a>
          </div>
        </div>

        <!-- Project Info -->
        <div>
          <h4 class="text-sm font-semibold text-[var(--text-light)] mb-4 tracking-wide uppercase">项目信息</h4>
          <div class="space-y-2.5 text-sm text-[var(--text-muted)]">
            <p>基于 Vue 3 + Vite + Pinia 构建</p>
            <p>支持 GitHub 仓库一键导入</p>
            <p>兼容 Claude / Solo / Cursor 技能格式</p>
          </div>
        </div>
      </div>

      <!-- Copyright -->
      <div class="mt-10 md:mt-14 pt-6 border-t border-[var(--neon-cyan)]/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[var(--text-muted)]">
        <p>&copy; {{ currentYear }} SkillHub. All rights reserved.</p>
        <p>Build with Vue 3 &amp; Element Plus</p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const currentYear = new Date().getFullYear()
const githubRepoUrl = import.meta.env.VITE_GITHUB_REPO_URL || 'https://github.com/blankls/skill-hub'
const githubIssuesUrl = `${githubRepoUrl}/issues`
</script>