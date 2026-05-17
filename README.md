# SkillHub

一个集中展示与管理个人/团队 AI Skills 的可视化平台。在这里，你可以快速浏览已导入的 Skill 文件，了解每个工具的核心功能、使用场景、标准操作流程。

## ✨ 功能特性

- 📦 **技能管理** - 浏览、搜索和筛选技能
- 📝 **技能导入** - 支持多种方式导入技能
- 🌓 **主题切换** - 深色/浅色主题
- 🔒 **管理后台** - 安全的技能编辑和管理
- 📱 **响应式设计** - 支持多种设备
- 📤 **导出功能** - 一键导出技能包

## 🛠️ 技术栈

### 前端
- Vue 3 + Vite
- TypeScript
- Pinia (状态管理)
- Vue Router
- Element Plus
- Tailwind CSS

### 后端
- Node.js + Express
- 基于文件的存储系统 (JSON)

## 🚀 快速开始

### 前置要求

- Node.js 18+
- npm 或 yarn/pnpm

### 安装和运行

1. **克隆项目**

```bash
git clone <repository-url>
cd skill-hub
```

2. **安装依赖**

```bash
npm install
```

3. **配置环境变量**

```bash
# 复制环境变量示例文件
cp .env.example .env

# 根据需要编辑 .env 文件
```

4. **启动开发服务**

```bash
# 同时启动后端 API 和前端开发服务器
npm run dev:all

# 或者分别启动
# 启动后端
npm run server
# 启动前端（另一个终端）
npm run dev
```

5. **访问应用**

- 前端: http://localhost:5173 (或终端显示的端口)
- 后端 API: http://localhost:3001

## 📁 项目结构

```
skill-hub/
├── src/
│   ├── components/       # 通用组件
│   │   ├── features/     # 功能组件
│   │   ├── layout/       # 布局组件
│   │   └── ui/           # UI 组件
│   ├── modules/          # 页面模块
│   │   ├── admin/        # 管理后台
│   │   ├── home/         # 首页
│   │   ├── skill-detail/ # 技能详情
│   │   └── skill-list/   # 技能列表
│   ├── stores/           # Pinia 状态管理
│   ├── types/            # TypeScript 类型定义
│   ├── utils/            # 工具函数
│   ├── App.vue           # 根组件
│   ├── main.ts           # 入口文件
│   └── router.ts         # 路由配置
├── data/
│   └── skills/           # 技能数据存储 (JSON)
├── docs/                 # 项目文档
├── .env.example          # 环境变量示例
├── server.js             # 后端服务
├── vite.config.ts        # Vite 配置
├── tailwind.config.js    # Tailwind 配置
└── package.json
```

## ⚙️ 环境变量配置

请参考 `.env.example` 文件创建 `.env` 文件，配置以下变量：

### 前端配置

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `VITE_API_URL` | 后端 API 地址 | `http://localhost:3001/api` |
| `VITE_ADMIN_PASSWORD` | 管理员密码 | `admin123` |

### 后端配置

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `HOST` | 后端服务主机 | `localhost` |
| `PORT` | 后端服务端口 | `3001` |
| `DATA_DIR` | 技能数据保存目录（绝对路径或相对项目根目录） | `data/skills` |

## 📋 可用脚本

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动前端开发服务器 |
| `npm run dev:all` | 同时启动后端和前端 |
| `npm run server` | 仅启动后端 API 服务 |
| `npm run build` | 构建生产版本 |
| `npm run preview` | 预览生产构建 |
| `npm run test` | 运行测试 |

## 🔒 安全说明

- 管理后台受密码保护，默认密码为 `admin123`
- 生产环境请务必修改强密码
- 会话超时设置为 30 分钟
- 更多安全建议请参考 [docs/SECURITY.md](docs/SECURITY.md)

## 📖 相关文档

- [安全指南](docs/SECURITY.md)

## 🤝 贡献指南

1. Fork 本仓库
2. 新建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 LICENSE 文件了解详情

## 👥 作者

- SkillHub Team
