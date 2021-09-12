import { Request, Response } from 'express'
import { BaseController } from '@cig-platform/core'

import UserAggregator from '@Aggregators/UserAggregator'

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
  async store(req: Request, res: Response): Promise<void> {
    console.log('chegou aqui')
  }
}

export default new UserController()
