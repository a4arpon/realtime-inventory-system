import { pSql } from "#app/config/database"

import { updateDropStock } from "./drop.services"

export async function expireReservations() {
  const currentTime = new Date()

  console.log("Clearing expired reservations: ", currentTime.toISOString())

  const expired = await pSql.reservation.findMany({
    where: {
      status: "active",
      expiresAt: { lte: currentTime }
    },
    include: { drop: true }
  })

  if (expired.length === 0) return

  const reservationIds = expired.map((r) => r.id)
  const drops = expired.map((r) => ({
    qty: r.quantity,
    dropId: r.dropId
  }))

  await pSql.$transaction(async (tx) => {
    await tx.reservation.updateMany({
      where: {
        id: {
          in: reservationIds
        }
      },
      data: { status: "expired" }
    })

    drops?.map(async (drop) => await updateDropStock(tx, drop.dropId, drop.qty))
  })

  return { expired }
}
