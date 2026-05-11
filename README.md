# 数学协会官网

数学协会官方门户网站 — 前后端分离架构，支持公开浏览、会员内部资料、管理员后台三大功能模块。

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 18 + Vite 5 + React Router v6 + 自定义 CSS |
| 后端 | Go 1.21 + Gin + GORM + JWT + bcrypt |
| 数据库 | SQLite（开发）/ MySQL（生产可选） |
| 缓存 | Redis（生产可选） |
| 部署 | Docker + docker-compose + Nginx |

## 项目结构

```
math-association/
├── backend/                # Go 后端 API 服务
│   ├── main.go            # 入口（数据库初始化 + 种子数据）
│   ├── config/            # 环境变量配置
│   ├── models/            # 数据模型
│   │   └── models.go      # User, Article, Document, Resource, Activity, Competition 等
│   ├── handlers/          # 请求处理器
│   │   ├── auth.go        # 登录认证、JWT
│   │   ├── article.go     # 新闻/知识库文章
│   │   ├── document.go    # 文档资料
│   │   ├── resource.go    # 学习资源
│   │   ├── activity.go    # 活动管理
│   │   ├── competition.go # 竞赛信息
│   │   ├── member_showcase.go # 成员展示
│   │   ├── user_manage.go # 用户管理（超管）
│   │   ├── contact.go     # 留言管理
│   │   ├── site.go        # 站点配置
│   │   └── upload.go      # 文件上传
│   ├── middleware/         # JWT 认证中间件（三级权限）
│   ├── routes/            # 路由定义
│   └── Dockerfile
├── frontend/              # React 前端
│   ├── src/
│   │   ├── App.jsx        # 根组件 + 路由
│   │   ├── App.css        # 完整样式系统（~2700 行）
│   │   ├── api/            # API 封装 + 认证上下文
│   │   └── components/
│   │       ├── Navbar.jsx, Hero.jsx, About.jsx ...  # 公开首页组件
│   │       ├── Activities.jsx, News.jsx, Contact.jsx # 公开页面（动态数据）
│   │       ├── Resources.jsx                          # 公开资源（含文档下载）
│   │       ├── admin/       # 管理后台
│   │       │   ├── AdminLayout.jsx    # 侧边栏布局
│   │       │   ├── AdminDashboard.jsx
│   │       │   ├── AdminCompetitions.jsx
│   │       │   ├── AdminNews.jsx      # 动态管理（含展示范围+定时发布）
│   │       │   ├── AdminActivities.jsx # 活动管理（含展示范围+定时发布）
│   │       │   ├── AdminDocuments.jsx  # 资料管理（含展示范围+定时发布）
│   │       │   ├── AdminMembers.jsx
│   │       │   ├── AdminUsers.jsx      # 账号管理（仅超管）
│   │       │   ├── AdminContacts.jsx
│   │       │   └── AdminShared.jsx
│   │       └── portal/      # 会员中心
│   │           ├── PortalLayout.jsx
│   │           ├── PortalDocuments.jsx
│   │           ├── PortalResources.jsx
│   │           └── PortalDirectory.jsx
│   └── Dockerfile
├── nginx/                 # Nginx 反向代理配置
├── docker-compose.yml    # 容器编排
└── README.md
```

## 快速开始

### 本地运行

**前置条件：** Go 1.21+、Node.js 20+

**1. 启动后端**

```bash
cd backend
go mod tidy
go run main.go
```

首次启动自动创建 SQLite 数据库和种子数据。

**2. 启动前端**

```bash
cd frontend
npm install
npm run dev
```

**3. 访问**

| 地址 | 说明 |
|------|------|
| http://localhost:5173 | 公开首页 |
| http://localhost:5173/portal | 会员中心（需登录） |
| http://localhost:5173/admin | 管理后台（需管理员登录） |

**默认账号：** `admin` / `admin123`（超级管理员）

### 局域网访问

如需其他设备访问，已配置为监听所有网卡 (`0.0.0.0`)。将以下文件中的 IP 改为你的实际局域网 IP：

| 文件 | 修改位置 | 当前值 |
|------|---------|--------|
| `frontend/vite.config.js` | proxy target | `http://localhost:8080` |
| `backend/main.go` 第 53 行 | 启动日志中的公网 IP 显示 | `43.99.48.199` |
| `nginx/nginx.conf` 第 25 行 | server_name | `43.99.48.199 172.30.11.199 localhost` |

其他设备访问 `http://你的IP:5173` 即可。若无法访问，检查路由器是否开启了 AP 隔离。

### Docker 部署

```bash
docker-compose up -d
```

启动 4 个容器：backend(8080)、redis(6379)、frontend(80)、nginx(80/443)。

部署前修改：
1. `docker-compose.yml` 中 `JWT_SECRET` 改为生产密钥
2. `nginx/nginx.conf` 中 `server_name` 改为实际域名

## 账号与权限

| 角色 | 说明 | 默认账号 |
|------|------|---------|
| 超级管理员 | 全部权限，含用户管理、账号拉黑 | admin / admin123 |
| 管理员 | 内容管理、资料、活动、成员展示 | 由超管创建 |
| 会员 | 浏览内部文档、资源、通讯录 | 由超管创建 |

三级认证中间件：`AuthRequired` → `AdminRequired` → `SuperAdminRequired`，前端侧边栏按角色自动隐藏无权限入口。

## 功能模块

### 公开首页（无需登录）

- **Hero + 介绍** — 大气的首屏 + 协会数据 + 最新动态
- **竞赛信息** — 8+ 竞赛条目，难度、时间、备战技巧
- **时间线** — 竞赛节奏可视化
- **活动展示** — 从后台动态获取，支持展示范围控制
- **文档资料** — 已发布且公开的文档可直接下载
- **学习资源** — 外部链接推荐
- **新闻动态** — 根据展示范围和定时发布规则自动显示
- **联系我们** — 留言表单

### 会员中心（需登录）

- **仪表盘** — 文档数、资源数、成员数统计
- **内部文档** — 会员可见的文档，支持下载
- **学习资源** — 题库、讲义、视频等分类浏览
- **成员通讯录** — 公开成员及联系方式

### 管理后台（需管理员登录）

| 模块 | 功能 | 特殊权限 |
|------|------|---------|
| 总览 | 数据统计 + 最近留言 | — |
| 竞赛 | CRUD + 搜索 | — |
| 动态 | CRUD + 展示范围 + 定时发布 | — |
| 活动 | CRUD + 展示范围 + 定时发布 | — |
| 成员 | 成员展示 CRUD | — |
| 资料 | 上传文档 + 展示范围 + 定时发布 | — |
| 账号 | 注册/编辑/拉黑/重置密码 | 仅超管 |
| 留言 | 标记已读 + 删除 | — |

### 展示范围与定时发布

所有内容（动态、资料、活动）均支持：

| 字段 | 选项 | 说明 |
|------|------|------|
| `visibility` | `public` | 公开：首页 + 会员中心 |
| | `members` | 仅会员中心 |
| | `both` | 首页 + 会员中心 |
| `is_published` | true/false | 立即发布 / 草稿 |
| `publish_at` | datetime | 定时发布，到达时间后自动可见 |

后端公共接口自动过滤：未发布或未到定时发布时间的内容不会返回。

## API 接口

### 公开接口（无需认证）

| 路径 | 方法 | 说明 |
|------|------|------|
| `/api/competitions` | GET | 竞赛列表 |
| `/api/news` | GET | 已发布新闻（按visibility+publish_at过滤） |
| `/api/members` | GET | 公开成员展示 |
| `/api/documents` | GET | 公开文档（visibility=public/both） |
| `/api/activities` | GET | 公开活动（visibility=public/both） |
| `/api/contact` | POST | 提交留言 |

### 认证接口

| 路径 | 方法 | 权限 | 说明 |
|------|------|------|------|
| `/api/admin/login` | POST | 公开 | 登录获取 JWT |
| `/api/admin/documents` | GET | 会员+ | 会员可见文档 |
| `/api/admin/resources` | GET | 会员+ | 学习资源 |
| `/api/admin/members` | GET | 会员+ | 成员列表 |

### 管理接口（需管理员 JWT）

| 路径 | 方法 | 权限 | 说明 |
|------|------|------|------|
| `/api/admin/stats` | GET | admin+ | 仪表盘统计 |
| `/api/admin/news` | CRUD | admin+ | 动态管理 |
| `/api/admin/activities` | CRUD | admin+ | 活动管理 |
| `/api/admin/competitions` | CRUD | admin+ | 竞赛管理 |
| `/api/admin/members` | 写 | admin+ | 成员展示 |
| `/api/admin/documents` | CRUD+写 | admin+ | 资料管理 |
| `/api/admin/contacts` | 读写 | admin+ | 留言管理 |
| `/api/admin/upload` | POST | admin+ | 文件上传 |
| `/api/admin/users` | CRUD | super_admin | 账号管理 |
| `/api/admin/users/:id/reset-password` | PUT | super_admin | 重置密码 |

## 环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `SERVER_PORT` | `8080` | 后端服务端口 |
| `DB_PATH` | `./data/math_association.db` | SQLite 数据库路径 |
| `JWT_SECRET` | `math-association-secret-key-2024` | JWT 签名密钥（生产务必修改） |
| `REDIS_ADDR` | `localhost:6379` | Redis 地址 |
| `REDIS_PASS` | 空 | Redis 密码 |
| `UPLOAD_DIR` | `./uploads` | 上传文件目录 |

## 颜色主题

暖白 + 赭橙系，传达数学的严谨与温度：

| 用途 | 色值 | 说明 |
|------|------|------|
| 主色 | `#BC6C25` | 赭橙 |
| 强调 | `#9F5320` | 深赭 |
| 冷调 | `#324A74` | 深蓝 |
| 背景 | `#F3EFE7` | 暖白 |
| 成功 | `#256F5C` | 绿 |
| 危险 | `#A63F32` | 红 |
