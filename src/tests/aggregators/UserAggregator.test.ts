import faker from '@faker-js/faker'
import { userFactory, breederFactory, merchantFactory } from '@cig-platform/factories'
import { IAdvertisingFavorite } from '@cig-platform/types'

import { UserAggregator } from '@Aggregators/UserAggregator'
import TokenService from '@Services/TokenService'
import EncryptService from '@Services/EncryptService'
import EmailService from '@Services/EmailService'
import i18n from '@Configs/i18n'
import InvalidEmailError from '@Errors/InvalidEmailError'

describe('UserAggregator', () => {
  describe('auth', () => {
    it('returns token when the account service client returns a valid user, and the breeder service returns valid breeders', async () => {
      const token = 'example token'
      const favorites = [] as IAdvertisingFavorite[]
      const user = userFactory()
      const merchant = merchantFactory()
      const breeders = Array(10).fill(null).map(() => breederFactory())
      const mockAccountServiceClient: any = {
        authUser: jest.fn().mockResolvedValue(user)
      }
      const mockPoultryServiceClient: any = {
        getBreeders: jest.fn().mockResolvedValue(breeders)
      }
      const mockAdvertisingServiceClient: any = {
        getMerchants: jest.fn().mockResolvedValue([merchant]),
        getFavorites: jest.fn().mockResolvedValue(favorites)
      }
      const userAggregator = new UserAggregator(mockAccountServiceClient, mockPoultryServiceClient, mockAdvertisingServiceClient)
      const mockCreateToken = jest.fn().mockResolvedValue(token)

      jest.spyOn(TokenService, 'create').mockImplementation(mockCreateToken)

      const email = faker.internet.email()
      const password = faker.internet.password()

      expect(await userAggregator.auth(email, password)).toBe(token)
      expect(mockCreateToken).toHaveBeenCalledWith(user, breeders, merchant, favorites)
      expect(mockAccountServiceClient.authUser).toHaveBeenCalledWith(email, password, user.registerType, undefined)
      expect(mockPoultryServiceClient.getBreeders).toHaveBeenLastCalledWith(user.id)
      expect(mockAdvertisingServiceClient.getMerchants).toHaveBeenCalledWith(breeders[0].id)
      expect(mockAdvertisingServiceClient.getFavorites).toHaveBeenCalledWith(user.id)
    })

    it('throwns an error when the account service gets an error', async () => {
      const error = new Error()
      const breeders = Array(10).fill(null).map(() => breederFactory())
      const mockAccountServiceClient: any = {
        authUser: jest.fn().mockRejectedValue(error)
      }
      const mockPoultryServiceClient: any = {
        getBreeders: jest.fn().mockResolvedValue(breeders)
      }
      const mockAdvertisingServiceClient: any = {
        getMerchants: jest.fn().mockResolvedValue([]),
        getFavorites: jest.fn().mockResolvedValue([])
      }
      const userAggregator = new UserAggregator(mockAccountServiceClient, mockPoultryServiceClient, mockAdvertisingServiceClient)

      await expect(userAggregator.auth).rejects.toThrow(error)
    })

    it('throwns an error when the breeder service gets an error', async () => {
      const error = new Error()
      const user = userFactory()
      const mockAccountServiceClient: any = {
        authUser: jest.fn().mockResolvedValue(user)
      }
      const mockPoultryServiceClient: any = {
        getBreeders: jest.fn().mockRejectedValue(error)
      }
      const mockAdvertisingServiceClient: any = {
        getMerchants: jest.fn().mockResolvedValue([]),
        getFavorites: jest.fn().mockResolvedValue([])
      }
      const userAggregator = new UserAggregator(mockAccountServiceClient, mockPoultryServiceClient, mockAdvertisingServiceClient)

      await expect(userAggregator.auth).rejects.toThrow(error)
    })

    it('throwns an error when the advertising service gets an error', async () => {
      const error = new Error()
      const user = userFactory()
      const breeders = Array(10).fill(null).map(() => breederFactory())
      const mockAccountServiceClient: any = {
        authUser: jest.fn().mockResolvedValue(user)
      }
      const mockPoultryServiceClient: any = {
        getBreeders: jest.fn().mockResolvedValue(breeders)
      }
      const mockAdvertisingServiceClient: any = {
        getMerchants: jest.fn().mockRejectedValue(error),
        getFavorites: jest.fn().mockResolvedValue([])
      }
      const userAggregator = new UserAggregator(mockAccountServiceClient, mockPoultryServiceClient, mockAdvertisingServiceClient)

      await expect(userAggregator.auth).rejects.toThrow(error)
    })
  })

  describe('store', () => {
    it('returns user, breeder, merchant and breederUser when the apis returns valids responses', async () => {
      const user = {}
      const breeder = {}
      const breederUser = {}
      const merchant = {}
      const mockAccountServiceClient: any = {
        postUser: jest.fn().mockResolvedValue(user)
      }
      const mockPoultryServiceClient: any = {
        postBreeder: jest.fn().mockResolvedValue(breeder),
        postBreederUser: jest.fn().mockResolvedValue(breederUser)
      }
      const mockAdvertisingServiceClient: any = {
        postMerchant: jest.fn().mockResolvedValue(merchant)
      }
      const userAggregator = new UserAggregator(mockAccountServiceClient, mockPoultryServiceClient, mockAdvertisingServiceClient)

      expect(await userAggregator.store({}, {})).toMatchObject({ user, breederUser, breeder, merchant })
    })

    it('throwns an error when user post request gets an error', async () => {
      const error = new Error()
      const breeder = {}
      const breederUser = {}
      const merchant = {}
      const mockAccountServiceClient: any = {
        postUser: jest.fn().mockRejectedValue(error)
      }
      const mockPoultryServiceClient: any = {
        postBreeder: jest.fn().mockResolvedValue(breeder),
        postBreederUser: jest.fn().mockResolvedValue(breederUser)
      }
      const mockAdvertisingServiceClient: any = {
        postMerchant: jest.fn().mockResolvedValue(merchant)
      }
      const userAggregator = new UserAggregator(mockAccountServiceClient, mockPoultryServiceClient, mockAdvertisingServiceClient)

      await expect(userAggregator.store).rejects.toThrow(error)
    })

    it('throwns an error when breeder post request gets an error', async () => {
      const error = new Error()
      const user = {}
      const breederUser = {}
      const merchant = {}
      const mockAccountServiceClient: any = {
        postUser: jest.fn().mockResolvedValue(user),
        rollbackUser: jest.fn()
      }
      const mockPoultryServiceClient: any = {
        postBreeder: jest.fn().mockRejectedValue(error),
        postBreederUser: jest.fn().mockResolvedValue(breederUser)
      }
      const mockAdvertisingServiceClient: any = {
        postMerchant: jest.fn().mockResolvedValue(merchant)
      }
      const userAggregator = new UserAggregator(mockAccountServiceClient, mockPoultryServiceClient, mockAdvertisingServiceClient)

      await expect(userAggregator.store).rejects.toThrow(error)

      expect(mockAccountServiceClient.rollbackUser).toHaveBeenCalledTimes(1)
    })

    it('throwns an error when breeder user post request gets an error', async () => {
      const breeder = {}
      const user = {}
      const merchant = {}
      const error = new Error()
      const mockAccountServiceClient: any = {
        postUser: jest.fn().mockResolvedValue(user),
        rollbackUser: jest.fn()
      }
      const mockPoultryServiceClient: any = {
        postBreeder: jest.fn().mockResolvedValue(breeder),
        postBreederUser: jest.fn().mockRejectedValue(error),
        rollbackBreeder: jest.fn()
      }
      const mockAdvertisingServiceClient: any = {
        postMerchant: jest.fn().mockResolvedValue(merchant)
      }
      const userAggregator = new UserAggregator(mockAccountServiceClient, mockPoultryServiceClient, mockAdvertisingServiceClient)

      await expect(userAggregator.store).rejects.toThrow(error)

      expect(mockAccountServiceClient.rollbackUser).toHaveBeenCalledTimes(1)
      expect(mockPoultryServiceClient.rollbackBreeder).toHaveBeenCalledTimes(1)
    })

    it('throwns an error when merchant post request gets an error', async () => {
      const user = {}
      const breeder = {}
      const breederUser = {}
      const error = new Error()
      const mockAccountServiceClient: any = {
        postUser: jest.fn().mockResolvedValue(user),
        rollbackUser: jest.fn()
      }
      const mockPoultryServiceClient: any = {
        postBreeder: jest.fn().mockResolvedValue(breeder),
        postBreederUser: jest.fn().mockResolvedValue(breederUser),
        rollbackBreederUser: jest.fn(),
        rollbackBreeder: jest.fn(),
      }
      const mockAdvertisingServiceClient: any = {
        postMerchant: jest.fn().mockRejectedValue(error)
      }
      const userAggregator = new UserAggregator(mockAccountServiceClient, mockPoultryServiceClient, mockAdvertisingServiceClient)

      await expect(userAggregator.store).rejects.toThrow(error)

      expect(mockAccountServiceClient.rollbackUser).toHaveBeenCalledTimes(1)
      expect(mockPoultryServiceClient.rollbackBreeder).toHaveBeenCalledTimes(1)
      expect(mockPoultryServiceClient.rollbackBreederUser).toHaveBeenCalledTimes(1)
    })
  })

  describe('refreshToken', () => {
    it('returns the token', async () => {
      const user = userFactory()
      const breeder = breederFactory()
      const merchant = merchantFactory()
      const favorites = [] as IAdvertisingFavorite[]
      const token = 'token'
      const breeders = [breeder]

      const mockCreateToken = jest.fn().mockResolvedValue(token)

      jest.spyOn(TokenService, 'create').mockImplementation(mockCreateToken)

      const mockAccountServiceClient: any = {}
      const mockPoultryServiceClient: any = {
        getBreeders: jest.fn().mockReturnValue(breeders),
      }
      const mockAdvertisingServiceClient: any = {
        getMerchants: jest.fn().mockResolvedValue([merchant]),
        getFavorites: jest.fn().mockResolvedValue(favorites)
      }
      const userAggregator = new UserAggregator(mockAccountServiceClient, mockPoultryServiceClient, mockAdvertisingServiceClient)

      expect(await userAggregator.refreshToken(user)).toBe(token)
      expect(mockCreateToken).toHaveBeenLastCalledWith(user, breeders, merchant, favorites)
      expect(mockPoultryServiceClient.getBreeders).toHaveBeenCalledWith(user.id)
      expect(mockAdvertisingServiceClient.getMerchants).toHaveBeenCalledWith(breeder.id)
      expect(mockAdvertisingServiceClient.getFavorites).toHaveBeenCalledWith(user.id)
    })
  })

  describe('recoverPassword', () => {
    it('send and email when the api returns a valid user', async () => {
      const email = faker.internet.email()
      const password = faker.internet.password()
      const user = userFactory({ email, password })
      const mockAccountServiceClient: any = {
        getUsers: jest.fn().mockResolvedValue([user])
      }
      const mockAdvertisingServiceClient: any = {}
      const mockDecrypt = jest.fn().mockReturnValue(password)
      const mockSendEmail = jest.fn()

      jest.spyOn(EncryptService, 'decrypt').mockImplementation(mockDecrypt)
      jest.spyOn(EmailService, 'send').mockImplementation(mockSendEmail)

      const userAggregator = new UserAggregator(mockAccountServiceClient, {} as any, mockAdvertisingServiceClient)

      await userAggregator.recoverPassword(email)

      expect(mockDecrypt).toHaveBeenCalledWith(user.password)
      expect(mockAccountServiceClient.getUsers).toHaveBeenCalledWith({ email })
      expect(mockSendEmail).toHaveBeenCalledWith({
        emailDestination: user.email,
        subject: i18n.__('emails.recover-password.title'),
        message: i18n.__('emails.recover-password.content', { password })
      })
    })

    it('throws an error when the api does not return users', async () => {
      const email = faker.internet.email()
      const mockAccountServiceClient: any = {
        getUsers: jest.fn().mockResolvedValue([])
      }
      const mockAdvertisingServiceClient: any = {}

      const userAggregator = new UserAggregator(mockAccountServiceClient, {} as any, mockAdvertisingServiceClient)

      await expect(userAggregator.recoverPassword(email)).rejects.toThrow(InvalidEmailError)
    })
  })
})
