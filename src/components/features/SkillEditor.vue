<template>
  <el-dialog v-model="visible" :title="isNew ? '新建技能' : '编辑技能'" width="800px">
    <el-form :model="form" label-width="100px">
      <el-form-item label="名称">
        <el-input v-model="form.name" />
      </el-form-item>
      <el-form-item label="描述">
        <el-input v-model="form.description" type="textarea" :rows="3" />
      </el-form-item>
      <el-form-item label="版本">
        <el-input v-model="form.version" />
      </el-form-item>
      <el-form-item label="作者">
        <el-input v-model="form.author" />
      </el-form-item>
      <el-form-item label="标签">
        <el-select v-model="form.tags" multiple filterable allow-create />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="save">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Skill } from '@/types'

const props = defineProps<{
  modelValue: boolean
  skill?: Skill
}>()
const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'save', skill: Skill): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
})
const isNew = computed(() => !props.skill)

const form = ref<Partial<Skill>>({
  name: '',
  description: '',
  version: '1.0.0',
  author: '',
  tags: [],
  source: { type: 'local' },
  files: [],
  createdAt: new Date(),
  updatedAt: new Date()
})

watch(() => props.skill, (s) => {
  if (s) {
    form.value = { ...s }
  } else {
    form.value = {
      name: '',
      description: '',
      version: '1.0.0',
      author: '',
      tags: [],
      source: { type: 'local' },
      files: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }
}, { immediate: true })

function save() {
  emit('save', {
    ...form.value,
    id: props.skill?.id || crypto.randomUUID(),
    files: props.skill?.files || [],
    source: props.skill?.source || { type: 'local' },
    createdAt: props.skill?.createdAt || new Date(),
    updatedAt: new Date()
  } as Skill)
  visible.value = false
}
</script>
