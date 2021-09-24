import { createDoc } from '@cig-platform/docs'
import { authUserSchema, storeUserSchema } from '@Schemas/UserSchemas'

const userDocs = {
  ...createDoc('/auth', ['Auth'], [
    {
      method: 'post',
      title: 'Authentication route',
      description: 'Route to authenticate users',
      objectSchema: authUserSchema
    } 
  ]),
  ...createDoc('/users', ['Users'], [
    {
      method: 'post',
      title: 'Register user',
      descriptoin: 'Route to register user and breeder',
      objectSchema: storeUserSchema
    }
  ])
}

export default userDocs
