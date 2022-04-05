import request from 'supertest'
import faker from '@faker-js/faker'
import {
  userFactory,
  breederFactory,
  breederUserFactory,
  merchantFactory
} from '@cig-platform/factories'

import App from '@Configs/server'
import UserAggregator from '@Aggregators/UserAggregator'
import i18n from '@Configs/i18n'
import TokenService from '@Services/TokenService'
import AccountServiceClient from '@Clients/AccountServiceClient'
import { BreederContactTypeEnum } from '@cig-platform/enums'

describe('User actions', () => {
  describe('Authentication', () => {
    it('is a valid user', async () => {
      const token = 'example token'
      const email = faker.internet.email()
      const password = faker.internet.password()
      const mockAuth = jest.fn().mockResolvedValue(token)

      jest.spyOn(UserAggregator, 'auth').mockImplementation(mockAuth)

      const response = await request(App).post('/v1/auth').send({ email, password })

      expect(response.statusCode).toBe(200)
      expect(response.body.token).toBe(token)
      expect(mockAuth).toHaveBeenCalledWith(email, password, undefined, undefined)
    })

    it('is an invalid authentication when is not sent email', async () => {
      const token = 'example token'
      const email = undefined
      const password = faker.internet.password()
      const mockAuth = jest.fn().mockResolvedValue(token)

      jest.spyOn(UserAggregator, 'auth').mockImplementation(mockAuth)

      const response = await request(App).post('/v1/auth').send({ email, password })

      expect(response.statusCode).toBe(400)
      expect(response.body).toMatchObject({
        ok: false,
        error: {
          message: i18n.__('required-field', { field: i18n.__('user.fields.email') }),
          name: 'ValidationError',
        }
      })
    })

    it('is an invalid authentication when user aggregator throwns an error', async () => {
      const email = faker.internet.email()
      const password = faker.internet.password()
      const error = { ...new Error('Example error') }
      const mockAuth = jest.fn().mockRejectedValue(error)

      jest.spyOn(UserAggregator, 'auth').mockImplementation(mockAuth)

      const response = await request(App).post('/v1/auth').send({ email, password })

      expect(response.statusCode).toBe(400)
      expect(response.body).toMatchObject({
        ok: false,
        error
      })
    })
  })

  describe('Register', () => {
    it('is a valid register', async () => {
      const user = userFactory()
      const breeder = breederFactory({ description: 'fake description' })
      const breederUser = breederUserFactory({ userId: user.id, breederId: breeder.id })
      const merchant = merchantFactory()
      const whatsApp = '(15) 99644-2031'
      const contact = {
        value: whatsApp,
        type: BreederContactTypeEnum.WHATS_APP,
        breederId: breeder.id,
        id: faker.datatype.uuid()
      }
      const mockStore = jest.fn().mockResolvedValue({ user, breederUser, breeder, merchant, contact })

      jest.spyOn(UserAggregator, 'store').mockImplementation(mockStore)

      const response = await request(App).post('/v1/users').send({ user, breeder, type: user.registerType, whatsApp })
      const userWithDateString = {
        ...user,
        birthDate: user?.birthDate?.toISOString(),
      }
      const breederWithDateString = {
        ...breeder,
        foundationDate: breeder.foundationDate.toISOString(),
        createdAt: breeder?.createdAt?.toISOString(),
      }

      expect(response.statusCode).toBe(200)
      expect(response.body).toMatchObject({
        ok: true,
        user: userWithDateString,
        breeder: breederWithDateString,
        breederUser,
        merchant,
        contact
      })
      expect(mockStore).toHaveBeenCalledWith({
        user: userWithDateString,
        breeder: breederWithDateString,
        type: user.registerType,
        whatsApp
      })
    })

    it('is na invalid register when does not send whatsApp', async () => {
      const user = userFactory()
      const breeder = breederFactory({ description: 'fake description' })

      const response = await request(App).post('/v1/users').send({ user, breeder })

      expect(response.statusCode).toBe(400)
      expect(response.body).toMatchObject({
        ok: false,
      })
    })

    it('is na invalid register when does not send user', async () => {
      const user = null
      const breeder = breederFactory({ description: 'fake description' })
      const whatsApp = '(15) 99644-2031'

      const response = await request(App).post('/v1/users').send({ user, breeder, whatsApp })

      expect(response.statusCode).toBe(400)
      expect(response.body).toMatchObject({
        ok: false,
      })
    })

    it('is na invalid register when does not send breeder', async () => {
      const user = userFactory()
      const breeder = null
      const whatsApp = '(15) 99644-2031'

      const response = await request(App).post('/v1/users').send({ user, breeder, whatsApp })

      expect(response.statusCode).toBe(400)
      expect(response.body).toMatchObject({
        ok: false,
      })
    })

    it('is an invalid register when user aggregator throwns an error', async () => {
      const error = {}
      const user = userFactory()
      const breeder = breederFactory({ description: 'fake description' })
      const whatsApp = '(15) 99644-2031'
      const mockStore = jest.fn().mockRejectedValue(error)

      jest.spyOn(UserAggregator, 'store').mockImplementation(mockStore)

      const response = await request(App).post('/v1/users').send({ user, breeder, type: user.registerType, whatsApp })

      expect(response.statusCode).toBe(400)
      expect(response.body).toMatchObject({
        ok: false,
        error
      })
      expect(mockStore).toHaveBeenCalledWith({
        user: {
          ...user,
          birthDate: user?.birthDate?.toISOString()
        },
        breeder: {
          ...breeder, 
          foundationDate: breeder?.foundationDate?.toISOString(),
          createdAt: breeder?.createdAt?.toISOString(),
        },
        type: user.registerType,
        whatsApp
      })
    })
  })

  describe('Refresh token', () => {
    it('is a valid refresh', async () => {
      const user = userFactory()
      const token = 'token'
      const mockRefreshToken = jest.fn().mockResolvedValue(token)
      const mockOpen = jest.fn().mockResolvedValue(user)
      const mockGetUser = jest.fn().mockResolvedValue(user)

      jest.spyOn(UserAggregator, 'refreshToken').mockImplementation(mockRefreshToken)
      jest.spyOn(TokenService, 'open').mockImplementation(mockOpen)
      jest.spyOn(AccountServiceClient, 'getUser').mockImplementation(mockGetUser)

      const response = await request(App).post('/v1/refresh-token').set('X-Cig-Token', token)

      expect(response.statusCode).toBe(200)
      expect(response.body.token).toBe(token)
      expect(mockOpen).toHaveBeenCalledWith(token)
      expect(mockRefreshToken).toHaveBeenCalledWith(user)
      expect(mockGetUser).toHaveBeenCalledWith(user.id)
    })

    it('is an invalid refresh when send an invalid token', async () => {
      const user = userFactory()
      const token = ''
      const mockRefreshToken = jest.fn().mockResolvedValue(token)
      const mockOpen = jest.fn().mockResolvedValue(user)
      const mockGetUser = jest.fn().mockResolvedValue(user)

      jest.spyOn(UserAggregator, 'refreshToken').mockImplementation(mockRefreshToken)
      jest.spyOn(TokenService, 'open').mockImplementation(mockOpen)
      jest.spyOn(AccountServiceClient, 'getUser').mockImplementation(mockGetUser)

      const response = await request(App).post('/v1/refresh-token').set('X-Cig-Token', token)

      expect(response.statusCode).toBe(400)
      expect(response.body.error).toMatchObject({
        name: 'AuthError',
        message: String(i18n.__('auth.errors.invalid-login'))
      })
      expect(mockOpen).not.toHaveBeenCalledWith(token)
      expect(mockRefreshToken).not.toHaveBeenCalledWith(user)
      expect(mockGetUser).not.toHaveBeenCalledWith(user.id)
    })

    it('is an invalid refresh when is invalid token', async () => {
      const user = userFactory()
      const token = 'token'
      const mockRefreshToken = jest.fn().mockResolvedValue(token)
      const mockOpen = jest.fn().mockResolvedValue(null)
      const mockGetUser = jest.fn().mockResolvedValue(user)

      jest.spyOn(UserAggregator, 'refreshToken').mockImplementation(mockRefreshToken)
      jest.spyOn(TokenService, 'open').mockImplementation(mockOpen)
      jest.spyOn(AccountServiceClient, 'getUser').mockImplementation(mockGetUser)

      const response = await request(App).post('/v1/refresh-token').set('X-Cig-Token', token)

      expect(response.statusCode).toBe(400)
      expect(response.body.error).toMatchObject({
        name: 'AuthError',
        message: String(i18n.__('auth.errors.invalid-login'))
      })
      expect(mockOpen).toHaveBeenCalledWith(token)
      expect(mockRefreshToken).not.toHaveBeenCalledWith(user)
      expect(mockGetUser).not.toHaveBeenCalledWith(user.id)
    })
  })

  describe('Recover password', () => {
    it('is a valid password recovery', async () => {
      const mockRecoverPassword = jest.fn()
      const email = faker.internet.email()

      jest.spyOn(UserAggregator, 'recoverPassword').mockImplementation(mockRecoverPassword)

      const response = await request(App).post('/v1/recover-password').send({ email })

      expect(response.statusCode).toBe(200)
      expect(mockRecoverPassword).toHaveBeenCalledWith(email)
      expect(response.body).toMatchObject({
        ok: true,
        message: i18n.__('messages.recover-password.success')
      })
    })

    it('is an invalid password recovery when does not send an email', async () => {
      const mockRecoverPassword = jest.fn()
      const email = undefined

      jest.spyOn(UserAggregator, 'recoverPassword').mockImplementation(mockRecoverPassword)

      const response = await request(App).post('/v1/recover-password').send({ email })

      expect(response.statusCode).toBe(400)
      expect(mockRecoverPassword).not.toHaveBeenCalledWith(email)
      expect(response.body).toMatchObject({
        ok: false,
        error: {
          name: 'ValidationError',
          message: i18n.__('required-field', { field: i18n.__('user.fields.email') })
        }
      })
    })
  })

  describe('Edit password', () => {
    it('is a valid password update', async () => {
      const user = userFactory()
      const token = 'token'
      const mockRefreshToken = jest.fn().mockResolvedValue(token)
      const mockOpen = jest.fn().mockResolvedValue(user)
      const mockGetUser = jest.fn().mockResolvedValue(user)
      const mockEditPassword = jest.fn()

      jest.spyOn(UserAggregator, 'refreshToken').mockImplementation(mockRefreshToken)
      jest.spyOn(TokenService, 'open').mockImplementation(mockOpen)
      jest.spyOn(AccountServiceClient, 'getUser').mockImplementation(mockGetUser)
      jest.spyOn(UserAggregator, 'editPassword').mockImplementation(mockEditPassword)

      const response = await request(App).patch('/v1/users/password').send({
        password: user.password,
        confirmPassword: user.confirmPassword
      }).set('X-Cig-Token', token)

      expect(response.statusCode).toBe(200)
      expect(mockEditPassword).toHaveBeenCalledWith(user.id, user.password, user.confirmPassword)
      expect(response.body).toMatchObject({
        ok: true,
        message: i18n.__('messages.edit-password.success')
      })
    })

    it('is an invalid password update when confirm password is different', async () => {
      const user = userFactory()
      const { confirmPassword } = userFactory()
      const token = 'token'
      const mockRefreshToken = jest.fn().mockResolvedValue(token)
      const mockOpen = jest.fn().mockResolvedValue(user)
      const mockGetUser = jest.fn().mockResolvedValue(user)
      const mockEditPassword = jest.fn()

      jest.spyOn(UserAggregator, 'refreshToken').mockImplementation(mockRefreshToken)
      jest.spyOn(TokenService, 'open').mockImplementation(mockOpen)
      jest.spyOn(AccountServiceClient, 'getUser').mockImplementation(mockGetUser)
      jest.spyOn(UserAggregator, 'editPassword').mockImplementation(mockEditPassword)

      const response = await request(App).patch('/v1/users/password').send({
        password: user.password,
        confirmPassword
      }).set('X-Cig-Token', token)

      expect(response.statusCode).toBe(400)
      expect(mockEditPassword).not.toHaveBeenCalledWith(user.id, user.password, user.confirmPassword)
      expect(response.body).toMatchObject({
        ok: false,
      })
    })
  })
})
