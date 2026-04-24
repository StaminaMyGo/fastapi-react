# PRD: 面向学生组织的高可用志愿填报与排班系统 (MVP)

## 1. Introduction/Overview

本系统旨在解决高校学生组织在日常运作中的排班调度痛点。传统方式依赖微信群接龙、在线表格等手动流程，存在信息收集繁琐、调度冲突频发、排班效率低下、缺乏公平性保障等问题。

MVP版本将构建一个双端协同平台——**用户端(client)**面向组织成员提供志愿填报和排班查看功能，**管理端(admin)**面向组织管理者提供排班任务创建、成员管理、智能排班和结果管理功能。后端基于FastAPI异步架构，结合贪心+规则引擎实现快速自动排班。

核心流程类似 SignUpGenius + When2Meet 的结合体：管理员创建排班任务 → 成员填报可用时段和偏好 → 系统自动生成最优排班表 → 结果公示。

## 2. Goals

- 实现管理员创建排班任务、管理成员、配置排班参数的核心流程
- 实现成员注册（管理员审核）、志愿填报（选择可用时段+偏好）、查看排班结果
- 实现基于贪心+规则引擎的自动排班算法，支持硬约束（人数需求、时间冲突）和软约束（偏好满足、公平性）
- 使用FastAPI异步架构 + PostgreSQL，保证基础性能
- 所有API通过JWT认证保护，区分管理员和成员角色
- 提供类型安全的前端代码（React 18 + TypeScript + Ant Design 5）

## 3. User Stories

### US-001: 管理员注册与登录
**Description:** As a 管理员, I want to注册账号并登录系统 so that I can管理排班任务和成员。

**Acceptance Criteria:**
- [ ] 管理员通过邮箱+密码注册，注册后自动获得管理员角色
- [ ] 登录使用JWT token，token过期后自动刷新
- [ ] 登录状态持久化，页面刷新不丢失
- [ ] 前端有登录/注册表单，输入验证（邮箱格式、密码长度等）
- [ ] Typecheck/lint passes
- [ ] Verify in browser

### US-002: 成员注册与审核
**Description:** As a 普通成员, I want to注册账号并等待管理员审核 so that I can参与志愿填报。

**Acceptance Criteria:**
- [ ] 成员通过邮箱+密码+姓名注册，注册后状态为"待审核"
- [ ] 管理员在管理端可以看到待审核成员列表并审核通过/拒绝
- [ ] 审核通过后成员收到通知（站内消息），可正常登录使用
- [ ] Typecheck/lint passes
- [ ] Verify in browser

### US-003: 管理员创建排班任务
**Description:** As a 管理员, I want to创建排班任务 so that I can收集成员的时段偏好并进行排班。

**Acceptance Criteria:**
- [ ] 创建任务时填写：任务名称、描述、填报截止时间、排班起止日期
- [ ] 为每个排班日定义时段（如"上午8-12点"、"下午2-6点"）
- [ ] 为每个时段设置所需人数
- [ ] 可添加排班约束（每人最少/最多班次数）
- [ ] 创建成功后任务状态为"填报中"
- [ ] Typecheck/lint passes
- [ ] Verify in browser

### US-004: 成员志愿填报
**Description:** As a 成员, I want to在填报截止前选择我可用时段并设置偏好 so that 排班结果能考虑我的时间安排。

**Acceptance Criteria:**
- [ ] 成员看到所有"填报中"状态的排班任务
- [ ] 进入任务后，以日历/表格形式展示所有日期和时段
- [ ] 成员在每个时段可选择：可用(高/中/低偏好)、不可用、不关心
- [ ] 填报后可修改，截止时间后自动锁定
- [ ] 前端提示填报进度（已填/总时段数）
- [ ] Typecheck/lint passes
- [ ] Verify in browser

### US-005: 自动排班执行
**Description:** As a 管理员, I want to在填报截止后执行自动排班 so that 系统快速生成合理的排班表。

**Acceptance Criteria:**
- [ ] 管理员在任务详情页点击"执行排班"按钮
- [ ] 系统调用排班算法，考虑以下约束：
  - 硬约束：每个时段人数达标、一人同一时段只能安排一个班次、成员只能在可用时段被排班
  - 软约束：优先满足高偏好、平均分配工时、避免同一成员连续多个时段
- [ ] 排班过程显示进度/状态，完成后展示结果摘要
- [ ] 排班耗时控制在合理范围（100人×20时段 < 30秒）
- [ ] Typecheck/lint passes
- [ ] Verify in browser

### US-006: 排班结果查看与调整
**Description:** As a 管理员, I want to查看和手动调整排班结果 so that 我可以处理特殊情况。

**Acceptance Criteria:**
- [ ] 以日历视图展示排班结果，每个时段显示排班人员名单
- [ ] 支持拖拽或下拉方式替换/调整人员
- [ ] 调整时系统提示是否违反约束
- [ ] 排班结果确认后可发布，成员端可见
- [ ] Typecheck/lint passes
- [ ] Verify in browser

### US-007: 成员查看排班结果
**Description:** As a 成员, I want to查看已发布的排班结果 so that 我知道自己何时值班。

**Acceptance Criteria:**
- [ ] 成员在个人视图中看到自己被安排的班次
- [ ] 以日历样式展示，高亮自己的排班
- [ ] 可查看任务整体排班表（所有人）
- [ ] Typecheck/lint passes
- [ ] Verify in browser

### US-008: 后端API认证与权限中间件
**Description:** As a 开发者, I need统一认证和安全防护 so that 所有API请求都经过验证和授权。

**Acceptance Criteria:**
- [ ] JWT access token (短期 30min) + refresh token (长期 7天)
- [ ] 依赖注入方式获取当前用户
- [ ] 装饰器/依赖项区分 admin_required 和 member_required
- [ ] 密码使用 bcrypt 哈希存储
- [ ] Typecheck/lint passes

### US-009: 数据库模型与迁移
**Description:** As a 开发者, I need数据库模型定义和迁移脚本 so that 数据结构可版本化管理。

**Acceptance Criteria:**
- [ ] 用户模型（id, 邮箱, 密码哈希, 姓名, 角色, 状态, 创建时间）
- [ ] 排班任务模型（id, 名称, 描述, 状态, 截止时间, 排班日期范围）
- [ ] 时段模型（id, 任务id, 日期, 开始时间, 结束时间, 需要人数）
- [ ] 志愿填报模型（id, 用户id, 时段id, 偏好等级, 创建时间）
- [ ] 排班结果模型（id, 任务id, 时段id, 用户id, 是否手动调整）
- [ ] Alembic迁移脚本初始化
- [ ] Typecheck/lint passes

## 4. Functional Requirements

- FR-1: 系统支持邮箱+密码注册登录，JWT实现认证
- FR-2: 成员注册需管理员审核通过方可登录
- FR-3: 管理员可创建/编辑/删除排班任务
- FR-4: 管理员可为任务配置排班日期、时段、每时段人数需求
- FR-5: 成员可为每个时段填报可用性（可用-高/中/低偏好、不可用、不关心）
- FR-6: 填报截止后自动锁定，成员不可再修改
- FR-7: 系统提供贪心+规则引擎排班算法，满足硬约束并优化软约束
- FR-8: 管理员可对排班结果进行手动调整
- FR-9: 排班结果确认发布后成员可查看
- FR-10: 所有API需JWT认证，区分管理员和成员权限

## 5. Non-Goals (Out of Scope for MVP)

- 不实现邮件/短信通知功能
- 不实现实时WebSocket推送
- 不实现复杂报表和数据导出（如Excel/PDF）
- 不实现OAuth第三方登录
- 不实现容器化部署（Docker/K8s）
- 不实现多语言国际化
- 不实现移动端原生应用
- 不实现API限流和高级安全防护

## 6. Technical Architecture

```
┌─────────────────────────────────────────────────┐
│                  前端 (React 18 + TypeScript)                 │
│  ┌──────────────────┐  ┌──────────────────────┐  │
│  │  client (用户端)   │  │  admin (管理端)       │  │
│  │  - 注册/登录       │  │  - 注册/登录          │  │
│  │  - 志愿填报        │  │  - 成员管理           │  │
│  │  - 排班结果查看     │  │  - 排班任务管理        │  │
│  │                   │  │  - 排班执行/调整       │  │
│  └────────┬─────────┘  └──────────┬───────────┘  │
└───────────┼───────────────────────┼──────────────┘
            │       HTTP/REST       │
┌───────────┼───────────────────────┼──────────────┐
│           └──────────┬────────────┘              │
│                  ┌────┴─────┐                    │
│                  │  Nginx   │                    │
│                  └────┬─────┘                    │
│  ┌────────────────────┴──────────────────────┐   │
│  │          后端 (FastAPI + Python 3.11)             │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐   │   │
│  │  │ Auth     │ │ Schedule │ │ Members  │   │   │
│  │  │ Module   │ │ Module   │ │ Module   │   │   │
│  │  └──────────┘ └──────────┘ └──────────┘   │   │
│  │  ┌──────────────────────────────────────┐  │   │
│  │  │ Scheduling Engine (Greedy + Rules)   │  │   │
│  │  └──────────────────────────────────────┘  │   │
│  └────────────────────────────────────────────┘   │
│              │                                    │
│              ▼                                    │
│  ┌──────────────────┐                             │
│  │   PostgreSQL     │                             │
│  └──────────────────┘                             │
└───────────────────────────────────────────────────┘
```

### 目录结构

```
e:\E_projects\final_project\
├── client/                    # 用户端 (React + TypeScript)
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── public/
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── api/               # API请求封装
│   │   ├── components/        # 通用组件
│   │   ├── pages/             # 页面组件
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── TaskSubmit.tsx  # 志愿填报
│   │   │   └── ScheduleResult.tsx
│   │   ├── hooks/             # 自定义hooks
│   │   ├── stores/            # 状态管理 (Zustand)
│   │   └── types/             # TypeScript类型定义
│   └── index.html
│
├── admin/                     # 管理端 (React + TypeScript)
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── public/
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Members.tsx        # 成员管理
│   │   │   ├── TaskCreate.tsx     # 创建排班任务
│   │   │   ├── TaskDetail.tsx     # 任务详情+排班
│   │   │   └── ScheduleView.tsx   # 排班结果查看/调整
│   │   ├── hooks/
│   │   ├── stores/
│   │   └── types/
│   └── index.html
│
├── backend/                   # 后端 (FastAPI + Python 3.11)
│   ├── pyproject.toml
│   ├── alembic.ini
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   ├── config.py       # 配置
│   │   │   ├── security.py     # JWT/密码
│   │   │   ├── database.py     # 数据库连接
│   │   │   └── dependencies.py # 依赖注入
│   │   ├── models/             # SQLAlchemy模型
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── task.py
│   │   │   ├── slot.py
│   │   │   ├── application.py
│   │   │   └── assignment.py
│   │   ├── schemas/            # Pydantic schemas
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── task.py
│   │   │   ├── slot.py
│   │   │   ├── application.py
│   │   │   └── assignment.py
│   │   ├── api/               # API路由
│   │   │   ├── __init__.py
│   │   │   ├── deps.py
│   │   │   └── v1/
│   │   │       ├── __init__.py
│   │   │       ├── auth.py
│   │   │       ├── users.py
│   │   │       ├── tasks.py
│   │   │       ├── applications.py
│   │   │       └── schedule.py
│   │   ├── services/          # 业务逻辑
│   │   │   ├── __init__.py
│   │   │   ├── auth.py
│   │   │   ├── user.py
│   │   │   ├── task.py
│   │   │   ├── application.py
│   │   │   └── scheduling/
│   │   │       ├── __init__.py
│   │   │       ├── engine.py      # 排班引擎入口
│   │   │       ├── greedy.py      # 贪心算法
│   │   │       └── rules.py       # 规则引擎
│   │   └── utils/
│   │       ├── __init__.py
│   │       └── enums.py
│   └── alembic/
│       └── versions/
│
└── scripts/                   # 辅助脚本
```

## 7. Technical Considerations

- **性能**: FastAPI异步特性处理志愿填报截止前的并发提交；排班算法单次执行时间预期<30秒(100人×20时段)
- **安全**: 密码bcrypt哈希；JWT双token机制；API权限中间件区分角色
- **数据库**: PostgreSQL，SQLAlchemy 2.0 async模式 + asyncpg驱动
- **排班算法 MVP阶段**: 贪心策略 + 规则引擎。先满足硬约束（每时段人数、时间冲突），再优化软约束（偏好满足、工时均衡）
- **前端状态管理**: Zustand（轻量级，适合MVP）
- **HTTP客户端**: axios + React Query (TanStack Query) 处理服务端状态

## 8. Success Metrics

- 管理员创建排班任务到发布结果的全流程操作不超过10分钟
- 排班算法在100人×20时段规模下，执行时间 < 30秒
- 硬约束满足率 100%（每时段人数达标、无时间冲突）
- 成员偏好满足率 > 70%
- 前端页面加载时间 < 2秒

## 9. Open Questions

- 排班算法的公平性度量指标具体如何计算（工时方差 vs 偏好满足率权重）
- 是否需要在MVP中支持排班冲突的自动检测与提示（手动调整时）
- 排班任务是否支持重复周期（如每周同一时间），MVP先做单次任务
- 前后端分离部署时CORS策略和开发代理配置

## 10. Multi-Phase Implementation Plan

### 阶段一：项目基础设施 (第1周)
- 创建目录结构和脚手架代码
- 配置conda py311虚拟环境
- 初始化FastAPI后端项目（配置、数据库连接、基础中间件）
- 初始化client和admin的React + Vite前端项目
- 配置Alembic迁移
- 配置git并推送到远程仓库

### 阶段二：用户认证与权限系统 (第2周)
- 数据库模型：User
- JWT认证API（注册、登录、刷新token）
- 管理员审核成员API
- 前端登录/注册页面（client + admin）
- 权限中间件和路由保护

### 阶段三：排班任务管理（管理端核心）(第3周)
- 数据库模型：Task, Slot
- 创建/编辑/删除排班任务API
- 时段管理和配置API
- 管理端任务管理页面
- 成员管理页面（审核列表）

### 阶段四：志愿填报（用户端核心）(第4周)
- 数据库模型：Application
- 志愿填报API（CRUD，截止时间锁定）
- 用户端任务列表和填报页面
- 填报状态和进度展示

### 阶段五：排班算法与结果管理 (第5-6周)
- 贪心+规则引擎排班算法实现
- 排班执行API
- 排班结果查看/调整API
- 管理端排班视图（日历样式）
- 用户端排班结果查看

### 阶段六：集成测试与优化 (第7周)
- 前后端联调
- API自动化测试
- 排班算法参数调优
- Bug修复和性能优化
- 最终git提交和文档完善
