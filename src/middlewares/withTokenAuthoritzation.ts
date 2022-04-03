import { AccountServiceClient, AuthError, BaseController } from '@cig-platform/core'
import { NextFunction, Response } from 'express'

import TokenService from '@Services/TokenService'
import AccountClient from '@Clients/AccountServiceClient'
import { ApiErrorType, AuthenticatedRequest } from '@cig-platform/types'

const withTokenAuthorizationFactory = (errorCallback: (res: Response, error: ApiErrorType) => Response, accountServiceClient: AccountServiceClient) => async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('X-Cig-Token')

    if (!token) throw new AuthError()

    const tokenData = await TokenService.open(token)

    if (!tokenData?.id) throw new AuthError()

    const userData = await accountServiceClient.getUser(String(tokenData?.id))

    if (userData?.id !== tokenData?.id) throw new AuthError()

    req.user = userData
    req.merchant = tokenData.merchant

    next()
  } catch (error: any) {
    return errorCallback(res, error?.getError ? error.getError() : error)
  }
}

export default withTokenAuthorizationFactory(BaseController.errorResponse, AccountClient)
