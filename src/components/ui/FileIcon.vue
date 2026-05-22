<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    class="file-icon"
    :style="{ color: iconColor }"
  >
    <template v-if="iconType === 'folder'">
      <path d="M1.5 3.5C1.5 2.67 2.17 2 3 2h3.17a1 1 0 0 1 .7.3L8.3 3.7a1 1 0 0 0 .7.3H13c.83 0 1.5.67 1.5 1.5v6.5c0 .83-.67 1.5-1.5 1.5H3c-.83 0-1.5-.67-1.5-1.5V3.5Z" fill="currentColor" opacity="0.25"/>
      <path d="M1.5 5.5h13v6.5c0 .83-.67 1.5-1.5 1.5H3c-.83 0-1.5-.67-1.5-1.5V5.5Z" fill="currentColor" opacity="0.5"/>
      <path d="M1.5 3.5C1.5 2.67 2.17 2 3 2h3.17a1 1 0 0 1 .7.3L8.3 3.7a1 1 0 0 0 .7.3H13c.83 0 1.5.67 1.5 1.5V5.5h-13V3.5Z" fill="currentColor"/>
    </template>

    <template v-else-if="iconType === 'typescript'">
      <path d="M2 2h12v12H2V2Z" fill="currentColor" opacity="0.15"/>
      <path d="M2 2h12v12H2V2Zm1 1v10h10V3H3Z" fill="currentColor" opacity="0.3"/>
      <text x="8" y="11" text-anchor="middle" font-size="7" font-weight="700" font-family="sans-serif" fill="currentColor">TS</text>
    </template>

    <template v-else-if="iconType === 'javascript'">
      <path d="M2 2h12v12H2V2Z" fill="currentColor" opacity="0.15"/>
      <path d="M2 2h12v12H2V2Zm1 1v10h10V3H3Z" fill="currentColor" opacity="0.3"/>
      <text x="8" y="11" text-anchor="middle" font-size="6.5" font-weight="700" font-family="sans-serif" fill="currentColor">JS</text>
    </template>

    <template v-else-if="iconType === 'vue'">
      <path d="M8 2L2 14h3l3-6 3 6h3L8 2Z" fill="currentColor" opacity="0.3"/>
      <path d="M8 5L4.5 14h2L8 9.5 9.5 14h2L8 5Z" fill="currentColor"/>
    </template>

    <template v-else-if="iconType === 'markdown'">
      <path d="M2 3h12v10H2V3Z" fill="currentColor" opacity="0.15"/>
      <path d="M2 3h12v10H2V3Zm1 1v8h10V4H3Z" fill="currentColor" opacity="0.3"/>
      <text x="8" y="11" text-anchor="middle" font-size="8" font-weight="700" font-family="sans-serif" fill="currentColor">M↓</text>
    </template>

    <template v-else-if="iconType === 'json'">
      <path d="M4 2c-1.1 0-2 .9-2 2v1h1V4c0-.55.45-1 1-1h1V2H4Zm8 0h-1v1h1c.55 0 1 .45 1 1v1h1V4c0-1.1-.9-2-2-2ZM2 11v1c0 1.1.9 2 2 2h1v-1H4c-.55 0-1-.45-1-1v-1H2Zm12 0v1c0 .55-.45 1-1 1h-1v1h1c1.1 0 2-.9 2-2v-1h-1Z" fill="currentColor"/>
      <path d="M5 5h6v6H5V5Z" fill="currentColor" opacity="0.2"/>
      <path d="M6 7h4M6 9h3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
    </template>

    <template v-else-if="iconType === 'css'">
      <path d="M2 2h12v12H2V2Z" fill="currentColor" opacity="0.15"/>
      <path d="M2 2h12v12H2V2Zm1 1v10h10V3H3Z" fill="currentColor" opacity="0.3"/>
      <text x="8" y="11" text-anchor="middle" font-size="6" font-weight="700" font-family="sans-serif" fill="currentColor">CSS</text>
    </template>

    <template v-else-if="iconType === 'html'">
      <path d="M4 3l1 10h6l1-10H4Z" fill="currentColor" opacity="0.15"/>
      <path d="M3.5 2L5 14h6l1.5-12H3.5Zm1.17 1h6.66L10.17 13H5.83L4.67 3Z" fill="currentColor" opacity="0.3"/>
      <path d="M6 6l1 4 1-2.5L9 10l1-4" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    </template>

    <template v-else-if="iconType === 'yaml'">
      <path d="M2 2h12v12H2V2Z" fill="currentColor" opacity="0.15"/>
      <path d="M2 2h12v12H2V2Zm1 1v10h10V3H3Z" fill="currentColor" opacity="0.3"/>
      <text x="8" y="11" text-anchor="middle" font-size="6" font-weight="700" font-family="sans-serif" fill="currentColor">YL</text>
    </template>

    <template v-else-if="iconType === 'python'">
      <path d="M8 2c-2 0-3 .5-3 2v2h3v.5H4.5C3 6.5 2 7.5 2 9.5S3 13 4.5 13H6v-2.5c0-1 .8-1.5 1.5-1.5h3c1 0 1.5-.8 1.5-1.5V4c0-1-1-2-3-2H8ZM6 3.5a.5.5 0 1 1 0 1 .5.5 0 0 1 0-1Z" fill="currentColor" opacity="0.6"/>
      <path d="M8 14c2 0 3-.5 3-2v-2H8v-.5h3.5C13 9.5 14 8.5 14 6.5S13 3 11.5 3H10v2.5c0 1-.8 1.5-1.5 1.5h-3C4.5 7 4 7.8 4 8.5V12c0 1 1 2 3 2h1Zm2-1.5a.5.5 0 1 1 0-1 .5.5 0 0 1 0 1Z" fill="currentColor"/>
    </template>

    <template v-else-if="iconType === 'image'">
      <path d="M2 3h12v10H2V3Z" fill="currentColor" opacity="0.15"/>
      <path d="M2 3h12v10H2V3Zm1 1v8h10V4H3Z" fill="currentColor" opacity="0.3"/>
      <circle cx="5.5" cy="6.5" r="1.5" fill="currentColor" opacity="0.5"/>
      <path d="M3 11l3-3 2 2 2-3 3 4H3Z" fill="currentColor" opacity="0.5"/>
    </template>

    <template v-else-if="iconType === 'config'">
      <path d="M8 1.5l-.7 1.4-1.5-.2-.5 1.4-1.4.4.3 1.5L3 6.8l1 1.2-1 1.2 1.2.8-.3 1.5 1.4.4.5 1.4 1.5-.2.7 1.4 1.3-.8 1.3.8.7-1.4 1.5.2.5-1.4 1.4-.4-.3-1.5 1.2-.8-1-1.2 1-1.2-1.2-.8.3-1.5-1.4-.4-.5-1.4-1.5.2L8 1.5Z" fill="currentColor" opacity="0.2"/>
      <circle cx="8" cy="8" r="2.5" fill="currentColor" opacity="0.5"/>
      <circle cx="8" cy="8" r="1.2" fill="currentColor"/>
    </template>

    <template v-else-if="iconType === 'shell'">
      <path d="M2 3h12v10H2V3Z" fill="currentColor" opacity="0.15"/>
      <path d="M2 3h12v10H2V3Zm1 1v8h10V4H3Z" fill="currentColor" opacity="0.3"/>
      <path d="M5 7l2 1.5L5 10" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      <path d="M8 10.5h3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
    </template>

    <template v-else>
      <path d="M4 1h6l3 3v10c0 .55-.45 1-1 1H4c-.55 0-1-.45-1-1V2c0-.55.45-1 1-1Z" fill="currentColor" opacity="0.15"/>
      <path d="M4 1h6l3 3v10c0 .55-.45 1-1 1H4c-.55 0-1-.45-1-1V2c0-.55.45-1 1-1Zm6.5 1.5L12 4h-1.5V2.5Z" fill="currentColor" opacity="0.3"/>
      <path d="M10 1v3h3" stroke="currentColor" stroke-width="0.8" fill="none" opacity="0.5"/>
    </template>
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  filename: string
  type?: 'file' | 'folder'
  size?: number
}

const props = withDefaults(defineProps<Props>(), {
  type: 'file',
  size: 16,
})

const extMap: Record<string, string> = {
  '.ts': 'typescript',
  '.tsx': 'typescript',
  '.js': 'javascript',
  '.jsx': 'javascript',
  '.mjs': 'javascript',
  '.vue': 'vue',
  '.md': 'markdown',
  '.mdx': 'markdown',
  '.json': 'json',
  '.css': 'css',
  '.scss': 'css',
  '.less': 'css',
  '.html': 'html',
  '.yaml': 'yaml',
  '.yml': 'yaml',
  '.py': 'python',
  '.png': 'image',
  '.jpg': 'image',
  '.jpeg': 'image',
  '.gif': 'image',
  '.svg': 'image',
  '.webp': 'image',
  '.ico': 'image',
  '.toml': 'config',
  '.ini': 'config',
  '.env': 'config',
  '.conf': 'config',
  '.sh': 'shell',
  '.bash': 'shell',
  '.zsh': 'shell',
  '.bat': 'shell',
  '.ps1': 'shell',
}

const colorMap: Record<string, string> = {
  folder: '#42a5f5',
  typescript: '#3178c6',
  javascript: '#f7df1e',
  vue: '#42b883',
  markdown: '#519aba',
  json: '#cbcb41',
  css: '#563d7c',
  html: '#e34c26',
  yaml: '#cb171e',
  python: '#3572a5',
  image: '#a074c4',
  config: '#6d8086',
  shell: '#89e051',
  default: '#90a4ae',
}

const iconType = computed(() => {
  if (props.type === 'folder') return 'folder'
  const name = props.filename.toLowerCase()
  for (const [ext, type] of Object.entries(extMap)) {
    if (name.endsWith(ext)) return type
  }
  return 'default'
})

const iconColor = computed(() => {
  return colorMap[iconType.value] || colorMap.default
})
</script>

<style scoped>
.file-icon {
  flex-shrink: 0;
  vertical-align: middle;
}
</style>
