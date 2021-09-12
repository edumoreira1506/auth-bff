import Joi from 'joi'

import i18n from '@Configs/i18n'

export const authUserSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': i18n.__('invalid-email', { field: i18n.__('user.fields.email') }),
    'string.empty': i18n.__('empty-field', { field: i18n.__('user.fields.email') }),
    'any.required': i18n.__('required-field', { field: i18n.__('user.fields.email') })
  }),
  password: Joi.string().required().messages({
    'string.empty': i18n.__('empty-field', { field: i18n.__('user.fields.password') }),
    'any.required': i18n.__('required-field', { field: i18n.__('user.fields.password') })
  }),
}).options({ abortEarly: false })

export const storeUserSchema = Joi.object({
  poultry: Joi.object().required(),
  user: Joi.object().required()
})
