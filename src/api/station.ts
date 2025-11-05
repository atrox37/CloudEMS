import Request, { type ApiResponse } from '@/utils/request'
import type {
  Stations,
  StationOverview,
  PerformanceView,
  Overviewchart,
  Performancechart,
  StationInformation,
  StationAlarm,
  StationAlarmStatistics,
  StationListItem,
  AnalyticsIntervalData,
  AnalyticsNoIntervalData,
  AnalyticsParams,
  MainteranceData,
} from '@/types/Stations'

/**
 * 获取所有电站列表
 * @returns Promise<ApiResponse<Stations[]>> 电站信息数组
 */
export const getStations = (stationId?:number): Promise<ApiResponse<Stations[]>> => {
  return Request.post('/user-app/station/_page_station',{stationId})
}

/**
 * 获取指定电站的概览信息
 * @param stationId 电站ID（字符串）
 * @returns Promise<ApiResponse<StationOverview>> 电站概览数据
 */
export const getStationOverview = (
  stationId: string | number,
): Promise<ApiResponse<StationOverview>> => {
  return Request.post(`/user-app/station/_overview`, { stationId })
}

/**
 * 获取指定电站的一周数据（用于折线图/柱状图等）
 * @param stationId 电站ID（数字）
 * @returns Promise<ApiResponse<Overchart[]>> 电站一周数据数组
 */
export const getStationOverchart = (
  stationId: string | number,
): Promise<ApiResponse<Overviewchart>> => {
  return Request.post(`/user-app/station/_overchart`, { stationId })
}

/**
 * 获取指定电站的性能图表数据
 * @param stationId 电站ID（数字）
 * @returns Promise<ApiResponse<Overchart[]>> 性能图表数据数组
 */
export const getPerformancechart = (
  stationId: string | number,
): Promise<ApiResponse<Performancechart>> => {
  return Request.post(`/user-app/station/_performancehart`, { stationId })
}

/**
 * 获取指定电站的性能视图数据
 * @param stationId 电站ID（数字）
 * @returns Promise<ApiResponse<PerformanceView>> 性能视图数据
 */
export const getPerformanceView = (
  stationId: string | number,
): Promise<ApiResponse<PerformanceView>> => {
  return Request.post(`/user-app/station/_performancView`, { stationId })
}

/**
 * 获取指定电站的详情信息
 * @param stationId 电站ID（数字）
 * @returns Promise<ApiResponse<StationDetail>> 详情信息
 */
export const getStationDetail = (
  stationId: string | number,
): Promise<ApiResponse<StationInformation>> => {
  return Request.post(`/user-app/station/_information`, { stationId })
}
/**
 * 获取指定电站的告警信息
 * @param stationId 电站ID（数字）
 * @returns Promise<ApiResponse<StationAlarm>> 告警信息
 */
export const getStationAlarm = (stationId: string | number): Promise<ApiResponse<StationAlarm>> => {
  return Request.post(`/user-app/station/_alarmMessage`, { stationId })
}
/**
 * 获取指定电站的告警统计信息
 * @param stationId 电站ID（数字）
 * @returns Promise<ApiResponse<StationAlarmStatistics>> 告警统计信息
 */
export const getStationAlarmStatistics = (
  stationId: string | number,
): Promise<ApiResponse<StationAlarmStatistics>> => {
  return Request.post(`/user-app/station/_alarmTotal`, { stationId })
}

/**
 * 获取所有电站列表
 * @returns Promise<ApiResponse<StationList>> 列表信息
 */
export const getStationList = (): Promise<ApiResponse<StationListItem[]>> => {
  return Request.get(`/user-app/station/_all`)
}

export const getAnalyticsData = (
  params: AnalyticsParams,
): Promise<ApiResponse<AnalyticsIntervalData | AnalyticsNoIntervalData>> => {
  return Request.post(`/user-app/station/_analytics`, params)
}
export const getMainteranceData = (deviceId: number): Promise<ApiResponse<MainteranceData[]>> => {
  return Request.post(`/iot-app/device_tag/_search_all`, {
    terms: [{ column: 't.device_id', value: deviceId }],
  })
}
