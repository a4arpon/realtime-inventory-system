import { z } from "zod/mini"

export const uuidParamSchema = z.object({
  id: z.uuid()
})
