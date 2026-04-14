import { Router } from "express"

import { publicUsersController } from "#app/controllers/public-users"

export const publicUsersRouter = Router()

publicUsersRouter.post("/create-user", publicUsersController.createUser)
