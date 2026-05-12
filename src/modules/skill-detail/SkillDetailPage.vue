<template>
  <div class="min-h-screen bg-[var(--dark-bg)]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div v-if="loading" class="flex items-center justify-center py-20">
        <el-icon class="text-4xl text-[var(--neon-cyan)] animate-spin"><Loading /></el-icon>
        <p class="ml-4 text-[var(--text-muted)] font-mono">> Loading Skill...</p>
      </div>
      <template v-else-if="skill">
        <!-- Return Button & Header -->
        <div class="flex items-center justify-between mb-8">
          <div class="flex items-center gap-4">
            <el-button
              @click="router.back()"
              class="flex items-center gap-2 bg-[var(--dark-card)] border border-[var(--neon-cyan)]/30 hover:border-[var(--neon-cyan)] hover:bg-[var(--neon-cyan)]/10 text-[var(--text-light)] rounded-xl font-mono"
            >
              <el-icon><ArrowLeft /></el-icon>
              <span>BACK</span>
            </el-button>
            <div>
              <h1 class="text-3xl font-bold mb-2 text-[var(--text-light)] font-mono">{{ skill.name }}</h1>
              <p class="text-[var(--text-muted)]">{{ skill.description }}</p>
            </div>
          </div>
          <div class="flex gap-2">
            <el-button @click="showEditor = true" class="bg-[var(--dark-card)] border border-[var(--neon-yellow)]/50 hover:border-[var(--neon-yellow)] text-[var(--text-light)] font-mono">
              <el-icon><Edit /></el-icon> EDIT
            </el-button>
            <el-button type="danger" @click="handleDelete" class="font-mono">
              <el-icon><Delete /></el-icon> DELETE
            </el-button>
            <ZipExportBtn :skill="skill" />
          </div>
        </div>
        <div class="mt-8">
          <el-tabs v-model="activeTab">
            <el-tab-pane label="OVERVIEW" name="overview">
              <OverviewTab :skill="skill" />
            </el-tab-pane>
            <el-tab-pane label="TOOLS" name="tools">
              <ToolsTab :skill="skill" />
            </el-tab-pane>
            <el-tab-pane label="FILES" name="files">
              <FilesTab :skill="skill" />
            </el-tab-pane>
          </el-tabs>
        </div>
      </template>
      <div v-else class="text-center py-20">
        <h2 class="text-2xl font-bold mb-4 text-[var(--text-light)] font-mono">> SKILL NOT FOUND</h2>
        <router-link to="/skills">
          <el-button type="primary" class="bg-gradient-to-r from-[var(--neon-cyan)] to-[var(--neon-purple)] border-none text-white font-bold font-mono">
            RETURN TO LIBRARY
          </el-button>
        </router-link>
      </div>
    </div>

    <SkillEditor v-model="showEditor" :skill="skill" @save="handleSave" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Loading, Edit, Delete, ArrowLeft } from '@element-plus/icons-vue'
import { useSkillStore } from '@/stores/skillStore'
import SkillEditor from '@/components/features/SkillEditor.vue'
import ZipExportBtn from '@/components/features/ZipExportBtn.vue'
import OverviewTab from './components/OverviewTab.vue'
import ToolsTab from './components/ToolsTab.vue'
import FilesTab from './components/FilesTab.vue'

const route = useRoute()
const router = useRouter()
const skillStore = useSkillStore()
const loading = ref(true)
const activeTab = ref('overview')
const showEditor = ref(false)

const skill = computed(() => {
  return skillStore.skills.find(s => s.id === route.params.id) || null
})

async function handleSave(updatedSkill: any) {
  await skillStore.updateSkill(updatedSkill)
  ElMessage.success('Skill Updated Successfully')
}

async function handleDelete() {
  try {
    await ElMessageBox.confirm('Are you sure you want to delete this skill?', 'Confirm Delete', {
      type: 'warning'
    })
    if (skill.value) {
      await skillStore.deleteSkill(skill.value.id)
      ElMessage.success('Skill Deleted Successfully')
      router.push('/skills')
    }
  } catch (e) {
  }
}

onMounted(async () => {
  if (skillStore.skills.length === 0) {
    await skillStore.loadSkills()
  }
  loading.value = false
})
</script>

<style scoped>
:deep(.el-tabs__header) {
  border-color: rgba(0, 245, 255, 0.2) !important;
}

:deep(.el-tabs__item) {
  color: var(--text-muted) !important;
  font-family: 'Courier New', monospace !important;
}

:deep(.el-tabs__item.is-active) {
  color: var(--neon-cyan) !important;
}

:deep(.el-tabs__active-bar) {
  background-color: var(--neon-cyan) !important;
}
</style>
