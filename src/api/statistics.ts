import { defaultRequest, type ApiResponse } from '@/utils/request'
import type { StatisticsTotalData,StorageStateData,EnergyStructureAnalysisData,DieselGeneratorStatusData,PowerCurveData,AnalyticsAllData     } from '@/types/statistics'
export const getStatisticsTotalData = (): Promise<ApiResponse<StatisticsTotalData>> => {
  return defaultRequest.get('/user-app/station/statisticsTotal')
}

export const getStorageStateData = (): Promise<ApiResponse<StorageStateData>> => {
  return defaultRequest.get('/user-app/station/statisticsBPCharts')
}

export  const getEnergyStructureAnalysisData = (): Promise<ApiResponse<EnergyStructureAnalysisData>> => {
  return defaultRequest.get('/user-app/station/statisticsPvCharts')
}

export const getDieselGeneratorStatusData = (): Promise<ApiResponse<DieselGeneratorStatusData>> => {
  return defaultRequest.get('/user-app/station/statisticsCfStatus')
}
export const getPowerCurveData = (): Promise<ApiResponse<PowerCurveData>> => {
  return defaultRequest.get('/user-app/station/statisticsLinePv')
}
export const getEnergyConsumptionData = (): Promise<ApiResponse<number[]>> => {
  return defaultRequest.get('/user-app/station/statisticsLineRate')
}
export const getAnalyticsLineData = (): Promise<ApiResponse<AnalyticsAllData[]>> => {
  return defaultRequest.get('/user-app/station/statisticsAll')
}