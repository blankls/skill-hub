<template>
  <div class="space-y-6">
    <div v-for="tool in skill.tools" :key="tool.name" class="rounded-xl overflow-hidden border border-[var(--neon-cyan)]/20" style="background: var(--dark-card)">
      <div class="p-6 border-b border-[var(--neon-cyan)]/15">
        <h3 class="text-xl font-semibold mb-2" style="color: var(--text-light)">{{ tool.name }}</h3>
        <p style="color: var(--text-muted)">{{ tool.description }}</p>
      </div>
      <div class="p-6">
        <h4 class="font-semibold mb-4" style="color: var(--text-light)">参数</h4>
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
          <h4 class="font-semibold mb-3" style="color: var(--text-light)">示例</h4>
          <pre class="p-4 rounded-lg overflow-x-auto text-sm font-mono" style="background: rgba(15, 23, 42, 0.6); color: var(--text-light); border: 1px solid rgba(14, 165, 233, 0.2)"><code>{{ tool.example }}</code></pre>
        </div>
      </div>
    </div>
    <div v-if="skill.tools.length === 0" class="text-center py-20" style="color: var(--text-muted)">
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
