import express from 'express'
import { withBodyValidation } from '@cig-platform/core'

import UserController from '@Controllers/UserController'
import { authUserSchema } from '@Schemas/UserSchemas'

const router = express.Router()

router.post('/auth', withBodyValidation(authUserSchema), UserController.auth)

export default router
