import { randomUUID } from "node:crypto"

import randomName from "@scaleway/random-name"

import { pSql } from "#app/config/database"
import { apiHandler, response } from "#app/utils/http"

async function createUser() {
  const data = {
    sessionId: randomUUID(),
    username: randomName("", "_")
  }

  const user = await pSql.user.create({
    data: data
  })

  return response({
    message: "User created",
    data: user
  })
}

export const publicUsersController = {
  createUser: apiHandler(createUser)
}
