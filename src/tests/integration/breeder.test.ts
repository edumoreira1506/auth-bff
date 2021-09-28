import request from 'supertest'
import { breederFactory, userFactory } from '@cig-platform/factories'

import App from '@Configs/server'
import i18n from '@Configs/i18n'
import BreederServiceClient from '@Clients/BreederServiceClient'
import AccountServiceClient from '@Clients/AccountServiceClient'
import TokenService from '@Services/TokenService'

describe('Breeder actions', () => {
  describe('Update', () => {
    it('is a valid update', async () => {
      const breeder = breederFactory()
      const user = userFactory()
      const mockUpdateBreeder = jest.fn()
      const mockOpen = jest.fn().mockReturnValue(user)
      const mockGetUser = jest.fn().mockResolvedValue(user)
      const mockGetBreeders = jest.fn().mockResolvedValue([breeder])
      const newBreeder = {}
      const token = 'fake token'

      jest.spyOn(BreederServiceClient, 'updateBreeder').mockImplementation(mockUpdateBreeder)
      jest.spyOn(TokenService, 'open').mockImplementation(mockOpen)
      jest.spyOn(AccountServiceClient, 'getUser').mockImplementation(mockGetUser)
      jest.spyOn(BreederServiceClient, 'getBreeders').mockImplementation(mockGetBreeders)

      const response = await request(App).patch(`/v1/breeders/${breeder.id}`).send({ breeder: newBreeder }).set('X-Cig-Token', token)

      expect(response.statusCode).toBe(200)
      expect(response.body.message).toBe(i18n.__('common.updated'))
      expect(mockUpdateBreeder).toHaveBeenCalledWith(breeder.id, newBreeder)
      expect(mockOpen).toHaveBeenCalledWith(token)
      expect(mockGetUser).toHaveBeenCalledWith(user.id)
      expect(mockGetBreeders).toHaveBeenCalledWith(user.id)
    })

    it('is an invalid update when token is not sent', async () => {
      const breeder = breederFactory()
      const user = userFactory()
      const mockUpdateBreeder = jest.fn()
      const mockOpen = jest.fn().mockReturnValue(user)
      const mockGetUser = jest.fn().mockResolvedValue(user)
      const mockGetBreeders = jest.fn().mockResolvedValue([breeder])
      const newBreeder = {}
      const token = 'fake token'

      jest.spyOn(BreederServiceClient, 'updateBreeder').mockImplementation(mockUpdateBreeder)
      jest.spyOn(TokenService, 'open').mockImplementation(mockOpen)
      jest.spyOn(AccountServiceClient, 'getUser').mockImplementation(mockGetUser)
      jest.spyOn(BreederServiceClient, 'getBreeders').mockImplementation(mockGetBreeders)

      const response = await request(App).patch(`/v1/breeders/${breeder.id}`).send({ breeder: newBreeder })

      expect(response.statusCode).toBe(400)
      expect(response.body).toMatchObject({
        ok: false,
        error: {
          message: i18n.__('auth.errors.invalid-login'),
          name: 'AuthError',
        }
      })
      expect(mockUpdateBreeder).not.toHaveBeenCalledWith(breeder.id, newBreeder)
      expect(mockOpen).not.toHaveBeenCalledWith(token)
      expect(mockGetUser).not.toHaveBeenCalledWith(user.id)
      expect(mockGetBreeders).not.toHaveBeenCalledWith(user.id)
    })
  })
})
