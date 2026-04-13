import { z } from "zod/mini"

const createOne = z.object({
  name: z.string().check(z.minLength(3), z.maxLength(100)),
  price: z.number().check(z.positive()),
  totalStock: z.number().check(z.int(), z.positive())
})

const updateOne = z.extend(createOne, {
  availableStock: z.number().check(z.int(), z.positive())
})

export const dropEventsZSchemas = {
  createDrop: createOne,
  updateDrop: z.partial(updateOne)
}
