import faker from 'faker'
import { userFactory, poultryFactory } from '@cig-platform/factories'

import { UserAggregator } from '@Aggregators/UserAggregator'
import TokenService from '@Services/TokenService'

describe('UserAggregator', () => {
  describe('auth', () => {
    it('returns token when the account service client returns a valid user, and the poultrys service returns valid poultries', async () => {
      const token = 'example token'
      const user = userFactory()
      const poultries = Array(10).fill(null).map(() => poultryFactory())
      const mockAccountServiceClient: any = {
        authUser: jest.fn().mockResolvedValue(user)
      }
      const mockPoultryServiceClient: any = {
        getPoultries: jest.fn().mockResolvedValue(poultries)
      }
      const userAggregator = new UserAggregator(mockAccountServiceClient, mockPoultryServiceClient)
      const mockCreateToken = jest.fn().mockResolvedValue(token)

      jest.spyOn(TokenService, 'create').mockImplementation(mockCreateToken)

      const email = faker.internet.email()
      const password = faker.internet.password()

      expect(await userAggregator.auth(email, password)).toBe(token)
      expect(mockCreateToken).toHaveBeenCalledWith(user, poultries)
      expect(mockAccountServiceClient.authUser).toHaveBeenCalledWith(email, password)
      expect(mockPoultryServiceClient.getPoultries).toHaveBeenLastCalledWith(user.id)
    })

    it('throwns an error when the account service gets an error', async () => {
      const error = new Error()
      const poultries = Array(10).fill(null).map(() => poultryFactory())
      const mockAccountServiceClient: any = {
        authUser: jest.fn().mockRejectedValue(error)
      }
      const mockPoultryServiceClient: any = {
        getPoultries: jest.fn().mockResolvedValue(poultries)
      }
      const userAggregator = new UserAggregator(mockAccountServiceClient, mockPoultryServiceClient)

      await expect(userAggregator.auth).rejects.toThrow(error)
    })

    it('throwns an error when the poultry service gets an error', async () => {
      const error = new Error()
      const user = userFactory()
      const mockAccountServiceClient: any = {
        authUser: jest.fn().mockResolvedValue(user)
      }
      const mockPoultryServiceClient: any = {
        getPoultries: jest.fn().mockRejectedValue(error)
      }
      const userAggregator = new UserAggregator(mockAccountServiceClient, mockPoultryServiceClient)

      await expect(userAggregator.auth).rejects.toThrow(error)
    })
  })

  describe('store', () => {
    it('returns user, poultry and poultryUser when the apis returns valids responses', async () => {
      const user = {}
      const poultry = {}
      const poultryUser = {}
      const mockAccountServiceClient: any = {
        postUser: jest.fn().mockResolvedValue(user)
      }
      const mockPoultryServiceClient: any = {
        postPoultry: jest.fn().mockResolvedValue(poultry),
        postPoultryUser: jest.fn().mockResolvedValue(poultryUser)
      }
      const userAggregator = new UserAggregator(mockAccountServiceClient, mockPoultryServiceClient)

      expect(await userAggregator.store({}, {})).toMatchObject({ user, poultryUser, poultry })
    })

    it('throwns an error when user post request gets an error', async () => {
      const error = new Error()
      const poultry = {}
      const poultryUser = {}
      const mockAccountServiceClient: any = {
        postUser: jest.fn().mockRejectedValue(error)
      }
      const mockPoultryServiceClient: any = {
        postPoultry: jest.fn().mockResolvedValue(poultry),
        postPoultryUser: jest.fn().mockResolvedValue(poultryUser)
      }
      const userAggregator = new UserAggregator(mockAccountServiceClient, mockPoultryServiceClient)

      await expect(userAggregator.store).rejects.toThrow(error)
    })

    it('throwns an error when poultry post request gets an error', async () => {
      const error = new Error()
      const user = {}
      const poultryUser = {}
      const mockAccountServiceClient: any = {
        postUser: jest.fn().mockResolvedValue(user)
      }
      const mockPoultryServiceClient: any = {
        postPoultry: jest.fn().mockRejectedValue(error),
        postPoultryUser: jest.fn().mockResolvedValue(poultryUser)
      }
      const userAggregator = new UserAggregator(mockAccountServiceClient, mockPoultryServiceClient)

      await expect(userAggregator.store).rejects.toThrow(error)
    })

    it('throwns an error when poultry user post request gets an error', async () => {
      const poultry = {}
      const user = {}
      const error = new Error()
      const mockAccountServiceClient: any = {
        postUser: jest.fn().mockResolvedValue(user)
      }
      const mockPoultryServiceClient: any = {
        postPoultry: jest.fn().mockResolvedValue(poultry),
        postPoultryUser: jest.fn().mockRejectedValue(error)
      }
      const userAggregator = new UserAggregator(mockAccountServiceClient, mockPoultryServiceClient)

      await expect(userAggregator.store).rejects.toThrow(error)
    })
  })
})
