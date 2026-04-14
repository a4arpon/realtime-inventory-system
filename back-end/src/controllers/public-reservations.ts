import type { Request } from "express"
import type { z } from "zod/mini"

import { atomicReserve } from "#app/services/reservation.services"
import { getUser } from "#app/services/users.services"
import { apiHandler, response } from "#app/utils/http"
import type { uuidParamSchema } from "#app/validators/common"

async function myReservations() {
  return response({
    message: "hello world"
  })
}

async function purchaseReservedDrop() {
  return response({
    message: ""
  })
}

async function createReservation(req: Request) {
  const { id: dropId } = req.body as z.infer<typeof uuidParamSchema>
  const sessionId = req.sessionId

  const user = await getUser(sessionId)

  const reservation = await atomicReserve(user, dropId)
  return response({
    message: "Reservation created",
    data: reservation
  })
}

export const publicReservationsController = {
  myReservations: apiHandler(myReservations),
  purchaseReservedDrop: apiHandler(purchaseReservedDrop),
  createReservation: apiHandler(createReservation)
}
