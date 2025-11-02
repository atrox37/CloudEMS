import Request from '@/utils/request'

export const getAlarmDeviceList = (deviceIdList: number[]) => {
  return Request.post(`/iot-app/device/_page`, {
    size: -1,
    terms: [{ column: 't.id', termType: 'in', value: deviceIdList }],
  })
}
