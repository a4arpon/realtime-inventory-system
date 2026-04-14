import { pSql } from "#app/config/database"
import { BadRequestError } from "#app/utils/http"

export async function getUser(sessionId: string) {
  const user = await pSql.user.findFirst({
    where: {
      sessionId: sessionId
    }
  })

  if (!user) {
    throw new BadRequestError("User not found")
  }

  return user.id
}
