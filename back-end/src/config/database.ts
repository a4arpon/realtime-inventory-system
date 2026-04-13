import { PrismaPg } from "@prisma/adapter-pg"

import { PrismaClient } from "#app/utils/prisma/client"

import { ENV } from "./env"

const adapter = new PrismaPg({ connectionString: ENV.DATABASE_URL })

export const prisma = new PrismaClient({ adapter })

export async function disconnectDb() {
  await prisma.$disconnect()
}

export async function connectDb() {
  await prisma.$connect()
  console.log("Database connected...")
}
