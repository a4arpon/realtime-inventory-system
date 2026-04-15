import { pSql } from "#app/config/database"
import { BadRequestError } from "#app/utils/http"
import { getSIO } from "#app/web-socket"

import { updateDropStock } from "./drop.services"

export async function expireReservations() {
  const currentTime = new Date()

  // Note: raw SQL used to SKIP LOCKED for multi-node safety
  const expired = await pSql.$queryRaw<Array<{ id: string; dropId: string }>>`
      SELECT id, "dropId"
      FROM "Reservation"
      WHERE status = 'active' AND "expiresAt" < ${currentTime}
      FOR UPDATE SKIP LOCKED
      LIMIT 100
    `

  if (expired.length === 0) return

  const reservationIds = expired.map((r) => r.id)
  const drops = expired.map((r) => ({
    qty: 1,
    dropId: r.dropId
  }))

  await pSql.$transaction(async (tx) => {
    await tx.reservation.updateMany({
      where: { id: { in: reservationIds } },
      data: { status: "expired" }
    })

    await Promise.all(
      drops.map((drop) => updateDropStock(tx, drop.dropId, drop.qty))
    )
  })

  const uniqueDropIds = [...new Set(expired.map((r) => r.dropId))]

  const dropsWithStock = await Promise.all(
    uniqueDropIds.map(async (dropId) => {
      const drop = await pSql.drop.findUnique({
        where: { id: dropId },
        select: { availableStock: true }
      })
      return { dropId, availableStock: drop?.availableStock ?? 0 }
    })
  )

  for (const { dropId, availableStock } of dropsWithStock) {
    getSIO().emit("realtime-drop:inventory", { dropId, availableStock })
  }

  return { expired }
}

export async function atomicReserve(userId: string, dropId: string) {
  const trxResponse = await pSql.$transaction(
    async (tx) => {
      const existing = await tx.reservation.findFirst({
        where: { userId: userId, dropId: dropId, status: "active" }
      })
      if (existing) {
        throw new BadRequestError(
          "You already have an active reservation for this drop"
        )
      }

      const updatedDrop = await tx.drop.updateMany({
        where: { id: dropId, availableStock: { gt: 0 } },
        data: { availableStock: { decrement: 1 } }
      })
      if (updatedDrop.count === 0) {
        throw new BadRequestError("Out of stock")
      }

      // 60 Seconds reservation lock
      const reservation = await tx.reservation.create({
        data: {
          userId,
          dropId,
          expiresAt: new Date(Date.now() + 60_000),
          status: "active",
          quantity: 1
        }
      })
      return reservation
    },
    {
      isolationLevel: "Serializable"
    }
  )

  const drop = await pSql.drop.findUnique({
    where: {
      id: dropId
    },
    select: {
      id: true,
      availableStock: true
    }
  })

  getSIO().emit("realtime-drop:inventory", {
    dropId: drop?.id,
    availableStock: drop?.availableStock
  })

  return trxResponse
}
