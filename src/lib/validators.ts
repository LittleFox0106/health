// 通用验证工具

// 验证邮箱格式
export function isValidEmail(email: unknown): email is string {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// 验证密码（至少6位）
export function isValidPassword(password: unknown): password is string {
  return typeof password === 'string' && password.length >= 6
}

// 验证 sessionId 格式（sess_ 开头 + 32位hex）
export function isValidSessionId(sessionId: unknown): sessionId is string {
  return typeof sessionId === 'string' && /^sess_[a-f0-9]{32}$/.test(sessionId)
}

// 验证 UUID 格式
export function isValidUUID(id: unknown): id is string {
  return typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
}

// 验证性别
export function isValidGender(gender: unknown): gender is 'male' | 'female' {
  return gender === 'male' || gender === 'female'
}

// 验证目标
export function isValidGoal(goal: unknown): goal is 'lose_weight' | 'build_muscle' | 'maintain' {
  return goal === 'lose_weight' || goal === 'build_muscle' || goal === 'maintain'
}

// 验证运动频率
export function isValidExerciseFreq(freq: unknown): freq is 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active' {
  return ['sedentary', 'light', 'moderate', 'active', 'very_active'].includes(freq as string)
}

// 验证订阅计划类型
export function isValidPlanType(plan: unknown): plan is 'monthly' | 'yearly' | 'lifetime' {
  return plan === 'monthly' || plan === 'yearly' || plan === 'lifetime'
}

// 验证年龄范围
export function isValidAge(age: unknown): age is number {
  return typeof age === 'number' && Number.isInteger(age) && age >= 1 && age <= 150
}

// 验证身高范围（cm）
export function isValidHeight(height: unknown): height is number {
  return typeof height === 'number' && Number.isInteger(height) && height >= 50 && height <= 300
}

// 验证体重范围（kg）
export function isValidWeight(weight: unknown): weight is number {
  return typeof weight === 'number' && weight > 0 && weight <= 500
}

// 验证步骤范围
export function isValidStep(step: unknown): step is number {
  return typeof step === 'number' && Number.isInteger(step) && step >= 1 && step <= 5
}

// 服务端价格表（不信任前端传入的金额）
export const PLAN_PRICES: Record<string, number> = {
  monthly: 29.99,
  yearly: 199.99,
  lifetime: 499.99,
}

// 验证支付金额是否匹配计划
export function validatePaymentAmount(planType: string, amount: number): boolean {
  const expected = PLAN_PRICES[planType]
  if (!expected) return false
  // 允许 0.01 的浮点误差
  return Math.abs(amount - expected) < 0.01
}
