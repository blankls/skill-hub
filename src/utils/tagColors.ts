export interface TagColor {
  bg: string
  border: string
  hover: string
  text: string
}

export const tagColors: TagColor[] = [
  { bg: 'rgba(99, 102, 241, 0.1)', border: 'rgba(99, 102, 241, 0.5)', hover: 'rgba(99, 102, 241, 0.2)', text: 'rgba(99, 102, 241, 1)' },
  { bg: 'rgba(236, 72, 153, 0.1)', border: 'rgba(236, 72, 153, 0.5)', hover: 'rgba(236, 72, 153, 0.2)', text: 'rgba(236, 72, 153, 1)' },
  { bg: 'rgba(34, 197, 94, 0.1)', border: 'rgba(34, 197, 94, 0.5)', hover: 'rgba(34, 197, 94, 0.2)', text: 'rgba(34, 197, 94, 1)' },
  { bg: 'rgba(251, 146, 60, 0.1)', border: 'rgba(251, 146, 60, 0.5)', hover: 'rgba(251, 146, 60, 0.2)', text: 'rgba(251, 146, 60, 1)' },
  { bg: 'rgba(14, 165, 233, 0.1)', border: 'rgba(14, 165, 233, 0.5)', hover: 'rgba(14, 165, 233, 0.2)', text: 'rgba(14, 165, 233, 1)' },
  { bg: 'rgba(168, 85, 247, 0.1)', border: 'rgba(168, 85, 247, 0.5)', hover: 'rgba(168, 85, 247, 0.2)', text: 'rgba(168, 85, 247, 1)' },
  { bg: 'rgba(20, 184, 166, 0.1)', border: 'rgba(20, 184, 166, 0.5)', hover: 'rgba(20, 184, 166, 0.2)', text: 'rgba(20, 184, 166, 1)' },
  { bg: 'rgba(244, 63, 94, 0.1)', border: 'rgba(244, 63, 94, 0.5)', hover: 'rgba(244, 63, 94, 0.2)', text: 'rgba(244, 63, 94, 1)' }
]

export function getTagColor(tag: string, index: number): TagColor {
  const hash = tag.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const colorIndex = (hash + index) % tagColors.length
  return tagColors[colorIndex]
}
