import { Router } from "express"

import { publicReservationsController } from "#app/controllers/public-reservations"
import { authGuard } from "#app/middleware/demo-auth-guard"

export const publicReservationsRoutes = Router()

publicReservationsRoutes.use(authGuard)

publicReservationsRoutes.get(
  "/my-reservations",

  publicReservationsController.myReservations
)

publicReservationsRoutes.post(
  "/purchase-reserved-drop",

  publicReservationsController.purchaseReservedDrop
)
