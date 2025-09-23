import { defaultRequest,type ApiResponse } from '@/utils/request'
import type { HomeTotalData } from '@/types/home'

export const getHomeTotalData = (): Promise<ApiResponse<HomeTotalData>> => {
    return defaultRequest.get('/user-app/home/_index')
}