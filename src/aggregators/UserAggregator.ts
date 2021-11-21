import { IBreeder, IUser } from '@cig-platform/types'
import {
  AccountServiceClient,
  PoultryServiceClient,
  AdvertisingServiceClient,
} from '@cig-platform/core'

import AccountClient from '@Clients/AccountServiceClient'
import AdvertisingClient from '@Clients/AdvertisingServiceClient'
import BreederClient from '@Clients/PoultryServiceClient'
import TokenService from '@Services/TokenService'
import InvalidEmailError from '@Errors/InvalidEmailError'
import EncryptService from '@Services/EncryptService'
import i18n from '@Configs/i18n'
import EmailService from '@Services/EmailService'

export class UserAggregator {
  private _accountServiceClient: AccountServiceClient;
  private _poultryServiceClient: PoultryServiceClient;
  private _advertisingServiceClient: AdvertisingServiceClient;

  constructor(
    accountServiceClient: AccountServiceClient,
    poultryServiceClient: PoultryServiceClient,
    advertisingServiceClient: AdvertisingServiceClient
  ) {
    this._accountServiceClient = accountServiceClient
    this._poultryServiceClient = poultryServiceClient
    this._advertisingServiceClient = advertisingServiceClient

    this.auth = this.auth.bind(this)
    this.store = this.store.bind(this)
  }

  async auth(email: string, password: string) {
    const user = await this._accountServiceClient.authUser(email, password)
    const breeders = await this._poultryServiceClient.getBreeders(user.id)
    const token = await TokenService.create(user, breeders as any)

    return token
  }

  async refreshToken(user: IUser) {
    const breeders = await this._poultryServiceClient.getBreeders(user.id)
    const token = await TokenService.create(user as any, breeders  as any)

    return token
  }

  async recoverPassword(email: string) {
    const users = await this._accountServiceClient.getUsers({ email })
    const userOfEmail = users?.[0]

    if (!userOfEmail) throw new InvalidEmailError()

    const decryptedPassword = EncryptService.decrypt(userOfEmail.password)
    const emailSubject = i18n.__('emails.recover-password.title')
    const emailText = i18n.__('emails.recover-password.content', { password: decryptedPassword })

    EmailService.send({ emailDestination: userOfEmail.email, subject: emailSubject, message: emailText })
  }

  async store(user: Partial<IUser>, breeder: Partial<IBreeder>) {
    const userData = await this._accountServiceClient.postUser(user)
    const breederData = await this._poultryServiceClient.postBreeder(breeder)
    const breederUserData = await this._poultryServiceClient.postBreederUser({ userId: userData.id, breederId: breederData.id })
    const merchantData = await this._advertisingServiceClient.postMerchant({ externalId: breederData.id })

    return {
      user: userData,
      breeder: breederData,
      breederUser: breederUserData,
      merchant: merchantData
    }
  }

  async editPassword(userId: string, password: string, confirmPassword: string) {
    return await this._accountServiceClient.editUser({ password, confirmPassword }, userId)
  }
}

export default new UserAggregator(AccountClient, BreederClient, AdvertisingClient)
