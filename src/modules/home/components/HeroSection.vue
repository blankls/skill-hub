<template>
  <section class="relative min-h-screen flex items-center justify-center overflow-hidden">
    <div class="absolute inset-0 gradient-bg"></div>
    
    <!-- 3D Particle Canvas -->
    <canvas ref="canvas" class="absolute inset-0 w-full h-full" @mousemove="handleMouseMove"></canvas>
    
    <!-- Animated Grid Lines (simplified) -->
    <div class="absolute inset-0 opacity-10">
      <svg class="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="var(--neon-cyan)" stroke-width="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </div>

    <!-- Main Content -->
    <div class="relative z-10 w-full max-w-[95rem] px-6 text-center">
      <!-- Logo Text - simplified -->
      <h1 class="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">
        SKILL HUB
        <span class="block text-base md:text-xl text-[var(--neon-yellow)] mt-2 font-mono">
          // AI Skills Manager v2.0
        </span>
      </h1>
      
      <p class="text-lg md:text-xl text-[var(--text-muted)] mb-10 max-w-2xl mx-auto leading-relaxed">
        Discover · Share · Manage your AI Skills
      </p>

      <!-- Search Area - simplified -->
      <div class="relative mb-12">
        <div class="relative flex items-center bg-[var(--dark-card)] border border-[var(--neon-cyan)]/20 rounded-full p-3 shadow-xl">
          <el-input
            v-model="searchQuery"
            size="large"
            placeholder="Search skills... (e.g. 代码生成)"
            class="flex-1 bg-transparent no-input-border"
            :class="{ 'no-input-border': true }"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon class="text-[var(--neon-cyan)]"><Search /></el-icon>
            </template>
          </el-input>
          <el-button type="primary" size="large" round class="ml-3 bg-gradient-to-r from-[var(--neon-cyan)] to-[var(--neon-purple)] border-none text-white font-semibold shadow-md" @click="handleSearch">
            LAUNCH
          </el-button>
        </div>
      </div>

      <!-- Popular Tags -->
      <div class="flex flex-wrap justify-center gap-2">
        <router-link v-for="tag in popularTags" :key="tag" :to="`/skills?tag=${tag}`"
          class="px-4 py-2 bg-[var(--dark-card)] hover:bg-[var(--neon-cyan)]/10 border border-[var(--neon-cyan)]/20 hover:border-[var(--neon-cyan)]/50 text-[var(--text-light)] rounded-full transition-all duration-200 font-mono text-sm">
          #{{ tag }}
        </router-link>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Search } from '@element-plus/icons-vue'

const router = useRouter()
const searchQuery = ref('')
const canvas = ref<HTMLCanvasElement | null>(null)
const popularTags = ['代码生成', '翻译', '写作', '数据分析', '创意', '编程', '学习']

let animationId: number
let particles: Particle3D[] = []
let mouseX = 0
let mouseY = 0

interface Particle3D {
  x: number
  y: number
  z: number
  vx: number
  vy: number
  vz: number
  radius: number
  colorIndex: number
}

const colorBases = [
  [255, 255, 255],
  [14, 165, 233],
  [236, 72, 153],
  [139, 92, 246]
]

const focalLength = 500
const centerX = ref(0)
const centerY = ref(0)

function handleSearch() {
  if (searchQuery.value.trim()) {
    router.push({ path: '/skills', query: { q: searchQuery.value } })
  } else {
    router.push('/skills')
  }
}

function handleMouseMove(e: MouseEvent) {
  const rect = canvas.value?.getBoundingClientRect()
  if (rect) {
    mouseX = (e.clientX - rect.left - rect.width / 2) * 0.5
    mouseY = (e.clientY - rect.top - rect.height / 2) * 0.5
  }
}

function initParticles() {
  if (!canvas.value) return
  
  const ctx = canvas.value.getContext('2d')
  if (!ctx) return

  canvas.value.width = window.innerWidth
  canvas.value.height = window.innerHeight
  centerX.value = canvas.value.width / 2
  centerY.value = canvas.value.height / 2

  particles = []
  const particleCount = 25

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: (Math.random() - 0.5) * 1000,
      y: (Math.random() - 0.5) * 1000,
      z: Math.random() * 2000,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      vz: -Math.random() * 1 - 0.3,
      radius: Math.random() * 5 + 3,
      colorIndex: Math.floor(Math.random() * colorBases.length)
    })
  }

  function animate() {
    if (!canvas.value || !ctx) return
    
    ctx.clearRect(0, 0, canvas.value.width, canvas.value.height)

    particles.forEach((particle, i) => {
      // Update particle position with mouse interaction
      particle.x += particle.vx
      particle.y += particle.vy
      particle.z += particle.vz

      // Mouse attraction
      const dx = mouseX - particle.x * 0.1
      const dy = mouseY - particle.y * 0.1
      particle.vx += dx * 0.0001
      particle.vy += dy * 0.0001

      // Reset particle if too far
      if (particle.z < 0) {
        particle.z = 2000
        particle.x = (Math.random() - 0.5) * 1000
        particle.y = (Math.random() - 0.5) * 1000
      }

      // Apply friction
      particle.vx *= 0.98
      particle.vy *= 0.98

      // 3D to 2D projection
      const scale = focalLength / (focalLength + particle.z)
      const projX = centerX.value + particle.x * scale
      const projY = centerY.value + particle.y * scale
      const projRadius = particle.radius * scale

      // Draw particle
      ctx.beginPath()
      ctx.arc(projX, projY, projRadius, 0, Math.PI * 2)
      const alpha = 1 - particle.z / 2000
      const [r, g, b] = colorBases[particle.colorIndex]
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.3 + alpha * 0.7})`
      ctx.fill()

      // Draw connections
      particles.slice(i + 1).forEach(other => {
        const dx = particle.x - other.x
        const dy = particle.y - other.y
        const dz = particle.z - other.z
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)

        if (distance < 300) {
          const otherScale = focalLength / (focalLength + other.z)
          const otherProjX = centerX.value + other.x * otherScale
          const otherProjY = centerY.value + other.y * otherScale

          ctx.beginPath()
          ctx.strokeStyle = `rgba(14, 165, 233, ${0.08 * (1 - distance / 300)})`
          ctx.lineWidth = 0.5 * scale
          ctx.moveTo(projX, projY)
          ctx.lineTo(otherProjX, otherProjY)
          ctx.stroke()
        }
      })
    })

    animationId = requestAnimationFrame(animate)
  }

  animate()
}

function handleResize() {
  if (canvas.value) {
    canvas.value.width = window.innerWidth
    canvas.value.height = window.innerHeight
    centerX.value = canvas.value.width / 2
    centerY.value = canvas.value.height / 2
  }
}

onMounted(() => {
  initParticles()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
})
</script>

<style scoped>
.no-input-border :deep(.el-input__wrapper) {
  box-shadow: none !important;
  border: none !important;
  background-color: transparent !important;
}

.no-input-border :deep(.el-input__inner) {
  background-color: transparent !important;
}

.no-input-border :deep(.el-input__wrapper:hover),
.no-input-border :deep(.el-input__wrapper.is-focus) {
  box-shadow: none !important;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  h1 {
    font-size: 2.5rem !important;
  }
  
  h1 span {
    font-size: 0.875rem !important;
  }
  
  p {
    font-size: 0.875rem !important;
  }
  
  .relative.z-10 {
    padding: 1rem !important;
  }
  
  .relative.flex.items-center {
    flex-direction: column !important;
    gap: 0.75rem !important;
    border-radius: 1rem !important;
  }
  
  .relative.flex.items-center .el-input {
    width: 100% !important;
  }
  
  .relative.flex.items-center .el-button {
    width: 100% !important;
    margin-left: 0 !important;
  }
}

@media (max-width: 640px) {
  h1 {
    font-size: 2rem !important;
  }
  
  .relative.z-10 {
    padding: 0.75rem !important;
  }
}

/* Touch friendly improvements */
@media (max-width: 768px) {
  .flex.flex-wrap.justify-center.gap-2 {
    gap: 0.75rem !important;
  }
  
  /* Make tags bigger for touch */
  .flex.flex-wrap.justify-center.gap-2 .router-link {
    padding: 12px 20px !important;
    font-size: 0.9rem !important;
  }
  
  /* Improve search input touch */
  .relative.flex.items-center {
    padding: 1rem !important;
  }
  
  /* Larger tap target for the big launch button */
  .bg-gradient-to-r.from-\\[var\\(--neon-cyan\\)\\].to-\\[var\\(--neon-purple\\)\\] {
    padding: 14px 24px !important;
    font-size: 1rem !important;
  }
}

/* Disable hover effects on touch devices */
@media (hover: none) and (pointer: coarse) {
  .hover\\:shadow-\\[0_0_20px_rgba\\(0,245,255,0.5\\)\\]:hover,
  .hover\\:scale-105:hover,
  .group:hover .group-hover\\:scale-110,
  .group:hover .group-hover\\:text-\\[var\\(--neon-cyan\\)\\] {
    transform: none !important;
    box-shadow: none !important;
    transition: none !important;
  }
}
</style>
