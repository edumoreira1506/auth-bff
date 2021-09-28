import { NextFunction, Request, Response } from 'express'
import { AccountServiceClient, AuthError, BaseController } from '@cig-platform/core'
import { ApiErrorType } from '@cig-platform/types'

import TokenService from '@Services/TokenService'
import { ACCOUNT_SERVICE_URL } from '@Constants/account'

const withTokenAuthorizationFactory = (errorCallback: (res: Response, error: ApiErrorType) => Response, accountServiceClient: AccountServiceClient) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header('X-Cig-Token')

    if (!token) throw new AuthError()

    const tokenData = await TokenService.open(token)

    if (!tokenData?.id) throw new AuthError()

    const userData = await accountServiceClient.getUser(String(tokenData?.id))

    if (userData?.id !== tokenData?.id) throw new AuthError()

    next()
  } catch (error: any) {
    console.log({ error })
    return errorCallback(res, error?.getError ? error.getError() : error)
  }
}

export default withTokenAuthorizationFactory(BaseController.errorResponse, new AccountServiceClient(ACCOUNT_SERVICE_URL))
