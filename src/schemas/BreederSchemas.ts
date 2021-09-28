import Joi from 'joi'

export const updateBreederSchema = Joi.object({
  breeder: Joi.object().required(),
})
