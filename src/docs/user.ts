import { createDoc } from '@cig-platform/docs'
import { authUserSchema } from '@Schemas/UserSchemas'

const userDocs = {
  ...createDoc('/auth', ['Auth'], [
    {
      method: 'post',
      title: 'Authentication route',
      description: 'Route to authenticate users',
      objectSchema: authUserSchema
    } 
  ])
}

export default userDocs
