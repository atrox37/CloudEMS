import Request, { type ApiResponse } from '@/utils/request'
import type {
  StatisticsTotalData,
  StorageStateData,
  EnergyStructureAnalysisData,
  DieselGeneratorStatusData,
  PowerCurveData,
  AnalyticsAllData,
} from '@/types/statistics'
export const getStatisticsTotalData = (): Promise<ApiResponse<StatisticsTotalData>> => {
  return Request.get('/user-app/station/statisticsTotal')
}

export const getStorageStateData = (): Promise<ApiResponse<StorageStateData>> => {
  return Request.get('/user-app/station/statisticsBPCharts')
}

export const getEnergyStructureAnalysisData = (): Promise<
  ApiResponse<EnergyStructureAnalysisData>
> => {
  return Request.get('/user-app/station/statisticsPvCharts')
}

export const getDieselGeneratorStatusData = (): Promise<ApiResponse<DieselGeneratorStatusData>> => {
  return Request.get('/user-app/station/statisticsCfStatus')
}
export const getPowerCurveData = (): Promise<ApiResponse<PowerCurveData>> => {
  return Request.get('/user-app/station/statisticsLinePv')
}
export const getEnergyConsumptionData = (): Promise<ApiResponse<number[]>> => {
  return Request.get('/user-app/station/statisticsLineRate')
}
export const getAnalyticsLineData = (): Promise<ApiResponse<AnalyticsAllData[]>> => {
  return Request.get('/user-app/station/statisticsAll')
}
