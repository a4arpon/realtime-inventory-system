import type { Request } from "express"
import { z } from "zod/mini"

import { pSql } from "#app/config/database"
import { atomicReserve } from "#app/services/reservation.services"
import { getUser } from "#app/services/users.services"
import {
  apiHandler,
  BadRequestError,
  response,
  UnauthorizedError
} from "#app/utils/http"
import type { dropIdSchema, reserveIdSchema } from "#app/validators/common"
import { getSIO } from "#app/web-socket"

async function myReservations(req: Request) {
  const sessionId = req.sessionId

  const userId = await getUser(sessionId)

  const reservations = await pSql.reservation.findMany({
    where: {
      userId: userId
    },
    include: {
      drop: true
    },
    orderBy: {
      createdAt: "desc"
    }
  })

  return response({
    message: "ok",
    data: reservations
  })
}

async function createReservation(req: Request) {
  const { dropId } = req.body as z.infer<typeof dropIdSchema>
  const sessionId = req.sessionId

  const user = await getUser(sessionId)

  const reservation = await atomicReserve(user, dropId)
  return response({
    message: "Reservation created",
    data: reservation
  })
}

async function purchaseReservedDrop(req: Request) {
  const sessionId = req.sessionId
  const { reserveId } = req.body as z.infer<typeof reserveIdSchema>

  const userId = await getUser(sessionId)

  const trxResult = await pSql.$transaction(async (trx) => {
    const reservation = await trx.reservation.findUnique({
      where: { id: reserveId }
    })

    if (!reservation) throw new BadRequestError("reservation: Not found")
    if (reservation.userId !== userId) throw new UnauthorizedError("Not yours")
    if (reservation.status !== "active") throw new BadRequestError("Not active")
    if (reservation.expiresAt < new Date()) throw new BadRequestError("Expired")

    const purchase = await trx.purchase.create({
      data: {
        userId,
        dropId: reservation.dropId,
        quantity: reservation.quantity
      }
    })

    await trx.reservation.update({
      where: { id: reserveId },
      data: { status: "completed" }
    })

    return {
      purchaseId: purchase.id,
      reservation: reservation
    }
  })

  const drop = await pSql.drop.findUnique({
    where: {
      id: trxResult?.reservation?.dropId
    },
    select: {
      id: true,
      availableStock: true,

      purchases: {
        take: 3,
        orderBy: {
          purchasedAt: "desc"
        },
        select: {
          quantity: true,
          user: {
            select: {
              username: true
            }
          }
        }
      }
    }
  })

  getSIO().emit("realtime-drop:inventory", {
    dropId: drop?.id,
    availableStock: drop?.availableStock
  })
  getSIO().emit("realtime-drop:purchases", {
    dropId: drop?.id,
    purchases: drop?.purchases
  })

  return response({
    message: "ok",
    data: trxResult
  })
}

export const publicReservationsController = {
  myReservations: apiHandler(myReservations),
  purchaseReservedDrop: apiHandler(purchaseReservedDrop),
  createReservation: apiHandler(createReservation)
}
