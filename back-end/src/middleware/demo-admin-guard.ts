import type { NextFunction, Request, Response } from "express"

import { UnauthorizedError } from "#app/utils/http"

// --------------------------------------------------------
// This statically token is not standard.
// It is only used to save time.
// --------------------------------------------------------
// In production proper backend authentication is required
// --------------------------------------------------------

const ADMIN_TOKEN = "ddecbc49-e121-48bc-829c-eef4f4eb186b"

export function adminGuard(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new UnauthorizedError("Missing or invalid Authorization header")
  }

  const token = authHeader.split(" ")[1]

  if (!token || token !== ADMIN_TOKEN) {
    throw new UnauthorizedError("Invalid admin token")
  }

  next()
}
