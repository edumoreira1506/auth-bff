import Joi from 'joi'

import i18n from '@Configs/i18n'

const passwordSchema = Joi.string().messages({
  'string.empty': i18n.__('empty-field', { field: i18n.__('user.fields.password') }),
  'any.required': i18n.__('required-field', { field: i18n.__('user.fields.password') })
})

export const authUserSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': i18n.__('invalid-email', { field: i18n.__('user.fields.email') }),
    'string.empty': i18n.__('empty-field', { field: i18n.__('user.fields.email') }),
    'any.required': i18n.__('required-field', { field: i18n.__('user.fields.email') })
  }),
  password: passwordSchema,
  type: Joi.string(),
  externalId: Joi.string()
}).options({ abortEarly: false })

export const editPasswordSchema = Joi.object({
  password: passwordSchema.required(),
  confirmPassword: Joi.string().equal(Joi.ref('password')).required().messages({
    'any.only': i18n.__('must-be-equal', {
      field1: i18n.__('user.fields.password'),
      field2: i18n.__('user.fields.confirm-password').toLowerCase()
    }),
    'any.required': i18n.__('required-field', { field: i18n.__('user.fields.confirm-password') }),
    'string.empty': i18n.__('empty-field', { field: i18n.__('user.fields.confirm-password') }),
  }),
}).options({ abortEarly: false })

export const storeUserSchema = Joi.object({
  breeder: Joi.object().required(),
  user: Joi.object().required(),
  type: Joi.string(),
  externalId: Joi.string(),
  whatsApp: Joi.string().required()
})

export const updateUserSchema = Joi.object({
  user: Joi.object().required()
})

export const recoverPasswordSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': i18n.__('invalid-email', { field: i18n.__('user.fields.email') }),
    'string.empty': i18n.__('empty-field', { field: i18n.__('user.fields.email') }),
    'any.required': i18n.__('required-field', { field: i18n.__('user.fields.email') })
  })
})
