import { ApiError } from '@cig-platform/core'
import i18n from '@Configs/i18n'

export default class InvalidRegisterTypeError extends ApiError {
  constructor() {
    super(i18n.__('recover-password.errors.invalid-register-type'))

    this.name = 'InvalidRegisterTypeError'
  }
}
