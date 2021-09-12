import request from 'supertest'
import faker from 'faker'

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
})
