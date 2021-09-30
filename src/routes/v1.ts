import express from 'express'
import { withBodyValidation } from '@cig-platform/core'

import UserController from '@Controllers/UserController'
import { authUserSchema, storeUserSchema } from '@Schemas/UserSchemas'
import BreederController from '@Controllers/BreederController'
import withTokenAuthorization from '@Middlewares/withTokenAuthoritzation'
import withBreederPermission from '@Middlewares/withBreederPermission'

const router = express.Router()

router.post('/auth', withBodyValidation(authUserSchema), UserController.auth)

router.post('/auth/refresh', withTokenAuthorization, UserController.refreshToken)

router.post('/users', withBodyValidation(storeUserSchema), UserController.store)

router.patch('/breeders/:breederId', withTokenAuthorization, withBreederPermission, BreederController.update)

export default router
