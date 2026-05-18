# 域名配置指南

## 🎯 配置方案

### 方案1：使用自定义域名根路径（推荐）
**访问地址：** `https://blankls.xyz/`

**配置：**
- ✅ `vite.config.ts` 中 `base: '/'`
- ✅ `public/CNAME` 文件内容：`blankls.xyz`

---

### 方案2：使用项目名路径
**访问地址：** `https://blankls.xyz/skill-hub/`

**配置：**
- 修改 `vite.config.ts` 中 `base: '/skill-hub/'`
- 保留 `public/CNAME` 文件内容：`blankls.xyz`

---

## 📋 DNS 配置

在你的域名服务商（如 GoDaddy、Cloudflare 等）处添加：

### 使用 GitHub Pages 官方域名
```
CNAME  @  your-username.github.io
```

### 使用项目域名
```
CNAME  @  your-username.github.io
```

---

## 🔧 GitHub Pages 配置

1. 进入仓库的 **Settings** → **Pages**
2. 在 **Custom domain** 中输入：`blankls.xyz`
3. 点击 **Save**
4. 等待 DNS 验证（可能需要几分钟到几小时）
5. 勾选 **Enforce HTTPS**（可选，推荐）

---

## 🚀 部署步骤

1. **确认 vite.config.ts 配置**
   ```typescript
   // 方案1：根路径
   base: '/'
   
   // 方案2：项目名路径
   // base: '/skill-hub/'
   ```

2. **推送到 GitHub**
   ```bash
   git add .
   git commit -m "Configure custom domain"
   git push origin master
   ```

3. **等待部署完成**

4. **验证访问**
   - 方案1：`https://blankls.xyz/`
   - 方案2：`https://blankls.xyz/skill-hub/`

---

## 📝 注意事项

- 首次配置 DNS 可能需要 10-30 分钟生效
- HTTPS 证书签发可能需要几小时
- `public/CNAME` 文件会被自动部署到 GitHub Pages
- 确保仓库名与路径配置一致（如使用方案2）