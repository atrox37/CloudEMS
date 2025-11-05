import Request, { type ApiResponse } from '@/utils/request'
import type { HomeTotalData } from '@/types/home'
import type { StationDetail } from '@/types/Stations'

export const getHomeTotalData = (): Promise<ApiResponse<HomeTotalData>> => {
    return Request.get('/user-app/station/_home')
}
    export const getHomeStationList = (): Promise<ApiResponse<StationDetail[]>> => {
    return Request.get('/user-app/station/_all')
}