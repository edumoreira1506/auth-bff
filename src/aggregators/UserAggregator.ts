import { IBreeder, IUser } from '@cig-platform/types'
import { AccountServiceClient, BreederServiceClient } from '@cig-platform/core'

import AccountClient from '@Clients/AccountServiceClient'
import BreederClient from '@Clients/BreederServiceClient'
import TokenService from '@Services/TokenService'

export class UserAggregator {
  private _accountServiceClient: AccountServiceClient;
  private _breederServiceClient: BreederServiceClient;

  constructor(accountServiceClient: AccountServiceClient, breederServiceClient: BreederServiceClient) {
    this._accountServiceClient = accountServiceClient
    this._breederServiceClient = breederServiceClient

    this.auth = this.auth.bind(this)
    this.store = this.store.bind(this)
  }

  async auth(email: string, password: string) {
    const user = await this._accountServiceClient.authUser(email, password)
    const breeders = await this._breederServiceClient.getBreeders(user.id)
    const token = await TokenService.create(user, breeders as any)

    return token
  }

  async refreshToken(user: IUser) {
    const breeders = await this._breederServiceClient.getBreeders(user.id)
    const token = await TokenService.create(user as any, breeders  as any)

    return token
  }

  async store(user: Partial<IUser>, breeder: Partial<IBreeder>) {
    const userData = await this._accountServiceClient.postUser(user)
    const breederData = await this._breederServiceClient.postBreeder(breeder)
    const breederUserData = await this._breederServiceClient.postBreederUser({ userId: userData.id, breederId: breederData.id })

    return { user: userData, breeder: breederData, breederUser: breederUserData }
  }
}

export default new UserAggregator(AccountClient, BreederClient)
