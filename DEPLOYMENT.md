# 部署到 https://blankls.xyz/skill-hub/

## 📋 当前配置状态

✅ **已配置：**
- `vite.config.ts` - `base: '/skill-hub/'`
- `public/CNAME` - `blankls.xyz`
- `src/router.ts` - Hash 路由模式

---

## 🚀 完整部署步骤

### 步骤 1：配置 DNS

在你的域名服务商（如 GoDaddy、Cloudflare、阿里云等）添加 CNAME 记录：

```
类型：CNAME
主机名（Host）：@
值（Points to）：你的GitHub用户名.github.io
TTL：自动/300
```

**或者如果使用子域名：**
```
类型：CNAME
主机名（Host）：www
值（Points to）：你的GitHub用户名.github.io
TTL：自动/300
```

---

### 步骤 2：推送到 GitHub

```bash
# 添加所有更改
git add .

# 提交
git commit -m "Configure deployment for blankls.xyz/skill-hub"

# 推送到 master 分支
git push origin master
```

---

### 步骤 3：在 GitHub Pages 配置自定义域名

1. 进入你的 GitHub 仓库
2. 点击 **Settings**（设置）
3. 点击左侧菜单的 **Pages**
4. 在 **Custom domain** 输入框中输入：`blankls.xyz`
5. 点击 **Save**（保存）
6. 等待 DNS 验证（可能需要几分钟到几小时）
7. **重要**：验证成功后，勾选 **Enforce HTTPS**（强制 HTTPS）

---

### 步骤 4：等待部署完成

GitHub Actions 会自动运行：
- 查看 **Actions** 标签页监控部署进度
- 等待绿色对勾 ✅ 出现

---

### 步骤 5：访问网站

部署成功后，访问：

```
https://blankls.xyz/skill-hub/
```

**实际访问地址会是：**
```
https://blankls.xyz/skill-hub/#/
https://blankls.xyz/skill-hub/#/skills
https://blankls.xyz/skill-hub/#/admin
```

---

## 🔍 验证配置

### 检查 GitHub Pages 状态

在仓库 **Settings** → **Pages** 页面，你应该看到：
- ✅ Your site is live at https://你的用户名.github.io/skill-hub/
- ✅ Custom domain: blankls.xyz
- ✅ Enforce HTTPS 已勾选

### 检查 DNS 解析

在终端或命令行运行：

```bash
# Windows
nslookup blankls.xyz

# macOS/Linux
dig blankls.xyz
```

应该能看到指向 GitHub Pages 的 CNAME 记录。

---

## 📝 本地开发测试

部署前可以本地测试：

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

---

## ⚠️ 常见问题

### 1. DNS 未生效
- 等待更长时间（最多 24 小时）
- 清除浏览器缓存
- 尝试使用隐私/无痕模式访问

### 2. HTTPS 证书错误
- 等待 GitHub 签发证书（最多 24 小时）
- 确保 **Enforce HTTPS** 已勾选

### 3. 404 错误
- 确保访问地址带 `/skill-hub/` 路径
- 确保使用的是 Hash 模式（URL 中有 `#`）

---

## 📞 需要帮助？

如果遇到问题，请检查：
1. GitHub Actions 日志（Actions 标签页）
2. 浏览器开发者工具（F12）的 Console 和 Network
3. 确保所有配置文件已正确推送到 GitHub

---

## 🎯 最终目标

配置成功后，你的访问地址是：
- **主页：** `https://blankls.xyz/skill-hub/#/`
- **技能列表：** `https://blankls.xyz/skill-hub/#/skills`
- **管理后台：** `https://blankls.xyz/skill-hub/#/admin`