# tongue-web

Vue 3 前端工作区，包含用户端、医生端、管理端和共享包。前端只负责展示、交互、会话状态和调用 Java 后端；舌象识别、报告生成、趋势推导和健康计划评估都由后端或 Agent 完成。

## 技术栈

- Vue 3
- Vue Router 4
- Pinia
- TypeScript
- Vite
- Element Plus
- ECharts
- lucide-vue-next
- npm workspaces

默认后端地址：

```text
http://127.0.0.1:8080
```

## 工作区结构

```text
tongue-web
├─ apps
│  ├─ user-web       用户端：分析、报告、趋势、健康计划、通知、个人资料
│  ├─ doctor-web     医生端：审核队列、审核详情、医生资料
│  └─ admin-web      管理端：用户、医生、报告、任务、审核、配置、指标
├─ packages
│  └─ shared         API client、类型、store、通用组件和布局
├─ docs
│  └─ DESIGN_SYSTEM.md
├─ legacy-mvp        旧版联调页面，保留作参考
├─ package.json
└─ tsconfig.base.json
```

## 安装依赖

PowerShell 下使用 `npm.cmd`：

```powershell
cd D:\tongue\tongue-web
npm.cmd install
```

依赖统一装在工作区根目录，子应用通过 workspace 引用 `@tongue/shared`。

## 本地启动

先启动 Java 后端：

```text
http://127.0.0.1:8080
```

再启动需要的前端：

```powershell
cd D:\tongue\tongue-web

# 用户端
npm.cmd run dev:user

# 医生端
npm.cmd run dev:doctor

# 管理端
npm.cmd run dev:admin
```

默认端口：

| 应用 | 地址 |
| --- | --- |
| 用户端 | `http://127.0.0.1:5173` |
| 医生端 | `http://127.0.0.1:5174` |
| 管理端 | `http://127.0.0.1:5175` |

## 构建和检查

```powershell
# 构建全部应用
npm.cmd run build

# 只构建用户端
npm.cmd run build:user

# 只构建医生端
npm.cmd run build:doctor

# 只构建管理端
npm.cmd run build:admin

# 全工作区类型检查
npm.cmd run typecheck
```

每个子应用的 `build` 都会先执行 `vue-tsc --noEmit`，再执行 `vite build`。

## 用户端功能

入口：

```text
apps/user-web
```

主要路由：

| 路由 | 功能 |
| --- | --- |
| `/analysis` | 舌象图片上传、近 3 天状态补充、分析进度、Agent 对话 |
| `/health-plan` | 当前健康计划、今日打卡、7 天日历、复查入口 |
| `/health-plan/draft/:planId` | 健康计划草稿编辑、AI 评估、具体计划生成 |
| `/reports` | 历史报告列表 |
| `/reports/:reportId` | 报告详情、证据、建议、生成计划入口 |
| `/trends` | 趋势分析、报告对比、执行反馈 |
| `/reviews` | 医生审核订单 |
| `/doctors` | 医生列表 |
| `/notifications` | 通知中心 |
| `/profile` | 个人资料 |
| `/privacy` | 隐私管理 |

用户端核心页面：

```text
apps/user-web/src/views/AnalysisChatView.vue
apps/user-web/src/views/HealthPlanView.vue
apps/user-web/src/views/HealthPlanDraftView.vue
apps/user-web/src/views/ReportDetailView.vue
apps/user-web/src/views/ReportsView.vue
apps/user-web/src/views/TrendsView.vue
```

## 医生端功能

入口：

```text
apps/doctor-web
```

主要路由：

| 路由 | 功能 |
| --- | --- |
| `/workbench` | 医生工作台 |
| `/reviews` | 审核队列 |
| `/reviews/:reviewId` | 审核详情和意见提交 |
| `/profile` | 医生资料维护 |

医生端只允许 `DOCTOR` 或 `ADMIN` 角色进入受保护页面。

## 管理端功能

入口：

```text
apps/admin-web
```

主要路由：

| 路由 | 功能 |
| --- | --- |
| `/dashboard` | 系统总览 |
| `/users` | 用户管理 |
| `/doctors` | 医生审核 |
| `/reports` | 报告管理 |
| `/tasks` | 分析任务管理 |
| `/reviews` | 审核订单 |
| `/system-config` | 系统配置 |
| `/audit-logs` | 审计日志 |
| `/metrics` | 指标 |

管理端要求当前用户角色为 `ADMIN`。

## 共享包

入口：

```text
packages/shared
```

常用内容：

```text
packages/shared/src/api/client.ts       统一 API 请求、token、后端地址
packages/shared/src/api/*.ts            业务 API 封装
packages/shared/src/stores/*.ts         Pinia store
packages/shared/src/components/*.vue    通用组件
packages/shared/src/types.ts            共享类型
```

`apiRequest()` 会：

1. 从 `localStorage` 读取后端地址。
2. 自动携带 `Authorization: Bearer <token>`。
3. 兼容后端 snake_case 和前端 camelCase。
4. 把后端 `ApiResponse<T>` 解包成业务数据。

本地后端地址保存在：

```text
tongue_api_base
```

如果误填成前端 Vite 端口，client 会尽量归一化回：

```text
http://127.0.0.1:8080
```

## 登录和联调

本地默认验证码：

```text
123456
```

用户端、医生端、管理端都会把 token 存在浏览器：

```text
tongue_access_token
tongue_current_user
```

切换角色测试时，建议清理 localStorage 或重新登录。

## 与后端的关系

前端只请求 Java 后端，不直接请求 Python Agent。

```text
Vue 前端
  -> Java tongue-server:8080
  -> Python tongue-agent:8000
  -> 模型网关 / 舌象模型 / RAG
```

舌象分析页使用两阶段流程：

1. 上传图片并创建 `WAITING_STATE` 任务。
2. 收集近 3 天状态快照。
3. 提交快照后开始轮询任务进度。
4. 报告完成后展示结构化内容和生成健康计划入口。

## 结构化回答展示

Agent 聊天回答遵循：

```text
content              可独立展示的中文自然语言
structuredContent    结构化增强展示
```

前端公共处理工具位于：

```text
apps/user-web/src/utils/assistant-response.ts
```

它负责：

- 拦截内部 JSON 泄漏。
- 净化 `structuredContent`。
- 在 `content` 异常但结构化内容可用时降级成可见文本。
- 统一新旧分析页的展示逻辑。

## UI 约定

- 优先复用 `packages/shared` 里的组件和类型。
- 图标使用 `lucide-vue-next` 已存在的导出名。
- 三端布局使用共享 `AppShell`。
- 新页面要补路由 meta，便于导航和标题显示。
- 用户端报告、计划和趋势页面尽量消费后端稳定 DTO，不直接解析模型原始输出。

## 常见问题

### 页面打开一片空白

先跑构建：

```powershell
npm.cmd run build:user
```

常见原因：

- TypeScript 编译失败。
- 图标名不存在，比如引用了当前 `lucide-vue-next` 未导出的图标。
- 后端地址误填成 `http://127.0.0.1:5173`。

### 请求一直 404 或 500

检查：

1. Java 后端是否启动在 `8080`。
2. 登录页保存的后端地址是否为 `http://127.0.0.1:8080`。
3. 浏览器 localStorage 是否残留旧 token 或旧后端地址。
4. 后端接口是否需要先登录。

### 修改 shared 后页面没有变化

重新启动对应 Vite 服务。workspace 本地包有时会被 Vite 缓存。

### 构建提示 chunk 太大

这是 Vite 警告，不会导致构建失败。需要优化首屏加载时再做动态 import。

## 开发约定

- 新 API 先放到 `packages/shared/src/api`，页面不要手写重复 fetch。
- 新共享类型放到 `packages/shared/src/types.ts` 或对应业务类型文件。
- 真实入口是用户端 `/analysis`，旧页面只保留兼容时才改。
- 不在前端编造质量分、趋势状态或健康结论。
- 打印导出第一版使用浏览器 `window.print()`，不在前端生成二进制 PDF。
