# 健康测评系统

基于 Next.js 14 + TypeScript + Prisma + Supabase PostgreSQL 的全栈健康测评应用。用户通过 5 步渐进式测评获取个性化健康方案，支持匿名测评与账号绑定，包含模拟支付与会员权限体系。

## 线上演示

**演示地址**：[https://health-b9skr32zl-littlefox0106s-projects.vercel.app/](https://health-b9skr32zl-littlefox0106s-projects.vercel.app/)

### 测试账号

| 角色 | 邮箱 | 密码 | 说明 |
|------|------|------|------|
| VIP 用户 | `vip@test.com` | `123456` | 已激活终身会员，可直接查看完整报告 |
| 普通用户 | `normal@test.com` | `123456` | 未付费，仅可查看报告预览 |

### 演示流程

1. 打开演示地址，匿名完成 5 步测评
2. 在结果页点击付费 → 弹出登录框 → 使用 `normal@test.com` 登录
3. 对比付费前后的差异化返回（预览 vs 完整报告）
4. 退出登录，使用 `vip@test.com` 登录，查看 VIP 用户的完整报告

## 技术栈

| 层级 | 技术 |
|------|------|
| **前端** | Next.js 14 (App Router) + TypeScript + Tailwind CSS |
| **后端** | Next.js API Routes (force-dynamic) |
| **ORM** | Prisma v6 |
| **数据库** | Supabase (PostgreSQL + PgBouncer) |
| **部署** | Vercel + GitHub 自动部署 |
| **密码加密** | Node.js crypto.scrypt |

## 功能特性

- 分步测评流程（性别 → 目标 → 身体数据 → 运动频率 → 结果）
- BMI / BMR / TDEE 健康指标计算（Mifflin-St Jeor 公式）
- 非线性进度预测曲线（SVG 渲染，无第三方图表依赖）
- 个性化健康建议生成
- 匿名测评 → 登录绑定 → 模拟支付 全链路
- 会员权限控制（免费预览 vs 完整报告）
- 登录状态持久化（localStorage + Token 验证）
- 首页智能检测已完成的测评
- 数据隔离（不同账号之间 session 完全隔离）

## 快速开始

### 1. 克隆项目并安装依赖

```bash
git clone https://github.com/LittleFox0106/health.git
cd health-fix
npm install
```

### 2. 配置环境变量

创建 `.env.local` 文件：

```env
# Supabase 连接池地址（用于生产环境）
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres"

# Supabase 直连地址（用于迁移）
DIRECT_URL="postgresql://postgres.[project-ref]:[password]@db.[project-ref].supabase.co:5432/postgres"
```

### 3. 初始化数据库

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 4. 创建测试账号（可选）

```bash
npx tsx prisma/seed.ts
```

### 5. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

## 项目结构

```
health-fix/
├── prisma/
│   ├── schema.prisma          # 数据库模型定义（4 个模型）
│   └── seed.ts                # 测试数据种子脚本
├── src/
│   ├── app/
│   │   ├── (quiz)/            # 测评流程页面组
│   │   │   ├── step-1-gender/     # 第 1 步：性别选择
│   │   │   ├── step-2-goal/       # 第 2 步：目标选择
│   │   │   ├── step-3-body/       # 第 3 步：身体数据
│   │   │   ├── step-4-exercise/   # 第 4 步：运动频率
│   │   │   ├── step-5-result/     # 第 5 步：结果与支付
│   │   │   ├── layout.tsx         # 测评布局
│   │   │   └── components/
│   │   │       └── QuizProgress.tsx
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── register/route.ts  # 注册
│   │   │   │   ├── login/route.ts     # 登录
│   │   │   │   ├── me/route.ts        # 用户信息
│   │   │   │   └── bind/route.ts      # 绑定匿名会话
│   │   │   ├── session/route.ts       # 创建匿名会话
│   │   │   ├── quiz/
│   │   │   │   ├── progress/route.ts  # 测评进度 CRUD
│   │   │   │   ├── calculate/route.ts # 计算健康指标
│   │   │   │   └── result/route.ts    # 获取结果（含权限）
│   │   │   └── pay/route.ts           # 模拟支付
│   │   ├── layout.tsx             # 根布局（Header + AuthButton）
│   │   ├── page.tsx               # 首页
│   │   └── globals.css
│   ├── components/
│   │   ├── AuthButton.tsx         # 右上角登录/用户菜单
│   │   └── AuthModal.tsx          # 登录/注册弹窗
│   ├── hooks/
│   │   ├── useAuth.ts             # 认证状态管理
│   │   ├── useSession.ts          # 匿名会话管理
│   │   └── useQuiz.ts             # 测评流程状态管理
│   ├── lib/
│   │   ├── prisma.ts              # Prisma 客户端（PgBouncer 兼容）
│   │   ├── validators.ts          # 数据验证器 + 价格表
│   │   ├── rate-limit.ts          # 内存速率限制器
│   │   └── calculator.ts          # 健康指标计算引擎
│   └── types/
│       └── index.ts               # TypeScript 类型定义
├── next.config.mjs
├── package.json
└── tsconfig.json
```

## 数据库 Schema

### ER 关系图

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│   Account    │       │     User     │       │  QuizSession │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ id (PK)      │──1:1──│ id (PK)      │──1:1──│ id (PK)      │
│ email (UQ)   │       │ sessionId(UQ)│       │ userId (FK,UQ)│
│ password     │       │ accountId(FK)│       │ currentStep   │
│ nickname     │       │ createdAt    │       │ isCompleted   │
│ createdAt    │       │ updatedAt    │       │ gender        │
│ updatedAt    │       └──────┬───────┘       │ goal          │
└──────────────┘              │               │ age/height    │
                              │               │ weight        │
                              │ 1:1           │ exerciseFreq  │
                     ┌────────┴───────┐       │ bmi/calories  │
                     │ Subscription  │       │ targetDate    │
                     ├──────────────┤       └──────────────┘
                     │ id (PK)      │
                     │ userId (FK)  │
                     │ status       │
                     │ planType     │
                     │ paidAmount   │
                     │ startedAt    │
                     │ expiresAt    │
                     └──────────────┘
```

### 模型说明

| 模型 | 表名 | 说明 | 关键字段 |
|------|------|------|----------|
| **Account** | `accounts` | 账号表（邮箱密码登录） | `id`, `email`(UQ), `password`, `nickname` |
| **User** | `users` | 用户表（基于匿名 Session） | `id`, `sessionId`(UQ), `accountId`(UQ) |
| **QuizSession** | `quiz_sessions` | 测评会话表（存储测评数据） | `id`, `userId`(UQ), `gender`, `goal`, `age`, `height`, `weight`, `bmi`, `dailyCalories` |
| **Subscription** | `subscriptions` | 订阅表（会员状态管理） | `id`, `userId`(UQ), `status`, `planType`, `paidAmount`, `expiresAt` |

### 关系说明

- **Account ↔ User**：一对一（一个账号对应一个测评用户）
- **User ↔ QuizSession**：一对一（级联删除）
- **User ↔ Subscription**：一对一（级联删除）
- **Account 删除时**：User 的 accountId 置空（SetNull），不删除测评数据

## API 文档

Base URL：`https://health-b9skr32zl-littlefox0106s-projects.vercel.app`

### 认证相关

#### POST `/api/auth/register` — 注册新账号

```bash
curl -X POST '{BASE_URL}/api/auth/register' \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}'
```

响应：
```json
{
  "success": true,
  "data": {
    "token": "uuid-of-account-id",
    "account": { "id": "...", "email": "test@example.com", "nickname": null },
    "sessionId": "sess_xxxxxxxxxxxx"
  }
}
```

#### POST `/api/auth/login` — 登录

```bash
curl -X POST '{BASE_URL}/api/auth/login' \
  -H "Content-Type: application/json" \
  -d '{"email":"vip@test.com","password":"123456"}'
```

响应：
```json
{
  "success": true,
  "data": {
    "token": "uuid-of-account-id",
    "account": { "id": "...", "email": "vip@test.com", "nickname": "VIP用户" },
    "sessionId": "sess_vip_xxxxxxxxxxxx"
  }
}
```

#### GET `/api/auth/me?token=xxx` — 获取当前用户信息

```bash
curl '{BASE_URL}/api/auth/me?token=<account-id>'
```

#### POST `/api/auth/bind` — 绑定匿名会话到账号

```bash
curl -X POST '{BASE_URL}/api/auth/bind' \
  -H "Content-Type: application/json" \
  -d '{"token":"<account-id>","sessionId":"sess_xxx"}'
```

### 测评相关

#### POST `/api/session` — 创建匿名会话

```bash
curl -X POST '{BASE_URL}/api/session'
```

响应：
```json
{ "success": true, "data": { "sessionId": "sess_xxx", "userId": "uuid" } }
```

#### GET `/api/quiz/progress?sessionId=xxx` — 获取测评进度

```bash
curl '{BASE_URL}/api/quiz/progress?sessionId=sess_xxx'
```

#### PUT `/api/quiz/progress` — 更新测评进度

```bash
# 第 1 步：性别
curl -X PUT '{BASE_URL}/api/quiz/progress' \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"sess_xxx","step":1,"data":{"gender":"male"}}'

# 第 2 步：目标
curl -X PUT '{BASE_URL}/api/quiz/progress' \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"sess_xxx","step":2,"data":{"goal":"lose_weight"}}'

# 第 3 步：身体数据
curl -X PUT '{BASE_URL}/api/quiz/progress' \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"sess_xxx","step":3,"data":{"age":28,"height":175,"weight":80,"targetWeight":70}}'

# 第 4 步：运动频率（通过 calculate 接口提交）
curl -X POST '{BASE_URL}/api/quiz/calculate' \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"sess_xxx","data":{"exerciseFreq":"moderate"}}'
```

#### GET `/api/quiz/result?sessionId=xxx` — 获取测评结果

```bash
# 未付费：返回预览数据（BMI + 热量）
curl '{BASE_URL}/api/quiz/result?sessionId=sess_xxx'

# 已付费：返回完整报告（含进度曲线、目标日期、个性化建议）
curl '{BASE_URL}/api/quiz/result?sessionId=sess_xxx'
```

### 支付相关

#### POST `/api/pay` — 模拟支付

```bash
curl -X POST '{BASE_URL}/api/pay' \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"sess_xxx","planType":"monthly","amount":29.99}'
```

价格表：

| planType | 价格 | 说明 |
|----------|------|------|
| `monthly` | 29.99 | 月度订阅 |
| `yearly` | 199.99 | 年度订阅（省 44%） |
| `lifetime` | 499.99 | 终身会员 |

> **安全说明**：服务端硬编码价格表，不信任前端传入的金额。如果 amount 与 planType 不匹配，接口返回 400 错误。

## 完整 API 测试脚本（可重放）

以下脚本可在线上环境完整跑通 funnel 全流程。将 `{BASE_URL}` 替换为实际地址即可。

```bash
BASE_URL="https://health-b9skr32zl-littlefox0106s-projects.vercel.app"

# ===== 1. 创建匿名会话 =====
echo "=== 1. 创建匿名会话 ==="
SESSION=$(curl -s -X POST "$BASE_URL/api/session")
SESSION_ID=$(echo $SESSION | grep -o '"sessionId":"[^"]*"' | cut -d'"' -f4)
echo "Session ID: $SESSION_ID"

# ===== 2. 完成测评（4 步） =====
echo -e "\n=== 2. 完成测评 ==="

# 第 1 步：性别
curl -s -X PUT "$BASE_URL/api/quiz/progress" \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\":\"$SESSION_ID\",\"step\":1,\"data\":{\"gender\":\"male\"}}"
echo ""

# 第 2 步：目标
curl -s -X PUT "$BASE_URL/api/quiz/progress" \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\":\"$SESSION_ID\",\"step\":2,\"data\":{\"goal\":\"lose_weight\"}}"
echo ""

# 第 3 步：身体数据
curl -s -X PUT "$BASE_URL/api/quiz/progress" \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\":\"$SESSION_ID\",\"step\":3,\"data\":{\"age\":28,\"height\":175,\"weight\":80,\"targetWeight\":70}}"
echo ""

# 第 4 步 + 计算
echo -e "\n=== 3. 计算结果 ==="
curl -s -X POST "$BASE_URL/api/quiz/calculate" \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\":\"$SESSION_ID\",\"data\":{\"exerciseFreq\":\"moderate\"}}"
echo ""

# ===== 4. 查看未付费结果（预览） =====
echo -e "\n=== 4. 未付费结果（预览） ==="
curl -s "$BASE_URL/api/quiz/result?sessionId=$SESSION_ID" | python3 -m json.tool

# ===== 5. 模拟支付 =====
echo -e "\n=== 5. 模拟支付（月度订阅） ==="
curl -s -X POST "$BASE_URL/api/pay" \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\":\"$SESSION_ID\",\"planType\":\"monthly\",\"amount\":29.99}" | python3 -m json.tool

# ===== 6. 查看已付费结果（完整报告） =====
echo -e "\n=== 6. 已付费结果（完整报告） ==="
curl -s "$BASE_URL/api/quiz/result?sessionId=$SESSION_ID" | python3 -m json.tool
```

### 付费前后差异化对比

**未付费返回**（`subscriptionStatus: "inactive"`）：
```json
{
  "success": true,
  "data": {
    "subscriptionStatus": "inactive",
    "preview": {
      "bmi": 26.1,
      "bmiCategory": "overweight",
      "dailyCalories": 2043
    },
    "lockedContent": {
      "targetDate": true,
      "daysToGoal": true,
      "progressCurve": true,
      "recommendations": true
    },
    "upgradeMessage": "订阅查看完整报告和个性化方案",
    "upgradePlans": [
      { "type": "monthly", "price": 29.99, "period": "月" },
      { "type": "yearly", "price": 199.99, "period": "年" },
      { "type": "lifetime", "price": 499.99, "period": "永久" }
    ]
  }
}
```

**已付费返回**（`subscriptionStatus: "active"`）：
```json
{
  "success": true,
  "data": {
    "subscriptionStatus": "active",
    "fullReport": {
      "bmi": 26.1,
      "bmiCategory": "overweight",
      "dailyCalories": 2043,
      "targetDate": "2026-09-23",
      "daysToGoal": 133,
      "progressCurve": [
        { "day": 0, "weight": 80.0, "date": "2026-05-13" },
        { "day": 7, "weight": 79.7, "date": "2026-05-20" },
        ...
      ],
      "recommendations": [
        "您的BMI偏高，建议控制饮食热量，增加有氧运动。",
        "建议每周进行3-5次有氧运动，每次30-60分钟。",
        ...
      ]
    }
  }
}
```

## 安全措施

- **密码加密**：scrypt 算法，salt:hex 格式存储
- **数据验证**：13 个类型守卫验证器覆盖所有输入参数（email、UUID、sessionId、gender、goal、age、height、weight 等）
- **支付安全**：服务端硬编码价格表（`validators.ts` 中的 `PLAN_PRICES`），不信任前端传入金额，允许 0.01 浮点误差
- **速率限制**：登录 5 次/分钟，注册 3 次/分钟（内存级限流器，5 分钟自动清理）
- **Token 验证**：每次页面加载向后端验证 Token 有效性
- **防御性验证**：从数据库读取的数据也进行二次校验（calculate 接口验证 gender/goal）
- **数据隔离**：登录后自动切换到该账号绑定的 session，不同账号之间数据完全隔离

## 部署到 Vercel

```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel

# 在 Vercel Dashboard 中配置环境变量：
# DATABASE_URL = Supabase 连接池地址
# DIRECT_URL = Supabase 直连地址
```

> 注意：Vercel 部署时需要在环境变量中同时配置 `DATABASE_URL`（连接池）和 `DIRECT_URL`（直连），Prisma 会自动选择合适的连接方式。

## 开发备忘

- 所有 API 路由使用 `export const dynamic = 'force-dynamic'` 避免 Vercel 构建时执行
- Prisma 客户端通过动态 `import('@/lib/prisma')` 引入，避免构建时连接数据库
- Supabase PgBouncer 兼容通过在 URL 中添加 `?pgbouncer=true` 实现
- Account 与 User 为一对一关系（schema 中使用 `user User?` 单数形式）
- 登录/注册/Token 验证时自动切换到账号绑定的 session（数据隔离）

## License

MIT
