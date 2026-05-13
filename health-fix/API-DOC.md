# 健康测评系统 API 文档

**Base URL**: `https://health-b9skr32zl-littlefox0106s-projects.vercel.app`

**测试账号**:
- VIP 用户: `vip@test.com` / `123456` (已付费)
- 普通用户: `normal@test.com` / `123456` (未付费)

---

## 目录

1. [认证相关](#认证相关)
2. [测评相关](#测评相关)
3. [支付相关](#支付相关)
4. [完整测试脚本](#完整测试脚本)
5. [付费前后对比](#付费前后对比)

---

## 认证相关

### POST `/api/auth/register` — 注册新账号

**请求**:
```bash
curl -X POST '{BASE_URL}/api/auth/register' \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "123456"
  }'
```

**参数说明**:
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| email | string | 是 | 邮箱地址 |
| password | string | 是 | 密码（至少6位） |

**成功响应 (200)**:
```json
{
  "success": true,
  "data": {
    "token": "550e8400-e29b-41d4-a716-446655440000",
    "account": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "test@example.com",
      "nickname": null
    },
    "sessionId": "sess_a1b2c3d4e5f6..."
  }
}
```

**错误响应 (400)**:
```json
{
  "success": false,
  "error": "该邮箱已被注册"
}
```

---

### POST `/api/auth/login` — 登录

**请求**:
```bash
curl -X POST '{BASE_URL}/api/auth/login' \
  -H "Content-Type: application/json" \
  -d '{
    "email": "vip@test.com",
    "password": "123456"
  }'
```

**参数说明**:
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| email | string | 是 | 邮箱地址 |
| password | string | 是 | 密码 |

**成功响应 (200)**:
```json
{
  "success": true,
  "data": {
    "token": "550e8400-e29b-41d4-a716-446655440000",
    "account": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "vip@test.com",
      "nickname": "VIP用户"
    },
    "sessionId": "sess_vip_xxxxxxxxxxxx",
    "subscription": {
      "status": "active",
      "planType": "lifetime"
    }
  }
}
```

**错误响应 (401)**:
```json
{
  "success": false,
  "error": "密码错误"
}
```

---

### GET `/api/auth/me?token={token}` — 获取当前用户信息

**请求**:
```bash
curl '{BASE_URL}/api/auth/me?token=550e8400-e29b-41d4-a716-446655440000'
```

**参数说明**:
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| token | string | 是 | 账号 ID（登录时返回的 token） |

**成功响应 (200)**:
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "vip@test.com",
    "nickname": "VIP用户",
    "user": {
      "sessionId": "sess_vip_xxxxxxxxxxxx"
    },
    "subscription": {
      "status": "active",
      "planType": "lifetime"
    }
  }
}
```

---

### POST `/api/auth/bind` — 绑定匿名会话到账号

**请求**:
```bash
curl -X POST '{BASE_URL}/api/auth/bind' \
  -H "Content-Type: application/json" \
  -d '{
    "token": "550e8400-e29b-41d4-a716-446655440000",
    "sessionId": "sess_xxxxxxxxxxxx"
  }'
```

**参数说明**:
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| token | string | 是 | 账号 ID |
| sessionId | string | 是 | 匿名会话 ID |

**成功响应 (200)**:
```json
{
  "success": true
}
```

**错误响应 (400)**:
```json
{
  "success": false,
  "error": "该会话已绑定账号"
}
```

---

## 测评相关

### POST `/api/session` — 创建匿名会话

**请求**:
```bash
curl -X POST '{BASE_URL}/api/session'
```

**成功响应 (200)**:
```json
{
  "success": true,
  "data": {
    "sessionId": "sess_a1b2c3d4e5f6789012345678",
    "userId": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

---

### GET `/api/quiz/progress?sessionId={sessionId}` — 获取测评进度

**请求**:
```bash
curl '{BASE_URL}/api/quiz/progress?sessionId=sess_a1b2c3d4e5f6789012345678'
```

**参数说明**:
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| sessionId | string | 是 | 会话 ID |

**成功响应 (200)**:
```json
{
  "success": true,
  "data": {
    "currentStep": 3,
    "quizData": {
      "gender": "male",
      "goal": "lose_weight",
      "age": 28,
      "height": 175,
      "weight": 80,
      "targetWeight": 70
    },
    "isCompleted": false
  }
}
```

---

### PUT `/api/quiz/progress` — 更新测评进度

**第 1 步：性别**
```bash
curl -X PUT '{BASE_URL}/api/quiz/progress' \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "sess_xxx",
    "step": 1,
    "data": {
      "gender": "male"
    }
  }'
```

**第 2 步：目标**
```bash
curl -X PUT '{BASE_URL}/api/quiz/progress' \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "sess_xxx",
    "step": 2,
    "data": {
      "goal": "lose_weight"
    }
  }'
```

**第 3 步：身体数据**
```bash
curl -X PUT '{BASE_URL}/api/quiz/progress' \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "sess_xxx",
    "step": 3,
    "data": {
      "age": 28,
      "height": 175,
      "weight": 80,
      "targetWeight": 70
    }
  }'
```

**参数说明**:
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| sessionId | string | 是 | 会话 ID |
| step | number | 是 | 步骤 (1-4) |
| data | object | 是 | 步骤数据 |

**成功响应 (200)**:
```json
{
  "success": true,
  "data": {
    "currentStep": 3,
    "nextStep": 4
  }
}
```

---

### POST `/api/quiz/calculate` — 计算健康指标

**请求**:
```bash
curl -X POST '{BASE_URL}/api/quiz/calculate' \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "sess_xxx",
    "data": {
      "exerciseFreq": "moderate"
    }
  }'
```

**参数说明**:
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| sessionId | string | 是 | 会话 ID |
| data.exerciseFreq | string | 是 | 运动频率 |

**exerciseFreq 枚举值**:
- `sedentary` - 久坐不动
- `light` - 轻度运动 (1-3天/周)
- `moderate` - 中度运动 (3-5天/周)
- `active` - 高强度运动 (6-7天/周)
- `very_active` - 专业运动员

**成功响应 (200)**:
```json
{
  "success": true,
  "data": {
    "bmi": 26.1,
    "bmiCategory": "overweight",
    "dailyCalories": 2043,
    "targetDate": "2026-09-23",
    "daysToGoal": 133,
    "subscriptionStatus": "inactive"
  }
}
```

---

### GET `/api/quiz/result?sessionId={sessionId}` — 获取测评结果

**请求**:
```bash
curl '{BASE_URL}/api/quiz/result?sessionId=sess_xxx'
```

**参数说明**:
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| sessionId | string | 是 | 会话 ID |

**未付费响应**:
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

**已付费响应**:
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
        { "day": 14, "weight": 79.4, "date": "2026-05-27" }
      ],
      "recommendations": [
        "您的BMI偏高，建议控制饮食热量，增加有氧运动。",
        "建议每周进行3-5次有氧运动，每次30-60分钟。",
        "控制饮食中的碳水化合物摄入，增加蛋白质比例。"
      ]
    }
  }
}
```

---

## 支付相关

### POST `/api/pay` — 模拟支付

**请求**:
```bash
curl -X POST '{BASE_URL}/api/pay' \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "sess_xxx",
    "planType": "monthly",
    "amount": 29.99
  }'
```

**参数说明**:
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| sessionId | string | 是 | 会话 ID |
| planType | string | 是 | 订阅类型 |
| amount | number | 是 | 支付金额 |

**planType 价格表**:
| 类型 | 价格 | 说明 |
|------|------|------|
| monthly | 29.99 | 月度订阅 |
| yearly | 199.99 | 年度订阅（省 44%） |
| lifetime | 499.99 | 终身会员 |

> **安全说明**: 服务端硬编码价格表，不信任前端传入的金额。如果 amount 与 planType 不匹配，接口返回 400 错误。

**成功响应 (200)**:
```json
{
  "success": true,
  "data": {
    "paymentId": "pay_a1b2c3d4e5f6...",
    "status": "success",
    "subscription": {
      "status": "active",
      "planType": "monthly",
      "startedAt": "2026-05-13T10:00:00.000Z",
      "expiresAt": "2026-06-13T10:00:00.000Z"
    }
  }
}
```

**错误响应 (400)**:
```json
{
  "success": false,
  "error": "支付金额与套餐不匹配"
}
```

---

## 完整测试脚本

以下脚本可在线上环境完整跑通 funnel 全流程：

```bash
#!/bin/bash

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
echo " - 步骤1完成"

# 第 2 步：目标
curl -s -X PUT "$BASE_URL/api/quiz/progress" \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\":\"$SESSION_ID\",\"step\":2,\"data\":{\"goal\":\"lose_weight\"}}"
echo " - 步骤2完成"

# 第 3 步：身体数据
curl -s -X PUT "$BASE_URL/api/quiz/progress" \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\":\"$SESSION_ID\",\"step\":3,\"data\":{\"age\":28,\"height\":175,\"weight\":80,\"targetWeight\":70}}"
echo " - 步骤3完成"

# 第 4 步 + 计算
echo -e "\n=== 3. 计算结果 ==="
curl -s -X POST "$BASE_URL/api/quiz/calculate" \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\":\"$SESSION_ID\",\"data\":{\"exerciseFreq\":\"moderate\"}}"
echo ""

# ===== 4. 查看未付费结果（预览） =====
echo -e "\n=== 4. 未付费结果（预览） ==="
curl -s "$BASE_URL/api/quiz/result?sessionId=$SESSION_ID" | python3 -m json.tool 2>/dev/null || curl -s "$BASE_URL/api/quiz/result?sessionId=$SESSION_ID"

# ===== 5. 模拟支付 =====
echo -e "\n\n=== 5. 模拟支付（月度订阅） ==="
curl -s -X POST "$BASE_URL/api/pay" \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\":\"$SESSION_ID\",\"planType\":\"monthly\",\"amount\":29.99}" | python3 -m json.tool 2>/dev/null || curl -s -X POST "$BASE_URL/api/pay" \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\":\"$SESSION_ID\",\"planType\":\"monthly\",\"amount\":29.99}"

# ===== 6. 查看已付费结果（完整报告） =====
echo -e "\n\n=== 6. 已付费结果（完整报告） ==="
curl -s "$BASE_URL/api/quiz/result?sessionId=$SESSION_ID" | python3 -m json.tool 2>/dev/null || curl -s "$BASE_URL/api/quiz/result?sessionId=$SESSION_ID"

echo -e "\n\n=== 测试完成 ==="
echo "Session ID: $SESSION_ID"
echo "可使用此 Session ID 再次调用 /api/quiz/result 查看结果"
```

**运行方式**:
```bash
chmod +x test-api.sh
./test-api.sh
```

---

## 付费前后对比

### 未付费状态 (`subscriptionStatus: "inactive"`)

**可查看内容**:
- BMI 值和分类
- 每日建议摄入热量

**锁定内容**:
- 目标日期
- 达成天数
- 进度预测曲线
- 个性化建议

**返回结构**:
```json
{
  "subscriptionStatus": "inactive",
  "preview": { ... },
  "lockedContent": { ... },
  "upgradeMessage": "...",
  "upgradePlans": [ ... ]
}
```

### 已付费状态 (`subscriptionStatus: "active"`)

**可查看内容**:
- 所有基础数据（BMI、热量）
- 目标达成日期
- 剩余天数
- 完整的进度预测曲线（SVG 图表数据）
- 个性化健康建议（3-5 条）

**返回结构**:
```json
{
  "subscriptionStatus": "active",
  "fullReport": {
    "bmi": ...,
    "dailyCalories": ...,
    "targetDate": "...",
    "daysToGoal": ...,
    "progressCurve": [ ... ],
    "recommendations": [ ... ]
  }
}
```

---

## 状态码说明

| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 400 | 请求参数错误 |
| 401 | 认证失败（密码错误） |
| 404 | 资源不存在（账号/会话不存在） |
| 429 | 请求过于频繁（触发速率限制） |
| 500 | 服务器内部错误 |

---

## 数据验证规则

| 字段 | 规则 |
|------|------|
| email | 必须符合邮箱格式 |
| password | 至少 6 位字符 |
| sessionId | 必须以 `sess_` 开头，后跟 32 位 hex |
| gender | `male` 或 `female` |
| goal | `lose_weight`, `build_muscle`, `maintain` |
| age | 整数，1-150 |
| height | 整数，50-300 (cm) |
| weight | 数字，0-500 (kg) |
| exerciseFreq | `sedentary`, `light`, `moderate`, `active`, `very_active` |
| planType | `monthly`, `yearly`, `lifetime` |
| amount | 必须与 planType 对应的价格匹配（允许 0.01 误差） |
