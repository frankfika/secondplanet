# Global Village

> 去中心化社区平台 - 创建、加入和管理你的数字村落

Global Village（地球村）是一个去中心化社区平台，用户可以创建、加入和管理独立的数字社区（Village）。每个村落拥有独立的经济体系、治理规则和身份系统。

## 核心特性

- **多重身份** - 用户在不同村落使用不同昵称、角色和隐私设置
- **社区货币** - 每个村落自定义货币，用于激励和交易
- **护照制度** - 全局身份（Passport）+ 村落签证（Visa）
- **社区自治** - 村落自定义规则、公告、隐私级别
- **活动系统** - 创建和管理村落活动，支持 RSVP 报名

## 技术栈

### 前端
- **React 19** + TypeScript
- **Vite** - 构建工具
- **TailwindCSS** - 样式
- **Zustand** - 状态管理
- **React Router v7** - 路由
- **Lucide React** - 图标

### 后端
- **NestJS** - Node.js 框架
- **Prisma** - ORM
- **PostgreSQL** (Neon) - 数据库
- **JWT** - 认证
- **Passport.js** - 身份验证

### 基础设施
- **pnpm** - 包管理器
- **Turborepo** - Monorepo 构建系统
- **Vercel** - 部署平台

## 项目结构

```
secondplanet/
├── apps/
│   └── server/          # NestJS 后端
│       ├── src/
│       │   ├── modules/
│       │   │   ├── auth/       # 认证模块
│       │   │   ├── village/    # 村落模块
│       │   │   ├── membership/ # 成员模块
│       │   │   ├── post/       # 帖子模块
│       │   │   └── event/      # 活动模块
│       │   └── common/         # 公共模块
│       └── prisma/             # 数据库模型
├── packages/
│   ├── web/             # React 前端
│   │   └── src/
│   │       ├── components/
│   │       ├── services/
│   │       └── hooks/
│   └── core/            # 共享类型和工具
└── api/                 # Vercel Serverless 入口
```

## 快速开始

### 环境要求

- Node.js >= 18
- pnpm >= 9.0

### 安装依赖

```bash
pnpm install
```

### 配置环境变量

复制 `apps/server/.env.example` 到 `apps/server/.env` 并填写：

```env
# 数据库 (PostgreSQL)
DATABASE_URL="postgresql://..."

# JWT
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"
JWT_REFRESH_SECRET="your-refresh-secret"
JWT_REFRESH_EXPIRES_IN="30d"

# 服务器
PORT=3001
NODE_ENV=development
```

### 初始化数据库

```bash
cd apps/server
npx prisma db push
npx prisma db seed
```

### 启动开发服务器

```bash
# 启动所有服务
pnpm dev

# 或分别启动
pnpm dev:web     # 前端 http://localhost:5173
pnpm dev:server  # 后端 http://localhost:3001
```

## 部署

项目已配置 Vercel 部署：

1. 在 Vercel 导入 GitHub 仓库
2. 配置环境变量（DATABASE_URL, JWT_SECRET 等）
3. 部署

详见 [vercel.json](./vercel.json) 配置。

## API 文档

主要接口：

| 模块 | 端点 | 说明 |
|------|------|------|
| Auth | `POST /api/auth/register` | 用户注册 |
| Auth | `POST /api/auth/login` | 用户登录 |
| Village | `GET /api/villages` | 获取村落列表 |
| Village | `POST /api/villages` | 创建村落 |
| Village | `POST /api/villages/:id/join` | 加入村落 |
| Village | `POST /api/villages/:id/leave` | 离开村落 |
| Event | `GET /api/events/village/:id` | 获取村落活动 |
| Event | `POST /api/events` | 创建活动 |
| Event | `POST /api/events/:id/rsvp` | RSVP 报名 |

## 开发

### 数据库迁移

```bash
cd apps/server
npx prisma migrate dev --name <migration-name>
```

### 生成 Prisma Client

```bash
npx prisma generate
```

### 查看数据库

```bash
npx prisma studio
```

## License

MIT
