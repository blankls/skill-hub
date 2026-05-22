import { ref, onMounted, onUnmounted } from 'vue'

export function useHoverSidebar(edgeWidth = 20) {
    const leftVisible = ref(false)
    const rightVisible = ref(false)
    let hideTimer: number | null = null

    const clearHideTimer = () => {
        if (hideTimer) { clearTimeout(hideTimer); hideTimer = null }
    }

    const showBoth = () => {
        leftVisible.value = true
        rightVisible.value = true
        clearHideTimer()
    }

    const scheduleHide = () => {
        clearHideTimer()
        hideTimer = window.setTimeout(() => {
            leftVisible.value = false
            rightVisible.value = false
        }, 1000)
    }

    const onMouseMove = (e: MouseEvent) => {
        const nearLeft = e.clientX <= edgeWidth
        const nearRight = e.clientX >= window.innerWidth - edgeWidth

        if (nearLeft || nearRight) {
            showBoth()
        }
    }

    const onSidebarEnter = () => {
        showBoth()
    }

    const onSidebarLeave = () => {
        scheduleHide()
    }

    onMounted(() => {
        window.addEventListener('mousemove', onMouseMove)
    })

    onUnmounted(() => {
        window.removeEventListener('mousemove', onMouseMove)
        clearHideTimer()
    })

    return {
        leftVisible, rightVisible,
        onSidebarEnter, onSidebarLeave
    }
}
