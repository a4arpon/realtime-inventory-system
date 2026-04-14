import { Router } from "express"

import { publicReservationsController } from "#app/controllers/public-reservations"
import { authGuard } from "#app/middleware/demo-auth-guard"
import { zValidate } from "#app/middleware/zod-validator"
import { dropIdSchema, reserveIdSchema } from "#app/validators/common"

export const publicReservationsRoutes = Router()

publicReservationsRoutes.use(authGuard)

publicReservationsRoutes.get(
  "/my-reservations",

  publicReservationsController.myReservations
)

publicReservationsRoutes.post(
  "/reserve-drop",

  zValidate(dropIdSchema),

  publicReservationsController.createReservation
)

publicReservationsRoutes.post(
  "/purchase-reserved-drop",

  zValidate(reserveIdSchema),

  publicReservationsController.purchaseReservedDrop
)
