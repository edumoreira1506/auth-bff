import express from 'express'
import { withBodyValidation } from '@cig-platform/core'

import UserController from '@Controllers/UserController'
import { authUserSchema, storeUserSchema } from '@Schemas/UserSchemas'
import withTokenAuthorization from '@Middlewares/withTokenAuthoritzation'

const router = express.Router()

router.post('/auth', withBodyValidation(authUserSchema), UserController.auth)

router.post('/refresh-token', withTokenAuthorization, UserController.refreshToken)

router.post('/users', withBodyValidation(storeUserSchema), UserController.store)

export default router
