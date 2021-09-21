import request from 'supertest'
import faker from 'faker'
import { userFactory, poultryFactory, poultryUserFactory } from '@cig-platform/core'

import App from '@Configs/server'
import UserAggregator from '@Aggregators/UserAggregator'
import i18n from '@Configs/i18n'

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
      const poultry = poultryFactory({ description: 'fake description' })
      const poultryUser = poultryUserFactory({ userId: user.id, poultryId: poultry.id })
      const mockStore = jest.fn().mockResolvedValue({ user, poultryUser, poultry })

      jest.spyOn(UserAggregator, 'store').mockImplementation(mockStore)

      const response = await request(App).post('/v1/users').send({ user, poultry })
      const userWithDateString = { ...user, birthDate: user?.birthDate?.toISOString() }

      expect(response.statusCode).toBe(200)
      expect(response.body).toMatchObject({
        ok: true,
        user: userWithDateString,
        poultry,
      })
      expect(mockStore).toHaveBeenCalledWith(userWithDateString, poultry)
    })

    it('is na invalid register when does not send user', async () => {
      const user = null
      const poultry = poultryFactory({ description: 'fake description' })

      const response = await request(App).post('/v1/users').send({ user, poultry })

      expect(response.statusCode).toBe(400)
      expect(response.body).toMatchObject({
        ok: false,
      })
    })

    it('is na invalid register when does not send poultry', async () => {
      const user = userFactory()
      const poultry = null

      const response = await request(App).post('/v1/users').send({ user, poultry })

      expect(response.statusCode).toBe(400)
      expect(response.body).toMatchObject({
        ok: false,
      })
    })

    it('is an invalid register when user aggregator throwns an error', async () => {
      const error = {}
      const user = userFactory()
      const poultry = poultryFactory({ description: 'fake description' })
      const mockStore = jest.fn().mockRejectedValue(error)

      jest.spyOn(UserAggregator, 'store').mockImplementation(mockStore)

      const response = await request(App).post('/v1/users').send({ user, poultry })

      expect(response.statusCode).toBe(400)
      expect(response.body).toMatchObject({
        ok: false,
        error
      })
      expect(mockStore).toHaveBeenCalledWith({ ...user, birthDate: user?.birthDate?.toISOString() }, poultry)
    })
  })
})
