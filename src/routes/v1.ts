import express from 'express'
import { withBodyValidation } from '@cig-platform/core'

import UserController from '@Controllers/UserController'
import {
  authUserSchema,
  recoverPasswordSchema,
  storeUserSchema,
  editPasswordSchema,
  updateUserSchema
} from '@Schemas/UserSchemas'
import withTokenAuthorization from '@Middlewares/withTokenAuthoritzation'

const router = express.Router()

router.post('/auth', withBodyValidation(authUserSchema), UserController.auth)

router.post('/refresh-token', withTokenAuthorization, UserController.refreshToken)

router.post('/recover-password', withBodyValidation(recoverPasswordSchema), UserController.recoverPassword)

router.post('/users', withBodyValidation(storeUserSchema), UserController.store)

router.patch('/users/password', withTokenAuthorization, withBodyValidation(editPasswordSchema), UserController.editPassword)

router.patch('/edit-profile', withTokenAuthorization, withBodyValidation(updateUserSchema), UserController.editProfile)

router.get('/profile-data', withTokenAuthorization, UserController.getUserData)

export default router
