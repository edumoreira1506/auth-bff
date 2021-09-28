import express from 'express'
import { withBodyValidation } from '@cig-platform/core'

import UserController from '@Controllers/UserController'
import { authUserSchema, storeUserSchema } from '@Schemas/UserSchemas'
import BreederController from '@Controllers/BreederController'

const router = express.Router()

router.post('/auth', withBodyValidation(authUserSchema), UserController.auth)

router.post('/users', withBodyValidation(storeUserSchema), UserController.store)

router.patch('/breeders/:breederId', BreederController.update)

export default router
