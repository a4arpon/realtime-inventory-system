import cors from "cors"
import express from "express"
import rateLimit from "express-rate-limit"
import helmet from "helmet"
import morgan from "morgan"

import { ENV } from "./config/env"
import { errorHandler } from "./middleware/error"
import { adminDropEventsRoutes } from "./routes/admin-drop-events"
import { AppError, BadRequestError, response } from "./utils/http"

export const app = express()

app.use(express.json({ limit: "1mb", strict: true }))

// Only GET, POST, DELETE methods are allowed
// To reduce the attack surface and reducing options to
// pick from bunch of HTTP methods to save time.
app.use(cors({ origin: ENV.FRONTEND_URL, methods: ["GET", "POST", "DELETE"] }))

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    xPoweredBy: false,
    noSniff: true,
    frameguard: {
      action: "deny"
    },
    xXssProtection: true
  })
)

app.use(
  rateLimit({
    // 60s
    windowMs: 60 * 1000,
    // 30 rpS
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests" }
  })
)

app.use(morgan("dev"))

app.get("/", (_req, res) => {
  res.json(
    response({
      message: "Hello world !!!"
    })
  )
})

app.get("/error", (_req, _res) => {
  throw new BadRequestError("Error !!!")
})

// ----------------------------------------------------------------
// Application routes
// ----------------------------------------------------------------

app.use("/admin-drops", adminDropEventsRoutes)

// ----------------------------------------------------------------
// Error handling
// ----------------------------------------------------------------

app.use((req) => {
  throw new AppError(`Cannot ${req.method} ${req.path}`, 404)
})

app.use(errorHandler)
