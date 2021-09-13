import faker from 'faker'

import { UserAggregator } from '@Aggregators/UserAggregator'

describe('UserAggregator', () => {
  describe('auth', () => {
    it('returns token when the account service client returns a valid token', async () => {
      const token = 'example token'
      const mockAccountServiceClient: any = {
        authUser: jest.fn().mockResolvedValue(token)
      }
      const userAggregator = new UserAggregator(mockAccountServiceClient, {} as any)

      expect(await userAggregator.auth(faker.internet.email(), faker.internet.password())).toBe(token)
    })

    it('throwns an error when the account service gets an error', async () => {
      const error = new Error()
      const mockAccountServiceClient: any = {
        authUser: jest.fn().mockRejectedValue(error)
      }
      const userAggregator = new UserAggregator(mockAccountServiceClient, {} as any)

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
