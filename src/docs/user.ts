import { createDoc } from '@cig-platform/docs'
import {
  authUserSchema,
  editPasswordSchema,
  recoverPasswordSchema,
  storeUserSchema,
} from '@Schemas/UserSchemas'

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
      description: 'Route to register user and breeder',
      objectSchema: storeUserSchema
    }
  ]),
  ...createDoc('/recover-password', ['Auth'], [
    {
      method: 'post',
      title: 'Recover password',
      description: 'Route to recover user password',
      objectSchema: recoverPasswordSchema
    }
  ]),
  ...createDoc('/users/password', ['Auth'], [
    {
      method: 'patch',
      title: 'Edit password',
      description: 'Route to edit password',
      objectSchema: editPasswordSchema,
      headerParams: [{ type: 'string', name: 'X-Cig-Token' }]
    }
  ])
}

export default userDocs
