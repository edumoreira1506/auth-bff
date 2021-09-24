import jwt from 'jsonwebtoken'
import { IBreeder, IUser } from '@cig-platform/types'

import { JWT_ENCRYPT_SECRET } from '@Constants/jwt'

export default class TokenService {
  static async create({ email, id, name }: Required<IUser>, breeders: Required<IBreeder>[]): Promise<string> {
    return jwt.sign({ email, id, name, breeders }, JWT_ENCRYPT_SECRET, { expiresIn: '1d' })
  }

  static open(token: string): Promise<Record<string, unknown>> {
    return new Promise ((resolve, reject) => {
      jwt.verify(token, JWT_ENCRYPT_SECRET, (error, decoded: any): void => {
        if (error) reject(error)

        return resolve(decoded)
      })
    })
  }
}
