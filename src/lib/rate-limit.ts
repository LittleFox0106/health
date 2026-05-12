// 简单的内存速率限制器（适用于单实例部署）
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetInMs: number
}

/**
 * 检查是否允许请求
 * @param key 限制键（如 IP 地址或 email）
 * @param maxRequests 时间窗口内最大请求数
 * @param windowMs 时间窗口（毫秒）
 */
export function rateLimit(
  key: string,
  maxRequests: number,
  windowMs: number = 60 * 1000
): RateLimitResult {
  const now = Date.now()
  const record = rateLimitMap.get(key)

  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs })
    return { allowed: true, remaining: maxRequests - 1, resetInMs: windowMs }
  }

  if (record.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetInMs: record.resetTime - now,
    }
  }

  record.count++
  return {
    allowed: true,
    remaining: maxRequests - record.count,
    resetInMs: record.resetTime - now,
  }
}

// 定期清理过期记录（每5分钟）
if (typeof globalThis !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, record] of rateLimitMap.entries()) {
      if (now > record.resetTime) {
        rateLimitMap.delete(key)
      }
    }
  }, 5 * 60 * 1000)
}
