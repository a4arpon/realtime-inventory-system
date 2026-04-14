import type { Request } from "express"
import type { z } from "zod/mini"

import { pSql } from "#app/config/database"
import { dropEventsFindOne, updateDropStock } from "#app/services/drop.services"
import { apiHandler, response } from "#app/utils/http"
import type { dropEventsZSchemas } from "#app/validators/drop-events"

async function createDrop(req: Request) {
  const jsonPayload = req.body as z.infer<typeof dropEventsZSchemas.createDrop>

  await pSql.drop.create({
    data: {
      name: jsonPayload.name,
      price: Number.parseFloat(Number(jsonPayload?.price).toFixed(2)),
      availableStock: jsonPayload.stock
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

async function adjustDropStock(req: Request) {
  const jsonPayload = req.body as z.infer<typeof dropEventsZSchemas.adjustStock>

  const drop = await dropEventsFindOne(pSql, jsonPayload.dropId)

  await updateDropStock(pSql, drop.id, jsonPayload.amount)

  return response({
    message: "Drop stock updated"
  })
}

export const adminDropEventsController = {
  createDrop: apiHandler(createDrop),
  getDrops: apiHandler(getDrops),
  adjustDropStock: apiHandler(adjustDropStock)
}
