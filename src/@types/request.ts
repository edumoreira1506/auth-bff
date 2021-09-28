import { Request } from 'express'
import { IUser } from '@cig-platform/types'

export interface AuthenticatedRequest extends Request {
  user?: IUser;
}
