import http from "node:http"

import { app } from "./app"
import { ENV } from "./config/env"

const server = http.createServer(app)

server.listen(ENV.PORT, () => {
  console.log(
    `${ENV.isProd ? "Production" : "Development"} Server running on http://localhost:${ENV.PORT}`
  )
})

if (!ENV.isProd) {
  process.on("SIGTERM", () => process.exit(0))
  process.on("SIGINT", () => process.exit(0))
} else {
  let isShuttingDown = false

  async function gracefulShutdown(signal: string) {
    if (isShuttingDown) return
    isShuttingDown = true

    console.log(`${signal} received. Shutting down...`)

    server.close(() => {
      console.log("HTTP server closed")

      process.exit(0)
    })

    setTimeout(() => {
      console.error("Force shutdown after timeout")
      process.exit(1)
    }, 10_000)
  }

  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"))
  process.on("SIGINT", () => gracefulShutdown("SIGINT"))
}

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection:", reason)
  process.exit(1)
})
