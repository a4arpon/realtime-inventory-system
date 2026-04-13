import { PrismaClient } from "@local-prisma-client"
import { PrismaPg } from "@prisma/adapter-pg"

import { ENV } from "./env"

const adapter = new PrismaPg({ connectionString: ENV.DATABASE_URL })

export const pSql = new PrismaClient({ adapter })

export async function disconnectDb() {
  await pSql.$disconnect()
}

export async function connectDb() {
  await pSql.$connect()
  console.log("Database connected...")
}
