// oxlint-disable no-console
import http from "node:http"

import { app } from "./app"
import { connectDb, disconnectDb } from "./config/database"
import { ENV } from "./config/env"
import { expireReservations } from "./services/reservation.services"

const server = http.createServer(app)

const cleanupInterval = setInterval(async () => {
  try {
    await expireReservations()
  } catch (err) {
    console.error("Expiration cleanup failed:", err)
  }
}, 10_000)

server.listen(ENV.PORT, async () => {
  await connectDb()

  console.log(
    `${ENV.isProd ? "Production" : "Development"} Server running on http://localhost:${ENV.PORT}`
  )
})

if (ENV.isProd) {
  let isShuttingDown = false

  const gracefulShutdown = (signal: string) => {
    if (isShuttingDown) return
    isShuttingDown = true

    console.log(`${signal} received. Shutting down...`)

    server.close(async () => {
      await disconnectDb()

      clearInterval(cleanupInterval)
      console.log("HTTP server closed")
      process.exit(0)
    })

    setTimeout(() => {
      console.error("Force shutdown after timeout")
      process.exit(1)
    }, 4_000)
  }

  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"))
  process.on("SIGINT", () => gracefulShutdown("SIGINT"))
} else {
  process.on("SIGTERM", () => process.exit(0))
  process.on("SIGINT", () => process.exit(0))
}

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection:", reason)
  process.exit(1)
})
