import { Router } from "express"

import { adminDropEventsController } from "#app/controllers/admin-drop-events"
import { adminGuard } from "#app/middleware/demo-admin-guard"
import { zValidate } from "#app/middleware/zod-validator"
import { dropEventsZSchemas } from "#app/validators/drop-events"

export const adminDropEventsRoutes = Router()

adminDropEventsRoutes.use(adminGuard)

adminDropEventsRoutes.post(
  "/create-drop",

  zValidate(dropEventsZSchemas.createDrop),

  adminDropEventsController.createDrop
)

adminDropEventsRoutes.get(
  "/get-drops",

  adminDropEventsController.getDrops
)
