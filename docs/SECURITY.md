# 安全指南

## 🔒 Admin 安全设置

### 环境变量配置

1. 复制 `.env.example` 为 `.env`
2. 修改 `VITE_ADMIN_PASSWORD` 为强密码：

```env
VITE_ADMIN_PASSWORD=your_very_strong_password_here
```

### 当前安全措施

✅ **会话超时**：30分钟无操作自动登出  
✅ **会话存储**：使用 `sessionStorage` 而非 `localStorage`  
✅ **路由守卫**：未登录用户无法访问 admin 页面  
✅ **登出功能**：支持手动安全登出  

### 安全建议

⚠️ **重要**：当前实现仍有局限性，生产环境建议：

1. **后端验证**：将密码验证移到后端
2. **密码哈希**：使用 bcrypt 或 Argon2 哈希密码
3. **HTTPS**：部署时必须使用 HTTPS
4. **2FA**：考虑添加双因素认证
5. **Rate limiting**：防止暴力破解

### 本地开发

本地开发时，可以保留默认密码 `admin123`（仅用于开发）。

## 📝 变更记录

- 初始版本：修复硬编码密码问题，添加安全存储和会话管理
