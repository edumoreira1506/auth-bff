import { userFactory } from '@cig-platform/factories'

import { withTokenAuthorizationFactory } from '@Middlewares/withTokenAuthoritzation'
import TokenService from '@Services/TokenService'

describe('withTokenAuthorization', () => {
  it('calls next when is a valid token', async () => {
    const token = 'token'
    const user = userFactory()
    const mockErrorCallback = jest.fn()
    const mockAccountServiceClient: any = {
      getUser: jest.fn().mockResolvedValue(user)
    }
    const withTokenAuthorization = withTokenAuthorizationFactory(mockErrorCallback, mockAccountServiceClient)
    const mockRequest: any = { header: jest.fn().mockReturnValue(token) }
    const mockResponse: any = {}
    const mockNext = jest.fn()
    const mockOpen = jest.fn().mockReturnValue(user)

    jest.spyOn(TokenService, 'open').mockImplementation(mockOpen)

    await withTokenAuthorization(mockRequest, mockResponse, mockNext)

    expect(mockAccountServiceClient.getUser).toHaveBeenCalledWith(user.id)
    expect(mockErrorCallback).not.toHaveBeenCalled()
    expect(mockNext).toHaveBeenCalled()
    expect(mockOpen).toHaveBeenCalledWith(token)
    expect(mockRequest.user).toMatchObject(user)
  })

  it('calls errorCallback when token is not sent', async () => {
    const token = 'token'
    const user = userFactory()
    const mockErrorCallback = jest.fn()
    const mockAccountServiceClient: any = {
      getUser: jest.fn().mockResolvedValue(user)
    }
    const withTokenAuthorization = withTokenAuthorizationFactory(mockErrorCallback, mockAccountServiceClient)
    const mockRequest: any = { header: jest.fn().mockReturnValue(null) }
    const mockResponse: any = {}
    const mockNext = jest.fn()
    const mockOpen = jest.fn().mockReturnValue(user)

    jest.spyOn(TokenService, 'open').mockImplementation(mockOpen)

    await withTokenAuthorization(mockRequest, mockResponse, mockNext)

    expect(mockAccountServiceClient.getUser).not.toHaveBeenCalledWith(user.id)
    expect(mockErrorCallback).toHaveBeenCalled()
    expect(mockNext).not.toHaveBeenCalled()
    expect(mockOpen).not.toHaveBeenCalledWith(token)
  })

  it('calls errorCallback when is an valid token', async () => {
    const token = 'token'
    const user = userFactory()
    const mockErrorCallback = jest.fn()
    const mockAccountServiceClient: any = {
      getUser: jest.fn().mockResolvedValue(user)
    }
    const withTokenAuthorization = withTokenAuthorizationFactory(mockErrorCallback, mockAccountServiceClient)
    const mockRequest: any = { header: jest.fn().mockReturnValue(token) }
    const mockResponse: any = {}
    const mockNext = jest.fn()
    const mockOpen = jest.fn().mockReturnValue(null)

    jest.spyOn(TokenService, 'open').mockImplementation(mockOpen)

    await withTokenAuthorization(mockRequest, mockResponse, mockNext)

    expect(mockAccountServiceClient.getUser).not.toHaveBeenCalledWith(user.id)
    expect(mockErrorCallback).toHaveBeenCalled()
    expect(mockNext).not.toHaveBeenCalled()
    expect(mockOpen).toHaveBeenCalledWith(token)
  })

  it('calls errorCallback when user does not exist', async () => {
    const token = 'token'
    const user = userFactory()
    const mockErrorCallback = jest.fn()
    const mockAccountServiceClient: any = {
      getUser: jest.fn().mockResolvedValue(null)
    }
    const withTokenAuthorization = withTokenAuthorizationFactory(mockErrorCallback, mockAccountServiceClient)
    const mockRequest: any = { header: jest.fn().mockReturnValue(token) }
    const mockResponse: any = {}
    const mockNext = jest.fn()
    const mockOpen = jest.fn().mockReturnValue(user)

    jest.spyOn(TokenService, 'open').mockImplementation(mockOpen)

    await withTokenAuthorization(mockRequest, mockResponse, mockNext)

    expect(mockAccountServiceClient.getUser).toHaveBeenCalledWith(user.id)
    expect(mockErrorCallback).toHaveBeenCalled()
    expect(mockNext).not.toHaveBeenCalled()
    expect(mockOpen).toHaveBeenCalledWith(token)
  })
})
