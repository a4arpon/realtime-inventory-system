import type { NextFunction, Request, Response } from "express"
import { z } from "zod/mini"

import { UnauthorizedError } from "#app/utils/http"

declare global {
  namespace Express {
    interface Request {
      sessionId: string
    }
  }
}
const sessionIdSchema = z.string().check(z.length(48))

export function authGuard(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new UnauthorizedError("Missing or invalid Authorization header")
  }

  const token = authHeader.split(" ")[1]

  if (!token) {
    throw new UnauthorizedError("Invalid admin token")
  }

  const result = sessionIdSchema.safeParse(token)
  if (!result.success) {
    throw new UnauthorizedError("Invalid session ID format (must be UUID)")
  }

  req.sessionId = result.data

  next()
}
