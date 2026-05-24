export function formatDate(date: Date | string): string {
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const oneDay = 24 * 60 * 60 * 1000

  if (diff < oneDay) return '今天'
  if (diff < 2 * oneDay) return '昨天'
  if (diff < 7 * oneDay) return `${Math.floor(diff / oneDay)} 天前`
  if (diff < 30 * oneDay) return `${Math.floor(diff / (7 * oneDay))} 周前`
  if (diff < 365 * oneDay) return `${Math.floor(diff / (30 * oneDay))} 月前`
  return d.toLocaleDateString('zh-CN')
}
