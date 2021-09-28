import { NextFunction, Response } from 'express'
import { AuthError, BaseController, BreederServiceClient } from '@cig-platform/core'
import { ApiErrorType } from '@cig-platform/types'

import { AuthenticatedRequest } from '@Types/request'
import { BREEDER_SERVICE_URL } from '@Constants/breeder'

const withBreederPermisionFactory = (errorCallback: (res: Response, error: ApiErrorType) => Response, breederServiceClient: BreederServiceClient) => async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const user = req.user

    if (!user) throw new AuthError()

    const breederId = req.params.breederId

    if (!breederId) throw new AuthError()

    const breeders = await breederServiceClient.getBreeders(user.id)
    const breedersIds = breeders.map(breeder => breeder.id)

    if (!breedersIds.includes(breederId)) throw new AuthError()

    next()
  } catch(error: any) {
    return errorCallback(res, error?.getError ? error.getError() : error)
  }
}

export default withBreederPermisionFactory(BaseController.errorResponse, new BreederServiceClient(BREEDER_SERVICE_URL))
