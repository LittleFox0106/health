import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error'] : [],
  })
}

// 只在非构建时创建客户端
const prisma = globalForPrisma.prisma ?? (
  process.env.NEXT_PHASE === 'phase-production-build' 
    ? undefined as unknown as PrismaClient
    : createPrismaClient()
)

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export { prisma }
