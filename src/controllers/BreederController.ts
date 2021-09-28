import { Request, Response } from 'express'
import { BaseController } from '@cig-platform/core'

class BreederController {
  constructor() {
    this.update = this.update.bind(this)
  }

  @BaseController.errorHandler()
  async update(req: Request, res: Response): Promise<Response> {
    return BaseController.successResponse(res, { message: 'deu boa!' })
  }
}

export default new BreederController()
