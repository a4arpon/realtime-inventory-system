import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({ connectionString })

export const prisma = new PrismaClient({
  log: ["error", "warn"],
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

// Connection pool for production
if (process.env.NODE_ENV === "production") {
  prisma.$connect()
}

// Graceful shutdown
export async function disconnect() {
  await prisma.$disconnect()
}
