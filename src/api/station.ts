import { defaultRequest,type ApiResponse } from '@/utils/request'
import type { Stations } from '@/types/Stations'

export const getStations = (): Promise<ApiResponse<Stations[]>> => {
  return defaultRequest.get('/stations/_index')
}

