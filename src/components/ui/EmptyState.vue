<template>
  <div class="empty-state-container">
    <div class="empty-state-icon">
      <slot name="icon">
        <span class="default-icon">📦</span>
      </slot>
    </div>
    <h3 class="empty-state-title">
      <slot name="title">{{ title }}</slot>
    </h3>
    <p class="empty-state-description">
      <slot name="description">{{ description }}</slot>
    </p>
    <div v-if="$slots.actions || showDefaultAction" class="empty-state-actions">
      <slot name="actions">
        <el-button v-if="showDefaultAction" type="primary" @click="handleAction" class="cyber-btn-primary">
          <slot name="action-text">{{ actionText }}</slot>
        </el-button>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  title?: string
  description?: string
  actionText?: string
  showDefaultAction?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '暂无内容',
  description: '开始创建或导入你的第一个项目吧',
  actionText: '开始使用',
  showDefaultAction: false
})

const emit = defineEmits<{
  (e: 'action'): void
}>()

function handleAction() {
  emit('action')
}
</script>

<style scoped>
.empty-state-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.empty-state-icon {
  font-size: 5rem;
  margin-bottom: 1.5rem;
  opacity: 0.8;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.default-icon {
  font-size: 5rem;
}

.empty-state-title {
  font-family: var(--font-sans);
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--text-light);
  margin-bottom: 0.75rem;
}

.empty-state-description {
  font-family: var(--font-sans);
  color: var(--text-muted);
  font-size: 1rem;
  margin-bottom: 2rem;
  max-width: 400px;
  line-height: 1.6;
}

.empty-state-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}

.cyber-btn-primary {
  background: linear-gradient(135deg, var(--neon-cyan), var(--neon-purple));
  border: none;
  color: white;
  font-weight: bold;
  padding: 0.75rem 2rem;
  border-radius: 8px;
}

.cyber-btn-primary:hover {
  box-shadow: 0 0 20px rgba(0, 245, 255, 0.4);
}
</style>
