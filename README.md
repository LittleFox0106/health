# 健康测评系统

基于 Next.js + TypeScript + Supabase + Prisma 的全栈健康测评应用。

## 技术栈

- **前端**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **后端**: Next.js API Routes
- **数据库**: Supabase (PostgreSQL)
- **ORM**: Prisma
- **部署**: Vercel

## 快速开始

### 1. 克隆项目并安装依赖

```bash
cd my-app
npm install
```

### 2. 配置环境变量

复制 `.env.local` 并填写您的 Supabase 凭证：

```bash
DATABASE_URL="postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"
```

### 3. 初始化数据库

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 4. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

## API 文档

### 1. 创建会话
```bash
POST /api/session
```

### 2. 获取进度
```bash
GET /api/quiz/progress?sessionId={sessionId}
```

### 3. 更新进度
```bash
PUT /api/quiz/progress
Content-Type: application/json

{
  "sessionId": "sess_xxx",
  "step": 1,
  "data": { "gender": "male" }
}
```

### 4. 计算结果
```bash
POST /api/quiz/calculate
Content-Type: application/json

{
  "sessionId": "sess_xxx",
  "data": { "exerciseFreq": "moderate" }
}
```

### 5. 获取结果
```bash
GET /api/quiz/result?sessionId={sessionId}
```

### 6. 模拟支付
```bash
POST /api/pay
Content-Type: application/json

{
  "sessionId": "sess_xxx",
  "planType": "monthly",
  "amount": 29.99
}
```

## 测试流程

```bash
# 1. 创建会话
SESSION_RESPONSE=$(curl -s -X POST http://localhost:3000/api/session)
SESSION_ID=$(echo $SESSION_RESPONSE | grep -o '"sessionId":"[^"]*"' | cut -d'"' -f4)
echo "Session ID: $SESSION_ID"

# 2. 更新第1步（性别）
curl -X PUT http://localhost:3000/api/quiz/progress \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\":\"$SESSION_ID\",\"step\":1,\"data\":{\"gender\":\"male\"}}"

# 3. 更新第2步（目标）
curl -X PUT http://localhost:3000/api/quiz/progress \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\":\"$SESSION_ID\",\"step\":2,\"data\":{\"goal\":\"lose_weight\"}}"

# 4. 更新第3步（身体数据）
curl -X PUT http://localhost:3000/api/quiz/progress \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\":\"$SESSION_ID\",\"step\":3,\"data\":{\"age\":28,\"height\":175,\"weight\":80,\"targetWeight\":70}}"

# 5. 计算结果（第4步）
curl -X POST http://localhost:3000/api/quiz/calculate \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\":\"$SESSION_ID\",\"data\":{\"exerciseFreq\":\"moderate\"}}"

# 6. 获取结果（未付费）
curl "http://localhost:3000/api/quiz/result?sessionId=$SESSION_ID"

# 7. 模拟支付
curl -X POST http://localhost:3000/api/pay \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\":\"$SESSION_ID\",\"planType\":\"monthly\",\"amount\":29.99}"

# 8. 获取结果（已付费）
curl "http://localhost:3000/api/quiz/result?sessionId=$SESSION_ID"
```

## 数据库 Schema

### Users 表
- `id`: UUID (PK)
- `sessionId`: String (Unique)
- `createdAt`: DateTime
- `updatedAt`: DateTime

### QuizSessions 表
- `id`: UUID (PK)
- `userId`: String (FK)
- `currentStep`: Int
- `isCompleted`: Boolean
- `gender`: String?
- `goal`: String?
- `age`: Int?
- `height`: Int?
- `weight`: Float?
- `targetWeight`: Float?
- `exerciseFreq`: String?
- `bmi`: Float?
- `dailyCalories`: Int?
- `targetDate`: DateTime?

### Subscriptions 表
- `id`: UUID (PK)
- `userId`: String (FK)
- `status`: String
- `planType`: String?
- `startedAt`: DateTime?
- `expiresAt`: DateTime?
- `paymentId`: String?
- `paidAmount`: Float?
- `paidAt`: DateTime?

## 部署到 Vercel

```bash
npm i -g vercel
vercel
```

## 项目结构

```
my-app/
├── src/
│   ├── app/
│   │   ├── (quiz)/              # 测评流程页面
│   │   ├── api/                 # API路由
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── hooks/                   # 自定义Hooks
│   ├── lib/                     # 工具库
│   ├── types/                   # 类型定义
│   └── ...
├── prisma/
│   └── schema.prisma           # 数据库Schema
└── ...
```

## 功能特性

- ✅ 分步测评流程（5个步骤）
- ✅ 进度自动保存和恢复
- ✅ BMI、BMR、TDEE 健康计算
- ✅ 会员权限控制（差异化返回）
- ✅ 模拟支付系统
- ✅ 预测曲线生成
- ✅ 个性化建议

## License

MIT
