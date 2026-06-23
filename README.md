# tongue-web

Vue3 三端前端工作区：

- `apps/user-web`：用户端，舌象分析、报告、趋势、审核申请、通知、个人资料。
- `apps/doctor-web`：医生端，审核队列、接单、提交审核意见、医生资料。
- `apps/admin-web`：管理端，用户、医生审核、报告、任务、系统配置和指标。
- `packages/shared`：API client、认证 store、通用组件、样式 token。

## 安装依赖

PowerShell 中请使用 `npm.cmd`：

```powershell
cd D:\tongue\tongue-web
npm.cmd install
```

## 启动

```powershell
npm.cmd run dev:user
npm.cmd run dev:doctor
npm.cmd run dev:admin
```

默认后端地址为 `http://127.0.0.1:8080`，可在页面登录区修改并保存。

## 构建

```powershell
npm.cmd run build
```

旧的零依赖联调页保留在 `legacy-mvp`。
