import { pSql } from "#app/config/database"
import { apiHandler, response } from "#app/utils/http"

async function getDrops() {
  const drops = await pSql.drop.findMany({
    include: {
      purchases: {
        take: 3,
        orderBy: { purchasedAt: "desc" },
        include: {
          user: {
            select: { username: true }
          }
        }
      }
    }
  })

  return response({
    message: "ok",
    data: drops
  })
}

export const publicDropEventsController = {
  getDrops: apiHandler(getDrops)
}
