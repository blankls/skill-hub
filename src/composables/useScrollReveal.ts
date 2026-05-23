import { ref, onMounted, onUnmounted, type Ref } from 'vue'

export function useScrollReveal(
    targetRef: Ref<HTMLElement | null>,
    options?: {
        threshold?: number
        rootMargin?: string
        staggerDelay?: number
    }
) {
    const isRevealed = ref(false)
    const revealedItems = ref<Set<number>>(new Set())
    const { threshold = 0.1, rootMargin = '0px 0px -50px 0px' } = options || {}

    let observer: IntersectionObserver | null = null

    onMounted(() => {
        if (!targetRef.value) return

        observer = new IntersectionObserver(
            (entries) => {
                if (entries[0]?.isIntersecting) {
                    isRevealed.value = true
                    observer?.unobserve(targetRef.value!)
                }
            },
            { threshold, rootMargin }
        )
        observer.observe(targetRef.value)
    })

    onUnmounted(() => {
        observer?.disconnect()
    })

    function observeItems(selector: string) {
        if (!targetRef.value) return
        const items = targetRef.value.querySelectorAll(selector)
        const itemObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const el = entry.target as HTMLElement
                        const idx = Array.from(items).indexOf(el)
                        if (idx >= 0) {
                            revealedItems.value = new Set([...revealedItems.value, idx])
                        }
                        itemObserver.unobserve(entry.target)
                    }
                })
            },
            { threshold: 0.1 }
        )
        items.forEach((item) => itemObserver.observe(item))

        onUnmounted(() => {
            itemObserver.disconnect()
        })
    }

    return { isRevealed, revealedItems, observeItems }
}

export function staggerStyle(index: number, baseDelay = 100): Record<string, string> {
    return {
        '--stagger-delay': `${index * baseDelay}ms`,
        '--stagger-index': String(index)
    }
}