import { PoultryServiceClient } from '@cig-platform/core'
import { POULTRY_SERVICE_API_KEY } from '@Constants/api-keys'
import { POULTRY_SERVICE_URL } from '@Constants/breeder'

export default new PoultryServiceClient(POULTRY_SERVICE_URL, POULTRY_SERVICE_API_KEY)
