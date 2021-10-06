import { ApiError } from '@cig-platform/core'
import i18n from '@Configs/i18n'

export default class InvalidEmailError extends ApiError {
  constructor() {
    super(i18n.__('common.errors.invalid-email'))

    this.name = 'InvalidEmailError'
  }
}
