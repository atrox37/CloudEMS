<template>
  <div class="voltage-class main-layout">
    <div class="main-layout__left">
      <Sidebar />
    </div>
    <div class="main-layout__right" :class="{ collapse: globalStore.isCollapse }">
      <Header />
      <main class="main-layout__content" :class="{ collapse: globalStore.isCollapse }">
        <router-view />
      </main>
    </div>
    <AIAssistant />
  </div>
</template>

<script setup lang="ts">
import { ElNotification } from 'element-plus'
import Header from './Header.vue'
import Sidebar from './Sidebar.vue'
import stompManager, { userAppStompManager } from '@/utils/stomp'
import { useGlobalStore } from '@/stores/global'
import { useStationStore } from '@/stores/station'
import { useUserStore } from '@/stores/user'
import { tryNumericStationId } from '@/utils/stationId'

interface AlarmValuePayload {
  alarm_id?: string
  status?: number
  msg?: string
}

interface AlarmMessageItem {
  deviceId: number
  property: string
  rawValue?: string | null
  numberValue?: number
}

const router = useRouter()
const globalStore = useGlobalStore()
const userStore = useUserStore()
const stationStore = useStationStore()
const ALARM_DEBUG_TAG = '[ALARM_DEBUG]'

let stationPollingTimer: number | null = null
let alarmIdCount = 0
const alarmMap = new Map<string, { close: () => void }>()
const alarmStatusSet = new Set<string>()

const clearStationPolling = () => {
  if (stationPollingTimer) {
    clearInterval(stationPollingTimer)
    stationPollingTimer = null
  }
}

const getStationName = (stationId: number): string => {
  const station = stationStore.getStationById(stationId)
  return station?.stationName || String(stationId)
}

const handleAlarmDetail = (event: Event) => {
  const target = event.currentTarget as HTMLElement | null
  const deviceId = target?.dataset.deviceId
  ElNotification.closeAll()
  const sid = tryNumericStationId(deviceId)
  if (sid !== null) {
    router.push({ name: 'Alarm', params: { stationId: sid } })
  }
}

const removeAlarmMessage = (alarmId: string, alarmKey?: string) => {
  const existingMessage = alarmMap.get(alarmId)
  if (existingMessage) {
    existingMessage.close()
    alarmMap.delete(alarmId)
  }

  if (alarmKey) {
    alarmStatusSet.delete(alarmKey)
  } else {
    Array.from(alarmStatusSet)
      .filter((key) => key.startsWith(`${alarmId}_`))
      .forEach((key) => alarmStatusSet.delete(key))
  }
}

const showAlarmMessage = (item: AlarmMessageItem, payload: AlarmValuePayload, alarmKey: string) => {
  const currentId = alarmIdCount++
  const stationName = getStationName(item.deviceId)
  console.log(`${ALARM_DEBUG_TAG}[NOTIFICATION][TRIGGER]`, {
    deviceId: item.deviceId,
    stationName,
    property: item.property,
    alarmId: String(payload.alarm_id || ''),
    status: payload.status,
    msg: payload.msg || '',
    alarmKey,
  })
  const message = ElNotification({
    title: stationName,
    showClose: true,
    customClass: 'alarm-notification alarm-notification--error',
    dangerouslyUseHTMLString: true,
    duration: 0,
    message: `
      <div class="alarm-notification-content">
        <span class="alarm-notification-msg">${payload.msg || ''}</span>
        <div class="alarm-notification-footer">
          <button id="stomp-to-detail-btn-${currentId}" data-device-id="${item.deviceId}" class="alarm-detail-btn">to detail</button>
        </div>
      </div>
    `,
    onClose: () => {
      const buttonId = `stomp-to-detail-btn-${currentId}`
      const eventInfo = document.getElementById(buttonId)
      if (eventInfo) {
        eventInfo.removeEventListener('click', handleAlarmDetail)
      }
      removeAlarmMessage(String(payload.alarm_id), alarmKey)
    },
  })

  alarmMap.set(String(payload.alarm_id), message)
  alarmStatusSet.add(alarmKey)

  nextTick(() => {
    const buttonId = `stomp-to-detail-btn-${currentId}`
    document.getElementById(buttonId)?.addEventListener('click', handleAlarmDetail)
  })
}

const handleAlarmRecovery = (
  item: AlarmMessageItem,
  payload: AlarmValuePayload,
  alarmKey: string,
) => {
  console.log(`${ALARM_DEBUG_TAG}[NOTIFICATION][RECOVERY]`, {
    deviceId: item.deviceId,
    stationName: getStationName(item.deviceId),
    property: item.property,
    alarmId: String(payload.alarm_id || ''),
    status: payload.status,
    msg: payload.msg || '',
    alarmKey,
  })
  removeAlarmMessage(String(payload.alarm_id))
  alarmStatusSet.add(alarmKey)
  ElNotification({
    title: getStationName(item.deviceId),
    message: payload.msg || '',
    customClass: 'alarm-notification alarm-notification--success',
    duration: 3000,
  })
}

const alarmCb = (alarm: AlarmMessageItem[]) => {
  alarm.forEach((item) => {
    const isAlarmCount = item.property === 'N0'
    const isAlarmMessage = ['N1M', 'N2M', 'N3M'].includes(item.property)

    if (isAlarmMessage && item.rawValue) {
      try {
        const payload = JSON.parse(item.rawValue) as AlarmValuePayload
        const alarmId = String(payload.alarm_id || '')
        const status = payload.status
        if (!alarmId || (status !== 0 && status !== 1)) {
          return
        }

        const alarmKey = `${alarmId}_${status}`
        if (alarmStatusSet.has(alarmKey)) {
          return
        }

        removeAlarmMessage(alarmId)

        if (status === 1) {
          showAlarmMessage(item, payload, alarmKey)
        } else {
          handleAlarmRecovery(item, payload, alarmKey)
        }
      } catch (error) {
        console.error('[MainLayout] failed to parse alarm payload:', error, item.rawValue)
      }
    }

    if (isAlarmCount && typeof item.numberValue === 'number') {
      console.log(`${ALARM_DEBUG_TAG}[COUNT][UPDATE]`, {
        deviceId: item.deviceId,
        stationName: getStationName(item.deviceId),
        property: item.property,
        alarmCount: item.numberValue,
      })
      stationStore.updateStationAlarmCount(item.deviceId, item.numberValue)
    }
  })
}

const fetchStationsAndSubscribe = async () => {
  try {
    const res = await stationStore.fetchStationsSkipCancel()
    // 请求成功即停止轮询：空列表也是合法结果（各页面进入时会自行刷新，无需常驻轮询）
    if (res.code === 200) {
      clearStationPolling()
      return true
    }
    return false
  } catch (error) {
    console.error('[MainLayout] failed to fetch station list:', error)
    return false
  }
}

const startStationPolling = () => {
  if (stationPollingTimer) {
    return
  }

  stationPollingTimer = window.setInterval(async () => {
    await fetchStationsAndSubscribe()
  }, 10000)
}

const initStomp = async () => {
  if (!userStore.isLoggedIn || !userStore.token) {
    return
  }

  stationStore.setAlarmCallback(alarmCb)
  stompManager.setGlobalListeners({
    onConnect: () => console.log('[MainLayout] STOMP connected'),
    onDisconnect: () => console.log('[MainLayout] STOMP disconnected'),
    onReconnect: () => console.log('[MainLayout] STOMP reconnecting'),
    onError: (error) => console.error('[MainLayout] STOMP error:', error),
  })

  // STOMP 连接与站点列表请求无依赖，并行执行；
  // 即使站点请求失败，告警通道也必须连接（订阅会在连接建立后由 pendingSubscriptions 自动补发）
  stompManager.connect().catch((error) => {
    console.error('[MainLayout] initial STOMP connect failed:', error)
  })

  const success = await fetchStationsAndSubscribe()
  if (!success) {
    startStationPolling()
  }
}

onMounted(() => {
  globalStore.appInitializing = false
})

watch(
  () => userStore.isLoggedIn,
  async (isLoggedIn, oldIsLoggedIn) => {
    if (isLoggedIn) {
      await initStomp()
      return
    }

    if (oldIsLoggedIn === true) {
      clearStationPolling()
      stationStore.clearStations()
      try {
        await Promise.all([stompManager.disconnect(), userAppStompManager.disconnect()])
      } catch (error) {
        console.error('[MainLayout] failed to disconnect STOMP:', error)
      }
    }
  },
  { immediate: true },
)

onUnmounted(() => {
  clearStationPolling()
})
</script>

<style lang="scss" scoped>
.voltage-class.main-layout {
  height: 100%;
  width: 100%;
  display: flex;
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat;
  background-image: url('../assets/images/simple-bg.png');

  .main-layout__left {
    z-index: 99;
  }

  .main-layout__right {
    transition: width 0.3s ease-in-out;
    width: calc(100% - 2.2rem);

    &.collapse {
      width: calc(100% - 0.85rem);
    }

    .main-layout__content {
      padding: 0.2rem;
      height: calc(100% - 0.85rem);
      width: 100%;
    }
  }
}
</style>
