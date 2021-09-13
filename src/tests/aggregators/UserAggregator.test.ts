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
})
