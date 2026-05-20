import { ref, onMounted, onUnmounted } from 'vue'

export function useSmartSidebar(delay = 1500) {
    const visible = ref(true)
    const isScrolling = ref(false)
    let scrollTimer: ReturnType<typeof setTimeout> | null = null
    let idleTimer: ReturnType<typeof setTimeout> | null = null

    function onScroll() {
        visible.value = false
        isScrolling.value = true

        if (scrollTimer) clearTimeout(scrollTimer)
        scrollTimer = setTimeout(() => {
            isScrolling.value = false
            scheduleIdleShow()
        }, 300)
    }

    function scheduleIdleShow() {
        if (idleTimer) clearTimeout(idleTimer)
        idleTimer = setTimeout(() => {
            visible.value = true
        }, delay)
    }

    function onMouseMove(e: MouseEvent) {
        if (isScrolling.value) return
        const edgeThreshold = 60
        const nearEdge = e.clientX < edgeThreshold || e.clientX > window.innerWidth - edgeThreshold
        if (nearEdge) {
            visible.value = true
            if (idleTimer) clearTimeout(idleTimer)
        }
    }

    onMounted(() => {
        window.addEventListener('scroll', onScroll, { passive: true })
        window.addEventListener('mousemove', onMouseMove, { passive: true })
    })

    onUnmounted(() => {
        window.removeEventListener('scroll', onScroll)
        window.removeEventListener('mousemove', onMouseMove)
        if (scrollTimer) clearTimeout(scrollTimer)
        if (idleTimer) clearTimeout(idleTimer)
    })

    return { visible }
}
