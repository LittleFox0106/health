import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL || ''
  // 添加 pgbouncer 参数，解决 Supabase 连接池 prepared statement 冲突
  if (url.includes('pooler.supabase.com') && !url.includes('pgbouncer=true')) {
    return url + (url.includes('?') ? '&' : '?') + 'pgbouncer=true'
  }
  return url
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasourceUrl: getDatabaseUrl(),
  log: process.env.NODE_ENV === 'development' ? ['error'] : [],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
