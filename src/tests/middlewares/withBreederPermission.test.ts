import { breederFactory, userFactory } from '@cig-platform/factories'

import { withBreederPermisionFactory } from '@Middlewares/withBreederPermission'

describe('withBreederPermission', () => {
  it('calls next when user belongs to breeder', async () => {
    const user = userFactory()
    const breeder = breederFactory()
    const mockErrorCallback = jest.fn()
    const mockBreederServiceClient: any = {
      getBreeders: jest.fn().mockResolvedValue([breeder])
    }
    const withBreederPermission = withBreederPermisionFactory(mockErrorCallback, mockBreederServiceClient)
    const mockRequest: any = { user, params: { breederId: breeder.id } }
    const mockResponse: any = {}
    const mockNext = jest.fn()

    await withBreederPermission(mockRequest, mockResponse, mockNext)

    expect(mockBreederServiceClient.getBreeders).toHaveBeenCalledWith(user.id)
    expect(mockErrorCallback).not.toHaveBeenCalled()
    expect(mockNext).toHaveBeenCalled()
  })

  it('calls errorCallback when user is not sent', async () => {
    const user = userFactory()
    const breeder = breederFactory()
    const mockErrorCallback = jest.fn()
    const mockBreederServiceClient: any = {
      getBreeders: jest.fn().mockResolvedValue([breeder])
    }
    const withBreederPermission = withBreederPermisionFactory(mockErrorCallback, mockBreederServiceClient)
    const mockRequest: any = { params: { breederId: breeder.id } }
    const mockResponse: any = {}
    const mockNext = jest.fn()

    await withBreederPermission(mockRequest, mockResponse, mockNext)

    expect(mockBreederServiceClient.getBreeders).not.toHaveBeenCalledWith(user.id)
    expect(mockErrorCallback).toHaveBeenCalled()
    expect(mockNext).not.toHaveBeenCalled()
  })

  it('calls errorCallback when breederId is not sent', async () => {
    const user = userFactory()
    const breeder = breederFactory()
    const mockErrorCallback = jest.fn()
    const mockBreederServiceClient: any = {
      getBreeders: jest.fn().mockResolvedValue([breeder])
    }
    const withBreederPermission = withBreederPermisionFactory(mockErrorCallback, mockBreederServiceClient)
    const mockRequest: any = { user }
    const mockResponse: any = {}
    const mockNext = jest.fn()

    await withBreederPermission(mockRequest, mockResponse, mockNext)

    expect(mockBreederServiceClient.getBreeders).not.toHaveBeenCalledWith(user.id)
    expect(mockErrorCallback).toHaveBeenCalled()
    expect(mockNext).not.toHaveBeenCalled()
  })

  it('calls errorCallback when user does not belong to breeder', async () => {
    const user = userFactory()
    const breeder = breederFactory()
    const mockErrorCallback = jest.fn()
    const mockBreederServiceClient: any = {
      getBreeders: jest.fn().mockResolvedValue([])
    }
    const withBreederPermission = withBreederPermisionFactory(mockErrorCallback, mockBreederServiceClient)
    const mockRequest: any = { user, params: { breederId: breeder.id } }
    const mockResponse: any = {}
    const mockNext = jest.fn()

    await withBreederPermission(mockRequest, mockResponse, mockNext)

    expect(mockBreederServiceClient.getBreeders).toHaveBeenCalledWith(user.id)
    expect(mockErrorCallback).toHaveBeenCalled()
    expect(mockNext).not.toHaveBeenCalled()
  })
})
