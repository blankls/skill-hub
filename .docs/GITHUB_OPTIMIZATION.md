# GitHub 技能导入 - 实时性与性能优化方案

## 📊 现有架构分析

### ✅ 已有优点
- **缓存机制**: 使用 IndexedDB 本地持久化
- **增量更新**: 对比 GitHub `pushed_at` 时间戳
- **状态管理**: 同步状态跟踪和防重复
- **错误降级**: 网络失败时使用本地缓存

### ⚠️ 可优化点
- 缺少单个文件级别的 SHA 比对（只能全量更新）
- 缺少后台自动同步
- 首次进入性能可进一步优化
- 缺少请求节流和重试机制
- 缺少进度反馈

---

## 🎯 优化方案设计

### 1. **文件级增量更新** (核心优化)

#### 问题
当前方案：每次更新都重新拉取所有文件
优化方案：对比文件 SHA 只拉取变更文件

```typescript
// 在 githubClient.ts 中新增
export interface GitHubFileWithSha extends GitHubFile {
  sha: string
}

// 获取文件树时只获取 SHA，不全量下载
export async function fetchRepoFileTree(
  repoUrl: string, 
  branch: string,
  subfolderPath?: string
): Promise<GitHubFileWithSha[]> {
  // 使用 GitHub Trees API 一次性获取完整树
  // 比 Contents API 快 10x+，而且包含所有文件 SHA
}
```

### 2. **多级缓存策略**

```typescript
interface CacheEntry {
  data: Skill
  etag?: string          // HTTP ETag
  lastFetch: Date
  staleWhileRevalidate: boolean
}

// 缓存策略
// 1. 首次：获取完整内容 → 显示 → 后台检查更新
// 2. 再次进入：显示缓存 → 后台静默检查并增量更新
// 3. 长时间离线：使用缓存，提示用户
```

### 3. **请求优化**

#### A. 请求节流与合并
```typescript
// githubClient.ts 中增加
const requestQueue = new Map<string, Promise<any>>()
const lastRequestTimes = new Map<string, number>()
const RATE_LIMIT_DELAY = 1000 // 1秒

export async function throttledFetch(url: string, options?: RequestInit) {
  const now = Date.now()
  const lastTime = lastRequestTimes.get(url) || 0
  
  if (now - lastTime < RATE_LIMIT_DELAY) {
    await new Promise(r => setTimeout(r, RATE_LIMIT_DELAY - (now - lastTime)))
  }
  
  // 如果已有相同请求在进行中，复用 Promise
  const existing = requestQueue.get(url)
  if (existing) return existing
  
  const promise = fetch(url, options).finally(() => {
    requestQueue.delete(url)
    lastRequestTimes.set(url, Date.now())
  })
  requestQueue.set(url, promise)
  return promise
}
```

#### B. 并发控制
```typescript
async function fetchFilesWithConcurrency(
  files: GitHubFile[],
  concurrency: number = 3
) {
  const results: SkillFile[] = []
  let index = 0
  
  async function worker() {
    while (index < files.length) {
      const file = files[index++]
      try {
        const content = await fetchGitHubFileContent(...)
        results.push({ ...file, content })
      } catch (e) {
        // 处理失败但不中断整体
      }
    }
  }
  
  const workers = Array(concurrency).fill(0).map(worker)
  await Promise.all(workers)
  return results
}
```

### 4. **后台自动同步**

```typescript
// 在 skillStore.ts 中新增
const backgroundSyncEnabled = ref(true)
const lastBackgroundCheck = ref<Date | null>(null)

async function startBackgroundSync() {
  if (!backgroundSyncEnabled.value) return
  
  // 检查所有 GitHub 技能
  const githubSkills = skills.value.filter(s => s.source.type === 'github')
  for (const skill of githubSkills) {
    try {
      await syncGitHubSkill(skill.id, false) // 静默更新
    } catch (e) {
      // 静默失败不影响用户
    }
  }
  
  lastBackgroundCheck.value = new Date()
}

// 间隔执行（30分钟一次）
let syncInterval: any = null
function enableBackgroundSync() {
  if (syncInterval) return
  syncInterval = setInterval(startBackgroundSync, 30 * 60 * 1000)
  // 启动时立即检查一次
  setTimeout(startBackgroundSync, 5000)
}
```

### 5. **ETag 缓存与条件请求**

```typescript
// 在类型中增加
interface SkillSource {
  // ... 现有字段
  etags?: { [filePath: string]: string }
  repoEtag?: string
}

// 更新 githubClient.ts
export async function fetchGitHubRepoWithCache(
  repoUrl: string,
  existingEtag?: string
): Promise<{ data: GitHubRepoMeta; notModified: boolean; etag?: string }> {
  const headers: Record<string, string> = {}
  if (existingEtag) {
    headers['If-None-Match'] = existingEtag
  }
  
  const response = await fetch(..., { headers })
  if (response.status === 304) {
    return { data: null, notModified: true, etag: existingEtag }
  }
  
  const etag = response.headers.get('ETag')
  const data = await response.json()
  return { data, notModified: false, etag }
}
```

### 6. **渐进式加载**

```typescript
// 进入技能详情页时的加载顺序
async function progressiveLoad(skillId: string) {
  const skill = await db.get(skillId)
  
  // 阶段 1: 立即显示缓存内容（0ms）
  selectSkill(skill)
  
  if (skill.source.type !== 'github') return
  
  // 阶段 2: 后台检查更新（不阻塞用户）
  queueMicrotask(async () => {
    try {
      const updated = await syncGitHubSkill(skillId, false)
      if (updated && updated.id === selectedSkill.value?.id) {
        selectSkill(updated)
      }
    } catch (e) {
      // 静默失败
    }
  })
}
```

### 7. **进度反馈**

```typescript
// 在 syncGitHubSkill 中增加进度回调
async function syncGitHubSkill(
  skillId: string,
  force: boolean = false,
  progressCallback?: (stage: string, current: number, total: number) => void
) {
  progressCallback?.('检查更新', 0, 0)
  // ...
  
  progressCallback?.('获取文件列表', 0, totalFiles)
  
  for (let i = 0; i < files.length; i++) {
    progressCallback?.('下载文件', i + 1, files.length)
    // ...
  }
}
```

---

## 📁 实施计划

### Phase 1: 文件级增量更新 (高优先级)
- 集成 GitHub Trees API
- 添加 SHA 对比逻辑
- 增量同步文件

### Phase 2: 请求优化 (高优先级)
- 请求节流与合并
- 并发控制
- 错误重试策略

### Phase 3: 后台同步 (中优先级)
- 定时同步
- 网络状态感知
- 电池状态感知（移动端优化）

### Phase 4: 缓存策略 (中优先级)
- ETag 支持
- Stale-While-Revalidate
- 预加载策略

---

## 🔧 性能指标目标

| 指标 | 当前 | 目标 |
|------|------|------|
| 首次进入响应 | ~500ms | <100ms (显示缓存) |
| 同步未更改仓库 | ~1-2s | <200ms |
| 同步已更改仓库 | ~5-10s | <3s (增量) |
| 最大并发请求 | 无限制 | 3-5 |
| API 调用次数 | 每次都拉取 | 根据 SHA 智能判断 |

---

## 🛡️ 错误处理与降级策略

```typescript
// 失败重试指数退避
async function fetchWithRetry(
  fn: () => Promise<any>,
  maxRetries = 3,
  baseDelay = 1000
) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (e) {
      if (i === maxRetries - 1) throw e
      const delay = baseDelay * Math.pow(2, i)
      await new Promise(r => setTimeout(r, delay))
    }
  }
}

// 网络感知
function isOnline() {
  return navigator.onLine
}

window.addEventListener('online', () => {
  // 网络恢复时触发后台同步
  startBackgroundSync()
})
```

---

## 📝 配置项建议

在 `.env` 中添加：

```env
# GitHub 同步配置
VITE_GITHUB_SYNC_INTERVAL=1800000     # 30分钟
VITE_GITHUB_CONCURRENT_REQUESTS=3      # 并发数
VITE_GITHUB_MAX_RETRIES=3              # 重试次数
VITE_GITHUB_RATE_LIMIT_DELAY=1000      # 请求间隔 (ms)
VITE_BACKGROUND_SYNC_ENABLED=true      # 启用后台同步
```

---

## ✅ 总结

通过以上优化，我们可以实现：
- **更快的响应**: 立即显示缓存，后台更新
- **更少的流量**: 文件级 SHA 对比，增量同步
- **更省资源**: 请求节流，并发控制，智能重试
- **更稳体验**: 完善的降级策略和错误处理
