import Request, { type ApiResponse } from '@/utils/request'
import type { HomeTotalData } from '@/types/home'
import type { StationList } from '@/types/station'

export const getHomeTotalData = (): Promise<ApiResponse<HomeTotalData>> => {
    return Request.get('/user-app/station/_home')
}
export const getHomeStationList = (): Promise<ApiResponse<StationList[]>> => {
    return Request.get('/user-app/station/_homeStationList')
}