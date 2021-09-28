import { createDoc } from '@cig-platform/docs'
import { updateBreederSchema } from '@Schemas/BreederSchemas'

const breederDocs = {
  ...createDoc('/breeders/{breederId}', ['Breeders'], [
    {
      method: 'patch',
      title: 'Update breeder',
      description: 'Route to update breeder',
      objectSchema: updateBreederSchema,
      headerParams: [{ type: 'string', name: 'X-Cig-Token' }]
    }
  ], { pathVariables: [{ type: 'string', name: 'breederId' }] }),
}

export default breederDocs
