import { TokenService } from '@cig-platform/core'

import { JWT_ENCRYPT_SECRET } from '@Constants/jwt'

export default new TokenService(JWT_ENCRYPT_SECRET)
