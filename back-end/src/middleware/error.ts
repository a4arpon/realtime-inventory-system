import type { NextFunction, Request, Response } from "express"

import { AppError, response } from "#app/utils/http"

export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json(
      response({
        success: false,
        message: err.message
      })
    )
  }
  console.error(err)
  return res.status(500).json(
    response({
      success: false,
      message: "Internal server error"
    })
  )
}
