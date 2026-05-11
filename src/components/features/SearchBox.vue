<template>
  <div class="relative">
    <el-input
      v-model="searchQuery"
      placeholder="搜索技能..."
      :prefix-icon="Search"
      class="w-64"
      clearable
      @input="handleSearch"
      @keyup.enter="goToSkills"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Search } from '@element-plus/icons-vue'
import { useSkillStore } from '@/stores/skillStore'

const router = useRouter()
const skillStore = useSkillStore()
const searchQuery = ref('')

const handleSearch = (val: string) => {
  skillStore.setSearchQuery(val)
}

const goToSkills = () => {
  if (router.currentRoute.value.path !== '/skills') {
    router.push('/skills')
  }
}
</script>
