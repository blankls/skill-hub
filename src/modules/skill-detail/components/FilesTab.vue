<template>
  <div class="grid grid-cols-4 gap-6">
    <div class="col-span-1">
      <div class="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-200 dark:border-slate-700">
        <h3 class="font-semibold mb-4">文件列表</h3>
        <div v-if="skill.files && skill.files.length > 0" class="space-y-2">
          <div 
            v-for="file in skill.files" 
            :key="file.path"
            @click="selectedFile = file"
            :class="['px-3 py-2 rounded cursor-pointer transition', selectedFile?.path === file.path ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600' : 'hover:bg-gray-100 dark:hover:bg-slate-700']"
          >
            {{ file.name }}
          </div>
        </div>
        <div v-else class="text-center py-10 text-gray-500">
          暂无文件信息
        </div>
      </div>
    </div>
    <div class="col-span-3">
      <div v-if="selectedFile" class="bg-white dark:bg-slate-800 rounded-xl overflow-hidden border border-gray-200 dark:border-slate-700">
        <div class="bg-gray-100 dark:bg-slate-700 px-4 py-2 border-b border-gray-200 dark:border-slate-600 font-mono text-sm">
          {{ selectedFile.path }}
        </div>
        <pre class="p-4 overflow-auto max-h-[600px]"><code class="text-sm" :class="`language-${selectedFile.language || 'text'}`">{{ selectedFile.content }}</code></pre>
      </div>
      <div v-else class="bg-white dark:bg-slate-800 rounded-xl p-8 border border-gray-200 dark:border-slate-700 text-center text-gray-500">
        <p>请从左侧选择一个文件查看</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Skill, SkillFile } from '@/types'

interface Props {
  skill: Skill
}

const props = defineProps<Props>()
const selectedFile = ref<SkillFile | null>(null)
</script>
