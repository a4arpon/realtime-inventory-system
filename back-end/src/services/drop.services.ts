import type { Prisma } from "@local-prisma-client"

import type { pSql } from "#app/config/database"
import { BadRequestError } from "#app/utils/http"

export async function updateDropStock(
  client: typeof pSql | Prisma.TransactionClient,
  dropId: string,
  amount: number = 1
) {
  await client.drop.update({
    where: {
      id: dropId
    },
    data: {
      availableStock:
        amount > 0
          ? {
              increment: Math.abs(amount)
            }
          : {
              decrement: Math.abs(amount)
            }
    }
  })
}

export async function dropEventsFindOne(
  client: typeof pSql | Prisma.TransactionClient,
  id: string
) {
  const drop = await client.drop.findFirst({
    where: {
      id: id
    }
  })

  if (!drop) {
    throw new BadRequestError("Drop is not found with this id")
  }

  return drop
}
