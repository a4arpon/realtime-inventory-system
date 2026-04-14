import { z } from "zod/mini"

const createOne = z.object({
  name: z.string().check(z.minLength(3), z.maxLength(100)),
  price: z.number().check(z.positive(), z.float64()),
  stock: z.number().check(z.int(), z.positive())
})

const adjustStock = z.object({
  dropId: z.uuid(),
  amount: z.number().check(z.int())
})

export const dropEventsZSchemas = {
  createDrop: createOne,
  adjustStock: adjustStock
}
