<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div v-if="loading" class="flex items-center justify-center py-20">
      <el-icon class="text-4xl text-primary-600 animate-spin"><Loading /></el-icon>
    </div>
    <template v-else-if="skill">
      <SkillHeader :skill="skill" />
      <div class="mt-8">
        <el-tabs v-model="activeTab" class="dark:text-white">
          <el-tab-pane label="概览" name="overview">
            <OverviewTab :skill="skill" />
          </el-tab-pane>
          <el-tab-pane label="工具" name="tools">
            <ToolsTab :skill="skill" />
          </el-tab-pane>
          <el-tab-pane label="文件" name="files">
            <FilesTab :skill="skill" />
          </el-tab-pane>
        </el-tabs>
      </div>
    </template>
    <div v-else class="text-center py-20">
      <h2 class="text-2xl font-bold mb-4">未找到技能</h2>
      <router-link to="/skills">
        <el-button type="primary">返回技能库</el-button>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Loading } from '@element-plus/icons-vue'
import { useSkillStore } from '@/stores/skillStore'
import SkillHeader from './components/SkillHeader.vue'
import OverviewTab from './components/OverviewTab.vue'
import ToolsTab from './components/ToolsTab.vue'
import FilesTab from './components/FilesTab.vue'

const route = useRoute()
const skillStore = useSkillStore()
const loading = ref(true)
const activeTab = ref('overview')

const skill = computed(() => {
  return skillStore.skills.find(s => s.id === route.params.id) || null
})

onMounted(async () => {
  if (skillStore.skills.length === 0) {
    await skillStore.loadSkills()
  }
  loading.value = false
})
</script>
