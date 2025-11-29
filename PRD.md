# secondplanet 产品需求文档 (PRD)

> 版本：1.1
> 更新：2024-11

## 目录
1. [产品概述](#1-产品概述)
2. [数据模型](#2-数据模型)
3. [API 接口设计](#3-api-接口设计)
4. [业务规则](#4-业务规则)
5. [页面与路由](#5-页面与路由)
6. [状态与通知](#6-状态与通知)
7. [多端架构设计](#7-多端架构设计)
8. [后端技术方案](#8-后端技术方案)
9. [MVP 优先级](#9-mvp-优先级)
10. [附录](#10-附录)

---

## 1. 产品概述

### 1.1 产品愿景
secondplanet（第二星球）是一个去中心化社区平台，用户可以创建、加入和管理独立的数字社区（Village）。每个村落拥有独立的经济体系、治理规则和身份系统。

### 1.2 核心差异点
| 特性 | 说明 |
|------|------|
| 多重身份 | 用户在不同村落使用不同昵称/角色/隐私设置 |
| 社区货币 | 每个村落自定义货币，用于激励和交易 |
| 护照制度 | 全局身份（Passport）+ 村落签证（Visa） |
| 社区自治 | 村落自定义规则、公告、隐私级别 |

### 1.3 目标用户
- 兴趣社群组织者（设计、编程、园艺等）
- 需要私密空间的小团体
- 追求社区归属感的用户

---

## 2. 数据模型

### 2.1 User（用户）
```typescript
interface User {
  id: string;                    // UUID

  // 登录凭证（至少有一个）
  email?: string;                // 邮箱（唯一）
  phone?: string;                // 手机号（唯一）
  passwordHash?: string;         // 加密密码（邮箱登录时必填）

  // 第三方登录
  wechatOpenId?: string;         // 微信 OpenID
  wechatUnionId?: string;        // 微信 UnionID（跨应用）
  appleId?: string;              // Apple ID

  // 全局资料
  globalProfile: {
    name: string;                // 全局显示名
    avatar: string;              // 头像 URL
    globalId: string;            // 公开 ID（如 8842-1920）
  };

  // 可选联系信息（用于名片隐私控制）
  location?: string;             // 位置
  socials?: {
    linkedin?: string;
    twitter?: string;
    website?: string;
  };

  createdAt: timestamp;
  updatedAt: timestamp;
}
```

### 2.2 Village（村落）
```typescript
interface Village {
  id: string;                    // UUID
  name: string;                  // 村落名称
  slug: string;                  // URL 友好标识（唯一）
  category: 'Interest' | 'Professional' | 'Region' | 'Lifestyle';
  description: string;
  announcement?: string;         // 置顶公告
  coverImage: string;
  icon: string;

  // 经济系统
  currency: {
    name: string;                // 如 "Pixels"
    symbol: string;              // 如 "PX" 或 emoji
  };

  // 隐私设置
  visibility: 'public' | 'private';  // public=可搜索, private=仅邀请码
  inviteCode?: string;           // 私密村落的邀请码

  // 统计（可用缓存/定时任务更新）
  memberCount: number;

  // 规则
  constitution: string[];        // 社区规则列表

  ownerId: string;               // 创建者 User ID
  createdAt: timestamp;
  updatedAt: timestamp;
}
```

### 2.3 Membership（成员关系）
```typescript
interface Membership {
  id: string;
  userId: string;
  villageId: string;

  // 本地身份（Visa）
  localProfile: {
    nickname: string;            // 村落内昵称
    bio: string;                 // 村落内简介
    avatar?: string;             // 可选覆盖全局头像
  };

  role: 'chief' | 'core_member' | 'villager';

  // 隐私设置（控制名片展示）
  privacy: {
    showEmail: boolean;
    showPhone: boolean;
    showLocation: boolean;
    showSocials: boolean;
  };

  // 经济
  balance: number;               // 村落货币余额

  status?: string;               // 状态签名，如 "Building something cool"
  joinedAt: timestamp;
  updatedAt: timestamp;
}

// 复合唯一索引: (userId, villageId)
```

### 2.4 Post（帖子）
```typescript
interface Post {
  id: string;
  villageId: string;
  authorId: string;              // User ID

  content: string;
  images?: string[];             // 图片 URL 数组
  tags?: string[];

  likeCount: number;
  commentCount: number;

  createdAt: timestamp;
  updatedAt: timestamp;
}
```

### 2.5 Comment（评论）
```typescript
interface Comment {
  id: string;
  postId: string;
  authorId: string;
  parentId?: string;             // 支持嵌套回复
  content: string;
  createdAt: timestamp;
}
```

### 2.6 Like（点赞）
```typescript
interface Like {
  id: string;
  postId: string;
  userId: string;
  createdAt: timestamp;
}
// 复合唯一索引: (postId, userId)
```

### 2.7 Event（活动）
```typescript
interface Event {
  id: string;
  villageId: string;
  organizerId: string;           // User ID

  title: string;
  description?: string;
  coverImage?: string;

  type: 'online' | 'offline';
  location: string;              // 线上=频道名，线下=地址

  startTime: timestamp;
  endTime?: timestamp;

  attendeeCount: number;

  createdAt: timestamp;
  updatedAt: timestamp;
}
```

### 2.8 EventRSVP（活动报名）
```typescript
interface EventRSVP {
  id: string;
  eventId: string;
  userId: string;
  status: 'going' | 'maybe' | 'not_going';
  createdAt: timestamp;
}
// 复合唯一索引: (eventId, userId)
```

### 2.9 ContactRequest（联系信息请求）
```typescript
interface ContactRequest {
  id: string;
  requesterId: string;           // 请求者 User ID
  targetId: string;              // 被请求者 User ID
  villageId: string;             // 在哪个村落发起
  status: 'pending' | 'approved' | 'rejected';
  createdAt: timestamp;
  respondedAt?: timestamp;
}
```

### 2.10 Quest（任务）- 扩展
```typescript
interface Quest {
  id: string;
  villageId: string;

  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'one_time';

  // 完成条件
  requirement: {
    action: 'post' | 'comment' | 'like' | 'invite' | 'attend_event';
    count: number;
  };

  reward: number;                // 货币奖励数量
  isActive: boolean;

  createdAt: timestamp;
}
```

### 2.11 QuestProgress（任务进度）
```typescript
interface QuestProgress {
  id: string;
  questId: string;
  userId: string;
  progress: number;              // 当前进度
  completed: boolean;
  completedAt?: timestamp;
  createdAt: timestamp;
}
```

### 2.12 Notification（通知）
```typescript
interface Notification {
  id: string;
  userId: string;                // 接收者

  type: 'post_liked' | 'post_commented' | 'contact_request' |
        'contact_approved' | 'event_reminder' | 'quest_completed' |
        'announcement' | 'new_member';

  // 关联实体（根据 type 不同）
  relatedId?: string;            // postId / eventId / villageId 等
  relatedType?: string;          // 'post' | 'event' | 'village' | 'user'

  title: string;
  content: string;
  isRead: boolean;

  createdAt: timestamp;
}
```

### 2.13 SmsCode（短信验证码）
```typescript
interface SmsCode {
  id: string;
  phone: string;
  code: string;                  // 6 位数字
  purpose: 'login' | 'bind';     // 用途
  expiredAt: timestamp;          // 5 分钟有效
  used: boolean;
  createdAt: timestamp;
}
```

---

## 3. API 接口设计

### 3.1 认证模块
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/auth/register` | 注册（email, password, name） |
| POST | `/auth/login` | 邮箱密码登录，返回 JWT |
| POST | `/auth/login/phone` | 手机验证码登录 |
| POST | `/auth/login/wechat` | 微信登录（code + platform） |
| POST | `/auth/login/apple` | Apple 登录（identityToken） |
| POST | `/auth/refresh` | 刷新 accessToken |
| POST | `/auth/logout` | 登出（可选，清除 refresh token） |
| GET | `/auth/me` | 获取当前用户信息 |
| POST | `/auth/bind/:provider` | 绑定第三方账号（wechat/apple/phone/email） |

### 3.2 短信模块
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/sms/send` | 发送验证码（phone, purpose） |
| POST | `/sms/verify` | 验证（仅测试用，正式流程在 login/bind 中） |

### 3.3 用户模块
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/users/:id` | 获取用户公开信息 |
| PATCH | `/users/me` | 更新全局资料（name, avatar） |
| GET | `/users/me/memberships` | 获取我加入的所有村落 |
| GET | `/users/me/assets` | 获取所有村落资产汇总 |

### 3.4 村落模块
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/villages` | 列表（支持 category 筛选，仅返回 public） |
| GET | `/villages/:id` | 村落详情 |
| POST | `/villages` | 创建村落 |
| PATCH | `/villages/:id` | 更新村落（仅 chief） |
| DELETE | `/villages/:id` | 删除村落（仅 chief） |
| POST | `/villages/:id/join` | 加入村落（私密需 inviteCode） |
| POST | `/villages/:id/leave` | 离开村落 |
| POST | `/villages/:id/regenerate-code` | 重新生成邀请码（仅 chief） |
| GET | `/villages/:id/stats` | 获取统计数据 |

### 3.5 成员模块
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/villages/:id/members` | 成员列表（支持筛选：online/newest/admins） |
| GET | `/villages/:id/members/:userId` | 获取成员名片（受隐私控制） |
| PATCH | `/villages/:id/members/me` | 更新本地资料/隐私设置 |
| PATCH | `/villages/:id/members/:userId/role` | 修改成员角色（仅 chief） |
| DELETE | `/villages/:id/members/:userId` | 踢出成员（仅 chief/core_member） |

### 3.6 帖子模块
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/villages/:id/posts` | 帖子列表（分页） |
| POST | `/villages/:id/posts` | 发帖 |
| GET | `/posts/:id` | 帖子详情 |
| PATCH | `/posts/:id` | 编辑帖子（仅作者） |
| DELETE | `/posts/:id` | 删除帖子（作者或管理员） |
| POST | `/posts/:id/like` | 点赞 |
| DELETE | `/posts/:id/like` | 取消点赞 |
| GET | `/posts/:id/comments` | 评论列表 |
| POST | `/posts/:id/comments` | 发表评论 |

### 3.7 活动模块
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/villages/:id/events` | 活动列表 |
| POST | `/villages/:id/events` | 创建活动 |
| GET | `/events/:id` | 活动详情 |
| PATCH | `/events/:id` | 编辑活动（仅组织者） |
| DELETE | `/events/:id` | 删除活动 |
| POST | `/events/:id/rsvp` | 报名/更新状态 |
| GET | `/events/:id/attendees` | 参与者列表 |

### 3.8 联系请求模块
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/contact-requests` | 发起联系请求 |
| GET | `/contact-requests/incoming` | 收到的请求 |
| GET | `/contact-requests/outgoing` | 发出的请求 |
| PATCH | `/contact-requests/:id` | 同意/拒绝请求 |

### 3.9 任务模块
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/villages/:id/quests` | 任务列表 |
| GET | `/villages/:id/quests/my-progress` | 我的任务进度 |
| POST | `/quests/:id/claim` | 领取奖励 |

### 3.10 通知模块
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/notifications` | 通知列表（分页） |
| GET | `/notifications/unread-count` | 未读数量 |
| PATCH | `/notifications/:id/read` | 标记已读 |
| POST | `/notifications/read-all` | 全部标记已读 |

### 3.11 文件上传模块
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/upload/image` | 上传图片（返回 URL） |
| POST | `/upload/avatar` | 上传头像（自动裁剪压缩） |
| DELETE | `/upload/:key` | 删除文件（可选） |

---

## 4. 业务规则

### 4.1 权限矩阵

| 操作 | Chief | Core Member | Villager |
|------|:-----:|:-----------:|:--------:|
| 编辑村落信息 | ✓ | - | - |
| 发布/编辑公告 | ✓ | - | - |
| 管理邀请码 | ✓ | - | - |
| 切换公开/私密 | ✓ | - | - |
| 编辑宪法规则 | ✓ | - | - |
| 踢出成员 | ✓ | ✓ | - |
| 设置成员角色 | ✓ | - | - |
| 删除任意帖子 | ✓ | ✓ | - |
| 发帖/评论/点赞 | ✓ | ✓ | ✓ |
| 创建活动 | ✓ | ✓ | ✓ |
| 查看成员列表 | ✓ | ✓ | ✓ |

### 4.2 加入村落流程
```
公开村落：
  用户点击 "Join" → 创建 Membership → 进入村落

私密村落：
  用户输入 inviteCode → 验证通过 → 创建 Membership → 进入村落

  或通过邀请链接：
  /join?code=XXXX → 登录后自动加入
```

### 4.3 货币获取规则
| 行为 | 奖励 | 说明 |
|------|------|------|
| 每日签到 | +5 | 每天首次访问 |
| 发帖 | +10 | 每日上限 3 次 |
| 评论 | +2 | 每日上限 10 次 |
| 被点赞 | +1 | 无上限 |
| 完成任务 | 变量 | 由任务定义 |
| 邀请新成员 | +100 | 被邀请者激活后 |

### 4.4 隐私控制逻辑
```
查看成员名片时：
  - 始终可见：昵称、角色、简介、头像、状态
  - 受控字段：email, phone, location, socials

  if (目标用户设置 showXxx = true) {
    显示该字段
  } else {
    显示 "Private" + 提供 "Request Contact" 按钮
  }
```

### 4.5 邀请码规则
- 格式：6-8 位大写字母数字
- 创建私密村落时自动生成
- Chief 可随时重新生成（旧码立即失效）
- 公开村落不需要邀请码

---

## 5. 页面与路由

| 路由 | 页面 | 认证 |
|------|------|------|
| `/login` | 登录/注册 | 否 |
| `/` | 发现页（村落列表） | 是 |
| `/v/:slug` | 村落主页（广场） | 是 |
| `/v/:slug/citizens` | 成员列表 | 是 |
| `/v/:slug/events` | 活动列表 | 是 |
| `/v/:slug/townhall` | 市政厅 | 是 |
| `/v/:slug/settings` | 村落设置（仅管理员） | 是 |
| `/passport` | 护照页面 | 是 |
| `/create` | 创建村落向导 | 是 |

---

## 6. 状态与通知

### 6.1 在线状态
- 使用 WebSocket 或轮询维护
- 用户最后活跃时间 < 5 分钟 视为在线
- 村落 `online` 计数实时更新

### 6.2 通知类型（扩展）
| 类型 | 触发 |
|------|------|
| `new_post` | 关注的人发帖 |
| `post_liked` | 帖子被点赞 |
| `post_commented` | 帖子被评论 |
| `contact_request` | 收到联系请求 |
| `contact_approved` | 请求被同意 |
| `event_reminder` | 活动开始前提醒 |
| `quest_completed` | 任务完成 |
| `announcement` | 新公告 |

---

## 7. 多端架构设计

### 7.1 目标平台

| 平台 | 说明 | 优先级 |
|------|------|:------:|
| Web 网页版 | 桌面浏览器，完整功能 | P0 |
| H5 移动网页 | 微信/浏览器内嵌，响应式 | P0 |
| 微信小程序 | 国内主要入口 | P1 |
| iOS App | App Store 上架 | P1 |
| Android App | 应用商店上架 | P1 |
| 支付宝/抖音小程序 | 扩展渠道 | P2 |

### 7.2 技术方案选型

#### 方案对比

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|----------|
| **Taro 3.x** | React 语法，一码多端，小程序体验好 | 原生能力受限 | 小程序优先 |
| **uni-app** | 生态成熟，Vue 语法，多端支持全 | 复杂交互性能一般 | 快速多端铺开 |
| **React Native** | 原生性能，React 生态 | 小程序需额外方案 | App 优先 |
| **Flutter** | 高性能，UI 一致性强 | 包体积大，学习曲线 | 重交互 App |

#### 推荐方案：分层架构

```
┌─────────────────────────────────────────────────────────────┐
│                        客户端层                              │
├──────────────┬──────────────┬──────────────┬────────────────┤
│   Web/H5    │   小程序      │   iOS        │   Android      │
│   (React)   │   (Taro)     │ (React Native)│ (React Native) │
└──────────────┴──────────────┴──────────────┴────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      共享业务层                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  @gv/core - 纯 TypeScript 业务逻辑包                  │   │
│  │  - API Client (axios/fetch 封装)                     │   │
│  │  - 状态管理 (Zustand)                                │   │
│  │  - 类型定义 (TypeScript interfaces)                  │   │
│  │  - 工具函数 (日期、格式化、验证)                       │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      后端 API 层                             │
│                   RESTful API + WebSocket                    │
└─────────────────────────────────────────────────────────────┘
```

### 7.3 代码复用策略

#### 共享层 `@gv/core`

```typescript
// packages/core/src/index.ts

// 类型定义 - 100% 复用
export * from './types';

// API 客户端 - 100% 复用
export * from './api';

// 状态管理 - 100% 复用
export * from './stores';

// 业务逻辑 hooks - 90% 复用
export * from './hooks';

// 工具函数 - 100% 复用
export * from './utils';
```

#### 平台适配层

```typescript
// packages/core/src/platform.ts

export interface PlatformAdapter {
  // 存储
  storage: {
    get(key: string): Promise<string | null>;
    set(key: string, value: string): Promise<void>;
    remove(key: string): Promise<void>;
  };

  // 导航
  navigation: {
    push(path: string, params?: object): void;
    replace(path: string): void;
    back(): void;
  };

  // 设备信息
  device: {
    platform: 'web' | 'h5' | 'weapp' | 'ios' | 'android';
    screenWidth: number;
    screenHeight: number;
    safeAreaInsets: { top: number; bottom: number };
  };

  // 分享
  share?: {
    toFriend(options: ShareOptions): Promise<void>;
    toTimeline(options: ShareOptions): Promise<void>;
  };

  // 支付
  payment?: {
    pay(options: PaymentOptions): Promise<PaymentResult>;
  };
}
```

### 7.4 各端实现细节

#### Web 网页版 (React + Vite)
```
packages/
├── core/                 # 共享业务逻辑
├── web/                  # Web 端
│   ├── src/
│   │   ├── components/   # Web 专用组件
│   │   ├── pages/        # 页面
│   │   ├── platform.ts   # 平台适配实现
│   │   └── main.tsx
│   └── vite.config.ts
```

- 直接使用现有 React 代码
- TailwindCSS 样式
- 响应式适配 H5

#### 微信小程序 (Taro 3.x + React)
```
packages/
├── core/                 # 共享业务逻辑
├── weapp/                # 小程序端
│   ├── src/
│   │   ├── components/   # 小程序组件 (Taro 语法)
│   │   ├── pages/        # 页面
│   │   ├── platform.ts   # Taro API 适配
│   │   └── app.tsx
│   └── config/
│       └── index.ts      # Taro 配置
```

**小程序特殊处理：**
- 登录：微信授权登录 → 后端换取 token
- 分享：调用小程序分享 API
- 支付：微信支付
- 存储：wx.setStorageSync

#### App (React Native + Expo)
```
packages/
├── core/                 # 共享业务逻辑
├── mobile/               # RN 端
│   ├── src/
│   │   ├── components/   # RN 组件
│   │   ├── screens/      # 屏幕
│   │   ├── navigation/   # React Navigation
│   │   ├── platform.ts   # RN 平台适配
│   │   └── App.tsx
│   └── app.json          # Expo 配置
```

**App 特殊处理：**
- 登录：Apple/Google 登录 + 手机号
- 推送：Expo Notifications
- 存储：AsyncStorage / expo-secure-store
- 导航：React Navigation

### 7.5 Monorepo 项目结构

```
global-village/
├── packages/
│   ├── core/                    # 共享业务逻辑
│   │   ├── src/
│   │   │   ├── api/             # API 封装
│   │   │   ├── stores/          # Zustand 状态
│   │   │   ├── hooks/           # 业务 hooks
│   │   │   ├── types/           # TypeScript 类型
│   │   │   └── utils/           # 工具函数
│   │   └── package.json
│   │
│   ├── ui/                      # 跨端 UI 组件 (可选)
│   │   ├── src/
│   │   │   ├── Button/
│   │   │   ├── Avatar/
│   │   │   └── ...
│   │   └── package.json
│   │
│   ├── web/                     # Web 端
│   ├── weapp/                   # 小程序端
│   └── mobile/                  # React Native 端
│
├── apps/
│   └── server/                  # 后端服务
│       ├── src/
│       └── package.json
│
├── pnpm-workspace.yaml
├── turbo.json                   # Turborepo 配置
└── package.json
```

### 7.6 各端登录流程

```
┌─────────────────────────────────────────────────────────────┐
│                        登录方式                              │
├──────────────┬──────────────┬──────────────┬────────────────┤
│   Web/H5    │   小程序      │   iOS        │   Android      │
├──────────────┼──────────────┼──────────────┼────────────────┤
│ • 邮箱密码   │ • 微信授权    │ • Apple 登录  │ • Google 登录  │
│ • 手机验证码 │ • 手机验证码  │ • 手机验证码  │ • 手机验证码   │
│ • 第三方OAuth│              │ • 邮箱密码    │ • 邮箱密码     │
└──────────────┴──────────────┴──────────────┴────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     统一用户系统                             │
│  • 首次登录自动创建用户                                       │
│  • 可绑定多个登录方式到同一账号                               │
│  • 返回统一 JWT Token                                        │
└─────────────────────────────────────────────────────────────┘
```

### 7.7 平台差异处理清单

| 功能 | Web | H5 | 小程序 | iOS | Android |
|------|:---:|:--:|:------:|:---:|:-------:|
| 邮箱登录 | ✓ | ✓ | - | ✓ | ✓ |
| 微信登录 | ✓ | ✓ | ✓ | ✓ | ✓ |
| Apple 登录 | - | - | - | ✓ | - |
| 推送通知 | - | - | 订阅消息 | ✓ | ✓ |
| 分享 | Web Share API | 微信 JS-SDK | 小程序 API | 原生 | 原生 |
| 支付 | 网页支付 | 微信 H5 支付 | 微信支付 | IAP/支付宝 | 支付宝/微信 |
| 图片上传 | File API | File API | wx.chooseImage | ImagePicker | ImagePicker |
| 位置服务 | Geolocation | Geolocation | wx.getLocation | expo-location | expo-location |
| 本地存储 | localStorage | localStorage | wx.storage | SecureStore | SecureStore |
| 扫码 | - | - | wx.scanCode | Camera | Camera |

---

## 8. 后端技术方案

### 8.1 技术栈选型

| 组件 | 推荐 | 备选 |
|------|------|------|
| 语言 | TypeScript (Node.js) | Go |
| 框架 | Fastify / NestJS | Gin / Fiber |
| 数据库 | PostgreSQL | MySQL |
| ORM | Prisma | TypeORM / Drizzle |
| 缓存 | Redis | |
| 消息队列 | BullMQ (Redis) | RabbitMQ |
| 文件存储 | 阿里云 OSS / S3 | Cloudflare R2 |
| 认证 | JWT (access + refresh) | |
| 实时通信 | Socket.io | ws |
| 部署 | Docker + K8s | Serverless |

### 8.2 后端目录结构

```
apps/server/
├── src/
│   ├── modules/                 # 业务模块
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.dto.ts
│   │   │   └── strategies/      # passport 策略
│   │   ├── user/
│   │   ├── village/
│   │   ├── membership/
│   │   ├── post/
│   │   ├── event/
│   │   └── notification/
│   │
│   ├── common/                  # 公共模块
│   │   ├── guards/              # 权限守卫
│   │   ├── interceptors/        # 拦截器
│   │   ├── decorators/          # 装饰器
│   │   ├── filters/             # 异常过滤
│   │   └── pipes/               # 验证管道
│   │
│   ├── config/                  # 配置
│   ├── prisma/                  # Prisma schema
│   └── main.ts
│
├── test/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
└── package.json
```

### 8.3 数据库设计 (Prisma Schema)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String   @id @default(uuid())
  email         String?  @unique
  phone         String?  @unique
  passwordHash  String?

  // 全局资料
  name          String
  avatar        String?
  globalId      String   @unique @default(cuid())

  // 第三方登录
  wechatOpenId  String?  @unique
  wechatUnionId String?
  appleId       String?  @unique

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // 关系
  memberships   Membership[]
  posts         Post[]
  comments      Comment[]
  likes         Like[]
  events        Event[]        @relation("Organizer")
  eventRsvps    EventRsvp[]

  @@index([email])
  @@index([phone])
  @@index([wechatOpenId])
}

model Village {
  id            String   @id @default(uuid())
  name          String
  slug          String   @unique
  category      String
  description   String
  announcement  String?
  coverImage    String
  icon          String

  // 经济
  currencyName   String
  currencySymbol String

  // 隐私
  visibility    String   @default("public") // public | private
  inviteCode    String?

  // 规则
  constitution  String[]

  // 统计
  memberCount   Int      @default(0)

  ownerId       String
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // 关系
  memberships   Membership[]
  posts         Post[]
  events        Event[]
  quests        Quest[]

  @@index([visibility])
  @@index([category])
}

model Membership {
  id            String   @id @default(uuid())
  userId        String
  villageId     String

  // 本地资料
  nickname      String
  bio           String   @default("")
  localAvatar   String?
  status        String?

  role          String   @default("villager") // chief | core_member | villager

  // 隐私
  showEmail     Boolean  @default(true)
  showPhone     Boolean  @default(false)
  showLocation  Boolean  @default(true)
  showSocials   Boolean  @default(true)

  // 经济
  balance       Int      @default(0)

  joinedAt      DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // 关系
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  village       Village  @relation(fields: [villageId], references: [id], onDelete: Cascade)

  @@unique([userId, villageId])
  @@index([userId])
  @@index([villageId])
}

model Post {
  id            String   @id @default(uuid())
  villageId     String
  authorId      String

  content       String
  images        String[]
  tags          String[]

  likeCount     Int      @default(0)
  commentCount  Int      @default(0)

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // 关系
  village       Village  @relation(fields: [villageId], references: [id], onDelete: Cascade)
  author        User     @relation(fields: [authorId], references: [id], onDelete: Cascade)
  comments      Comment[]
  likes         Like[]

  @@index([villageId, createdAt(sort: Desc)])
  @@index([authorId])
}

model Comment {
  id            String   @id @default(uuid())
  postId        String
  authorId      String
  parentId      String?

  content       String

  createdAt     DateTime @default(now())

  // 关系
  post          Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  author        User     @relation(fields: [authorId], references: [id], onDelete: Cascade)
  parent        Comment? @relation("CommentReplies", fields: [parentId], references: [id])
  replies       Comment[] @relation("CommentReplies")

  @@index([postId])
}

model Like {
  id            String   @id @default(uuid())
  postId        String
  userId        String
  createdAt     DateTime @default(now())

  post          Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([postId, userId])
}

model Event {
  id            String   @id @default(uuid())
  villageId     String
  organizerId   String

  title         String
  description   String?
  coverImage    String?

  type          String   // online | offline
  location      String

  startTime     DateTime
  endTime       DateTime?

  attendeeCount Int      @default(0)

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // 关系
  village       Village  @relation(fields: [villageId], references: [id], onDelete: Cascade)
  organizer     User     @relation("Organizer", fields: [organizerId], references: [id])
  rsvps         EventRsvp[]

  @@index([villageId, startTime])
}

model EventRsvp {
  id            String   @id @default(uuid())
  eventId       String
  userId        String
  status        String   // going | maybe | not_going
  createdAt     DateTime @default(now())

  event         Event    @relation(fields: [eventId], references: [id], onDelete: Cascade)
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([eventId, userId])
}

model Quest {
  id            String   @id @default(uuid())
  villageId     String

  title         String
  description   String
  type          String   // daily | weekly | one_time

  actionType    String   // post | comment | like | invite | attend_event
  actionCount   Int

  reward        Int
  isActive      Boolean  @default(true)

  createdAt     DateTime @default(now())

  village       Village  @relation(fields: [villageId], references: [id], onDelete: Cascade)
  progress      QuestProgress[]
}

model QuestProgress {
  id            String   @id @default(uuid())
  questId       String
  userId        String

  progress      Int      @default(0)
  completed     Boolean  @default(false)
  completedAt   DateTime?

  createdAt     DateTime @default(now())

  quest         Quest    @relation(fields: [questId], references: [id], onDelete: Cascade)

  @@unique([questId, userId])
}

model ContactRequest {
  id            String   @id @default(uuid())
  requesterId   String
  targetId      String
  villageId     String

  status        String   @default("pending") // pending | approved | rejected

  createdAt     DateTime @default(now())
  respondedAt   DateTime?
}

model Notification {
  id            String   @id @default(uuid())
  userId        String

  type          String   // post_liked | post_commented | contact_request | ...
  relatedId     String?
  relatedType   String?

  title         String
  content       String
  isRead        Boolean  @default(false)

  createdAt     DateTime @default(now())

  @@index([userId, isRead])
  @@index([userId, createdAt(sort: Desc)])
}

model SmsCode {
  id            String   @id @default(uuid())
  phone         String
  code          String
  purpose       String   // login | bind

  expiredAt     DateTime
  used          Boolean  @default(false)

  createdAt     DateTime @default(now())

  @@index([phone, code])
}
```

### 8.4 认证流程

```
┌─────────────────────────────────────────────────────────────┐
│                      认证 API                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  POST /auth/register                                        │
│  ├─ body: { email, password, name }                         │
│  └─ response: { user, accessToken, refreshToken }           │
│                                                             │
│  POST /auth/login                                           │
│  ├─ body: { email, password }                               │
│  └─ response: { user, accessToken, refreshToken }           │
│                                                             │
│  POST /auth/login/phone                                     │
│  ├─ body: { phone, code }                                   │
│  └─ response: { user, accessToken, refreshToken }           │
│                                                             │
│  POST /auth/login/wechat                                    │
│  ├─ body: { code, platform: 'weapp' | 'h5' | 'app' }        │
│  └─ response: { user, accessToken, refreshToken }           │
│                                                             │
│  POST /auth/login/apple                                     │
│  ├─ body: { identityToken }                                 │
│  └─ response: { user, accessToken, refreshToken }           │
│                                                             │
│  POST /auth/refresh                                         │
│  ├─ body: { refreshToken }                                  │
│  └─ response: { accessToken, refreshToken }                 │
│                                                             │
│  POST /auth/bind/:provider                                  │
│  ├─ 绑定第三方账号到当前用户                                  │
│  └─ provider: wechat | apple | phone | email                │
│                                                             │
└─────────────────────────────────────────────────────────────┘

Token 策略：
- accessToken: 15 分钟有效期
- refreshToken: 30 天有效期
- 客户端自动刷新 accessToken
```

### 8.5 安全考虑

| 安全项 | 措施 |
|--------|------|
| 密码存储 | bcrypt / argon2 加密 |
| API 限流 | 登录：5次/分钟，普通接口：100次/分钟 |
| SQL 注入 | Prisma 参数化查询 |
| XSS | 输入过滤 + CSP 头 |
| CSRF | SameSite Cookie + Token |
| 文件上传 | 类型白名单 + 大小限制 (10MB) |
| 敏感数据 | 加密存储 + 脱敏返回 |
| 日志 | 不记录密码/token |

### 8.6 部署架构

```
┌─────────────────────────────────────────────────────────────┐
│                        CDN (静态资源)                        │
│                    Cloudflare / 阿里云 CDN                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      负载均衡 (Nginx / ALB)                  │
└─────────────────────────────────────────────────────────────┘
                              │
         ┌────────────────────┼────────────────────┐
         ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   API Server    │  │   API Server    │  │   API Server    │
│   (Node.js)     │  │   (Node.js)     │  │   (Node.js)     │
└─────────────────┘  └─────────────────┘  └─────────────────┘
         │                    │                    │
         └────────────────────┼────────────────────┘
                              │
         ┌────────────────────┼────────────────────┐
         ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   PostgreSQL    │  │      Redis      │  │    OSS/S3       │
│   (主从复制)     │  │   (缓存/队列)    │  │   (文件存储)    │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

---

## 9. MVP 优先级

### 9.1 Phase 1 - 核心功能 (P0)

**后端 API**
- [ ] 用户注册/登录（邮箱 + 密码）
- [ ] JWT 认证 + Token 刷新
- [ ] 村落 CRUD
- [ ] 成员关系管理
- [ ] 帖子/评论/点赞
- [ ] 文件上传（OSS）

**Web 端**
- [ ] 登录/注册页
- [ ] 发现页（村落列表）
- [ ] 村落详情（广场、成员、活动、市政厅）
- [ ] 护照弹窗
- [ ] 响应式适配 H5

### 9.2 Phase 2 - 多端扩展 (P1)

**后端 API**
- [ ] 微信登录（小程序 + H5）
- [ ] 手机验证码登录
- [ ] 私密村落 + 邀请码
- [ ] 活动管理
- [ ] 公告发布

**客户端**
- [ ] 微信小程序 (Taro)
- [ ] 共享业务层 (@gv/core) 抽取
- [ ] 平台适配层实现

### 9.3 Phase 3 - App 发布 (P1)

**后端 API**
- [ ] Apple 登录
- [ ] 推送通知服务
- [ ] 在线状态 (WebSocket)

**客户端**
- [ ] React Native App (Expo)
- [ ] iOS 上架
- [ ] Android 上架

### 9.4 Phase 4 - 增强功能 (P2)

- [ ] 任务系统
- [ ] 货币获取与余额
- [ ] 联系请求机制
- [ ] 通知中心
- [ ] 支付宝/抖音小程序

### 9.5 Phase 5 - 未来规划 (P3)

- [ ] 实时聊天 / 语音频道
- [ ] 货币交易 / 转账
- [ ] 投票治理 / DAO
- [ ] 徽章 / 成就系统
- [ ] 数据分析仪表盘

---

## 10. 附录

### 10.1 ER 图

```
┌──────────┐       ┌─────────────┐       ┌──────────┐
│   User   │───────│ Membership  │───────│ Village  │
└──────────┘  1:N  └─────────────┘  N:1  └──────────┘
     │                    │                    │
     │ 1:N                │               1:N  │
     ▼                    │                    ▼
┌──────────┐              │              ┌──────────┐
│   Post   │◄─────────────┘              │  Event   │
└──────────┘                             └──────────┘
     │                                        │
     │ 1:N                               1:N  │
     ▼                                        ▼
┌──────────┐                             ┌──────────┐
│ Comment  │                             │EventRSVP │
└──────────┘                             └──────────┘

┌──────────┐     ┌───────────────┐     ┌──────────┐
│   Like   │     │ContactRequest │     │  Quest   │
└──────────┘     └───────────────┘     └──────────┘
                                            │
                                       1:N  │
                                            ▼
┌──────────────┐                     ┌─────────────┐
│ Notification │                     │QuestProgress│
└──────────────┘                     └─────────────┘
     ▲ N:1
     │
┌──────────┐
│   User   │
└──────────┘
```

### 10.2 API 响应格式

```typescript
// 成功响应
{
  "success": true,
  "data": { ... }
}

// 分页响应
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}

// 错误响应
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format"
  }
}
```

### 10.3 错误码定义

| 错误码 | HTTP | 说明 |
|--------|------|------|
| `UNAUTHORIZED` | 401 | 未登录或 token 过期 |
| `FORBIDDEN` | 403 | 无权限 |
| `NOT_FOUND` | 404 | 资源不存在 |
| `VALIDATION_ERROR` | 400 | 参数验证失败 |
| `DUPLICATE_ENTRY` | 409 | 重复数据 |
| `INVALID_INVITE_CODE` | 400 | 邀请码无效 |
| `VILLAGE_PRIVATE` | 403 | 私密村落需要邀请码 |
| `RATE_LIMITED` | 429 | 请求过于频繁 |

### 10.4 环境配置

```bash
# .env.example

# 数据库
DATABASE_URL="postgresql://user:pass@localhost:5432/globalvillage"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="your-secret-key"
JWT_ACCESS_EXPIRES="15m"
JWT_REFRESH_EXPIRES="30d"

# 微信
WECHAT_APP_ID="wx..."
WECHAT_APP_SECRET="..."
WECHAT_MINI_APP_ID="wx..."
WECHAT_MINI_APP_SECRET="..."

# Apple
APPLE_CLIENT_ID="..."
APPLE_TEAM_ID="..."
APPLE_KEY_ID="..."

# 阿里云 OSS
OSS_ACCESS_KEY_ID="..."
OSS_ACCESS_KEY_SECRET="..."
OSS_BUCKET="globalvillage"
OSS_REGION="oss-cn-hangzhou"

# 短信
SMS_ACCESS_KEY_ID="..."
SMS_ACCESS_KEY_SECRET="..."
SMS_SIGN_NAME="地球村"
SMS_TEMPLATE_CODE="..."
```

---

**文档版本历史**

| 版本 | 日期 | 更新内容 |
|------|------|----------|
| 1.0 | 2024-11 | 初始版本 |
| 1.1 | 2024-11 | 新增多端架构设计、Prisma Schema、部署架构 |

---

**文档结束**
