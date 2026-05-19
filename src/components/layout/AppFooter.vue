<template>
  <footer class="border-t border-gray-200 dark:border-dark-border py-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div class="col-span-2">
          <div class="flex items-center gap-2 mb-4">
            <div class="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
              <span class="text-white font-bold">S</span>
            </div>
            <span class="font-bold text-lg">Skill Hub</span>
          </div>
          <p class="text-gray-600 dark:text-gray-400">
            一个集中展示与管理 AI Skills 的可视化平台
          </p>
        </div>
        <div>
          <h4 class="font-semibold mb-4">快速链接</h4>
          <ul class="space-y-2 text-gray-600 dark:text-gray-400">
            <li><router-link to="/" class="hover:text-primary-600 transition-colors">首页</router-link></li>
            <li><router-link to="/skills" class="hover:text-primary-600 transition-colors">技能库</router-link></li>
            <li><router-link to="/admin" class="hover:text-primary-600 transition-colors">管理后台</router-link></li>
          </ul>
        </div>
        <div>
          <h4 class="font-semibold mb-4">资源</h4>
          <ul class="space-y-2 text-gray-600 dark:text-gray-400">
            <li><a href="https://github.com/blankls/skill-hub" target="_blank" rel="noopener noreferrer" class="hover:text-primary-600 transition-colors inline-flex items-center gap-1">GitHub <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg></a></li>
            <li><a href="https://gitee.com/blankls/skill-hub" target="_blank" rel="noopener noreferrer" class="hover:text-primary-600 transition-colors inline-flex items-center gap-1">Gitee <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg></a></li>
            <li><a href="https://github.com/blankls/skill-hub/issues" target="_blank" rel="noopener noreferrer" class="hover:text-primary-600 transition-colors inline-flex items-center gap-1">反馈问题 <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg></a></li>
          </ul>
        </div>
      </div>
      <div class="mt-8 pt-8 border-t border-gray-200 dark:border-dark-border text-center text-gray-500">
        © {{ new Date().getFullYear() }} Skill Hub. All rights reserved.
      </div>
    </div>
  </footer>
</template>
