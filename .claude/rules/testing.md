# 测试策略与规范

## 测试框架

- **运行器**: Vitest 1.2+
- **环境**: happy-dom
- **工具库**: @vue/test-utils 2.4+

## 测试命令

```bash
npm run test           # 运行所有测试
npm run test:coverage  # 运行测试并生成覆盖率报告
npx vitest             # watch 模式运行测试
```

## 测试原则

### 测试范围
- 核心业务逻辑（stores、utils、composables）必须有测试
- UI 组件测试聚焦关键交互行为
- API 调用使用 mock，不依赖真实后端

### 测试文件
- 放置在 `__tests__/` 目录或与源文件同目录的 `*.test.ts`
- 命名：`<source-file>.test.ts`

### Store 测试
- 测试 state 初始值
- 测试 getter 计算逻辑
- 测试 action 的状态变更
- Mock API 调用

### 组件测试
- 使用 `@vue/test-utils` 的 `mount`
- 测试 props 渲染
- 测试用户交互（点击、输入）
- 测试事件发射
- 不测试样式细节

### 工具函数测试
- 测试正常输入输出
- 测试边界情况
- 测试错误处理

## 配置

参考 `vitest.config.ts`：使用 happy-dom 环境，`@/` 路径别名，globals 模式开启。
