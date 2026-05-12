import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error'] : [],
  })
}

// 检查是否在构建阶段（Vercel构建时没有DATABASE_URL或只有占位符）
const isBuildPhase = !process.env.DATABASE_URL || 
  process.env.DATABASE_URL.includes('[YOUR-PASSWORD]') ||
  process.env.DATABASE_URL.includes('localhost')

// 构建阶段返回模拟对象，运行时使用真实客户端
export const prisma = globalForPrisma.prisma ?? (
  isBuildPhase 
    ? ({
        user: { create: async () => ({}), findUnique: async () => null },
        quizSession: { update: async () => ({}), findUnique: async () => null },
        subscription: { update: async () => ({}), create: async () => ({}) },
      } as unknown as PrismaClient)
    : createPrismaClient()
)

if (!isBuildPhase && process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma as PrismaClient
}
