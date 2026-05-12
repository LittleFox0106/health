# 健康测评系统

基于 Next.js 14 + TypeScript + Prisma + Supabase PostgreSQL 的全栈健康测评应用。用户通过 5 步渐进式测评获取个性化健康方案，支持匿名测评与账号绑定，包含模拟支付与会员权限体系。

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

## 快速开始

### 1. 克隆项目并安装依赖

```bash
git clone <repo-url>
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

测试账号：
- VIP 用户：`vip@test.com` / `123456`（已激活终身会员）
- 普通用户：`free@test.com` / `123456`（未付费）

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

## 数据库模型

```
Account (1) ──→ (1) User ──→ (1) QuizSession
                      │
                      └──→ (1) Subscription
```

| 模型 | 说明 | 关键字段 |
|------|------|----------|
| **Account** | 账号表（邮箱密码登录） | email, password, nickname |
| **User** | 用户表（基于匿名 Session） | sessionId, accountId |
| **QuizSession** | 测评会话表 | gender, goal, age, height, weight, bmi, dailyCalories |
| **Subscription** | 订阅表 | status, planType, paidAmount, expiresAt |

## API 文档

### 认证相关

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/auth/register` | 注册新账号 |
| POST | `/api/auth/login` | 登录 |
| GET | `/api/auth/me?token=xxx` | 获取当前用户信息 |
| POST | `/api/auth/bind` | 绑定匿名会话到账号 |

### 测评相关

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/session` | 创建匿名会话 |
| GET | `/api/quiz/progress?sessionId=xxx` | 获取测评进度 |
| PUT | `/api/quiz/progress` | 更新测评进度 |
| POST | `/api/quiz/calculate` | 计算健康指标 |
| GET | `/api/quiz/result?sessionId=xxx` | 获取测评结果 |

### 支付相关

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/pay` | 模拟支付 |

### 请求/响应示例

```bash
# 创建会话
curl -X POST http://localhost:3000/api/session

# 更新第 1 步（性别）
curl -X PUT http://localhost:3000/api/quiz/progress \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"sess_xxx","step":1,"data":{"gender":"male"}}'

# 更新第 3 步（身体数据）
curl -X PUT http://localhost:3000/api/quiz/progress \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"sess_xxx","step":3,"data":{"age":28,"height":175,"weight":80,"targetWeight":70}}'

# 计算结果
curl -X POST http://localhost:3000/api/quiz/calculate \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"sess_xxx","data":{"exerciseFreq":"moderate"}}'

# 模拟支付
curl -X POST http://localhost:3000/api/pay \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"sess_xxx","planType":"monthly","amount":29.99}'
```

## 安全措施

- **密码加密**：scrypt 算法，salt:hex 格式存储
- **数据验证**：13 个类型守卫验证器覆盖所有输入参数
- **支付安全**：服务端硬编码价格表，不信任前端传入金额
- **速率限制**：登录 5 次/分钟，注册 3 次/分钟
- **Token 验证**：每次页面加载向后端验证 Token 有效性
- **防御性验证**：从数据库读取的数据也进行二次校验

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

## License

MIT
