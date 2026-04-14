import { Router } from "express"

import { publicDropEventsController } from "#app/controllers/public-drop-events"

export const publicDropEventsRoutes = Router()

publicDropEventsRoutes.get("/get-drops", publicDropEventsController.getDrops)
