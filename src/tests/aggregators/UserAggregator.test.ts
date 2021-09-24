import faker from 'faker'
import { userFactory, breederFactory } from '@cig-platform/factories'

import { UserAggregator } from '@Aggregators/UserAggregator'
import TokenService from '@Services/TokenService'

describe('UserAggregator', () => {
  describe('auth', () => {
    it('returns token when the account service client returns a valid user, and the breeder service returns valid breeders', async () => {
      const token = 'example token'
      const user = userFactory()
      const breeders = Array(10).fill(null).map(() => breederFactory())
      const mockAccountServiceClient: any = {
        authUser: jest.fn().mockResolvedValue(user)
      }
      const mockBreederServiceClient: any = {
        getBreeders: jest.fn().mockResolvedValue(breeders)
      }
      const userAggregator = new UserAggregator(mockAccountServiceClient, mockBreederServiceClient)
      const mockCreateToken = jest.fn().mockResolvedValue(token)

      jest.spyOn(TokenService, 'create').mockImplementation(mockCreateToken)

      const email = faker.internet.email()
      const password = faker.internet.password()

      expect(await userAggregator.auth(email, password)).toBe(token)
      expect(mockCreateToken).toHaveBeenCalledWith(user, breeders)
      expect(mockAccountServiceClient.authUser).toHaveBeenCalledWith(email, password)
      expect(mockBreederServiceClient.getBreeders).toHaveBeenLastCalledWith(user.id)
    })

    it('throwns an error when the account service gets an error', async () => {
      const error = new Error()
      const breeders = Array(10).fill(null).map(() => breederFactory())
      const mockAccountServiceClient: any = {
        authUser: jest.fn().mockRejectedValue(error)
      }
      const mockBreederServiceClient: any = {
        getBreeders: jest.fn().mockResolvedValue(breeders)
      }
      const userAggregator = new UserAggregator(mockAccountServiceClient, mockBreederServiceClient)

      await expect(userAggregator.auth).rejects.toThrow(error)
    })

    it('throwns an error when the breeder service gets an error', async () => {
      const error = new Error()
      const user = userFactory()
      const mockAccountServiceClient: any = {
        authUser: jest.fn().mockResolvedValue(user)
      }
      const mockBreederServiceClient: any = {
        getBreeders: jest.fn().mockRejectedValue(error)
      }
      const userAggregator = new UserAggregator(mockAccountServiceClient, mockBreederServiceClient)

      await expect(userAggregator.auth).rejects.toThrow(error)
    })
  })

  describe('store', () => {
    it('returns user, breeder and breederUser when the apis returns valids responses', async () => {
      const user = {}
      const breeder = {}
      const breederUser = {}
      const mockAccountServiceClient: any = {
        postUser: jest.fn().mockResolvedValue(user)
      }
      const mockBreederServiceClient: any = {
        postBreeder: jest.fn().mockResolvedValue(breeder),
        postBreederUser: jest.fn().mockResolvedValue(breederUser)
      }
      const userAggregator = new UserAggregator(mockAccountServiceClient, mockBreederServiceClient)

      expect(await userAggregator.store({}, {})).toMatchObject({ user, breederUser, breeder })
    })

    it('throwns an error when user post request gets an error', async () => {
      const error = new Error()
      const breeder = {}
      const breederUser = {}
      const mockAccountServiceClient: any = {
        postUser: jest.fn().mockRejectedValue(error)
      }
      const mockBreederServiceClient: any = {
        postBreeder: jest.fn().mockResolvedValue(breeder),
        postBreederUser: jest.fn().mockResolvedValue(breederUser)
      }
      const userAggregator = new UserAggregator(mockAccountServiceClient, mockBreederServiceClient)

      await expect(userAggregator.store).rejects.toThrow(error)
    })

    it('throwns an error when breeder post request gets an error', async () => {
      const error = new Error()
      const user = {}
      const breederUser = {}
      const mockAccountServiceClient: any = {
        postUser: jest.fn().mockResolvedValue(user)
      }
      const mockBreederServiceClient: any = {
        postBreeder: jest.fn().mockRejectedValue(error),
        postBreederUser: jest.fn().mockResolvedValue(breederUser)
      }
      const userAggregator = new UserAggregator(mockAccountServiceClient, mockBreederServiceClient)

      await expect(userAggregator.store).rejects.toThrow(error)
    })

    it('throwns an error when breeder user post request gets an error', async () => {
      const breeder = {}
      const user = {}
      const error = new Error()
      const mockAccountServiceClient: any = {
        postUser: jest.fn().mockResolvedValue(user)
      }
      const mockBreederServiceClient: any = {
        postBreeder: jest.fn().mockResolvedValue(breeder),
        postBreederUser: jest.fn().mockRejectedValue(error)
      }
      const userAggregator = new UserAggregator(mockAccountServiceClient, mockBreederServiceClient)

      await expect(userAggregator.store).rejects.toThrow(error)
    })
  })
})
