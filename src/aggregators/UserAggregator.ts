import { IPoultry, IUser } from '@cig-platform/types'
import { AccountServiceClient, PoultryServiceClient } from '@cig-platform/core'

import { ACCOUNT_SERVICE_URL } from '@Constants/account'
import { POULTRY_SERVICE_URL } from '@Constants/poultry'

export class UserAggregator {
  private _accountServiceClient: AccountServiceClient;
  private _poultryServiceClient: PoultryServiceClient;

  constructor(accountServiceClient: AccountServiceClient, poultryServiceClient: PoultryServiceClient) {
    this._accountServiceClient = accountServiceClient
    this._poultryServiceClient = poultryServiceClient

    this.auth = this.auth.bind(this)
    this.store = this.store.bind(this)
  }

  async auth(email: string, password: string) {
    const user = await this._accountServiceClient.authUser(email, password)
    const poultries = await this._poultryServiceClient.getPoultries(user.id)

    return { user, poultries }
  }

  async store(user: Partial<IUser>, poultry: Partial<IPoultry>) {
    const userData = await this._accountServiceClient.postUser(user)
    const poultryData = await this._poultryServiceClient.postPoultry(poultry)
    const poultryUserData = await this._poultryServiceClient.postPoultryUser({ userId: userData.id, poultryId: poultryData.id })

    return { user: userData, poultry: poultryData, poultryUser: poultryUserData }
  }
}

export default new UserAggregator(new AccountServiceClient(ACCOUNT_SERVICE_URL), new PoultryServiceClient(POULTRY_SERVICE_URL))
