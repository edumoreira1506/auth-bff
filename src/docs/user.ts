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
  ...createDoc('/refresh-token', ['Auth'], [
    {
      method: 'post',
      title: 'Refresh token',
      description: 'Route to refresh the token',
      headerParams: [{ type: 'string', name: 'X-Cig-Token' }]
    }
  ]),
  ...createDoc('/users', ['Users'], [
    {
      method: 'post',
      title: 'Register user',
      descriptoin: 'Route to register user and breeder',
      objectSchema: storeUserSchema
    }
  ]),
}

export default userDocs
