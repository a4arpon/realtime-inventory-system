import { z } from "zod/mini"

export const uuidParamSchema = z.object({
  id: z.uuid()
})

export const dropIdSchema = z.object({
  dropId: z.uuid()
})

export const reserveIdSchema = z.object({
  reserveId: z.uuid()
})
