import faker from 'faker'

import { UserAggregator } from '@Aggregators/UserAggregator'
import { AuthError } from '@cig-platform/core'

describe('UserAggregator', () => {
  describe('auth', () => {
    it('returns token when the account service client returns a valid token', async () => {
      const token = 'example token'
      const mockAccountServiceClient: any = {
        authUser: jest.fn().mockResolvedValue(token)
      }
      const userAggregator = new UserAggregator(mockAccountServiceClient)

      expect(await userAggregator.auth(faker.internet.email(), faker.internet.password())).toBe(token)
    })

    it('throwns an error when the account service client does not return a valid token', async () => {
      const invalidToken = null
      const mockAccountServiceClient: any = {
        authUser: jest.fn().mockResolvedValue(invalidToken)
      }
      const userAggregator = new UserAggregator(mockAccountServiceClient)

      await expect(userAggregator.auth).rejects.toThrow(AuthError)
    })
  })
})
