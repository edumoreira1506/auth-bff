import { AccountServiceClient } from '@cig-platform/core'
import { ACCOUNT_SERVICE_URL } from '@Constants/account'
import { ACCOUNT_SERVICE_API_KEY } from '@Constants/api-keys'

export default new AccountServiceClient(ACCOUNT_SERVICE_URL, ACCOUNT_SERVICE_API_KEY)
