import { AccountServiceClient, AuthError } from '@cig-platform/core'
import { ACCOUNT_SERVICE_URL } from '@Constants/account'

export class UserAggregator {
  private _accountServiceClient: AccountServiceClient;

  constructor(accountServiceClient: AccountServiceClient) {
    this._accountServiceClient = accountServiceClient

    this.auth = this.auth.bind(this)
  }

  async auth(email: string, password: string) {
    const token = await this._accountServiceClient.authUser(email, password)

    if (!token) throw new AuthError()

    return token
  }
}

export default new UserAggregator(new AccountServiceClient(ACCOUNT_SERVICE_URL))
