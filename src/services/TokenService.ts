import { IAdvertisingFavorite, IBreeder, IMerchant, IUser } from '@cig-platform/types'
import jwt from 'jsonwebtoken'

import { JWT_ENCRYPT_SECRET } from '@Constants/jwt'

class TokenService {
  private _encryptSecret: string

  constructor(encryptSecret: string) {
    this._encryptSecret = encryptSecret

    this.create = this.create.bind(this)
    this.open = this.open.bind(this)
  }

  async create({
    email,
    id,
    name
  }: IUser, breeders: IBreeder[], merchant: IMerchant, favorites: IAdvertisingFavorite[]) {
    return jwt.sign({
      email,
      id,
      name,
      breeders,
      merchant,
      favorites
    }, this._encryptSecret, {
      expiresIn: '1d'
    })
  }

  open(token: string) {
    return new Promise((resolve, reject) => {
      jwt.verify(token, this._encryptSecret, (error: any, decoded: any) => {
        if (error) reject(error)

        return resolve(decoded)
      })
    })
  }
}

export default new TokenService(JWT_ENCRYPT_SECRET)
