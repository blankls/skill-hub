# API 设计与使用约定

## 后端架构

- 单文件 Express 5 服务：`server.js`
- 默认端口：`3001`
- 数据存储：`data/skills/` 目录下的 JSON 文件
- 环境变量：通过 `.env` 文件配置（`VITE_API_URL`、`ADMIN_PASSWORD` 等）

## 前端 API 调用

- 统一通过 `src/utils/db.ts` 中的 `db` 对象发起请求
- 底层使用原生 `fetch` API
- API 基础路径：`import.meta.env.VITE_API_URL || 'http://localhost:3001/api'`

## API 端点

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/skills` | 获取所有技能列表 |
| GET | `/api/skills/:id` | 获取单个技能详情 |
| POST | `/api/skills` | 创建新技能 |
| PUT | `/api/skills/:id` | 更新技能 |
| DELETE | `/api/skills/:id` | 删除技能 |
| POST | `/api/auth/login` | 管理员登录 |
| POST | `/api/auth/logout` | 管理员登出 |
| GET | `/api/auth/status` | 检查认证状态 |
| POST | `/api/skills/:id/like` | 点赞技能 |

## 约定

### 新增 API 端点
1. 在 `server.js` 中定义路由和处理函数
2. 在 `src/utils/db.ts` 中添加对应的前端调用方法
3. 保持 JSON 请求/响应格式

### 数据格式
- Skill 对象结构见 `src/types/index.ts` 中的 `Skill` 接口
- 新增字段需同时更新 TypeScript 类型和后端处理逻辑

### 错误处理
- 后端返回标准 HTTP 状态码 + JSON 错误消息
- 前端调用处处理 try/catch，失败时通过 Element Plus 的 `ElMessage` 提示用户

### 认证
- 基于 session 的 token 认证，30 分钟超时
- 管理 API 需通过 `authStore` 检查登录状态
- 登录接口有 IP 级别速率限制

### 文件操作
- 导出/导入功能使用 JSZip 处理 ZIP 文件
- GitHub 同步使用 `githubClient.ts` 中的工具函数
- 文件 SHA 映射用于增量更新
