// oxlint-disable typescript/no-explicit-any
import type { Request, Response, NextFunction } from "express"
import { type ZodMiniObject } from "zod/mini"

import { BadRequestError } from "../utils/http"

type Source = "body" | "query" | "params"

export function zValidate(schema: ZodMiniObject, source: Source = "body") {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const validated = await schema.parseAsync(req[source])
      req[source] = validated
      next()
    } catch (error: any) {
      if (error?.name === "$ZodError") {
        const message = JSON.parse(error?.message)
          .map((err: any) => `${err.path.join(".")}: ${err.message}`)
          .join(", ")
        next(new BadRequestError(message))
      } else {
        next(error)
      }
    }
  }
}
