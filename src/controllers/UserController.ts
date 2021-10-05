import { Request, Response } from 'express'
import { AuthError, BaseController } from '@cig-platform/core'

import UserAggregator from '@Aggregators/UserAggregator'
import { AuthenticatedRequest } from '@Types/request'
import i18n from '@Configs/i18n'

class UserController {
  constructor() {
    this.auth = this.auth.bind(this)
    this.store = this.store.bind(this)
  }

  @BaseController.errorHandler()
  async auth(req: Request, res: Response): Promise<Response> {
    const email = req.body.email
    const password = req.body.password

    const token = await UserAggregator.auth(email, password)

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
    const { breeder, user } = req.body

    const entities = await UserAggregator.store(user, breeder)

    return BaseController.successResponse(res, entities)
  }

  @BaseController.errorHandler()
  @BaseController.actionHandler(i18n.__('messages.recover-password.success'))
  async recoverPassword(req: Request): Promise<void> {
    const { email } = req.body

    await UserAggregator.recoverPassword(email)
  }
}

export default new UserController()
