import type { NextFunction, Request, Response } from "express"

export const response = (props: {
  message?: string
  data?: object | null | [object]
  success?: boolean
  extra?: {
    pagination?: {
      limit: number
      page: number
      total: number
    }
  }
}) => {
  return {
    success: props.success ?? true,
    message: props.message || "Success",
    data: props.data || null,
    extra: props.extra || null
  }
}

export class AppError extends Error {
  statusCode: number
  constructor(message: string, statusCode: number) {
    super(message)
    this.statusCode = statusCode
  }
}

export class BadRequestError extends AppError {
  constructor(message: string) {
    super(message, 400)
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string) {
    super(message, 401)
  }
}

export const apiHandler =
  (fn: any) => (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next))
      .then((result) => {
        if (result !== undefined) {
          res.json(result)
        }
      })
      .catch(next)
