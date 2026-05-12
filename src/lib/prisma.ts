import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

let _prisma: PrismaClient | undefined

function getPrismaClient(): PrismaClient {
  if (_prisma) return _prisma
  
  _prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error'] : [],
  })
  
  return _prisma
}

export const prisma = new Proxy({} as PrismaClient, {
  get(target, prop) {
    const client = getPrismaClient()
    const value = (client as Record<string | symbol, unknown>)[prop]
    if (typeof value === 'function') {
      return value.bind(client)
    }
    return value
  },
})

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = getPrismaClient()
}
