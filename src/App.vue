<template>
  <div id="app">
    <MainLayout>
      <router-view v-slot="{ Component, route }">
        <transition :name="transitionName" mode="out-in">
          <component :is="Component" :key="route.path" />
        </transition>
      </router-view>
    </MainLayout>
  </div>
</template>

<script setup lang="ts">
import MainLayout from '@/components/layout/MainLayout.vue'
import { onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useThemeStore } from '@/stores/themeStore'
import { useSkillStore } from '@/stores/skillStore'

const themeStore = useThemeStore()
const skillStore = useSkillStore()
const route = useRoute()

const transitionName = ref('fade-slide')

const routeStack = ref<string[]>([])

const isDetailPage = (path: string) => {
    return path.includes('/skills/') && path.split('/').length >= 3
}

watch(() => route.path, (newPath, oldPath) => {
    if (!oldPath) {
        routeStack.value = [newPath]
        return
    }
    
    const stackIndex = routeStack.value.indexOf(newPath)
    const goingToDetail = isDetailPage(newPath)
    const leavingDetail = isDetailPage(oldPath)
    
    if (stackIndex !== -1) {
        if (leavingDetail) {
            transitionName.value = 'door-close'
        } else {
            transitionName.value = 'slide-right'
        }
        routeStack.value = routeStack.value.slice(0, stackIndex + 1)
    } else {
        if (goingToDetail) {
            transitionName.value = 'door-open'
        } else {
            transitionName.value = 'slide-left'
        }
        routeStack.value.push(newPath)
    }
}, { immediate: true })

onMounted(() => {
    themeStore.initTheme()
    skillStore.loadSkills()
})
</script>

<style scoped>
#app {
    min-height: 100vh;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
    transition: opacity 0.3s ease, transform 0.3s ease;
    will-change: opacity, transform;
}

.fade-slide-enter-from {
    opacity: 0;
    transform: translateY(20px);
}

.fade-slide-leave-to {
    opacity: 0;
    transform: translateY(-20px);
}

.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
    transition: opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1), 
                transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    will-change: opacity, transform;
}

.slide-left-enter-from {
    opacity: 0;
    transform: translateX(50px);
}

.slide-left-leave-to {
    opacity: 0;
    transform: translateX(-50px);
}

.slide-right-enter-from {
    opacity: 0;
    transform: translateX(-50px);
}

.slide-right-leave-to {
    opacity: 0;
    transform: translateX(50px);
}

.door-open-enter-active {
    animation: door-open-in 0.45s cubic-bezier(0.25, 1, 0.5, 1) forwards;
    will-change: clip-path, opacity;
}

.door-open-leave-active {
    animation: door-open-out 0.25s ease-out forwards;
    will-change: opacity;
}

@keyframes door-open-in {
    0% {
        opacity: 0;
        clip-path: inset(0 50% 0 50%);
    }
    100% {
        opacity: 1;
        clip-path: inset(0 0 0 0);
    }
}

@keyframes door-open-out {
    0% {
        opacity: 1;
    }
    100% {
        opacity: 0;
    }
}

.door-close-enter-active {
    animation: door-close-in 0.25s ease-out forwards;
    will-change: opacity;
}

.door-close-leave-active {
    animation: door-close-out 0.45s cubic-bezier(0.25, 1, 0.5, 1) forwards;
    will-change: clip-path, opacity;
}

@keyframes door-close-in {
    0% {
        opacity: 0;
    }
    100% {
        opacity: 1;
    }
}

@keyframes door-close-out {
    0% {
        opacity: 1;
        clip-path: inset(0 0 0 0);
    }
    100% {
        opacity: 0;
        clip-path: inset(0 50% 0 50%);
    }
}
</style>
