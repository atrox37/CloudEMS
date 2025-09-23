import { alarmRequest } from '@/utils/request'

export const getRuleDetail = (id: string) => {
  return alarmRequest.get(`/user-app/rules/${id}`)
}

export const createRule = (data: any) => {
  return alarmRequest.post('/user-app/rules', data)
}

export const updateRule = (id: string, data: any) => {
  return alarmRequest.put(`/user-app/rules/${id}`, data)
}

export const deleteRule = (id: string) => {
  return alarmRequest.delete(`/user-app/rules/${id}`)
}
export const enableRule = (id: string | number) => {
  return alarmRequest.patch(`/user-app/rules/${id}/enable`)
}
export const disableRule = (id: string | number) => {
  return alarmRequest.patch(`/user-app/rules/${id}/disable`)
}
