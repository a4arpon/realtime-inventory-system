import type { Request } from "express"
import type { z } from "zod/mini"

import { pSql } from "#app/config/database"
import { apiHandler, response } from "#app/utils/http"
import type { dropEventsZSchemas } from "#app/validators/drop-events"

async function createDrop(req: Request) {
  const jsonPayload = req.body as z.infer<typeof dropEventsZSchemas.createDrop>

  await pSql.drop.create({
    data: {
      name: jsonPayload.name,
      price: jsonPayload.price,
      totalStock: jsonPayload.totalStock,
      availableStock: jsonPayload.totalStock
    }
  })

  return response({
    message: "Drop created successfully"
  })
}

async function getDrops() {
  const drops = await pSql.drop.findMany()

  return response({
    data: drops
  })
}

export const adminDropEventsController = {
  createDrop: apiHandler(createDrop),
  getDrops: apiHandler(getDrops)
}
