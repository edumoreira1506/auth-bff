import { Request, Response } from 'express'
import { AuthError, BaseController } from '@cig-platform/core'

import UserAggregator from '@Aggregators/UserAggregator'
import { AuthenticatedRequest } from '@Types/request'
import i18n from '@Configs/i18n'
import AccountServiceClient from '@Clients/AccountServiceClient'

class UserController {
  constructor() {
    this.auth = this.auth.bind(this)
    this.store = this.store.bind(this)
    this.editPassword = this.editPassword.bind(this)
    this.editProfile = this.editProfile.bind(this)
    this.getUserData = this.getUserData.bind(this)
  }

  @BaseController.errorHandler()
  async auth(req: Request, res: Response): Promise<Response> {
    const email = req.body.email
    const password = req.body.password
    const type = req.body.type
    const externalId = req.body.externalId

    const token = await UserAggregator.auth(email, password, type, externalId)

    return BaseController.successResponse(res, { token })
  }

  @BaseController.errorHandler()
  async refreshToken(req: AuthenticatedRequest, res: Response) {
    if (!req.user) throw new AuthError()

    const token = await UserAggregator.refreshToken(req.user)

    return BaseController.successResponse(res, { token })
  }

  @BaseController.errorHandler()
  async store(req: Request, res: Response): Promise<Response> {
    const { breeder, user, type, externalId, whatsApp } = req.body

    const entities = await UserAggregator.store({ user, breeder, type, externalId, whatsApp })

    return BaseController.successResponse(res, entities)
  }

  @BaseController.errorHandler()
  @BaseController.actionHandler(i18n.__('messages.recover-password.success'))
  async recoverPassword(req: Request): Promise<void> {
    const { email } = req.body

    await UserAggregator.recoverPassword(email)
  }

  @BaseController.errorHandler()
  @BaseController.actionHandler(i18n.__('messages.edit-password.success'))
  async editPassword(req: AuthenticatedRequest): Promise<void> {
    if (!req.user) throw new AuthError()

    const { password, confirmPassword } = req.body

    await UserAggregator.editPassword(req.user.id, password, confirmPassword)
  }

  @BaseController.errorHandler()
  @BaseController.actionHandler(i18n.__('messages.edit-profile.success'))
  async editProfile(req: AuthenticatedRequest) {
    if (!req.user) throw new AuthError()

    const { user } = req.body

    await AccountServiceClient.editUser(user, req.user.id)
  }

  @BaseController.errorHandler()
  async getUserData(req: AuthenticatedRequest, res: Response) {
    if (!req.user) throw new AuthError()

    return BaseController.successResponse(res, { user: req.user })
  }
}

export default new UserController()
