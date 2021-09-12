import { AccountServiceClient, PoultryServiceClient, AuthError, IPoultry, IUser } from '@cig-platform/core'
import { ACCOUNT_SERVICE_URL } from '@Constants/account'
import { POULTRY_SERVICE_URL } from '@Constants/poultry'

export class UserAggregator {
  private _accountServiceClient: AccountServiceClient;
  private _poultryServiceClient: PoultryServiceClient;

  constructor(accountServiceClient: AccountServiceClient, poultryServiceClient: PoultryServiceClient) {
    this._accountServiceClient = accountServiceClient
    this._poultryServiceClient = poultryServiceClient

    this.auth = this.auth.bind(this)
  }

  async auth(email: string, password: string) {
    const token = await this._accountServiceClient.authUser(email, password)

    if (!token) throw new AuthError()

    return token
  }

  async store(user: IUser, poultry: IPoultry) {
    const userData = await this._accountServiceClient.postUser(user)
    const poultryData = await this._poultryServiceClient.postPoultry(poultry)
  }
}

export default new UserAggregator(new AccountServiceClient(ACCOUNT_SERVICE_URL), new PoultryServiceClient(POULTRY_SERVICE_URL))
