import request from 'supertest'
import faker from 'faker'
import { userFactory, breederFactory, breederUserFactory } from '@cig-platform/factories'

import App from '@Configs/server'
import UserAggregator from '@Aggregators/UserAggregator'
import i18n from '@Configs/i18n'
import TokenService from '@Services/TokenService'
import AccountServiceClient from '@Clients/AccountServiceClient'

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
      expect(mockAuth).toHaveBeenCalledWith(email, password)
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

    it('is an invalid authentication when is not sent password', async () => {
      const token = 'example token'
      const email = faker.internet.email()
      const password = undefined
      const mockAuth = jest.fn().mockResolvedValue(token)

      jest.spyOn(UserAggregator, 'auth').mockImplementation(mockAuth)

      const response = await request(App).post('/v1/auth').send({ email, password })

      expect(response.statusCode).toBe(400)
      expect(response.body).toMatchObject({
        ok: false,
        error: {
          message: i18n.__('required-field', { field: i18n.__('user.fields.password') }),
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
      const mockStore = jest.fn().mockResolvedValue({ user, breederUser, breeder })

      jest.spyOn(UserAggregator, 'store').mockImplementation(mockStore)

      const response = await request(App).post('/v1/users').send({ user, breeder })
      const userWithDateString = { ...user, birthDate: user?.birthDate?.toISOString() }
      const breederWithDateString = { ...breeder, foundationDate: breeder.foundationDate.toISOString() }

      expect(response.statusCode).toBe(200)
      expect(response.body).toMatchObject({
        ok: true,
        user: userWithDateString,
        breeder: breederWithDateString,
      })
      expect(mockStore).toHaveBeenCalledWith(userWithDateString, breederWithDateString)
    })

    it('is na invalid register when does not send user', async () => {
      const user = null
      const breeder = breederFactory({ description: 'fake description' })

      const response = await request(App).post('/v1/users').send({ user, breeder })

      expect(response.statusCode).toBe(400)
      expect(response.body).toMatchObject({
        ok: false,
      })
    })

    it('is na invalid register when does not send breeder', async () => {
      const user = userFactory()
      const breeder = null

      const response = await request(App).post('/v1/users').send({ user, breeder })

      expect(response.statusCode).toBe(400)
      expect(response.body).toMatchObject({
        ok: false,
      })
    })

    it('is an invalid register when user aggregator throwns an error', async () => {
      const error = {}
      const user = userFactory()
      const breeder = breederFactory({ description: 'fake description' })
      const mockStore = jest.fn().mockRejectedValue(error)

      jest.spyOn(UserAggregator, 'store').mockImplementation(mockStore)

      const response = await request(App).post('/v1/users').send({ user, breeder })

      expect(response.statusCode).toBe(400)
      expect(response.body).toMatchObject({
        ok: false,
        error
      })
      expect(mockStore).toHaveBeenCalledWith(
        { ...user, birthDate: user?.birthDate?.toISOString() },
        { ...breeder, foundationDate: breeder?.foundationDate?.toISOString() }
      )
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
})
