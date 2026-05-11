<template>
  <div class="space-y-6">
    <div v-for="tool in skill.tools" :key="tool.name" class="bg-white dark:bg-dark-card rounded-xl overflow-hidden border border-gray-200 dark:border-dark-border">
      <div class="p-6 border-b border-gray-200 dark:border-dark-border">
        <h3 class="text-xl font-semibold mb-2">{{ tool.name }}</h3>
        <p class="text-gray-600 dark:text-gray-400">{{ tool.description }}</p>
      </div>
      <div class="p-6">
        <h4 class="font-semibold mb-4">参数</h4>
        <el-table :data="tool.parameters" style="width: 100%">
          <el-table-column prop="name" label="名称" width="180" />
          <el-table-column prop="type" label="类型" width="120">
            <template #default="{ row }">
              <el-tag size="small" type="info">{{ row.type }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="required" label="必需" width="100">
            <template #default="{ row }">
              <el-tag v-if="row.required" size="small" type="danger">是</el-tag>
              <el-tag v-else size="small">否</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="description" label="描述" />
        </el-table>
        <div v-if="tool.example" class="mt-6">
          <h4 class="font-semibold mb-3">示例</h4>
          <div class="code-block">
            <pre><code class="language-text">{{ tool.example }}</code></pre>
          </div>
        </div>
      </div>
    </div>
    <div v-if="skill.tools.length === 0" class="text-center py-20 text-gray-500">
      暂无工具信息
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Skill } from '@/types'

interface Props {
  skill: Skill
}

defineProps<Props>()
</script>
