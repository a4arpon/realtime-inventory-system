import cors from "cors"
import express from "express"
import rateLimit from "express-rate-limit"
import helmet from "helmet"
import morgan from "morgan"

import { errorHandler } from "./middleware/error"
import { AppError, BadRequestError, response } from "./utils/http"

export const app = express()

app.use(express.json({ limit: "1mb" }))
app.use(cors({ origin: process.env.FRONTEND_URL }))
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
  })
)
app.use(
  rateLimit({
    windowMs: 60 * 1000, // 60s
    max: 30, // 30 rpS
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

app.use((req) => {
  throw new AppError(`Cannot ${req.method} ${req.path}`, 404)
})

app.use(errorHandler)
